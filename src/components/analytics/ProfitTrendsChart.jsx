import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown } from 'lucide-react';
import { formatLKR } from '../../services/analyticsService';

function ProfitTrendsChart({ data, loading }) {
  if (loading && !data) {
    return <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm h-[320px]" />;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col items-center justify-center h-[320px]">
        <TrendingDown size={36} className="text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">There is no data</p>
        <p className="text-xs text-slate-400 mt-1">No profit trends data available</p>
      </div>
    );
  }

  const profitData = data.profitData || [];
  const summary = data.summary || {};

  const chartData = profitData.map((p) => ({
    period: p._id,
    revenue: p.revenue || 0,
    cost: p.cost || 0,
    netProfit: p.netProfit || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
              {p.name}: {formatLKR(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown size={18} className="text-emerald-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Profit Trends</h2>
            <p className="text-xs text-slate-500">Revenue vs Cost vs Profit analysis</p>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
          <p className="text-xs text-slate-500">Overall Margin</p>
          <p className="text-lg font-bold text-emerald-600">{summary.overallMargin || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg bg-blue-50 p-2 text-center">
          <p className="text-xs text-blue-600 font-semibold">Revenue</p>
          <p className="text-sm font-bold text-blue-800">{formatLKR(summary.totalRevenue)}</p>
        </div>
        <div className="rounded-lg bg-rose-50 p-2 text-center">
          <p className="text-xs text-rose-600 font-semibold">Cost</p>
          <p className="text-sm font-bold text-rose-800">{formatLKR(summary.totalCost)}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-2 text-center">
          <p className="text-xs text-emerald-600 font-semibold">Net Profit</p>
          <p className="text-sm font-bold text-emerald-800">{formatLKR(summary.totalProfit)}</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
          <p className="text-sm font-semibold">There is no data</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `LKR${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} />
            <Bar dataKey="revenue" name="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cost" name="cost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="netProfit" name="netProfit" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ProfitTrendsChart;
