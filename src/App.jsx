import React from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { CartProvider } from './context/CartContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { ProductProvider } from './context/ProductContext';
import { SalesProvider } from './context/SalesContext';

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
import WarehouseList from './pages/warehouse/WarehouseList';
import WarehouseDetail from './pages/Warehouse/WarehouseDetail';

import './App.css';

function App() {
  return (
    <EmployeeProvider>
      <ProductProvider>
        <SalesProvider>
          <CartProvider>
            <Router>
              <div className="app-container">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pos" element={<POSPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/receipt" element={<ReceiptPage />} />
                  <Route path="/history" element={<SalesHistoryPage />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/products/add" element={<AddProductPage />} />
                  <Route path="/products/edit/:id" element={<EditProductPage />} />
                  <Route path="/products/:id" element={<ProductDetailsPage />} />
                  <Route path="/employees" element={<EmployeesPage />} />
                  <Route path="/warehouse" element={<WarehouseList />} />
                  <Route path="/warehouse/:id" element={<WarehouseDetail />} />
                </Routes>
              </div>
            </Router>
          </CartProvider>
        </SalesProvider>
      </ProductProvider>
    </EmployeeProvider>
  );
}

export default App;
