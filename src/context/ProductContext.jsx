import {
  createContext,
  useContext,
  useState,
} from "react";

const ProductContext = createContext();

export const useProducts = () =>
  useContext(ProductContext);

export const ProductProvider = ({
  children,
}) => {
  const [products] = useState([
    {
      _id: "1",
      name: "Rice 1kg",
      price: 250,
      stock: 100,
      barcode: "10001",
    },
    {
      _id: "2",
      name: "Sugar 1kg",
      price: 300,
      stock: 50,
      barcode: "10002",
    },
    {
      _id: "3",
      name: "Milk Powder",
      price: 800,
      stock: 35,
      barcode: "10003",
    },
    {
      _id: "4",
      name: "Tea Pack",
      price: 450,
      stock: 40,
      barcode: "10004",
    },
  ]);

  return (
    <ProductContext.Provider
      value={{ products }}
    >
      {children}
    </ProductContext.Provider>
  );
};