/**
 * reportService.js
 * Reporting Module — Frontend API Service
 *
 * PURPOSE:
 *   Centralises all future HTTP calls for the Reporting Module.
 *   Currently returns static demo data. Replace each function body
 *   with the real axios call once backend endpoints are live.
 *
 * BASE URL: import.meta.env.VITE_API_URL  (set in .env.example)
 *
 * FUTURE ENDPOINTS (to be implemented on feature/tharsiga-reporting-backend):
 *   GET  /api/reports/summary           → KPI totals
 *   GET  /api/reports/sales             → Sales records with filters
 *   GET  /api/reports/inventory         → Inventory / low stock data
 *   GET  /api/reports/branch-performance→ Per-branch revenue
 *   GET  /api/reports/history           → Generated report log
 *   GET  /api/reports/scheduled         → Scheduled report configs
 *   POST /api/reports/export/pdf        → Trigger PDF generation
 *   POST /api/reports/export/excel      → Trigger Excel generation
 */

// const axios = require('axios');  // ← uncomment when connecting
// const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

// ─────────────────────────────────────────────
// STATIC DEMO DATA (replace with API calls)
// ─────────────────────────────────────────────

const DEMO_SUMMARY = {
  totalSales: 2400000,
  totalOrders: 1248,
  lowStockItems: 36,
  activeBranches: 8,
  netRevenue: 1800000,
};

const DEMO_SALES_TREND = [
  { month: 'Jan', sales: 1200000 },
  { month: 'Feb', sales: 1450000 },
  { month: 'Mar', sales: 1380000 },
  { month: 'Apr', sales: 1620000 },
  { month: 'May', sales: 1890000 },
  { month: 'Jun', sales: 2150000 },
  { month: 'Jul', sales: 1970000 },
  { month: 'Aug', sales: 2240000 },
  { month: 'Sep', sales: 2100000 },
  { month: 'Oct', sales: 2380000 },
  { month: 'Nov', sales: 2650000 },
  { month: 'Dec', sales: 2400000 },
];

const DEMO_BRANCH_PERFORMANCE = [
  { branch: 'Colombo', revenue: 850000, growth: 12.4 },
  { branch: 'Kandy', revenue: 610000, growth: 8.1 },
  { branch: 'Galle', revenue: 420000, growth: 5.3 },
  { branch: 'Jaffna', revenue: 310000, growth: -2.1 },
  { branch: 'Negombo', revenue: 195000, growth: 3.8 },
  { branch: 'Matara', revenue: 175000, growth: 6.7 },
];

// ─────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Fetch KPI summary totals.
 * Replace with: const res = await axios.get(`${BASE}/api/reports/summary`, { headers });
 */
export async function fetchReportSummary() {
  // TODO: replace with real API call
  return DEMO_SUMMARY;
}

/**
 * Fetch monthly sales trend data.
 * Replace with: const res = await axios.get(`${BASE}/api/reports/sales`, { params: filters, headers });
 * @param {object} filters - { fromDate, toDate, branch, type }
 */
export async function fetchSalesTrend(filters = {}) {
  // TODO: replace with real API call
  return DEMO_SALES_TREND;
}

/**
 * Fetch per-branch revenue data.
 * Replace with: const res = await axios.get(`${BASE}/api/reports/branch-performance`, { params: filters, headers });
 * @param {object} filters - { fromDate, toDate }
 */
export async function fetchBranchPerformance(filters = {}) {
  // TODO: replace with real API call
  return DEMO_BRANCH_PERFORMANCE;
}

/**
 * Fetch inventory / low stock summary.
 * Replace with: const res = await axios.get(`${BASE}/api/reports/inventory`, { headers });
 */
export async function fetchInventorySummary() {
  // TODO: replace with real API call — depends on Inventory module APIs from team
  return { lowStockCount: 36, totalProducts: 486, inventoryValue: 124600 };
}

/**
 * Fetch report generation history log.
 * Replace with: const res = await axios.get(`${BASE}/api/reports/history`, { headers });
 */
export async function fetchReportHistory() {
  // TODO: replace with real API call
  return [];
}

/**
 * Fetch scheduled report configurations.
 * Replace with: const res = await axios.get(`${BASE}/api/reports/scheduled`, { headers });
 */
export async function fetchScheduledReports() {
  // TODO: replace with real API call
  return [];
}

/**
 * Trigger PDF export (frontend-only placeholder).
 * Replace with: const res = await axios.post(`${BASE}/api/reports/export/pdf`, payload, { headers, responseType: 'blob' });
 * @param {object} payload - report filter options
 */
export async function exportPDF(payload = {}) {
  // TODO: replace with real API call
  console.info('[reportService] exportPDF called (placeholder) —', payload);
  return null;
}

/**
 * Trigger Excel export (frontend-only placeholder).
 * Replace with: const res = await axios.post(`${BASE}/api/reports/export/excel`, payload, { headers, responseType: 'blob' });
 * @param {object} payload - report filter options
 */
export async function exportExcel(payload = {}) {
  // TODO: replace with real API call
  console.info('[reportService] exportExcel called (placeholder) —', payload);
  return null;
}
