import express from 'express';
import cors from 'cors';
import customerRouter from './modules/customers/customer.controller';
import productRouter from './modules/products/product.controller';
import orderRouter from './modules/orders/order.controller';
import authRouter from './modules/auth/auth.controller';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);

app.use('/api', customerRouter);
app.use('/api', productRouter);
app.use('/api', orderRouter);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});