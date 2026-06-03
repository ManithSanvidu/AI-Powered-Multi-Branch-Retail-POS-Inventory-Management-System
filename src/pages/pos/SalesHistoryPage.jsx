import React from "react";
import { useNavigate } from "react-router-dom";

const SalesHistoryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">
            Sales History
          </h1>
          <button 
            onClick={() => navigate("/")}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Back to POS
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Payment</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-3">INV001</td>
              <td className="p-3">2026-06-02</td>
              <td className="p-3">Rs.1300</td>
              <td className="p-3">Cash</td>
            </tr>

            <tr className="border-b">
              <td className="p-3">INV002</td>
              <td className="p-3">2026-06-02</td>
              <td className="p-3">Rs.2500</td>
              <td className="p-3">Card</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesHistoryPage;