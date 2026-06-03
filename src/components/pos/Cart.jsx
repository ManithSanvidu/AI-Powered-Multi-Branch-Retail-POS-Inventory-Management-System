import CartItem from "./CartItem";

const Cart = ({
  cart,
  total,
  increaseQty,
  decreaseQty,
  removeItem,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-xl font-bold text-blue-600 mb-4">
        Shopping Cart
      </h2>

      <div className="space-y-4">
        {cart.map((item) => (
          <CartItem
            key={item._id}
            item={item}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
            removeItem={removeItem}
          />
        ))}
      </div>

      <div className="border-t mt-5 pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-blue-600">
            Rs. {total}
          </span>
        </div>

        <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg">
          Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;