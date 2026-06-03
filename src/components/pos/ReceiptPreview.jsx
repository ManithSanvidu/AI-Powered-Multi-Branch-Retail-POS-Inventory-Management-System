const ReceiptPreview = ({
  items,
  total,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h2 className="text-center text-2xl font-bold text-blue-600">
        DIGITAL RECEIPT
      </h2>

      <hr className="my-4" />

      {items.map((item) => (
        <div
          key={item._id}
          className="flex justify-between mb-2"
        >
          <span>
            {item.name} x {item.qty}
          </span>

          <span>
            Rs. {item.price * item.qty}
          </span>
        </div>
      ))}

      <hr className="my-4" />

      <div className="flex justify-between text-xl font-bold text-blue-600">
        <span>Total</span>
        <span>Rs. {total}</span>
      </div>
    </div>
  );
};

export default ReceiptPreview;