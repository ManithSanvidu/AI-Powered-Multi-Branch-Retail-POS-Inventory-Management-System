const PaymentMethod = ({
  selected,
  setSelected,
}) => {
  return (
    <div className="space-y-3">
      {["Cash", "Card", "QR"].map((method) => (
        <label
          key={method}
          className="flex items-center gap-2"
        >
          <input
            type="radio"
            checked={selected === method}
            onChange={() =>
              setSelected(method)
            }
          />

          {method}
        </label>
      ))}
    </div>
  );
};

export default PaymentMethod;