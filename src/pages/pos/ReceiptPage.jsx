import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import ReceiptPreview from "../../components/pos/ReceiptPreview";

const ReceiptPage = () => {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const sale      = state?.sale;

  if (!sale) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No receipt data available.</p>
          <button
            onClick={() => navigate("/pos")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Back to POS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      {/* Success banner */}
      <div className="flex items-center gap-2 text-green-600 font-semibold mb-6 print:hidden">
        <CheckCircle size={22} />
        Sale Completed Successfully!
      </div>

      {/* Receipt */}
      <ReceiptPreview sale={sale} />

      {/* Back button */}
      <button
        onClick={() => navigate("/pos")}
        className="mt-5 flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 font-medium print:hidden"
      >
        <ArrowLeft size={16} /> New Sale
      </button>
    </div>
  );
};

export default ReceiptPage;
