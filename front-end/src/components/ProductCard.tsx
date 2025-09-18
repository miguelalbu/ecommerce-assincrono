import React, { useState } from 'react';
import { ShoppingCart, Package, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${quantity}x ${product.name} adicionado(s) ao carrinho!`);
    setQuantity(1);
  };

  const incrementQuantity = () => {

    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {

    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      <div>
        <div className="aspect-square bg-gray-100 rounded-t-xl flex items-center justify-center">
          <Package className="h-16 w-16 text-gray-400" />
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 h-10">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">
              R$ {product.price.toFixed(2)}
            </span>
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t">
        {user && product.stock > 0 ? (
          <div className="flex items-center space-x-3">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={decrementQuantity} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 font-medium text-gray-800 tabular-nums">{quantity}</span>
              <button onClick={incrementQuantity} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled={quantity >= product.stock}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Adicionar</span>
            </button>
          </div>
        ) : !user ? (
          <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg text-center font-medium">
            Faça login para comprar
          </div>
        ) : (
          <div className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg text-center font-medium">
            Fora de estoque
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;