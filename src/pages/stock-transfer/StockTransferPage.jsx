import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiClipboard,
  FiDownload,
  FiEdit2,
  FiList,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiTruck,
  FiXCircle,
} from 'react-icons/fi';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import {
  approveTransfer,
  cancelTransfer,
  completeTransfer,
  buildCreateTransferPayload,
  createTransfer,
  dispatchTransfer,
  resubmitTransfer,
  updateTransfer,
  getApiErrorMessage,
  getBranchInventory,
  getBranches,
  buildLogsFromTransfers,
  enrichMovementLogs,
  toDisplayString,
  getMovementHistory,
  getProducts,
  getTransferAnalytics,
  listTransfers,
  mapStatusToApi,
  normalizeStockRow,
  rejectTransfer,
} from '../../services/stockTransferApi';
import {
  WORKFLOW_STEPS,
  canCancelTransfer,
  canConfirmReceipt,
  canEditTransfer,
  canReviewPendingTransfer,
  filterTransfersByScope,
  getStockTransferPermissions,
  getUserBranchIds,
  getWorkflowStepIndex,
  isActiveForProgressTab,
} from '../../utils/stockTransferPermissions';
import TransferActivityTrail from '../../components/stock-transfer/TransferActivityTrail';
import TransferEditPanel from '../../components/stock-transfer/TransferEditPanel';
import TransferLogsTab from '../../components/stock-transfer/TransferLogsTab';
import {
  AlertBanner,
  EmptyState,
  FilterBar,
  KpiCard,
  PageHero,
  PanelHeader,
  SearchField,
  StatusBadge,
  WorkflowGuide,
  transferBtnClass,
  transferBtnGhostClass,
  transferBtnPrimaryClass,
  transferFieldClass,
  transferLabelClass,
} from '../../components/stock-transfer/StockTransferUI';
import { formatLogDate, formatUserLabel } from '../../services/stockTransferApi';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Approved: '#3b82f6',
  'In Transit': '#6366f1',
  Completed: '#10b981',
  Cancelled: '#ef4444',
  Rejected: '#dc2626',
};

const TAB_DEFS = [
  { id: 'request', label: 'New Request', icon: FiClipboard },
  { id: 'tracking', label: 'Progress', icon: FiTruck },
  { id: 'availability', label: 'Branch Stock', icon: FiPackage },
  { id: 'history', label: 'History', icon: FiSearch },
  { id: 'reports', label: 'Reports', icon: FiBarChart2 },
  { id: 'logs', label: 'Logs', icon: FiList },
];

function resolveUserRole(user) {
  return user?.role ?? user?.roleName ?? user?.userType ?? '';
}

