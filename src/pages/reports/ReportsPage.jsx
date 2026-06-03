import { useState } from 'react';
import { FileDown, FileSpreadsheet, BarChart2, RefreshCw } from 'lucide-react';

import ReportSummaryCards from '../../components/reports/ReportSummaryCards';
import ReportFilter from '../../components/reports/ReportFilter';
import ReportPreviewTable from '../../components/reports/ReportPreviewTable';
import SalesTrendChart from '../../components/reports/SalesTrendChart';
import BranchPerformanceChart from '../../components/reports/BranchPerformanceChart';
import ScheduledReports from '../../components/reports/ScheduledReports';
import ReportHistory from '../../components/reports/ReportHistory';

function ReportsPage() {
  const [filters, setFilters] = useState({});
  const [lastRefreshed] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );

  const handleExportPDF = () => {
    // Placeholder — wire to reportService.exportPDF() when backend is ready
    alert('PDF export will be available after backend integration.');
  };

  const handleExportExcel = () => {
    // Placeholder — wire to reportService.exportExcel() when backend is ready
    alert('Excel export will be available after backend integration.');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title block */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-200">
                <BarChart2 size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">
                    Reports &amp; Analytics
                  </h1>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    Reporting Module
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  AI-Powered Multi-Branch Retail POS · Last refreshed {lastRefreshed}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800 active:scale-95"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 active:scale-95"
              >
                <FileSpreadsheet size={14} />
                Export Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-95"
              >
                <FileDown size={14} />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page Body ── */}
      <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* 1 — KPI Summary Cards */}
        <ReportSummaryCards />

        {/* 2 — Filters */}
        <ReportFilter onFilterChange={setFilters} />

        {/* 3 — Charts row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SalesTrendChart />
          <BranchPerformanceChart />
        </div>

        {/* 4 — Report Preview Table */}
        <ReportPreviewTable filters={filters} />

        {/* 5 — Scheduled + History row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ScheduledReports />
          <ReportHistory />
        </div>

        {/* 6 — API Integration Notice */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <div className="flex gap-3">
            <span className="mt-0.5 text-blue-500">ℹ️</span>
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Backend API Integration Pending
              </p>
              <p className="mt-0.5 text-xs text-blue-600">
                This page currently displays static sample data. Once{' '}
                <code className="rounded bg-blue-100 px-1 font-mono">
                  feature/tharsiga-reporting-backend
                </code>{' '}
                endpoints are merged into Dev, replace{' '}
                <code className="rounded bg-blue-100 px-1 font-mono">
                  src/services/reportService.js
                </code>{' '}
                placeholders with real API calls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;