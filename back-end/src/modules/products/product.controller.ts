import { Request, Response, Router } from 'express';
import prisma from '../../services/prisma';
import { authMiddleware } from '../../middleware/auth.middleware';
import { adminMiddleware } from '../../middleware/admin.middleware';
import { Prisma } from '@prisma/client';

const router = Router();

router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
});

router.post('/products', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const { name, price, stock } = req.body;

  // Validação básica dos dados de entrada
  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ error: 'Nome, preço e estoque são obrigatórios.' });
  }

  // Validação do tipo de dados
  if (typeof name !== 'string' || typeof price !== 'number' || typeof stock !== 'number') {
    return res.status(400).json({ error: 'Os tipos de dados estão incorretos.' });
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        stock,
      },
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});


router.patch('/products/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params; 
    const { name, price, stock } = req.body;

    if (name === undefined && price === undefined && stock === undefined) {
        return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para a atualização.' });
    }

    const dataToUpdate: { name?: string; price?: number; stock?: number } = {};
    if (name) dataToUpdate.name = name;
    if (price !== undefined) dataToUpdate.price = price;
    if (stock !== undefined) dataToUpdate.stock = stock;
    
    try {
        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: dataToUpdate,
        });

        return res.status(200).json(updatedProduct);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Produto não encontrado.' });
            }
        }

        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

export default router;