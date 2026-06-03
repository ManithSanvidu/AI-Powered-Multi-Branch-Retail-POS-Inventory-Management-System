import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Contexts
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from './context/CartContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { ProductProvider } from './context/ProductContext';
import { SalesProvider } from './context/SalesContext';

// Routes
import ProtectedRoute from "./routes/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/auth/Profile";

// POS Pages
import Dashboard from './pages/dashboard/Dashboard';
import EmployeesPage from './pages/employees/EmployeesPage';
import CheckoutPage from './pages/pos/CheckoutPage';
import POSPage from './pages/pos/POSPage';
import ReceiptPage from './pages/pos/ReceiptPage';
import SalesHistoryPage from './pages/pos/SalesHistoryPage';
import AddProductPage from './pages/products/AddProductPage';
import EditProductPage from './pages/products/EditProductPage';
import ProductDetailsPage from './pages/products/ProductDetailsPage';
import ProductListPage from './pages/products/ProductListPage';
import ReturnsPage from './pages/returns/ReturnsPage';
import PurchaseOrdersPage from './pages/purchase-orders/PurchaseOrdersPage';
import BranchListPage from "./pages/branches/BranchListPage";

import './App.css';

// Placeholder for roles
const AdminPanel = () => <h1>🔐 Admin Panel</h1>;
const Unauthorized = () => <h1>⛔ Unauthorized Access</h1>;

function App() {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <ProductProvider>
          <SalesProvider>
            <CartProvider>
              <BrowserRouter>
                <div className="app-container">
                  <Routes>
                    {/* Public Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Private Routes (Protected) */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute roles={["admin", "manager", "cashier"]}>
                        <Dashboard />
                      </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                      <ProtectedRoute roles={["admin"]}>
                        <AdminPanel />
                      </ProtectedRoute>
                    } />

                    {/* POS & Inventory Routes */}
                    <Route path="/pos" element={<POSPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/receipt" element={<ReceiptPage />} />
                    <Route path="/history" element={<SalesHistoryPage />} />
                    <Route path="/products" element={<ProductListPage />} />
                    <Route path="/products/add" element={<AddProductPage />} />
                    <Route path="/products/edit/:id" element={<EditProductPage />} />
                    <Route path="/products/:id" element={<ProductDetailsPage />} />
                    <Route path="/employees" element={<EmployeesPage />} />
                    <Route path="/returns" element={<ReturnsPage />} />
                    <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                    <Route path="/branches" element={<BranchListPage />} />

                    {/* Default redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </CartProvider>
          </SalesProvider>
        </ProductProvider>
      </EmployeeProvider>
    </AuthProvider>
  );
}

export default App;