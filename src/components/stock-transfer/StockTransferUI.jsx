import { useState } from 'react';
import {
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiRefreshCw,
  FiTruck,
  FiUser,
} from 'react-icons/fi';

const BTN =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98]';
const BTN_PRIMARY =
  'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:pointer-events-none disabled:opacity-50';
const BTN_GHOST =
  'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300';

function statusBadgeClass(status) {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset';
  const key = String(status || '')
    .toLowerCase()
    .replace(/\s/g, '');
  const tones = {
    pending: `${base} bg-amber-50 text-amber-800 ring-amber-600/20`,
    approved: `${base} bg-blue-50 text-blue-800 ring-blue-600/20`,
    intransit: `${base} bg-indigo-50 text-indigo-800 ring-indigo-600/20`,
    transit: `${base} bg-indigo-50 text-indigo-800 ring-indigo-600/20`,
    completed: `${base} bg-emerald-50 text-emerald-800 ring-emerald-600/20`,
    received: `${base} bg-emerald-50 text-emerald-800 ring-emerald-600/20`,
    cancelled: `${base} bg-red-50 text-red-800 ring-red-600/20`,
    rejected: `${base} bg-red-50 text-red-700 ring-red-600/20`,
  };
  return tones[key] ?? `${base} bg-slate-50 text-slate-700 ring-slate-500/20`;
}

const KPI_STYLES = {
  primary: {
    card: 'border-blue-100/80 bg-gradient-to-br from-white to-blue-50/40 hover:border-blue-200',
    icon: 'bg-blue-500 text-white shadow-md shadow-blue-500/25',
  },
  warning: {
    card: 'border-amber-100/80 bg-gradient-to-br from-white to-amber-50/40 hover:border-amber-200',
    icon: 'bg-amber-500 text-white shadow-md shadow-amber-500/25',
  },
  success: {
    card: 'border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/40 hover:border-emerald-200',
    icon: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25',
  },
  info: {
    card: 'border-violet-100/80 bg-gradient-to-br from-white to-violet-50/40 hover:border-violet-200',
    icon: 'bg-violet-500 text-white shadow-md shadow-violet-500/25',
  },
};

