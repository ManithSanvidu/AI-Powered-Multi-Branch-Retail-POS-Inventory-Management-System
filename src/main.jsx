// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import './index.css'

// import { CartProvider } from "./context/CartContext";
// import { ProductProvider } from "./context/ProductContext";
// import { SalesProvider } from "./context/SalesContext";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <ProductProvider>
//       <CartProvider>
//         <SalesProvider>
//           <App />
//         </SalesProvider>
//       </CartProvider>
//     </ProductProvider>
//   </React.StrictMode>
// );

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)