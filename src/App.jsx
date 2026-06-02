import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ProductProvider } from "./context/ProductContext";
import { SalesProvider } from "./context/SalesContext";
import { CartProvider } from "./context/CartContext";

import Dashboard from "./pages/dashboard/Dashboard";

import POSPage from "./pages/pos/POSPage";
import CheckoutPage from "./pages/pos/CheckoutPage";
import ReceiptPage from "./pages/pos/ReceiptPage";
import SalesHistoryPage from "./pages/pos/SalesHistoryPage";

import ProductListPage from "./pages/products/ProductListPage";
import AddProductPage from "./pages/products/AddProductPage";
import EditProductPage from "./pages/products/EditProductPage";
import ProductDetailsPage from "./pages/products/ProductDetailsPage";

import "./index.css";

function App() {
  return (
    <ProductProvider>
      <SalesProvider>
        <CartProvider>
          <Router>
            <div className="app-container">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/pos" element={<POSPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/receipt" element={<ReceiptPage />} />
                <Route path="/history" element={<SalesHistoryPage />} />

                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/add" element={<AddProductPage />} />
                <Route path="/products/edit/:id" element={<EditProductPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </SalesProvider>
    </ProductProvider>
  );
}

export default App;