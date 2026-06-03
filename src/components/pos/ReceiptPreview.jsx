// const ReceiptPreview = ({
//   items,
//   total,
// }) => {
//   return (
//     <div className="bg-white rounded-xl p-6 shadow">
//       <h2 className="text-center text-2xl font-bold text-blue-600">
//         DIGITAL RECEIPT
//       </h2>

//       <hr className="my-4" />

//       {items.map((item) => (
//         <div
//           key={item._id}
//           className="flex justify-between mb-2"
//         >
//           <span>
//             {item.name} x {item.qty}
//           </span>

//           <span>
//             Rs. {item.price * item.qty}
//           </span>
//         </div>
//       ))}

//       <hr className="my-4" />

//       <div className="flex justify-between text-xl font-bold text-blue-600">
//         <span>Total</span>
//         <span>Rs. {total}</span>
//       </div>
//     </div>
//   );
// };

// export default ReceiptPreview;

import { Printer } from "lucide-react";

const ReceiptPreview = ({ sale }) => {
  if (!sale) return null;

  const handlePrint = () => window.print();

  return (
    <div>
      {/* Receipt */}
      <div id="receipt-print" className="bg-white font-mono text-sm p-6 rounded-xl border max-w-sm mx-auto">
        {/* Store header */}
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold">{sale.branch?.name || "RETAIL STORE"}</h2>
          {sale.branch?.address && <p className="text-xs text-gray-500">{sale.branch.address}</p>}
          <div className="border-b-2 border-dashed mt-2" />
        </div>

        {/* Invoice info */}
        <div className="space-y-0.5 text-xs mb-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Invoice #</span>
            <span className="font-semibold">{sale.invoiceNumber || sale.invoice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span>{new Date(sale.createdAt || sale.date).toLocaleString("en-LK")}</span>
          </div>
          {(sale.cashier?.name) && (
            <div className="flex justify-between">
              <span className="text-gray-500">Cashier</span>
              <span>{sale.cashier.name}</span>
            </div>
          )}
          {sale.customer?.name && (
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span>{sale.customer.name}</span>
            </div>
          )}
        </div>

        <div className="border-b border-dashed mb-2" />

        {/* Items */}
        <div className="space-y-1.5 mb-3">
          {(sale.items || []).map((item, i) => (
            <div key={i}>
              <div className="flex justify-between">
                <span className="flex-1 mr-2 truncate">{item.name}</span>
                <span>Rs.{(item.lineTotal ?? item.price * item.qty)?.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-gray-400 pl-2">
                {item.qty} × Rs.{(item.unitPrice ?? item.price)?.toLocaleString()}
                {item.discount > 0 && ` (${item.discount}% off)`}
              </div>
            </div>
          ))}
        </div>

        <div className="border-b border-dashed mb-2" />

        {/* Totals */}
        <div className="space-y-0.5 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>Rs.{sale.subtotal?.toLocaleString()}</span>
          </div>
          {(sale.discountAmount > 0) && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>– Rs.{sale.discountAmount?.toLocaleString()}</span>
            </div>
          )}
          {(sale.taxAmount > 0) && (
            <div className="flex justify-between text-gray-600">
              <span>Tax ({sale.taxRate}%)</span>
              <span>Rs.{sale.taxAmount?.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="border-b border-dashed my-2" />

        <div className="flex justify-between font-bold text-base">
          <span>TOTAL</span>
          <span className="text-blue-600">Rs.{(sale.totalAmount ?? sale.amount)?.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Payment</span>
          <span className="font-semibold">{sale.paymentMethod ?? sale.payment}</span>
        </div>

        {sale.paymentMethod === "CASH" && sale.cashReceived && (
          <>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Cash Received</span>
              <span>Rs.{sale.cashReceived?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Change</span>
              <span>Rs.{sale.changeGiven?.toLocaleString()}</span>
            </div>
          </>
        )}

        <div className="border-t border-dashed mt-3 pt-2 text-center text-[10px] text-gray-400">
          <p>Thank you for shopping!</p>
          <p>Please keep this receipt for returns.</p>
        </div>
      </div>

      {/* Print button */}
      <div className="text-center mt-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 mx-auto text-sm font-medium"
        >
          <Printer size={15} /> Print Receipt
        </button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-print, #receipt-print * { visibility: visible; }
          #receipt-print { position: fixed; left: 0; top: 0; width: 80mm; }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPreview;
