import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/produtos" element={<Products />} />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute requireAuth>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meus-pedidos" 
              element={
                <ProtectedRoute requireAuth>
                  <MyOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requireAuth requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/produtos" />} />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;