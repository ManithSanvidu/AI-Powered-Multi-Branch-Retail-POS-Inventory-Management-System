import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { getSales, voidSale, getSalesSummary } from "../../services/salesApi";
import { useSales } from "../../context/SalesContext";
import SalesTable from "../../components/pos/SalesTable";

const SalesHistoryPage = () => {
  const navigate = useNavigate();
  const { sales: localSales } = useSales();

  const [sales, setSales]         = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [period, setPeriod]       = useState("today");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, sumRes] = await Promise.all([
        getSales({ paymentMethod: paymentFilter || undefined, page }),
        getSalesSummary(period),
      ]);
      setSales(sRes.data.data);
      setPagination(sRes.data.pagination || {});
      setSummary(sumRes.data.data);
    } catch {
      // Fallback to local context
      setSales(localSales);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [period, paymentFilter, page]);

  const handleVoid = async (sale) => {
    if (!window.confirm(`Void sale ${sale.invoiceNumber}? This will restore inventory.`)) return;
    try {
      await voidSale(sale._id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to void sale");
    }
  };

  const handleView = (sale) => navigate("/receipt", { state: { sale } });

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/pos")} className="text-gray-500 hover:text-gray-800">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-blue-600">Sales History</h1>
        </div>
        <button onClick={loadData} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Revenue",       value: `Rs.${summary.totalRevenue?.toLocaleString() ?? 0}`,               color: "text-blue-600" },
            { label: "Transactions",  value: summary.totalTransactions ?? 0,                                    color: "text-gray-700" },
            { label: "Avg. Value",    value: `Rs.${Math.round(summary.avgTransactionValue ?? 0).toLocaleString()}`, color: "text-gray-700" },
            { label: "Cash / Card / QR",
              value: `${Math.round(summary.cashSales ?? 0).toLocaleString()} / ${Math.round(summary.cardSales ?? 0).toLocaleString()} / ${Math.round(summary.qrSales ?? 0).toLocaleString()}`,
              color: "text-gray-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`font-bold mt-0.5 ${color} text-sm`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex gap-1">
          {["today", "week", "month"].map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                period === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-1.5 text-xs outline-none"
        >
          <option value="">All Payments</option>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="QR">QR</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : (
          <SalesTable sales={sales} onView={handleView} onVoid={handleVoid} />
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm ${p === page ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistoryPage;
