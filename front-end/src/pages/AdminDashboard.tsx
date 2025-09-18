import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save } from 'lucide-react';
import { Product } from '../types';
import Header from '../components/Header';
import api from '../utils/api';

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    price: '',
    stock: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  
  const fetchProducts = async () => {
    try {
      const productsResponse = await api.get('/products');
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Falha ao buscar produtos', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock),
    };

    try {
      if (isEditing) {
        await api.patch(`/products/${productForm.id}`, productData);
      } else {
        await api.post('/products', productData);
      }
      fetchProducts();
      setProductForm({ id: '', name: '', price: '', stock: '' });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar o produto:', error);
      alert('Erro ao salvar o produto. Verifique o console.');
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
    });
    setIsEditing(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      console.log(`Exclusão do produto com ID: ${productId} ainda não implementada.`);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-2">Gerencie os produtos da sua loja</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {isEditing ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estoque
                    </label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isEditing ? 'Salvar Alterações' : 'Criar Produto'}</span>
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setProductForm({ id: '', name: '', price: '', stock: '' });
                          setIsEditing(false);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Lista de Produtos</h2>
                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <div className="flex space-x-4 mt-1">
                            <span className="text-sm text-green-600 font-medium">
                              R$ {product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-600">
                              Estoque: {product.stock}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;