export function PanelHeader({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex gap-4">
        {Icon ? (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20"
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

export function KpiCard({ variant = 'primary', icon: Icon, value, label }) {
  const v = KPI_STYLES[variant] ?? KPI_STYLES.primary;
  return (
    <div
      className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${v.card}`}
    >
      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg ${v.icon}`}
      >
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
          {value}
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
      </div>
    </div>
  );
}

export function AlertBanner({ variant = 'warn', children }) {
  const isWarn = variant === 'warn';
  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm leading-relaxed ${
        isWarn
          ? 'border border-amber-200/80 bg-amber-50/90 text-amber-950'
          : 'border border-emerald-200/80 bg-emerald-50/90 text-emerald-900'
      }`}
      role="status"
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isWarn ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
        }`}
      >
        {isWarn ? (
          <FiAlertTriangle className="h-5 w-5" aria-hidden="true" />
        ) : (
          <FiInfo className="h-5 w-5" aria-hidden="true" />
        )}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function EmptyState({
  icon = '📦',
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryDisabled = false,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white px-8 py-12 text-center">
      <div className="mb-4 text-5xl opacity-90" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      {(primaryLabel || secondaryLabel) && (
        <div className="flex flex-wrap justify-center gap-3">
          {primaryLabel && onPrimary ? (
            <button
              type="button"
              className={`${BTN} ${BTN_PRIMARY}`}
              onClick={onPrimary}
              disabled={primaryDisabled}
            >
              {primaryLabel}
            </button>
          ) : null}
          {secondaryLabel && onSecondary ? (
            <button
              type="button"
              className={`${BTN} ${BTN_GHOST}`}
              onClick={onSecondary}
            >
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={statusBadgeClass(status)}>{status}</span>;
}

export function ConnectionStatus({
  connected,
  branches,
  products,
  transfers,
  syncing,
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50/80 px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-100"
      role="status"
    >
      <span
        className={`h-2 w-2 rounded-full ${
          connected
            ? 'animate-pulse bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]'
            : 'bg-slate-400'
        }`}
        aria-hidden="true"
      />
      <span
        className={
          connected ? 'font-medium text-emerald-700' : 'font-medium text-amber-700'
        }
      >
        {syncing ? 'Syncing…' : connected ? 'Connected' : 'Not connected'}
      </span>
      <span className="flex flex-wrap items-center gap-1.5 text-slate-500">
        <span className="rounded-md bg-white/80 px-1.5 py-0.5 ring-1 ring-slate-100">
          {branches} branches
        </span>
        <span className="text-slate-300">·</span>
        <span className="rounded-md bg-white/80 px-1.5 py-0.5 ring-1 ring-slate-100">
          {products} products
        </span>
        <span className="text-slate-300">·</span>
        <span className="rounded-md bg-white/80 px-1.5 py-0.5 ring-1 ring-slate-100">
          {transfers} transfers
        </span>
      </span>
    </div>
  );
}

export function WorkflowGuide({ perms }) {
  const [open, setOpen] = useState(false);
  const roleHint = perms.canApproveTransfer
    ? 'You (Admin): approve or reject manager requests on Progress.'
    : perms.canCreateTransfer
      ? 'You (Manager): submit on New Request — admin approves on Progress.'
      : 'View-only: track transfer status for your branch.';

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 text-sm text-indigo-900">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"
          aria-hidden="true"
        >
          <FiUser className="h-4 w-4" />
        </span>
        <p className="m-0 leading-relaxed">{roleHint}</p>
      </div>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100/80"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>How transfers work</span>
        {open ? (
          <FiChevronUp className="text-slate-400" aria-hidden="true" />
        ) : (
          <FiChevronDown className="text-slate-400" aria-hidden="true" />
        )}
      </button>
      {open ? (
        <div className="border-t border-slate-100 bg-white px-5 py-4">
          <ol className="m-0 list-decimal space-y-2.5 pl-5 text-sm text-slate-600">
            <li>
              <strong className="text-slate-800">Manager</strong> submits →{' '}
              <StatusBadge status="Pending" />
            </li>
            <li>
              <strong className="text-slate-800">Admin</strong> reviews →{' '}
              <StatusBadge status="Approved" /> / <StatusBadge status="Rejected" />
            </li>
            <li>
              Dispatch → <StatusBadge status="In Transit" />
            </li>
            <li>
              <strong className="text-slate-800">Destination</strong> confirms →{' '}
              <StatusBadge status="Completed" />
            </li>
          </ol>
          {perms.canCancelTransfer ? (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Admins can cancel a transfer before it is completed.
            </p>
          ) : null}
          {perms.viewScope === 'branch' ? (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              You only see transfers linked to your branch.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function PageHero({
  perms,
  connected,
  branchCount,
  productCount,
  transferCount,
  loading,
  onSync,
}) {
  return (
    <header className="relative mb-6 flex flex-wrap items-start gap-5 pb-6 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-slate-200 after:to-transparent">
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-white"
        aria-hidden="true"
      >
        <FiTruck className="h-9 w-9" />
      </div>
      <div className="min-w-[200px] flex-1 space-y-2">
        <h1 className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
          Stock Transfer
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          {perms.label} access
        </span>
        <ConnectionStatus
          connected={connected}
          branches={branchCount}
          products={productCount}
          transfers={transferCount}
          syncing={loading}
        />
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2">
        <button
          type="button"
          className={`${BTN} ${BTN_PRIMARY} shrink-0`}
          onClick={onSync}
          disabled={loading}
          title="Refresh branches, products, and transfers"
        >
          <FiRefreshCw
            aria-hidden="true"
            className={loading ? 'animate-spin' : ''}
          />
          {loading ? 'Syncing…' : 'Sync data'}
        </button>
      </div>
    </header>
  );
}

export function FilterBar({ children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-4 rounded-xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
      {children}
    </div>
  );
}

export function SearchField({ label, value, onChange, placeholder }) {
  return (
    <label className="min-w-[200px] flex-1 max-sm:w-full">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <input
        type="search"
        className="w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm ring-1 ring-slate-200 transition-shadow placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

/** Shared form field classes for stock-transfer forms */
export const transferFieldClass =
  'rounded-xl border-0 bg-white px-3.5 py-3 text-sm text-slate-800 shadow-sm ring-1 ring-slate-200 transition-all placeholder:text-slate-400 hover:ring-slate-300 focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70';
export const transferLabelClass =
  'flex flex-col gap-2 text-sm font-medium text-slate-700';
export const transferBtnClass = BTN;
export const transferBtnPrimaryClass = BTN_PRIMARY;
export const transferBtnGhostClass = BTN_GHOST;
