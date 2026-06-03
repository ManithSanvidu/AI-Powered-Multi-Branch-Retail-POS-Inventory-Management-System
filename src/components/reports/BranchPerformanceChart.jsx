import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Building2 } from 'lucide-react';

const data = [
  { branch: 'Colombo', revenue: 850000, growth: 12.4 },
  { branch: 'Kandy', revenue: 610000, growth: 8.1 },
  { branch: 'Galle', revenue: 420000, growth: 5.3 },
  { branch: 'Jaffna', revenue: 310000, growth: -2.1 },
  { branch: 'Negombo', revenue: 195000, growth: 3.8 },
  { branch: 'Matara', revenue: 175000, growth: 6.7 },
];

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

const formatLKR = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return `${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = data.find((r) => r.branch === label);
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
        <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-sm font-bold text-blue-600">LKR {payload[0].value.toLocaleString()}</p>
        {d && (
          <p
            className={`mt-0.5 text-xs font-medium ${d.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {d.growth >= 0 ? '↑' : '↓'} {Math.abs(d.growth)}% vs last month
          </p>
        )}
      </div>
    );
  }
  return null;
};

function BranchPerformanceChart() {
  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
      aria-label="Branch Performance Chart"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Branch Performance</h2>
            <p className="text-xs text-slate-500">Revenue by branch — May 2026 (sample data)</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
          6 Branches
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
          barSize={32}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="branch"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatLKR}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend row */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-6">
        {data.map((d, i) => (
          <div key={d.branch} className="flex flex-col items-center gap-1">
            <span
              className="h-2 w-6 rounded-full"
              style={{ backgroundColor: COLORS[i] }}
            />
            <span className="text-center text-xs text-slate-500">{d.branch}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BranchPerformanceChart;
