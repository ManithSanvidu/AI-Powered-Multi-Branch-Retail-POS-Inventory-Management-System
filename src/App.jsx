import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProductProvider } from "./context/ProductContext";
import { SalesProvider } from "./context/SalesContext";
import { CartProvider } from "./context/CartContext";
import POSPage from "./pages/pos/POSPage";
import CheckoutPage from "./pages/pos/CheckoutPage";
import ReceiptPage from "./pages/pos/ReceiptPage";
import SalesHistoryPage from "./pages/pos/SalesHistoryPage"; 
import './index.css';

function App() {
  return (
    <ProductProvider>
      <SalesProvider>
        <CartProvider>
          <Router>
            <div className="app-container">
              <Routes>
                <Route path="/" element={<POSPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/receipt" element={<ReceiptPage />} />
                <Route path="/history" element={<SalesHistoryPage />} /> 
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </SalesProvider>
    </ProductProvider>
  );
}

export default App;