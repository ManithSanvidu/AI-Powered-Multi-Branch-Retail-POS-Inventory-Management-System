import React from "react";
import { useNavigate } from "react-router-dom";

const ReceiptPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
      <div className="bg-white w-[400px] rounded-xl shadow-md p-6">
        <h1 className="text-center text-2xl font-bold text-blue-600">
          DIGITAL RECEIPT
        </h1>

        <hr className="my-4" />
        <p>Invoice No : INV-001</p>
        <p>Date : 2026-06-02</p>
        <hr className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Rice x2</span>
            <span>500</span>
          </div>
          <div className="flex justify-between">
            <span>Milk x1</span>
            <span>800</span>
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex justify-between text-xl font-bold text-blue-600">
          <span>Total</span>
          <span>1300</span>
        </div>

        <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
          Print Receipt
        </button>

        <button 
          onClick={() => navigate("/")}
          className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Back to POS
        </button>
      </div>
    </div>
  );
};

export default ReceiptPage;