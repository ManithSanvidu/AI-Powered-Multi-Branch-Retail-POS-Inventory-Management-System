import { FiAlertTriangle } from "react-icons/fi";

export default function StockTable({ stocks }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Warehouse Stock</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Zone</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Quantity</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Min Stock</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No stock records found
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <tr key={stock._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{stock.product?.name}</p>
                      <p className="text-xs text-gray-500">{stock.product?.sku}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {stock.zone?.zoneName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-800">
                    {stock.quantity}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700">{stock.minStock}</td>
                  <td className="px-6 py-4 text-center">
                    {stock.isLowStock ? (
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <FiAlertTriangle size={16} />
                        <span className="text-xs font-semibold">Low Stock</span>
                      </div>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
