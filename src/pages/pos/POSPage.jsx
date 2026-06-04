import { History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductContext";
import BarcodeScanner from "../../components/pos/BarcodeScanner";
import ProductList    from "../../components/pos/ProductList";
import Cart           from "../../components/pos/Cart";

const POSPage = () => {
  const navigate = useNavigate();
  const {
    cart, addToCart, increaseQty, decreaseQty, removeItem, clearCart,
    subtotal, discount, setDiscount, taxRate, taxAmount, total,
  } = useCart();
  const { products } = useProducts();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-blue-600">🛒 POS — Cashier</h1>
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString("en-LK", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => navigate("/history")}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm"
        >
          <History size={15} /> Sales History
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Products */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
          <BarcodeScanner products={products} onFound={addToCart} />
          <div className="flex-1 overflow-hidden">
            <ProductList products={products} onAddToCart={addToCart} />
          </div>
        </div>

        {/* Right — Cart */}
        <Cart
          cart={cart}
          subtotal={subtotal}
          discount={discount}
          setDiscount={setDiscount}
          taxRate={taxRate}
          taxAmount={taxAmount}
          total={total}
          increaseQty={increaseQty}
          decreaseQty={decreaseQty}
          removeItem={removeItem}
          onClearCart={clearCart}
        />
      </div>
    </div>
  );
};

export default POSPage;
