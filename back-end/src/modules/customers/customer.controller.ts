import { Request, Response, Router } from 'express';
import prisma from '../../services/prisma';

const router = Router();

// Rota para cadastro de clientes
router.post('/customers', async (req: Request, res: Response) => {
  const { name, email, cpf_cnpj } = req.body;

  // Validação básica dos dados de entrada
  if (!name || !email || !cpf_cnpj) {
    return res.status(400).json({ error: 'Nome, e-mail e CPF/CNPJ são obrigatórios.' });
  }

  try {
    const newCustomer = await prisma.customer.create({
      data: {
        name,
        email,
        cpf_cnpj
      },
    });

    return res.status(201).json(newCustomer);
  } catch (error: any) {
    // Tratar erros de duplicidade (e-mail ou cpf_cnpj já existentes)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'E-mail ou CPF/CNPJ já cadastrado.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

export default router;