import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../services/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { cpf, cnpj } from 'cpf-cnpj-validator';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';


router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password, cpf_cnpj, role = 'USER' } = req.body;

  if (!email || !password || !name || !cpf_cnpj) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Validação básica dos campos CPF/CNPJ
  const documentoLimpo = cpf_cnpj.replace(/\D/g, '');
  if (!cpf.isValid(documentoLimpo) && !cnpj.isValid(documentoLimpo)) {
    return res.status(400).json({ error: 'CPF ou CNPJ inválido.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (prisma) => {
      const customer = await prisma.customer.create({
        data: {
          name,
          email,
          cpf_cnpj,
        },
      });

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role.toUpperCase(), // <--- CORREÇÃO AQUI
          customerId: customer.id,
        },
      });

      return { user, customer };
    });

    const token = jwt.sign(
      { 
        userId: result.user.id, 
        email: result.user.email, 
        name: result.user.name,
        role: result.user.role, 
        customerId: result.customer.id 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Usuário e Cliente registrados com sucesso!',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        customer: result.customer,
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'E-mail ou CPF/CNPJ já cadastrado.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota de login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            cpf_cnpj: true,
          }
        },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) { // <--- CORREÇÃO AQUI
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role, 
        customerId: user.customerId 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const { password: userPassword, ...userWithoutPassword } = user;

    res.json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        ...userWithoutPassword,
        customer: user.customer,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

export default router;