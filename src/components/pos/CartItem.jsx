const CartItem = ({
  item,
  increaseQty,
  decreaseQty,
  removeItem,
}) => {
  return (
    <div className="border-b pb-3">
      <div className="flex justify-between">
        <h4 className="font-medium">
          {item.name}
        </h4>

        <button
          onClick={() => removeItem(item._id)}
          className="text-red-500"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2">
          <button
            onClick={() => decreaseQty(item._id)}
            className="px-2 bg-gray-200 rounded"
          >
            -
          </button>

          <span>{item.qty}</span>

          <button
            onClick={() => increaseQty(item._id)}
            className="px-2 bg-gray-200 rounded"
          >
            +
          </button>
        </div>

        <span className="font-semibold">
          Rs. {item.price * item.qty}
        </span>
      </div>
    </div>
  );
};

export default CartItem;