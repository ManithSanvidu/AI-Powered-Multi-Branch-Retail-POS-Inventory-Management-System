import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductListPage from "./pages/products/ProductListPage";
import AddProductPage from "./pages/products/AddProductPage";
import EditProductPage from "./pages/products/EditProductPage";
import ProductDetailsPage from "./pages/products/ProductDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/products" />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/add" element={<AddProductPage />} />
        <Route path="/products/edit/:id" element={<EditProductPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;