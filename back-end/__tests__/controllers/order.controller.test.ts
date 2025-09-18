import request from 'supertest';
import express from 'express';
import orderRoutes from '../../src/modules/orders/order.controller';
import { prismaMock } from '../singleton';

// Mocks dos serviços e middlewares
jest.mock('../../src/services/redis', () => ({
  __esModule: true,
  default: { xadd: jest.fn() },
}));
import redisMock from '../../src/services/redis';

jest.mock('../../src/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: () => void) => {
    req.user = { userId: 'user-123', role: 'USER', customerId: 'customer-abc' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/', orderRoutes);

// Testes para POST /orders (já existentes)
describe('POST /orders', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('deve criar um novo pedido e enviar uma mensagem para o Redis com sucesso', async () => {
    const orderData = { customerId: 'customer-abc', products: [{ productId: 'prod-1', quantity: 2 }] };
    const createdOrderMock = { id: 'order-xyz-789', status: 'PENDING_PAYMENT', customerId: orderData.customerId, createdAt: new Date(), updatedAt: new Date() };
    prismaMock.order.create.mockResolvedValue(createdOrderMock);
    prismaMock.$transaction.mockImplementation(async (callback: any) => await callback(prismaMock));
    (redisMock.xadd as jest.Mock).mockResolvedValue(null);

    const response = await request(app).post('/orders').send(orderData);
    expect(response.status).toBe(201);
    expect(response.body.orderId).toBe(createdOrderMock.id);
    expect(prismaMock.order.create).toHaveBeenCalledTimes(1);
    expect(redisMock.xadd).toHaveBeenCalledTimes(1);
  });

  it('deve retornar erro 400 se os dados do pedido forem inválidos', async () => {
    const response = await request(app).post('/orders').send({});
    expect(response.status).toBe(400);
  });
});

// Testes para GET /orders/my-orders
describe('GET /orders/my-orders', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('deve retornar os pedidos do usuário autenticado', async () => {
    const mockOrders = [
      { id: 'order-1', customerId: 'customer-abc', status: 'CONFIRMED' },
      { id: 'order-2', customerId: 'customer-abc', status: 'PENDING_PAYMENT' },
    ];
    // encontrando os pedidos para o customerId do nosso usuário mockado
    prismaMock.order.findMany.mockResolvedValue(mockOrders as any);

    const response = await request(app).get('/orders/my-orders');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2); // esperado: 2 pedidos no array
    expect(response.body[0].id).toBe('order-1');
    // Verificando se a busca no banco foi feita com o filtro correto
    expect(prismaMock.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { customerId: 'customer-abc' }
    }));
  });
});

// Testes para GET /orders/:id
describe('GET /orders/:id', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('deve retornar um pedido específico pelo ID', async () => {
    const orderId = 'order-to-find-123';
    const mockOrder = { id: orderId, customerId: 'any-customer', status: 'CONFIRMED' };
    prismaMock.order.findUnique.mockResolvedValue(mockOrder as any);

    const response = await request(app).get(`/orders/${orderId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(orderId);
    expect(prismaMock.order.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: orderId }
    }));
  });

  it('deve retornar erro 404 se o pedido não for encontrado', async () => {
    const orderId = 'order-not-found-404';
    // Simulando o Prisma não encontrando o pedido
    prismaMock.order.findUnique.mockResolvedValue(null);

    const response = await request(app).get(`/orders/${orderId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Pedido não encontrado.');
  });
});