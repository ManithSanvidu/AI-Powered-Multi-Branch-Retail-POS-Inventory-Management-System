import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

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
import ReturnsPage from './pages/returns/ReturnsPage';

import './App.css';

const initialInvoices = [
  {
    id: 'INV-2026-001',
    customer: 'Yasith Silva',
    branch: 'Colombo Main (HQ)',
    date: '2026-05-20',
    paymentMethod: 'Credit Card',
    items: [
      { id: 'PROD-101', name: 'iPad Pro 11-inch M4', qty: 1, price: 999.00, returnedQty: 0 },
      { id: 'PROD-102', name: 'Apple Pencil Pro', qty: 1, price: 129.00, returnedQty: 0 },
      { id: 'PROD-103', name: 'Paperlike Screen Protector', qty: 2, price: 39.99, returnedQty: 1 }
    ],
    taxRate: 0.12,
    discountAmount: 50.00
  },
  {
    id: 'INV-2026-002',
    customer: 'Malmi Shehara',
    branch: 'Kandy City Mall',
    date: '2026-04-10', 
    paymentMethod: 'Cash',
    items: [
      { id: 'PROD-201', name: 'MacBook Air M3', qty: 1, price: 1099.00, returnedQty: 0 },
      { id: 'PROD-202', name: 'Apple Magic Mouse', qty: 1, price: 79.00, returnedQty: 0 }
    ],
    taxRate: 0.08,
    discountAmount: 0.00
  },
  {
    id: 'INV-2026-003',
    customer: 'Gavesha Thathsarani',
    branch: 'Galle Harbour Rd',
    date: '2026-05-29', 
    paymentMethod: 'Digital Wallet',
    items: [
      { id: 'PROD-301', name: 'Sony WH-1000XM5 Headphones', qty: 1, price: 399.00, returnedQty: 0 },
      { id: 'PROD-302', name: 'Anker USB-C Hub 7-in-1', qty: 2, price: 49.99, returnedQty: 0 }
    ],
    taxRate: 0.10,
    discountAmount: 20.00
  }
];

const initialReturns = [
  {
    id: 'RET-2026-001',
    invoiceId: 'INV-2026-001',
    customer: 'Dave Smith',
    branch: 'Colombo Main (HQ)',
    date: '2026-05-22',
    amount: 44.79, 
    status: 'Refunded',
    reason: 'Defective item',
    condition: 'Damaged (Write-off)',
    items: [
      { id: 'PROD-103', name: 'Paperlike Screen Protector', qty: 1, price: 39.99 }
    ]
  },
  {
    id: 'RET-2026-002',
    invoiceId: 'INV-2026-003',
    customer: 'John Doe',
    branch: 'Galle Harbour Rd',
    date: '2026-06-01',
    amount: 109.98,
    status: 'Pending Approval',
    reason: 'Wrong item shipped',
    condition: 'Resellable (Restock)',
    items: [
      { id: 'PROD-302', name: 'Anker USB-C Hub 7-in-1', qty: 2, price: 49.99 }
    ]
  }
];

function App() {
  const [returnState, setReturnState] = useState({
    invoices: initialInvoices,
    returns: initialReturns
  });

  return (
    <EmployeeProvider>
      <ProductProvider>
        <SalesProvider>
          <CartProvider>
            <Router>
              <div className="app-container">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard returnState={returnState} setReturnState={setReturnState} />} />
                  <Route path="/pos" element={<POSPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/receipt" element={<ReceiptPage />} />
                  <Route path="/history" element={<SalesHistoryPage />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/products/add" element={<AddProductPage />} />
                  <Route path="/products/edit/:id" element={<EditProductPage />} />
                  <Route path="/products/:id" element={<ProductDetailsPage />} />
                  <Route path="/employees" element={<EmployeesPage />} />
                  
                  {/* Integrated Returns Feature */}
                  <Route 
                    path="/returns" 
                    element={
                      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw', overflowX: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
                        <header style={{
                          height: '64px',
                          backgroundColor: 'var(--bg-secondary)',
                          borderBottom: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 24px',
                          position: 'sticky',
                          top: 0,
                          zIndex: 90
                        }} className="no-print">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--accent-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '18px',
                              boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)'
                            }}>
                              <FiRefreshCw style={{ animation: 'spin 12s linear infinite' }} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.2' }}>Returns & Refunds Station</div>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI POS Module</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FiAlertCircle style={{ color: 'var(--success-color)' }} /> System Status: <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>Active</span>
                            </div>
                            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color)' }} />
                            <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                              June 2, 2026
                            </div>
                          </div>
                        </header>

                        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <ReturnsPage returnState={returnState} setReturnState={setReturnState} />
                        </main>
                      </div>
                    } 
                  />
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

