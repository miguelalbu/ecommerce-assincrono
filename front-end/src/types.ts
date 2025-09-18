// front-end/src/types.ts

// Tipo para um único Produto
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
}

// Tipo para um item dentro de um pedido
export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  productId: string;
  orderId: string;
}

// Tipo para o Pedido, agora atualizado para corresponder à API
export interface Order {
  id: string;
  customerId: string;
  // Os status agora correspondem exatamente aos do back-end
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  // A propriedade 'total' é opcional
  total?: number;
  // A propriedade 'orderItems' agora existe e é um array de OrderItem
  orderItems?: OrderItem[];
}

// Tipo para o Cliente (pode ser útil em outras partes do app)
export interface Customer {
  id: string;
  name: string;
  email: string;
  cpf_cnpj: string;
}