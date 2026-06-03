import {
  createContext,
  useContext,
  useState,
} from "react";

const SalesContext = createContext();

export const useSales = () =>
  useContext(SalesContext);

export const SalesProvider = ({
  children,
}) => {
  const [sales, setSales] = useState([]);

  const addSale = (sale) => {
    setSales((prev) => [
      ...prev,
      {
        id: Date.now(),
        invoice:
          "INV-" +
          Math.floor(
            Math.random() * 10000
          ),
        date:
          new Date().toLocaleDateString(),
        ...sale,
      },
    ]);
  };

  return (
    <SalesContext.Provider
      value={{
        sales,
        addSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};