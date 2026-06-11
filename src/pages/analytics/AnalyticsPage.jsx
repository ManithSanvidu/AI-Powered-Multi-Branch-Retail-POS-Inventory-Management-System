import { useState, useEffect, useCallback } from "react";
import { BarChart3, RefreshCw, AlertCircle, Filter } from "lucide-react";

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
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const hasActiveFilters =
    filters.fromDate || filters.toDate || filters.branchId;

  const loadAll = useCallback(
    async (filterObj) => {
      setLoading(true);
      setError(null);
      const f = filterObj || filters;
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

        const getData = (res) =>
          res.status === "fulfilled" ? res.value.data : null;
        const getError = (res) =>
          res.status === "rejected" ? res.reason?.message : res.value?.error;

        const errors = [
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

        if (errors.length > 0) {
          setError(errors[0]);
        }

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
        setError(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleResetFilters = () =>
    setFilters({ fromDate: "", toDate: "", branchId: "" });

  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "sales", label: "Sales & Profit" },
    { key: "branches", label: "Branch Performance" },
    { key: "products", label: "Products & Categories" },
    { key: "customers", label: "Customer Insights" },
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
            <div className="flex items-center gap-2">
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
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 flex gap-3 items-start">
            <AlertCircle size={16} className="mt-0.5 text-rose-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-800">
                There is some error fetching data
              </p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {!error && activeTab === "overview" && (
          <>
            <AnalyticsKPICards data={data.kpi} loading={loading} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SalesTrendsChart data={data.sales} loading={loading} />
              <ProfitTrendsChart data={data.profit} loading={loading} />
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

        {!error && activeTab === "sales" && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SalesTrendsChart data={data.sales} loading={loading} />
              <ProfitTrendsChart data={data.profit} loading={loading} />
            </div>
            <RevenueBreakdownChart data={data.revenueBreak} loading={loading} />
          </>
        )}

        {!error && activeTab === "branches" && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <BranchPerformancePanel
                  data={data.branchPerf}
                  loading={loading}
                />
              </div>
              <BranchRankingsTable data={data.branchRank} loading={loading} />
            </div>
          </>
        )}

        {!error && activeTab === "products" && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CategoryAnalysisChart data={data.categories} loading={loading} />
              <RevenueBreakdownChart
                data={data.revenueBreak}
                loading={loading}
              />
            </div>
            <ProductPerformanceTable data={data.products} loading={loading} />
          </>
        )}

        {!error && activeTab === "customers" && (
          <>
            <CustomerInsightsPanel data={data.customers} loading={loading} />
            <AutomatedInsights data={data.insights} loading={loading} />
          </>
        )}

        {!error && activeTab === "drilldown" && (
          <DrillDownAnalysis
            data={data.drillDown}
            loading={loading}
            params={filters}
          />
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
