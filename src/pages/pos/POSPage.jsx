import React from "react";
import { Search, ShoppingCart, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

const POSPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">POS System</h1>
          <p className="text-gray-500">Cashier Dashboard</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => navigate("/history")}
            className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            
          </button>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
            New Sale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-8">
          <div className="bg-white rounded-xl shadow-sm p-5">
            {/* Search */}
            <div className="flex gap-3 mb-5">
              <div className="flex items-center border rounded-lg px-3 flex-1">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search Product..."
                  className="w-full p-2 outline-none"
                />
              </div>

              <button className="bg-blue-600 text-white px-4 rounded-lg flex items-center gap-2">
                <ScanLine size={18} />
                Scan
              </button>
            </div>

            
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="border rounded-xl p-4 hover:shadow-md cursor-pointer"
                >
                  <div className="h-28 bg-blue-50 rounded-lg mb-3"></div>
                  <h3 className="font-semibold">Product {item}</h3>
                  <p className="text-blue-600 font-bold">Rs. 500</p>
                  <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg">
                    Add To Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingCart className="text-blue-600" />
              <h2 className="text-xl font-semibold">Shopping Cart</h2>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-3">
                <h4 className="font-medium">Rice 1kg</h4>
                <p className="text-gray-500">Qty : 2</p>
                <p className="font-semibold">Rs. 500</p>
              </div>

              <div className="border-b pb-3">
                <h4 className="font-medium">Milk Powder</h4>
                <p className="text-gray-500">Qty : 1</p>
                <p className="font-semibold">Rs. 800</p>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>Rs. 1300</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Discount</span>
                <span>Rs. 0</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-blue-600">
                <span>Total</span>
                <span>Rs. 1300</span>
              </div>

              <button 
                onClick={() => navigate("/checkout")}
                className="w-full mt-5 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSPage;