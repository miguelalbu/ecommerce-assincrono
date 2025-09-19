import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, Prisma } from '@prisma/client';
import authRoutes from '../../src/modules/auth/auth.controller';
import { prismaMock } from '../singleton';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);


describe('POST /auth/login', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('deve autenticar o usuário e retornar um token em caso de sucesso', async () => {
    const loginData = { email: 'usuario@teste.com', password: 'senha123' };
    const hashedPassword = 'senha_criptografada_mock';
    const userInDb = { id: 'user-id-123', email: loginData.email, password: hashedPassword, name: 'Usuário de Teste', role: Role.USER, customerId: 'customer-id-456', createdAt: new Date(), updatedAt: new Date(), customer: { id: 'customer-id-456', name: 'Cliente Teste', email: 'usuario@teste.com', cpf_cnpj: '12345678900', createdAt: new Date(), updatedAt: new Date() } };
    
    prismaMock.user.findUnique.mockResolvedValue(userInDb);
    mockedBcrypt.compare.mockImplementation(async () => true);
    mockedJwt.sign.mockImplementation(() => 'fake.jwt.token');
    
    const response = await request(app).post('/auth/login').send(loginData);

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('fake.jwt.token');
  });

  it('deve retornar erro 400 se a senha estiver incorreta', async () => {
    const loginData = { email: 'usuario@teste.com', password: 'senha_errada' };
    const userInDb = { id: 'user-id-123', email: loginData.email, password: 'senha_criptografada_mock', name: 'Usuário de Teste', role: Role.USER, customerId: 'customer-id-456', createdAt: new Date(), updatedAt: new Date(), customer: { id: 'customer-id-456', name: 'Cliente Teste', email: 'usuario@teste.com', cpf_cnpj: '12345678900', createdAt: new Date(), updatedAt: new Date() } };

    prismaMock.user.findUnique.mockResolvedValue(userInDb);
    mockedBcrypt.compare.mockImplementation(async () => false);

    const response = await request(app).post('/auth/login').send(loginData);
    expect(response.status).toBe(400);
  });
});


describe('POST /auth/register', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('deve registrar um novo usuário e cliente com sucesso', async () => {
    const registerData = { name: 'Novo Usuário', email: 'novo@teste.com', password: 'senha forte', cpf_cnpj: '713.968.044-20' };
    const { password, ...customerData } = registerData;

    mockedBcrypt.hash.mockResolvedValue('senha_super_criptografada' as never);
    prismaMock.$transaction.mockImplementation(async (callback: any) => await callback(prismaMock));
    
    prismaMock.customer.create.mockResolvedValue({ id: 'customer-new', ...customerData });

    prismaMock.user.create.mockResolvedValue({ id: 'user-new', ...registerData, role: Role.USER, password: 'hashed', customerId: 'customer-new', createdAt: new Date(), updatedAt: new Date() });
    mockedJwt.sign.mockImplementation(() => 'novo.fake.token');

    const response = await request(app).post('/auth/register').send(registerData);

    expect(response.status).toBe(201);
    expect(response.body.token).toBe('novo.fake.token');
  });

  it('deve retornar erro 409 se o e-mail ou CPF/CNPJ já existir', async () => {
    const registerData = { name: 'Usuário Repetido', email: 'repetido@teste.com', password: '123', cpf_cnpj: '000' };
    const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: 'mock' });
    prismaMock.$transaction.mockRejectedValue(prismaError);
    const response = await request(app).post('/auth/register').send(registerData);
    expect(response.status).toBe(409);
  });
});