function StockTransferPage() {
  const { user } = useAuth();
  const perms = useMemo(
    () => getStockTransferPermissions(resolveUserRole(user)),
    [user],
  );

  const [activeTab, setActiveTab] = useState(perms.defaultTab);
  const [transfers, setTransfers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockRows, setStockRows] = useState([]);
  const [sourceInventory, setSourceInventory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [movementLogs, setMovementLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [logsSource, setLogsSource] = useState('');

  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiMessage, setApiMessage] = useState('Connecting to API…');

  const [message, setMessage] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatus, setHistoryStatus] = useState('All');
  const [stockBranch, setStockBranch] = useState('All');
  const [stockSearch, setStockSearch] = useState('');
  const [editingTransferId, setEditingTransferId] = useState(null);

  const [form, setForm] = useState({
    fromBranchId: '',
    toBranchId: '',
    productId: '',
    quantity: '',
    notes: '',
  });

  const loadTransfers = useCallback(
    async (statusFilter, branchList = [], { updateState = true } = {}) => {
      const params = { limit: 100, page: 1 };
      if (statusFilter && statusFilter !== 'All') {
        params.status = mapStatusToApi(statusFilter);
      }
      const { items } = await listTransfers(params);
      if (updateState) setTransfers(items);
      return items;
    },
    [],
  );

  const mergeTransfers = useCallback((...lists) => {
    const map = new Map();
    lists.flat().forEach((t) => {
      if (!t) return;
      const key = String(t._id ?? t.id ?? '');
      if (key) map.set(key, t);
    });
    return [...map.values()];
  }, []);

  const loadStockForBranches = useCallback(async (branchList) => {
    if (!branchList.length) {
      setStockRows([]);
      return;
    }
    setStockLoading(true);
    try {
      const results = await Promise.all(
        branchList.map(async (branch) => {
          try {
            const inventory = await getBranchInventory(branch.id);
            return inventory.map((row) => normalizeStockRow(row, branch.name));
          } catch {
            return [];
          }
        }),
      );
      setStockRows(results.flat());
    } finally {
      setStockLoading(false);
    }
  }, []);

  const loadSourceInventory = useCallback(async (branchId, branchName) => {
    if (!branchId) {
      setSourceInventory([]);
      return;
    }
    try {
      const rows = await getBranchInventory(branchId);
      setSourceInventory(rows.map((row) => normalizeStockRow(row, branchName)));
    } catch {
      setSourceInventory([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    const [branchesResult, productsResult] = await Promise.allSettled([
      getBranches(),
      getProducts(),
    ]);

    const branchList =
      branchesResult.status === 'fulfilled' ? branchesResult.value : [];

    const transfersResult = await Promise.allSettled([
      loadTransfers('All', branchList),
    ]);

    const productList =
      productsResult.status === 'fulfilled' ? productsResult.value : [];
    const transferItems =
      transfersResult.status === 'fulfilled' ? transfersResult.value : [];

    setBranches(branchList);
    setProducts(productList);
    setTransfers(transferItems);

    const hasCatalog = branchList.length > 0 && productList.length > 0;
    setApiConnected(hasCatalog);

    if (hasCatalog) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setApiMessage(
        `Connected · ${branchList.length} branches · ${productList.length} products · ${transferItems.length} transfers · ${time}`,
      );
    } else {
      const err =
        branchesResult.status === 'rejected'
          ? branchesResult.reason
          : productsResult.status === 'rejected'
            ? productsResult.reason
            : null;
      setApiMessage(
        getApiErrorMessage(
          err,
          branchList.length === 0
            ? 'No branches returned. Add branches in the database and click Sync (must be logged in).'
            : 'No products returned. Add products in the database and click Sync.',
        ),
      );
    }

    const homeBranchId =
      perms.viewScope === 'branch'
        ? getUserBranchIds(user, branchList)[0]
        : null;
    const otherBranch = branchList.find((b) => b.id !== homeBranchId);

    setForm((prev) => ({
      ...prev,
      fromBranchId:
        prev.fromBranchId || homeBranchId || branchList[0]?.id || '',
      toBranchId:
        prev.toBranchId ||
        otherBranch?.id ||
        branchList[1]?.id ||
        branchList[0]?.id ||
        '',
      productId: prev.productId || productList[0]?.id || '',
    }));

    if (branchList.length) {
      await loadStockForBranches(branchList);
      const fromId = branchList[0]?.id;
      const fromName = branchList[0]?.name;
      if (fromId) await loadSourceInventory(fromId, fromName);
    }

    setLoading(false);
  }, [loadStockForBranches, loadSourceInventory, loadTransfers, user, perms.viewScope]);

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (!form.fromBranchId || !apiConnected) return;
    const branchName = branches.find((b) => b.id === form.fromBranchId)?.name ?? '';
    loadSourceInventory(form.fromBranchId, branchName);
  }, [form.fromBranchId, form.productId, apiConnected, branches, loadSourceInventory]);

  const userBranchIds = useMemo(
    () => getUserBranchIds(user, branches),
    [user, branches],
  );

  const visibleTabs = useMemo(
    () => TAB_DEFS.filter((tab) => perms.tabs[tab.id]),
    [perms.tabs],
  );

  const visibleTransfers = useMemo(
    () => filterTransfersByScope(transfers, perms, userBranchIds, branches),
    [transfers, perms, userBranchIds, branches],
  );

  useEffect(() => {
    if (!visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id ?? 'tracking');
    }
  }, [visibleTabs, activeTab]);

  useEffect(() => {
    if (!apiConnected || activeTab !== 'reports' || !perms.canViewAnalytics) return;
    getTransferAnalytics()
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, [apiConnected, activeTab, perms.canViewAnalytics]);

  const loadTransferLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError('');

    const scopedTransfers = filterTransfersByScope(
      transfers,
      perms,
      userBranchIds,
      branches,
    );
    const instantRows = buildLogsFromTransfers(scopedTransfers);
    if (instantRows.length) {
      setMovementLogs(instantRows);
      setLogsSource('Showing transfer records loaded on this page');
    }

    try {
      let rows = await getMovementHistory({ limit: 100, page: 1 });
      rows = enrichMovementLogs(rows, scopedTransfers);
      if (rows.length) {
        setMovementLogs(rows);
        setLogsSource('');
        setLogsError('');
      } else if (!instantRows.length) {
        setLogsError('');
      }
    } catch (err) {
      if (!instantRows.length) {
        setLogsError(getApiErrorMessage(err, 'Could not load movement history from API.'));
      } else {
        setLogsError('');
      }
    } finally {
      setLogsLoading(false);
    }
  }, [transfers, perms, userBranchIds, branches]);

  useEffect(() => {
    if (activeTab !== 'logs' || !perms.tabs.logs) return;
    const scoped = filterTransfersByScope(
      transfers,
      perms,
      userBranchIds,
      branches,
    );
    const instant = buildLogsFromTransfers(scoped);
    if (instant.length) {
      setMovementLogs(instant);
      setLogsSource('Showing transfer records loaded on this page');
    }
    loadTransferLogs();
  }, [activeTab, loadTransferLogs, perms.tabs.logs]);

  const activeTransfers = useMemo(
    () => visibleTransfers.filter((t) => isActiveForProgressTab(t, perms)),
    [visibleTransfers, perms],
  );

  const pendingForApproval = useMemo(
    () => visibleTransfers.filter((t) => t.status === 'Pending'),
    [visibleTransfers],
  );

  const sortedActiveTransfers = useMemo(() => {
    return [...activeTransfers].sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return String(b.date).localeCompare(String(a.date));
    });
  }, [activeTransfers]);

  const progressPipeline = useMemo(() => {
    const counts = {
      Pending: 0,
      Approved: 0,
      'In Transit': 0,
      Rejected: 0,
    };
    visibleTransfers.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status] += 1;
    });
    return counts;
  }, [visibleTransfers]);

  const hiddenByBranchScope = transfers.length - visibleTransfers.length;

  const managerMissingBranch =
    perms.viewScope === 'branch' && !userBranchIds.length && user;

  const historyTransfers = useMemo(() => {
    return visibleTransfers
      .filter((t) => {
        const matchStatus = historyStatus === 'All' || t.status === historyStatus;
        const q = historySearch.trim().toLowerCase();
        const matchSearch =
          !q ||
          String(t.id).toLowerCase().includes(q) ||
          String(t.product).toLowerCase().includes(q) ||
          String(t.from).toLowerCase().includes(q) ||
          String(t.to).toLowerCase().includes(q);
        return matchStatus && matchSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [visibleTransfers, historySearch, historyStatus]);

  const filteredStockRows = useMemo(() => {
    let rows = stockRows;
    if (perms.viewScope === 'branch' && userBranchIds.length) {
      const names = userBranchIds
        .map((id) => branches.find((b) => b.id === id)?.name)
        .filter(Boolean);
      rows = rows.filter((row) => names.includes(row.branch));
    }
    return rows.filter((row) => {
      const matchBranch = stockBranch === 'All' || row.branch === stockBranch;
      const q = stockSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        row.sku.toLowerCase().includes(q) ||
        row.productName.toLowerCase().includes(q) ||
        row.branch.toLowerCase().includes(q);
      return matchBranch && matchSearch;
    });
  }, [stockRows, stockBranch, stockSearch, perms.viewScope, userBranchIds, branches]);

  const kpis = useMemo(() => {
    const inTransit = visibleTransfers.filter((t) => t.status === 'In Transit').length;
    const pending = visibleTransfers.filter((t) => t.status === 'Pending').length;
    const completed = visibleTransfers.filter((t) => t.status === 'Completed').length;
    const lowStock = stockRows.filter((s) => s.reorder > 0 && s.qty < s.reorder).length;
    return { inTransit, pending, completed, lowStock };
  }, [visibleTransfers, stockRows]);

  const selectedProduct = products.find((p) => String(p.id) === String(form.productId));
  const fromBranchName = branches.find((b) => b.id === form.fromBranchId)?.name ?? '';
  const sourceStock =
    sourceInventory.find((s) => String(s.productId) === String(form.productId)) ??
    stockRows.find(
      (s) => s.branch === fromBranchName && String(s.productId) === String(form.productId),
    );
  const availableQty = sourceStock?.qty ?? 0;

  const reportByBranch = useMemo(() => {
    const volume = analytics?.volumeSummary ?? analytics?.byBranch ?? [];
    if (Array.isArray(volume) && volume.length) {
      return volume.map((row) => ({
        branch: row.branchName ?? row.branch ?? row.name ?? 'Branch',
        transfers: row.transferCount ?? row.transfers ?? 0,
        units: row.totalUnits ?? row.units ?? 0,
      }));
    }
    const counts = {};
    transfers.forEach((t) => {
      const key = (t.from || 'Unknown').split(' ')[0];
      if (!counts[key]) counts[key] = { branch: key, transfers: 0, units: 0 };
      counts[key].transfers += 1;
      counts[key].units += t.qty;
    });
    return Object.values(counts);
  }, [analytics, transfers]);

  const reportByStatus = useMemo(() => {
    const summary = analytics?.statusSummary;
    if (summary && typeof summary === 'object') {
      return Object.entries(summary).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        value: typeof value === 'number' ? value : value?.count ?? 0,
        color: STATUS_COLORS[name] ?? '#94a3b8',
      }));
    }
    const counts = {};
    transfers.forEach((t) => {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] ?? '#94a3b8',
    }));
  }, [analytics, transfers]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!apiConnected) {
      setMessage('API not connected. Check backend and login token.');
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (!qty || qty < 1) {
      setMessage('Enter a valid quantity.');
      return;
    }
    if (form.fromBranchId === form.toBranchId) {
      setMessage('Source and destination branches must be different.');
      return;
    }
    if (qty > availableQty) {
      setMessage(
        `Insufficient stock at source. Available: ${availableQty} ${selectedProduct?.unit ?? 'units'}.`,
      );
      return;
    }

    if (!perms.canCreateTransfer) {
      setMessage('Only managers can create transfer requests.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createTransfer(
        buildCreateTransferPayload({
          fromBranchId: form.fromBranchId,
          toBranchId: form.toBranchId,
          productId: form.productId,
          quantity: qty,
          notes: form.notes,
        }),
      );
      let listed = [];
      try {
        listed = await loadTransfers('All', branches, { updateState: false });
      } catch {
        listed = [];
      }
      setTransfers(mergeTransfers([created], listed));
      setForm((prev) => ({ ...prev, quantity: '', notes: '' }));
      setMessage(
        `Request ${created.id} submitted (Pending). An admin will Approve or Reject on Progress. You can track it there.`,
      );
      setActiveTab('tracking');
      await loadStockForBranches(branches);
      const fromName = branches.find((b) => b.id === form.fromBranchId)?.name ?? '';
      await loadSourceInventory(form.fromBranchId, fromName);
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Could not create transfer.'));
    } finally {
      setSubmitting(false);
    }
  };

  const updateTransferInList = (updated) => {
    setTransfers((prev) =>
      prev.map((t) => (t._id === updated._id ? updated : t)),
    );
  };

  const handleApprove = async (transfer) => {
    if (!transfer._id || !perms.canApproveTransfer) return;
    setSubmitting(true);
    try {
      const updated = await approveTransfer(transfer._id);
      updateTransferInList(updated);
      setMessage(
        `${updated.id} approved. Use Mark In Transit when ready to ship stock.`,
      );
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Approve failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (transfer, editForm) => {
    if (!transfer._id || !canEditTransfer(transfer, perms, userBranchIds, branches)) {
      return;
    }
    const qty = parseInt(editForm.quantity, 10);
    if (!qty || qty < 1) {
      setMessage('Enter a valid quantity.');
      return;
    }
    if (editForm.fromBranchId === editForm.toBranchId) {
      setMessage('Source and destination must be different.');
      return;
    }

    const payload = {
      fromBranch: editForm.fromBranchId,
      toBranch: editForm.toBranchId,
      items: [{ product: editForm.productId, quantity: qty }],
      notes: editForm.notes || undefined,
    };

    setSubmitting(true);
    try {
      const updated =
        transfer.status === 'Rejected'
          ? await resubmitTransfer(transfer._id, payload)
          : await updateTransfer(transfer._id, payload);
      updateTransferInList(updated);
      setEditingTransferId(null);
      setMessage(
        transfer.status === 'Rejected'
          ? `${updated.id} updated and resubmitted — now Pending for admin review.`
          : `${updated.id} updated successfully.`,
      );
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Could not update transfer.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (transfer) => {
    if (!transfer._id || !perms.canRejectTransfer) return;
    const reason = window.prompt('Reason for rejection (required):');
    if (!reason?.trim()) return;
    setSubmitting(true);
    try {
      const updated = await rejectTransfer(transfer._id, reason.trim());
      updateTransferInList({
        ...updated,
        status: 'Rejected',
        rejectReason: updated.rejectReason || reason.trim(),
      });
      setMessage(
        `${updated.id} rejected. The manager can edit and resubmit from Progress.`,
      );
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Reject failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async (transfer) => {
    if (!transfer._id || !perms.canDispatchTransfer) return;
    setSubmitting(true);
    try {
      const updated = await dispatchTransfer(transfer._id);
      updateTransferInList(updated);
      setMessage(`${updated.id} in transit — stock deducted at source branch.`);
      await loadStockForBranches(branches);
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Dispatch failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReceipt = async (transfer) => {
    if (!transfer._id || !canConfirmReceipt(transfer, perms, userBranchIds, branches)) {
      setMessage('Only the destination branch manager can confirm receipt.');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await completeTransfer(transfer._id);
      updateTransferInList(updated);
      setMessage(
        `${updated.id} completed — stock added at destination, movement logged.`,
      );
      await loadStockForBranches(branches);
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Receipt confirmation failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (transfer) => {
    if (!transfer._id || !canCancelTransfer(transfer, perms)) return;
    const cancelReason = window.prompt('Reason for cancellation (required):');
    if (!cancelReason?.trim()) return;
    setSubmitting(true);
    try {
      const updated = await cancelTransfer(transfer._id, cancelReason.trim());
      setTransfers((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setMessage(`${updated.id} cancelled.`);
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Cancel failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const isErrorMessage =
    message &&
    (message.includes('Insufficient') ||
      message.includes('valid') ||
      message.includes('different') ||
      message.includes('failed') ||
      message.includes('permission') ||
      message.includes('not connected'));

  const switchTab = (id) => {
    setActiveTab(id);
    setMessage('');
    if (id === 'logs' && perms.tabs.logs) {
      const instant = buildLogsFromTransfers(
        filterTransfersByScope(transfers, perms, userBranchIds, branches),
      );
      if (instant.length) setMovementLogs(instant);
      loadTransferLogs();
    }
  };

  return (
    <div className="min-h-full text-slate-800 antialiased">
      <div className="relative mb-5 overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 backdrop-blur-md sm:p-8">
        <PageHero
          perms={perms}
          connected={apiConnected}
          branchCount={branches.length}
          productCount={products.length}
          transferCount={transfers.length}
          loading={loading}
          onSync={refreshAll}
        />

        <WorkflowGuide perms={perms} />

        {managerMissingBranch ? (
          <AlertBanner variant="warn">
            Your manager account has no branch assigned. Transfers still show for now —
            ask admin to set <strong className="font-semibold">branchId</strong> on your
            user for correct branch filtering.
          </AlertBanner>
        ) : null}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="Transfer summary">
          <KpiCard variant="primary" icon={FiTruck} value={kpis.inTransit} label="In transit" />
          <KpiCard variant="warning" icon={FiClipboard} value={kpis.pending} label={perms.canApproveTransfer ? 'Awaiting approval' : 'Pending'} />
          <KpiCard variant="success" icon={FiCheck} value={kpis.completed} label="Completed" />
          <KpiCard variant="info" icon={FiPackage} value={kpis.lowStock} label="Low-stock lines" />
        </div>

        {message ? (
          <AlertBanner variant={isErrorMessage ? 'warn' : 'success'}>
            {message}
          </AlertBanner>
        ) : null}

        <nav className="mb-6 inline-flex w-full flex-wrap gap-1 rounded-2xl bg-slate-100/80 p-1.5 ring-1 ring-slate-200/60 sm:w-auto" aria-label="Stock transfer features">
          {visibleTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 px-4 py-2.5 text-sm font-medium transition-all ${activeTab === id ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/80" : "text-slate-600 hover:text-slate-900"}`}
              onClick={() => switchTab(id)}
            >
              <Icon aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-h-[300px]">
        {loading && activeTab === 'request' ? (
          <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">Loading branches and products…</p>
        ) : null}

        {activeTab === 'logs' && perms.tabs.logs ? (
          <TransferLogsTab
            perms={perms}
            logsLoading={logsLoading}
            logsError={logsError}
            movementLogs={movementLogs}
            scopedTransfers={filterTransfersByScope(
              transfers,
              perms,
              userBranchIds,
              branches,
            )}
            onRefresh={loadTransferLogs}
          />
        ) : null}

        {activeTab === 'logs' && !perms.tabs.logs ? (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-8">
            <EmptyState
              icon="🔒"
              title="Logs not available for your role"
              description="Transfer movement logs are available to managers and administrators. Switch account or contact your admin if you need access."
            />
          </section>
        ) : null}

        {activeTab === 'request' && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-8" aria-labelledby="transfer-request-title">
            <PanelHeader
              title="Create transfer request (Manager)"
              subtitle="Branch managers submit here. Status is set to Pending — only an admin can Approve or Reject on the Progress tab."
            />
            <form className="grid grid-cols-1 gap-5 sm:grid-cols-2 [&_.full]:sm:col-span-2" onSubmit={handleSubmitRequest}>
              <label className={transferLabelClass}>
                From branch
                <select
                  className={transferFieldClass}
                  value={form.fromBranchId}
                  onChange={(e) => handleFormChange('fromBranchId', e.target.value)}
                  required
                  disabled={!branches.length}
                >
                  {!branches.length && (
                    <option value="">No branches loaded — click Sync</option>
                  )}
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={transferLabelClass}>
                To branch
                <select
                  className={transferFieldClass}
                  value={form.toBranchId}
                  onChange={(e) => handleFormChange('toBranchId', e.target.value)}
                  required
                  disabled={!branches.length}
                >
                  {!branches.length && (
                    <option value="">No branches loaded — click Sync</option>
                  )}
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={transferLabelClass}>
                Product
                <select
                  className={transferFieldClass}
                  value={form.productId}
                  onChange={(e) => handleFormChange('productId', e.target.value)}
                  required
                  disabled={!products.length}
                >
                  {!products.length && (
                    <option value="">No products loaded — click Sync</option>
                  )}
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className={transferLabelClass}>
                Quantity ({selectedProduct?.unit ?? 'units'})
                <input
                  className={transferFieldClass}
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                  placeholder={
                    availableQty ? `Max ${availableQty} at source` : 'Enter quantity'
                  }
                  required
                  disabled={!form.productId}
                />
              </label>
              <label className={`${transferLabelClass} full`}>
                Notes (optional)
                <textarea
                  className={transferFieldClass}
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Reason for transfer, batch numbers, handling instructions..."
                />
              </label>
              <div className="full flex flex-wrap items-start gap-3 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 text-sm text-amber-950 ring-1 ring-amber-100">
                Available at <strong>{fromBranchName || 'source branch'}</strong>:{' '}
                <strong>{availableQty}</strong> {selectedProduct?.unit ?? 'units'}
                {!sourceStock && form.fromBranchId && form.productId && (
                  <span className="font-semibold text-red-600">
                    {' '}
                    — no inventory at this branch yet. Add stock in Inventory Management
                    first.
                  </span>
                )}
                {sourceStock && sourceStock.reorder > 0 && (
                  <>
                    {' '}
                    —{' '}
                    {availableQty < sourceStock.reorder ? (
                      <span className="font-semibold text-red-600">below reorder level</span>
                    ) : (
                      <span className="font-semibold text-emerald-600">healthy stock</span>
                    )}
                  </>
                )}
              </div>
              <div className="full flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:pointer-events-none disabled:opacity-50"
                  disabled={submitting || !apiConnected || !perms.canCreateTransfer}
                >
                  <FiClipboard aria-hidden="true" />
                  {submitting ? 'Submitting…' : 'Submit Transfer Request'}
                </button>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"
                  onClick={() =>
                    setForm({
                      fromBranchId: branches[0]?.id ?? '',
                      toBranchId: branches[1]?.id ?? '',
                      productId: products[0]?.id ?? '',
                      quantity: '',
                      notes: '',
                    })
                  }
                >
                  Reset form
                </button>
              </div>
              {!perms.canCreateTransfer && (
                <p className="full rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-100">
                  Your role can view transfers only. Managers create requests; admins
                  approve and dispatch.
                </p>
              )}
            </form>
          </section>
        )}

        {activeTab === 'tracking' && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-8" aria-labelledby="transfer-tracking-title">
            <PanelHeader
              title="Transfer progress"
              subtitle={
                perms.canApproveTransfer
                  ? 'Track each request — approve or reject, then dispatch when approved.'
                  : perms.canConfirmReceipt
                    ? 'Edit Pending or Rejected requests; confirm receipt when goods arrive.'
                    : 'Track transfers involving your branch.'
              }
            />

            {perms.canApproveTransfer && pendingForApproval.length > 0 ? (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-4 text-sm text-amber-950 shadow-sm" role="status">
                <strong>{pendingForApproval.length}</strong> manager transfer request
                {pendingForApproval.length === 1 ? '' : 's'} waiting — use{' '}
                <strong>Approve</strong> or <strong>Reject</strong> below.
              </div>
            ) : null}

            {perms.canTrackAllProgress ? (
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Transfer pipeline">
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-center">
                  <strong className="block text-2xl font-bold tabular-nums text-slate-900">{progressPipeline.Pending}</strong>
                  <span className="text-xs font-medium text-slate-500">Pending review</span>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-4 text-center">
                  <strong className="block text-2xl font-bold tabular-nums text-slate-900">{progressPipeline.Approved}</strong>
                  <span className="text-xs font-medium text-slate-500">Approved</span>
                </div>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-4 text-center">
                  <strong className="block text-2xl font-bold tabular-nums text-slate-900">{progressPipeline['In Transit']}</strong>
                  <span className="text-xs font-medium text-slate-500">In transit</span>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-4 text-center">
                  <strong className="block text-2xl font-bold tabular-nums text-slate-900">{progressPipeline.Rejected}</strong>
                  <span className="text-xs font-medium text-slate-500">Rejected</span>
                </div>
              </div>
            ) : null}

            {activeTransfers.length === 0 ? (
              <EmptyState
                icon="🚛"
                title={
                  hiddenByBranchScope > 0
                    ? 'Transfers hidden by branch filter'
                    : 'No active transfers'
                }
                description={
                  hiddenByBranchScope > 0
                    ? `${hiddenByBranchScope} transfer(s) exist but none match your branch. Sync data or ask admin to assign your branch on your user profile.`
                    : apiConnected
                      ? perms.canCreateTransfer
                        ? 'Create a request under New Request — it will show here as Pending until an admin approves it. Completed transfers move to History.'
                        : perms.canApproveTransfer
                          ? 'Pending manager requests appear here for Approve, Reject, or Cancel. Click Sync data if you just created a transfer as another user.'
                          : 'Transfers in Pending or In Transit status appear here.'
                      : 'Click Sync data to load branches and transfers from the server.'
                }
                primaryLabel={perms.canCreateTransfer ? 'New request' : undefined}
                onPrimary={
                  perms.canCreateTransfer ? () => switchTab('request') : undefined
                }
                secondaryLabel="Sync data"
                onSecondary={refreshAll}
              />
            ) : (
              <div className="space-y-4">
                {sortedActiveTransfers.map((t) => {
                  const stepIdx = getWorkflowStepIndex(t.status);
                  const showApprove = canReviewPendingTransfer(t, perms);
                  const showReject = canReviewPendingTransfer(t, perms);
                  const showDispatch =
                    perms.canDispatchTransfer && t.status === 'Approved';
                  const showConfirm = canConfirmReceipt(
                    t,
                    perms,
                    userBranchIds,
                    branches,
                  );
                  const showCancel = canCancelTransfer(t, perms);
                  const showEdit = canEditTransfer(t, perms, userBranchIds, branches);
                  const isEditing =
                    editingTransferId === String(t._id ?? t.id);
                  return (
                    <article
                      className={`rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
                        t.status === 'Pending' && perms.canApproveTransfer
                          ? 'border-amber-300/80 bg-gradient-to-br from-amber-50/50 to-white ring-2 ring-amber-400/20'
                          : 'border-slate-200'
                      }`}
                      key={t._id ?? t.id}
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className="font-mono text-sm font-semibold text-blue-600">{t.id}</span>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
                            {toDisplayString(t.product)} · {t.qty} units
                          </div>
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600" style={{ marginTop: 6 }}>
                            {toDisplayString(t.from)}{' '}
                            <FiArrowRight aria-hidden="true" /> {toDisplayString(t.to)}
                          </div>
                          {t.status === 'Rejected' && t.rejectReason ? (
                            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-100">
                              Rejected: {t.rejectReason}
                            </p>
                          ) : null}
                        </div>
                        <StatusBadge status={t.status} />
                      </div>

                      {perms.canTrackAllProgress ? (
                        <TransferActivityTrail transfer={t} />
                      ) : null}

                      {!isEditing ? (
                      <div className="flex flex-wrap justify-center gap-1 py-2" role="list" aria-label={`Progress for ${t.id}`}>
                        {WORKFLOW_STEPS.map((step, i) => (
                          <div
                            key={step}
                            role="listitem"
                            className={`relative flex min-w-[4.5rem] flex-1 flex-col items-center text-center after:absolute after:top-4 after:left-[55%] after:z-0 after:h-0.5 after:w-[90%] after:bg-slate-200 after:content-[''] last:after:hidden ${
                              i < stepIdx || i === stepIdx ? 'after:bg-emerald-400' : ''
                            }`}
                          >
                            <div
                              className={`relative z-[1] mb-2 grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                                i < stepIdx
                                  ? 'bg-emerald-500 text-white'
                                  : i === stepIdx
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100'
                                    : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {i < stepIdx ? <FiCheck /> : i + 1}
                            </div>
                            <span className="max-w-[5rem] text-[0.65rem] font-medium leading-tight text-slate-500">{step}</span>
                          </div>
                        ))}
                      </div>
                      ) : (
                        <TransferEditPanel
                          transfer={t}
                          branches={branches}
                          products={products}
                          stockRows={stockRows}
                          saving={submitting}
                          isResubmit={t.status === 'Rejected'}
                          onSave={(editForm) => handleSaveEdit(t, editForm)}
                          onCancel={() => setEditingTransferId(null)}
                        />
                      )}

                      {!isEditing ? (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4" style={{ marginTop: 14 }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {formatLogDate(t.date)} · {formatUserLabel(t.requestedBy)}
                        </span>
                        <div className="flex flex-wrap gap-3">
                          {showEdit && (
                            <button
                              type="button"
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"
                              disabled={submitting}
                              onClick={() =>
                                setEditingTransferId(String(t._id ?? t.id))
                              }
                            >
                              <FiEdit2 aria-hidden="true" />
                              {t.status === 'Rejected' ? 'Edit & resubmit' : 'Edit'}
                            </button>
                          )}
                          {showApprove && (
                            <button
                              type="button"
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:pointer-events-none disabled:opacity-50"
                              disabled={submitting}
                              onClick={() => handleApprove(t)}
                            >
                              <FiCheck aria-hidden="true" />
                              Approve
                            </button>
                          )}
                          {showReject && (
                            <button
                              type="button"
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 text-red-700 ring-red-100 hover:bg-red-50"
                              disabled={submitting}
                              onClick={() => handleReject(t)}
                            >
                              <FiXCircle aria-hidden="true" />
                              Reject
                            </button>
                          )}
                          {showDispatch && (
                            <button
                              type="button"
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:pointer-events-none disabled:opacity-50"
                              disabled={submitting}
                              onClick={() => handleDispatch(t)}
                            >
                              <FiTruck aria-hidden="true" />
                              Mark In Transit
                            </button>
                          )}
                          {showConfirm && (
                            <button
                              type="button"
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:pointer-events-none disabled:opacity-50"
                              disabled={submitting}
                              onClick={() => handleConfirmReceipt(t)}
                            >
                              <FiPackage aria-hidden="true" />
                              Confirm Receipt
                            </button>
                          )}
                          {showCancel && (
                            <button
                              type="button"
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 text-red-700 ring-red-100 hover:bg-red-50"
                              disabled={submitting}
                              onClick={() => handleCancel(t)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'availability' && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-8" aria-labelledby="branch-stock-title">
            <PanelHeader
              title="Branch stock levels"
              subtitle="See how much stock each branch has before planning a transfer."
            />
            <FilterBar>
              <SearchField
                label="Search"
                value={stockSearch}
                onChange={setStockSearch}
                placeholder="Product name or SKU…"
              />
              <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-600">Branch</span>
                <select
                  className={transferFieldClass}
                  value={stockBranch}
                  onChange={(e) => setStockBranch(e.target.value)}
                >
                  {perms.canViewAllBranches && <option value="All">All branches</option>}
                  {(perms.canViewAllBranches
                    ? branches
                    : branches.filter((b) => userBranchIds.includes(b.id))
                  ).map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            </FilterBar>
            {stockLoading ? (
              <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">Loading inventory…</p>
            ) : filteredStockRows.length === 0 ? (
              <EmptyState
                icon="📦"
                title="No stock data"
                description="Inventory per branch will show here after you sync and assign products to branches in the database."
                primaryLabel="Sync data"
                onPrimary={refreshAll}
                secondaryLabel={
                  perms.canCreateTransfer ? 'Create transfer' : undefined
                }
                onSecondary={
                  perms.canCreateTransfer ? () => switchTab('request') : undefined
                }
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.02]">
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product</th>
                      <th>Branch</th>
                      <th>On hand</th>
                      <th>Reorder at</th>
                      <th>Status</th>
                      <th>Transfer hint</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStockRows.map((row) => {
                        const low = row.reorder > 0 && row.qty < row.reorder;
                        const surplus = row.reorder > 0 && row.qty > row.reorder * 2;
                        return (
                          <tr key={`${row.productId}-${row.branch}`}>
                            <td>{row.sku}</td>
                            <td>{row.productName}</td>
                            <td>{row.branch}</td>
                            <td className={low ? 'font-semibold text-red-600' : 'font-semibold text-emerald-600'}>
                              {row.qty} {row.unit}
                            </td>
                            <td>{row.reorder || '—'}</td>
                            <td>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${low ? "bg-amber-50 text-amber-800 ring-amber-600/20" : "bg-emerald-50 text-emerald-800 ring-emerald-600/20"}`}>
                                {low ? 'Low stock' : 'Healthy'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {low
                                ? 'Request inbound transfer'
                                : surplus
                                  ? 'Can supply other branches'
                                  : '—'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'history' && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-8" aria-labelledby="transfer-history-title">
            <PanelHeader
              title="Transfer history"
              subtitle="Browse completed and past transfers. Filter by status or search by ID, product, or branch."
            />
            <FilterBar>
              <SearchField
                label="Search"
                value={historySearch}
                onChange={setHistorySearch}
                placeholder="Transfer ID, product, branch…"
              />
              <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-600">Status</span>
                <select
                  className={transferFieldClass}
                  value={historyStatus}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setHistoryStatus(val);
                    if (apiConnected) {
                      try {
                        await loadTransfers(val, branches);
                      } catch (err) {
                        setMessage(getApiErrorMessage(err));
                      }
                    }
                  }}
                >
                  <option value="All">All statuses</option>
                  {['Pending', 'Approved', 'In Transit', 'Completed', 'Rejected', 'Cancelled'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </FilterBar>
            {historyTransfers.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No transfers found"
                description={
                  historySearch || historyStatus !== 'All'
                    ? 'Try clearing filters or search terms to see more results.'
                    : 'Transfers will appear here once requests are created and synced from the server.'
                }
                primaryLabel={perms.canCreateTransfer ? 'Create request' : undefined}
                onPrimary={
                  perms.canCreateTransfer ? () => switchTab('request') : undefined
                }
                secondaryLabel="Sync data"
                onSecondary={refreshAll}
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/[0.02]">
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Transfer</th>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Route</th>
                        <th>Qty</th>
                        <th>Requested by</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyTransfers.map((t) => (
                        <tr key={t._id ?? t.id}>
                          <td>
                            <span className="font-mono text-sm font-semibold text-blue-600">{t.id}</span>
                          </td>
                          <td>{formatLogDate(t.date)}</td>
                          <td>{toDisplayString(t.product)}</td>
                          <td className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {toDisplayString(t.from)} → {toDisplayString(t.to)}
                          </td>
                          <td>{t.qty}</td>
                          <td>{formatUserLabel(t.requestedBy)}</td>
                          <td>
                            <StatusBadge status={t.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'reports' && perms.canViewBranchReports && (
          <section aria-labelledby="transfer-reports-title">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-8" style={{ marginBottom: 20 }}>
              <PanelHeader
                title="Transfer reports"
                subtitle="Summary of transfer volume and status across branches."
              >
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300" title="Coming soon">
                    <FiDownload aria-hidden="true" />
                    Export PDF
                  </button>
                  <button type="button" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300" title="Coming soon">
                    <FiDownload aria-hidden="true" />
                    Export Excel
                  </button>
                </div>
              </PanelHeader>
              <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <KpiCard
                  variant="primary"
                  icon={FiBarChart2}
                  value={
                    analytics?.volumeSummary?.totalTransfers ??
                    analytics?.totalTransfers ??
                    transfers.length
                  }
                  label="Total transfers"
                />
                <KpiCard
                  variant="success"
                  icon={FiPackage}
                  value={
                    analytics?.volumeSummary?.totalUnits ??
                    analytics?.totalUnits ??
                    transfers.reduce((s, t) => s + t.qty, 0)
                  }
                  label="Units moved"
                />
                <KpiCard
                  variant="warning"
                  icon={FiTruck}
                  value={analytics?.cancelledCount ?? 0}
                  label="Cancelled"
                />
                <KpiCard
                  variant="info"
                  icon={FiCheck}
                  value={
                    (analytics?.topProducts ?? []).length ||
                    reportByStatus.find((r) => r.name === 'Completed')?.value ||
                    0
                  }
                  label="Top products"
                />
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-8">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900" style={{ marginBottom: 8 }}>
                  Transfers by branch
                </h3>
                <div className="h-[300px] rounded-xl bg-slate-50/50 p-2 ring-1 ring-slate-100">
                  {reportByBranch.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={reportByBranch}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="transfers"
                          name="Transfers"
                          fill="#3b82f6"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="units"
                          name="Units"
                          fill="#8b5cf6"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState
                      icon="📊"
                      title="No branch data yet"
                      description="Complete a few transfers to see volume by branch."
                      secondaryLabel="Sync data"
                      onSecondary={refreshAll}
                    />
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-8">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900" style={{ marginBottom: 8 }}>
                  Status distribution
                </h3>
                <div className="h-[300px] rounded-xl bg-slate-50/50 p-2 ring-1 ring-slate-100">
                  {reportByStatus.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportByStatus}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {reportByStatus.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState
                      icon="📈"
                      title="No status breakdown yet"
                      description="Status chart fills in when transfers exist in the system."
                      secondaryLabel="View history"
                      onSecondary={() => switchTab('history')}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
        </div>
      </div>
    </div>
  );
}

export default StockTransferPage;
