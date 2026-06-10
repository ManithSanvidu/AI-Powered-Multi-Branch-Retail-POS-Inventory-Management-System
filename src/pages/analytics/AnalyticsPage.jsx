import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart3, RefreshCw, AlertCircle, Filter, Clock } from "lucide-react";

import AnalyticsKPICards from "../../components/analytics/AnalyticsKPICards";
import SalesTrendsChart from "../../components/analytics/SalesTrendsChart";
import ProfitTrendsChart from "../../components/analytics/ProfitTrendsChart";
import BranchPerformancePanel from "../../components/analytics/BranchPerformancePanel";
import BranchRankingsTable from "../../components/analytics/BranchRankingsTable";
import RevenueBreakdownChart from "../../components/analytics/RevenueBreakdownChart";
import DrillDownAnalysis from "../../components/analytics/DrillDownAnalysis";
import ProductPerformanceTable from "../../components/analytics/ProductPerformanceTable";
import CategoryAnalysisChart from "../../components/analytics/CategoryAnalysisChart";
import CustomerInsightsPanel from "../../components/analytics/CustomerInsightsPanel";
import AutomatedInsights from "../../components/analytics/AutomatedInsights";

import {
  fetchKPISummary,
  fetchSalesTrends,
  fetchProfitTrends,
  fetchBranchPerformance,
  fetchBranchRankings,
  fetchRevenueBreakdown,
  fetchDrillDown,
  fetchProductPerformance,
  fetchCategoryAnalysis,
  fetchCustomerInsights,
  fetchInsights,
  fetchAllBranches,
} from "../../services/analyticsService";

function AnalyticsPage() {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    branchId: "",
  });

  const [data, setData] = useState({
    kpi: null,
    sales: null,
    profit: null,
    branchPerf: null,
    branchRank: null,
    revenueBreak: null,
    drillDown: null,
    products: null,
    categories: null,
    customers: null,
    insights: null,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [branchList, setBranchList] = useState([]);
  // Debounce ref: filter changes wait 600ms before triggering a fetch
  const debounceTimer = useRef(null);
  const pendingFilters = useRef(filters);

  const hasActiveFilters =
    filters.fromDate || filters.toDate || filters.branchId;

  // Keep pendingFilters in sync so the debounced callback always sees latest
  pendingFilters.current = filters;

  // getData: extract payload from a settled promise result
  const getData = (res) =>
    res.status === "fulfilled" ? res.value.data : null;

  // getError: capture both network rejections AND HTTP-level errors returned
  // as fulfilled { data: null, error: "..." } from the service layer
  const getError = (res) => {
    if (res.status === "rejected") return res.reason?.message;
    // fulfilled but the service returned an error string
    if (res.value?.error) return res.value.error;
    return null;
  };

  const loadAll = useCallback(
    async (filterObj) => {
      setLoading(true);
      setErrors([]);
      const f = filterObj || pendingFilters.current;
      try {
        const params = {};
        if (f.fromDate) params.fromDate = f.fromDate;
        if (f.toDate) params.toDate = f.toDate;
        if (f.branchId) params.branchId = f.branchId;

        const [
          kpiRes,
          salesRes,
          profitRes,
          bpRes,
          brRes,
          rbRes,
          ddRes,
          prodRes,
          catRes,
          custRes,
          insRes,
        ] = await Promise.allSettled([
          fetchKPISummary(params),
          fetchSalesTrends(params),
          fetchProfitTrends(params),
          fetchBranchPerformance(params),
          fetchBranchRankings(params),
          fetchRevenueBreakdown(params),
          fetchDrillDown(params),
          fetchProductPerformance(params),
          fetchCategoryAnalysis(params),
          fetchCustomerInsights(params),
          fetchInsights(params),
        ]);

        const errs = [
          kpiRes,
          salesRes,
          profitRes,
          bpRes,
          brRes,
          rbRes,
          ddRes,
          prodRes,
          catRes,
          custRes,
          insRes,
        ]
          .map(getError)
          .filter(Boolean);

        // Show partial errors as a warning banner but DO NOT hide the data
        setErrors(errs);

        setData({
          kpi: getData(kpiRes),
          sales: getData(salesRes),
          profit: getData(profitRes),
          branchPerf: getData(bpRes),
          branchRank: getData(brRes),
          revenueBreak: getData(rbRes),
          drillDown: getData(ddRes),
          products: getData(prodRes),
          categories: getData(catRes),
          customers: getData(custRes),
          insights: getData(insRes),
        });

        setLastRefreshed(
          new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      } catch (err) {
        setErrors([err.message || "Failed to load analytics data"]);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Load ALL branches on mount for the branch filter dropdown
  // (fetchBranchPerformance only returns branches that have sales data,
  //  so we use fetchAllBranches to show every branch including ones with no revenue)
  useEffect(() => {
    fetchAllBranches().then((res) => {
      if (res.data?.length) setBranchList(res.data);
    });
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced re-fetch whenever filters change (600 ms)
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      loadAll(pendingFilters.current);
    }, 600);
    return () => clearTimeout(debounceTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleResetFilters = () =>
    setFilters({ fromDate: "", toDate: "", branchId: "" });

  // Dismiss individual error entries
  const dismissError = (idx) =>
    setErrors((prev) => prev.filter((_, i) => i !== idx));

  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "products", label: "Products & Categories" },
    { key: "drilldown", label: "Drill-Down" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-md shadow-violet-200">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900">
                    Business Analytics
                  </h1>
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                    Analytics Module
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Advanced analytics, KPIs, and drill-down analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {lastRefreshed && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} />
                  Updated {lastRefreshed}
                </span>
              )}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => loadAll()}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />{" "}
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-1 border-b border-slate-100">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition ${
                  activeTab === t.key
                    ? "bg-violet-50 text-violet-700 border-b-2 border-violet-600"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters((p) => ({ ...p, fromDate: e.target.value }))
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-violet-500"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) =>
              setFilters((p) => ({ ...p, toDate: e.target.value }))
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-violet-500"
          />
          {/* Branch filter dropdown */}
          <select
            value={filters.branchId}
            onChange={(e) =>
              setFilters((p) => ({ ...p, branchId: e.target.value }))
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-violet-500"
          >
            <option value="">All Branches</option>
            {branchList.map((b) => (
              <option key={String(b._id)} value={String(b._id)}>
                {b.name || String(b._id)}
              </option>
            ))}
          </select>
        </div>

        {/* Partial-error warnings – shown as individual dismissible banners so
            data from successful calls is still visible below */}
        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((errMsg, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 flex gap-3 items-start"
              >
                <AlertCircle size={15} className="mt-0.5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-800">
                    Partial data fetch warning
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">{errMsg}</p>
                </div>
                <button
                  onClick={() => dismissError(idx)}
                  className="text-amber-400 hover:text-amber-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tabs render regardless of errors so partial data is still shown */}
        {activeTab === "overview" && (
          <>
            <AnalyticsKPICards data={data.kpi} loading={loading} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SalesTrendsChart params={filters} />
              <ProfitTrendsChart params={filters} />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <BranchPerformancePanel
                  data={data.branchPerf}
                  loading={loading}
                />
              </div>
              <AutomatedInsights data={data.insights} loading={loading} />
            </div>
          </>
        )}

        {activeTab === "products" && (
          <>
            <CategoryAnalysisChart data={data.categories} loading={loading} />
            <ProductPerformanceTable data={data.products} loading={loading} />
          </>
        )}

        {activeTab === "drilldown" && (
          <DrillDownAnalysis params={filters} />
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
