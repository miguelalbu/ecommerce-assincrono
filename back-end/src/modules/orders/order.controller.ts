import { Request, Response, Router } from 'express';
import prisma from '../../services/prisma';
import redis from '../../services/redis';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const PAYMENT_STREAM = 'payment_requests';
const PAYMENT_CONFIRMED_STREAM = 'payment_confirmed';

// Rota de criação de pedido: Protegida por autenticação
router.post('/orders', authMiddleware, async (req: Request, res: Response) => {
  const { customerId, products } = req.body;

  if (!customerId || !products || products.length === 0) {
    return res.status(400).json({ error: 'Dados inválidos para o pedido.' });
  }

  try {
    const newOrder = await prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          customerId,
          status: 'PENDING_PAYMENT',
          orderItems: {
            createMany: {
              data: products.map((p: any) => ({
                productId: p.productId,
                quantity: p.quantity,
              })),
            },
          },
        },
        include: {
          orderItems: true,
        },
      });

      return order;
    });

    await redis.xadd(
      PAYMENT_STREAM,
      '*',
      'orderId', newOrder.id,
      'customerId', newOrder.customerId,
      'status', newOrder.status
    );

    return res.status(201).json({
      message: 'Pedido criado com sucesso. O pagamento está sendo processado.',
      orderId: newOrder.id,
      status: newOrder.status,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor ao criar o pedido.' });
  }
});


router.get('/orders/my-orders', authMiddleware, async (req: Request, res: Response) => {
  // O customerId é extraído do token JWT pelo authMiddleware
  const customerId = req.user?.customerId;

  if (!customerId) {
    return res.status(403).json({ error: 'ID do cliente não encontrado no token.' });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        customerId: customerId,
      },
      include: {
        orderItems: {
          include: {
            product: true, // Inclui os detalhes de cada produto no item do pedido
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Mostra os pedidos mais recentes primeiro
      },
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor ao buscar os pedidos.' });
  }
});

// Rota de consulta de pedido por ID: Não precisa de autenticação, é pública
router.get('/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota de simulação de pagamento: Protegida por autenticação
router.post('/orders/:id/confirm-payment', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }
    
    await redis.xadd(
      PAYMENT_CONFIRMED_STREAM,
      '*',
      'orderId', order.id,
      'status', 'CONFIRMED'
    );

    return res.status(200).json({ message: 'Confirmação de pagamento enviada para o fluxo assíncrono.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

export default router;