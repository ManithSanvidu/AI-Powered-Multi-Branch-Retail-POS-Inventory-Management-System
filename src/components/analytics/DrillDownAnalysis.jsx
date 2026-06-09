import { useState, useCallback } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { formatLKR, formatNumber } from '../../services/analyticsService';
import { fetchDrillDownTransactions } from '../../services/analyticsService';

const GROUP_OPTIONS = [
  { key: 'day', label: 'Day' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'branch', label: 'Branch' },
  { key: 'category', label: 'Category' },
  { key: 'product', label: 'Product' },
];

function DrillDownAnalysis({ data, loading, params }) {
  const [groupBy, setGroupBy] = useState('month');
  const [drillIn, setDrillIn] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  if (loading && !data) {
    return <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm h-[320px]" />;
  }

  const drillData = data?.data || [];
  const pagination = data?.pagination || {};

  const handleDrill = useCallback(async (groupValue) => {
    setDrillIn(groupValue);
    setTxLoading(true);
    try {
      const res = await fetchDrillDownTransactions({ ...params, groupBy: groupBy === 'day' ? 'date' : groupBy, groupValue });
      setTransactions(res.data?.transactions || []);
    } catch {
      setTransactions([]);
    }
    setTxLoading(false);
  }, [groupBy, params]);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Drill-Down Analysis</h2>
            <p className="text-xs text-slate-500">Hierarchical data exploration</p>
          </div>
        </div>
        <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
          {GROUP_OPTIONS.map((g) => (
            <button
              key={g.key}
              onClick={() => { setGroupBy(g.key); setDrillIn(null); }}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition ${
                groupBy === g.key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500">
              <th className="py-2 pr-2 text-left font-semibold">{groupBy === 'day' ? 'Date' : groupBy === 'month' ? 'Month' : groupBy === 'year' ? 'Year' : groupBy === 'branch' ? 'Branch' : groupBy === 'category' ? 'Category' : 'Product'}</th>
              <th className="py-2 px-2 text-right font-semibold">Revenue</th>
              <th className="py-2 px-2 text-right font-semibold">Transactions</th>
              <th className="py-2 px-2 text-right font-semibold">Avg Value</th>
              <th className="py-2 px-2 text-right font-semibold">Items</th>
              <th className="py-2 pl-2 text-right font-semibold">Drill</th>
            </tr>
          </thead>
          <tbody>
            {drillData.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-2.5 pr-2 font-semibold text-slate-800">{row._id || row.name || 'N/A'}</td>
                <td className="py-2.5 px-2 text-right font-semibold text-slate-800">{formatLKR(row.revenue)}</td>
                <td className="py-2.5 px-2 text-right text-slate-600">{formatNumber(row.transactionCount)}</td>
                <td className="py-2.5 px-2 text-right text-slate-600">{formatLKR(row.avgOrderValue)}</td>
                <td className="py-2.5 px-2 text-right text-slate-600">{formatNumber(row.totalItems || row.itemCount || row.quantitySold || 0)}</td>
                <td className="py-2.5 pl-2 text-right">
                  <button
                    onClick={() => handleDrill(row._id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                  >
                    <ExternalLink size={11} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {drillData.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">No data available</p>
        )}
      </div>

      {pagination.total > 0 && (
        <div className="mt-3 text-xs text-slate-500 text-center">
          Showing {drillData.length} of {pagination.total} groups
        </div>
      )}

      {drillIn && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Transactions for: {drillIn}
            </p>
            <button
              onClick={() => { setDrillIn(null); setTransactions([]); }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Close
            </button>
          </div>
          {txLoading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded-lg bg-blue-100" />)}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">#{tx.invoiceNumber || tx._id?.slice(-6) || `TX-${i + 1}`}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{formatLKR(tx.totalAmount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-blue-600">No transactions found for this group.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default DrillDownAnalysis;
