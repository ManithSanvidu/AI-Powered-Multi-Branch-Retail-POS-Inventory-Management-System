import React from "react";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Checkout</h1>

        <div className="mb-5">
          <label className="font-medium">Total Amount</label>
          <input
            value="1300"
            readOnly
            className="w-full border p-3 rounded-lg mt-2"
          />
        </div>

        <div>
          <label className="font-medium">Payment Method</label>
          <div className="space-y-3 mt-3">
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" /> Cash
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" /> Card
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" /> QR Payment
            </label>
          </div>
        </div>

        <button 
          onClick={() => navigate("/receipt")}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;