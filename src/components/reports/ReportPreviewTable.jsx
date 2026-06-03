import { useState } from 'react';
import { Download, Eye, FileText, ChevronUp, ChevronDown } from 'lucide-react';

const REPORT_DATA = [
  {
    id: 'RPT-001',
    branch: 'Colombo',
    type: 'Sales',
    period: 'May 2026',
    amount: 'LKR 850,000',
    status: 'Completed',
  },
  {
    id: 'RPT-002',
    branch: 'Kandy',
    type: 'Inventory',
    period: 'May 2026',
    amount: 'LKR 420,000',
    status: 'Review',
  },
  {
    id: 'RPT-003',
    branch: 'Galle',
    type: 'Sales',
    period: 'May 2026',
    amount: 'LKR 610,000',
    status: 'Completed',
  },
  {
    id: 'RPT-004',
    branch: 'All Branches',
    type: 'Business Summary',
    period: 'Q2 2026',
    amount: 'LKR 2,400,000',
    status: 'Scheduled',
  },
  {
    id: 'RPT-005',
    branch: 'Jaffna',
    type: 'Branch Performance',
    period: 'May 2026',
    amount: 'LKR 310,000',
    status: 'Pending',
  },
  {
    id: 'RPT-006',
    branch: 'Negombo',
    type: 'Customer',
    period: 'May 2026',
    amount: 'LKR 195,000',
    status: 'Completed',
  },
];

const STATUS_STYLES = {
  Completed: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  Review: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  Scheduled: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  Pending: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const STATUS_DOT = {
  Completed: 'bg-emerald-500',
  Review: 'bg-amber-500',
  Scheduled: 'bg-blue-500',
  Pending: 'bg-slate-400',
};

function ReportPreviewTable() {
  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-slate-300" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-blue-600" />
    ) : (
      <ChevronDown size={12} className="text-blue-600" />
    );
  };

  const thClass =
    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 cursor-pointer select-none hover:text-slate-700';

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
      aria-label="Report Preview Table"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Report Preview</h2>
            <p className="text-xs text-slate-500">Static sample data — backend API pending</p>
          </div>
        </div>
        <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
          {REPORT_DATA.length} Reports
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                { label: 'Report ID', field: 'id' },
                { label: 'Branch', field: 'branch' },
                { label: 'Type', field: 'type' },
                { label: 'Period', field: 'period' },
                { label: 'Amount', field: 'amount' },
                { label: 'Status', field: 'status' },
              ].map(({ label, field }) => (
                <th
                  key={field}
                  className={thClass}
                  onClick={() => handleSort(field)}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon field={field} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {REPORT_DATA.map((report, idx) => (
              <tr
                key={report.id}
                className="group transition-colors hover:bg-slate-50/70"
              >
                <td className="px-4 py-3.5">
                  <span className="font-mono text-xs font-semibold text-blue-600">
                    {report.id}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-medium text-slate-700">
                  {report.branch}
                </td>
                <td className="px-4 py-3.5 text-slate-600">{report.type}</td>
                <td className="px-4 py-3.5 text-slate-600">{report.period}</td>
                <td className="px-4 py-3.5 font-semibold text-slate-800">
                  {report.amount}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[report.status]}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[report.status]}`}
                    />
                    {report.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      title="View Report"
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
                    >
                      <Eye size={13} />
                      View
                    </button>
                    <button
                      title="Export Report"
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <Download size={13} />
                      Export
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
        Showing {REPORT_DATA.length} of {REPORT_DATA.length} reports · Static data (API integration pending)
      </div>
    </section>
  );
}

export default ReportPreviewTable;
