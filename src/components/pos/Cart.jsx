// import CartItem from "./CartItem";

// const Cart = ({
//   cart,
//   total,
//   increaseQty,
//   decreaseQty,
//   removeItem,
// }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm p-5">
//       <h2 className="text-xl font-bold text-blue-600 mb-4">
//         Shopping Cart
//       </h2>

//       <div className="space-y-4">
//         {cart.map((item) => (
//           <CartItem
//             key={item._id}
//             item={item}
//             increaseQty={increaseQty}
//             decreaseQty={decreaseQty}
//             removeItem={removeItem}
//           />
//         ))}
//       </div>

//       <div className="border-t mt-5 pt-4">
//         <div className="flex justify-between text-lg font-bold">
//           <span>Total</span>
//           <span className="text-blue-600">
//             Rs. {total}
//           </span>
//         </div>

//         <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg">
//           Checkout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Cart;

import { useNavigate } from "react-router-dom";
import { ShoppingCart, Tag } from "lucide-react";
import CartItem from "./CartItem";

const Cart = ({
  cart = [],
  subtotal = 0,
  discount = 0,
  setDiscount,
  taxRate = 0,
  taxAmount = 0,
  total = 0,
  increaseQty,
  decreaseQty,
  removeItem,
  onClearCart,
}) => {
  const navigate   = useNavigate();
  const itemCount  = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="w-80 xl:w-96 bg-white border-l flex flex-col h-full">
       {/* Header  */}
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-blue-600" />
          <span className="font-semibold text-sm">Cart</span>
          {itemCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] rounded-full px-1.5 py-0.5 font-medium">
              {itemCount}
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <button
            onClick={() => { if (window.confirm("Clear cart?")) onClearCart?.(); }}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {cart.length === 0 ? (
          <div className="text-center text-gray-300 mt-20">
            <ShoppingCart size={36} className="mx-auto mb-2" />
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs mt-1">Scan a barcode or tap a product</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item._id}
              item={item}
              increaseQty={increaseQty}
              decreaseQty={decreaseQty}
              removeItem={removeItem}
            />
          ))
        )}
      </div>

      {/* Totals */}
      {cart.length > 0 && (
        <div className="border-t px-4 py-3 space-y-1.5 shrink-0">
          {/* Discount */}
          <div className="flex items-center gap-2">
            <Tag size={12} className="text-gray-400" />
            <label className="text-xs text-gray-500">Discount (Rs.)</label>
            <input
              type="number"
              min="0"
              max={subtotal}
              value={discount}
              onChange={(e) => setDiscount?.(Math.max(0, Number(e.target.value)))}
              className="border rounded px-2 py-0.5 text-xs w-20 text-right ml-auto"
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span>
            <span>Rs.{subtotal.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs text-green-600">
              <span>Discount</span>
              <span>– Rs.{discount.toLocaleString()}</span>
            </div>
          )}
          {taxRate > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Tax ({taxRate}%)</span>
              <span>Rs.{taxAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-blue-600 text-base border-t pt-1.5">
            <span>Total</span>
            <span>Rs.{total.toLocaleString()}</span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-sm mt-1"
          >
            Proceed to Checkout →
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
