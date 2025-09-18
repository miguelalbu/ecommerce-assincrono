import request from 'supertest';
import express from 'express';
import { Prisma } from '@prisma/client';
import productRoutes from '../../src/modules/products/product.controller';
import { prismaMock } from '../singleton';

// mini-servidor Express para os testes
const app = express();
app.use(express.json());
app.use('/', productRoutes);

// Mock dos middlewares de autenticação e autorização
jest.mock('../../src/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: () => void) => {
    req.user = req.body.mockUser;
    next();
  },
}));

jest.mock('../../src/middleware/admin.middleware', () => ({
  adminMiddleware: (req: any, res: any, next: () => void) => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ error: 'Acesso proibido.' });
    }
  },
}));

// rota de CRIAÇÃO de produtos
describe('POST /products', () => {
  it('deve criar um novo produto com sucesso quando o usuário é ADMIN', async () => {
    const productData = { name: 'Produto Teste', price: 150.50, stock: 20 };
    const adminUser = { userId: 'admin-id', role: 'ADMIN' };

    prismaMock.product.create.mockResolvedValue({ id: 'produto-123', ...productData });

    const response = await request(app)
      .post('/products')
      .send({ ...productData, mockUser: adminUser });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 'produto-123');
    expect(prismaMock.product.create).toHaveBeenCalledWith({ data: productData });
  });

  it('deve retornar erro 403 ao tentar criar um produto quando o usuário não é ADMIN', async () => {
    const productData = { name: 'Produto Ilegal', price: 10, stock: 1 };
    const regularUser = { userId: 'user-id', role: 'USER' };

    const response = await request(app)
      .post('/products')
      .send({ ...productData, mockUser: regularUser });

    expect(response.status).toBe(403);
    expect(prismaMock.product.create).not.toHaveBeenCalled();
  });

  it('deve retornar erro 400 se faltarem dados obrigatórios', async () => {
    const incompleteData = { name: 'Produto Incompleto' };
    const adminUser = { userId: 'admin-id', role: 'ADMIN' };

    const response = await request(app)
      .post('/products')
      .send({ ...incompleteData, mockUser: adminUser });

    expect(response.status).toBe(400);
    expect(prismaMock.product.create).not.toHaveBeenCalled();
  });
});

// rota de ATUALIZAÇÃO de produtos
describe('PATCH /products/:id', () => {
  it('deve atualizar um produto com sucesso quando o usuário é ADMIN', async () => {
    const productId = 'produto-existente-123';
    const updateData = { price: 199.99, stock: 50 };
    const adminUser = { userId: 'admin-id', role: 'ADMIN' };
    
    prismaMock.product.update.mockResolvedValue({
      id: productId,
      name: 'Produto Antigo',
      ...updateData,
    });

    const response = await request(app)
      .patch(`/products/${productId}`)
      .send({ ...updateData, mockUser: adminUser });

    expect(response.status).toBe(200);
    expect(response.body.price).toBe(199.99);
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: productId },
      data: updateData,
    });
  });

  it('deve retornar erro 404 se o produto a ser atualizado não existir', async () => {
    const nonExistentId = 'produto-fantasma-404';
    const updateData = { price: 100 };
    const adminUser = { userId: 'admin-id', role: 'ADMIN' };

    // erro específico que o Prisma retorna quando não encontra um registro para atualizar
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'An operation failed because it depends on one or more records that were required but not found.',
      { code: 'P2025', clientVersion: 'mock' }
    );
    prismaMock.product.update.mockRejectedValue(prismaError);

    const response = await request(app)
      .patch(`/products/${nonExistentId}`)
      .send({ ...updateData, mockUser: adminUser });
    
    expect(response.status).toBe(404);
    expect(response.body.error).toContain('Produto não encontrado');
  });

  it('deve retornar erro 403 se um usuário não-ADMIN tentar atualizar', async () => {
    const productId = 'produto-123';
    const updateData = { price: 100 };
    const regularUser = { userId: 'user-id', role: 'USER' };

    const response = await request(app)
      .patch(`/products/${productId}`)
      .send({ ...updateData, mockUser: regularUser });

    expect(response.status).toBe(403);
    expect(prismaMock.product.update).not.toHaveBeenCalled();
  });
});