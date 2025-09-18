import React, { useState, useEffect, useCallback } from 'react';
import { Package, Clock, CheckCircle, Truck, CreditCard, XCircle } from 'lucide-react';
import { Order } from '../types';
import Header from '../components/Header';
import api from '../utils/api';

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {

      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Falha ao buscar os pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000); 


    return () => clearInterval(interval);
  }, [fetchOrders]);


  const handleConfirmPayment = async (orderId: string) => {
    try {

      await api.post(`/orders/${orderId}/confirm-payment`);

      fetchOrders();
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      alert('Não foi possível processar a confirmação de pagamento.');
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'DELIVERED':
        return <Package className="h-5 w-5 text-purple-600" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Aguardando Pagamento';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'SHIPPED':
        return 'Enviado';
      case 'DELIVERED':
        return 'Entregue';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'DELIVERED':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">Você ainda não fez nenhum pedido</p>
              <a
                href="/produtos"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Começar a Comprar
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Pedido #{order.id.substring(0, 8)}...
                      </h2>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </div>
                      
                    
                      {order.status === 'PENDING_PAYMENT' && (
                        <button
                          onClick={() => handleConfirmPayment(order.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Confirmar Pagamento</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-4">
                    {order.orderItems?.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            R$ {(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-600">Total do Pedido</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {order.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;