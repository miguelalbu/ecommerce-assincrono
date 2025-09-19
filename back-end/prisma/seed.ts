import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding...');

  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.customer.deleteMany({});
  

  await prisma.product.createMany({
    data: [
      { name: 'Notebook Gamer Avançado', price: 7500.50, stock: 15 },
      { name: 'Mouse Vertical Ergonômico', price: 350.00, stock: 40 },
      { name: 'Teclado Mecânico RGB', price: 550.75, stock: 25 },
      { name: 'Monitor Ultrawide 34"', price: 2800.00, stock: 10 },
    ],
  });

  console.log('Criando usuário admin...');
  const hashedPassword = await bcrypt.hash('admin123', 10); // Senha para o admin

  const adminCustomer = await prisma.customer.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@ecommerce.com',
      cpf_cnpj: '000.000.000-00',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      role: Role.ADMIN,
      customerId: adminCustomer.id,
    },
  });

  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });