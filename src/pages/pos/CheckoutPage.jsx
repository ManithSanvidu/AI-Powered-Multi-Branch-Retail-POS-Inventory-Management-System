import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useSales } from "../../context/SalesContext";
import { createSale } from "../../services/salesApi";
import PaymentMethod from "../../components/pos/PaymentMethod";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, subtotal, discount, taxAmount, total, buildCheckoutPayload, clearCart } = useCart();
  const { addSale } = useSales();

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashReceived, setCashReceived]   = useState("");
  const [customerId, setCustomerId]       = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  if (cart.length === 0) { navigate("/pos"); return null; }

  const change     = paymentMethod === "CASH" && cashReceived ? parseFloat(cashReceived) - total : 0;
  const canConfirm = paymentMethod !== "CASH" || (cashReceived && parseFloat(cashReceived) >= total);

  const handleConfirm = async () => {
    setError(""); setLoading(true);
    try {
      const payload = buildCheckoutPayload(paymentMethod, parseFloat(cashReceived), customerId);
      const res     = await createSale(payload);
      const sale    = res.data.data;
      addSale(sale);
      clearCart();
      navigate("/receipt", { state: { sale } });
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate("/pos")}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-5 text-sm"
        >
          <ArrowLeft size={16} /> Back to POS
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-7">
          <h1 className="text-2xl font-bold text-blue-600 mb-6">Checkout</h1>

          {/* Order Summary */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm space-y-1">
            <p className="font-medium text-gray-700 mb-2">Order Summary ({cart.length} items)</p>
            {cart.map((i) => (
              <div key={i._id} className="flex justify-between text-gray-600">
                <span>{i.name} × {i.qty}</span>
                <span>Rs.{(i.price * i.qty).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>Rs.{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>– Rs.{discount.toLocaleString()}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span><span>Rs.{taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-blue-600 text-base">
                <span>Total</span><span>Rs.{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer (optional) */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer ID <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Leave blank for walk-in"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Payment Method — using component */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <PaymentMethod selected={paymentMethod} setSelected={(m) => { setPaymentMethod(m); setCashReceived(""); }} />
          </div>

          {/* Cash Received */}
          {paymentMethod === "CASH" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cash Received (Rs.)</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder={`Min: Rs.${total.toLocaleString()}`}
                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
              />
              {cashReceived && (
                <div className={`mt-2 flex items-center gap-2 text-sm font-medium ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {change >= 0 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {change >= 0
                    ? `Change to return: Rs.${change.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`
                    : `Short by Rs.${Math.abs(change).toLocaleString()}`}
                </div>
              )}
            </div>
          )}

          {paymentMethod === "CARD" && (
            <div className="mb-5 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              Swipe / tap card on the terminal. Confirm when approved.
            </div>
          )}
          {paymentMethod === "QR" && (
            <div className="mb-5 p-3 bg-purple-50 rounded-lg text-sm text-purple-700">
              Show QR to customer. Confirm once payment received.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-base"
          >
            {loading ? "Processing..." : `Confirm Payment — Rs.${total.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
