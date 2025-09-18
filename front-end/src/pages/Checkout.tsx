import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, CheckCircle } from 'lucide-react'; 
import { useCart, CartItem } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import api from '../utils/api';

const Checkout: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.customer?.id) {
      alert('Você precisa estar logado para finalizar um pedido.');
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    const productsPayload = items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const orderData = {
      customerId: user.customer.id,
      products: productsPayload,
    };

    try {
      await api.post('/orders', orderData);
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error('Erro ao finalizar o pedido:', error);
      alert('Ocorreu um erro ao finalizar seu pedido. Por favor, tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderPlaced) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Realizado!</h2>
            <p className="text-gray-600 mb-6">Seu pedido foi processado com sucesso. Você pode acompanhar o status na página "Meus Pedidos".</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/meus-pedidos')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Ver Meus Pedidos</span>
              </button>
              <button
                onClick={() => navigate('/produtos')}
                className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Pedido</h1>
          {items.length === 0 ? (
             <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg mb-4">Seu carrinho está vazio</p>
                <a href="/produtos" className="text-blue-600 hover:text-blue-700 font-medium">
                  Continuar Comprando
                </a>
              </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Itens do Carrinho</h2>
                  <div className="space-y-6">
                    {items.map((item: CartItem) => ( 
                      <div key={item.product.id} className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">R$ {item.product.price.toFixed(2)}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <button onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-100">
                              <Minus className="h-4 w-4" />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-100">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">

                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumo do Pedido</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Frete</span>
                      <span className="font-medium text-green-600">Grátis</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-blue-600">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                  <form onSubmit={handlePlaceOrder}>
                    <button
                      type="submit"
                      disabled={isProcessing || items.length === 0 || !user}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          <span>Finalizar Pedido</span>
                        </>
                      )}
                    </button>
                    {!user && (
                      <p className="text-red-600 text-sm text-center mt-4">
                        Você precisa <a href="/login" className="font-bold underline">fazer login</a> para finalizar o pedido.
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;