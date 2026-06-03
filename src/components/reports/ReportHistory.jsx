import { History, FileDown, FileSpreadsheet, FileText } from 'lucide-react';

const FORMAT_ICONS = {
  PDF: <FileText size={14} className="text-red-500" />,
  Excel: <FileSpreadsheet size={14} className="text-emerald-600" />,
  View: <FileDown size={14} className="text-blue-500" />,
  Scheduled: <History size={14} className="text-violet-500" />,
};

const FORMAT_COLORS = {
  PDF: 'bg-red-50 text-red-600 ring-1 ring-red-100',
  Excel: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
  View: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
  Scheduled: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100',
};

const processHistory = (historyArray) => {
  if (!historyArray || historyArray.length === 0) {
    return [
      {
        id: 'h-1',
        action: 'Sales Report exported as PDF',
        user: 'Amal Perera',
        date: '02 Jun 2026',
        time: '4:35 PM',
        format: 'PDF',
      },
      {
        id: 'h-2',
        action: 'Inventory Summary exported as Excel',
        user: 'Nimal Silva',
        date: '01 Jun 2026',
        time: '11:20 AM',
        format: 'Excel',
      },
      {
        id: 'h-3',
        action: 'Branch Performance Report generated',
        user: 'Amal Perera',
        date: '31 May 2026',
        time: '9:05 AM',
        format: 'View',
      },
      {
        id: 'h-4',
        action: 'Business Summary Q2 2026 scheduled',
        user: 'System',
        date: '30 May 2026',
        time: '8:00 PM',
        format: 'Scheduled',
      },
      {
        id: 'h-5',
        action: 'Customer Report exported as PDF',
        user: 'Ravi Kumar',
        date: '29 May 2026',
        time: '2:15 PM',
        format: 'PDF',
      },
    ];
  }

  return historyArray.map((item, idx) => {
    // Check if item is already in flat UI schema (e.g. from api sample)
    if (item.action && item.user && item.format) {
      return {
        id: item.id || `h-${idx}`,
        action: item.action,
        user: item.user,
        date: item.date,
        time: item.time,
        format: item.format,
      };
    }

    // Backend Report Schema mapping
    const created = item.generatedAt || item.createdAt || new Date();
    const dateObj = new Date(created);
    const dateStr = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let formatVal = 'View';
    if (item.fileUrl) {
      const url = item.fileUrl.toLowerCase();
      if (url.endsWith('.pdf')) formatVal = 'PDF';
      else if (
        url.endsWith('.xlsx') ||
        url.endsWith('.xls') ||
        url.endsWith('.csv')
      )
        formatVal = 'Excel';
    } else if (item.type === 'Scheduled') {
      formatVal = 'Scheduled';
    }

    return {
      id: item._id || `h-${idx}`,
      action: item.title || `${item.type || 'Report'} generated`,
      user: item.generatedBy
        ? `${item.generatedBy.firstName || ''} ${
            item.generatedBy.lastName || ''
          }`.trim() ||
          item.generatedBy.email ||
          'User'
        : 'System',
      date: dateStr,
      time: timeStr,
      format: formatVal,
    };
  });
};

function ReportHistory({ history }) {
  const historyList = processHistory(history);

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
      aria-label="Report History"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <History size={16} className="text-blue-600" />
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Report History</h2>
          <p className="text-xs text-slate-500">Recent report activity and exports</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {historyList.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50/60"
          >
            {/* Icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              {FORMAT_ICONS[item.format] ?? FORMAT_ICONS.View}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">{item.action}</p>
              <p className="text-xs text-slate-500">
                by <span className="font-medium text-slate-600">{item.user}</span>
              </p>
            </div>

            {/* Format badge */}
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                FORMAT_COLORS[item.format] ?? FORMAT_COLORS.View
              }`}
            >
              {item.format}
            </span>

            {/* Date */}
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-slate-600">{item.date}</p>
              <p className="text-xs text-slate-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 px-5 py-3">
        <button
          onClick={() => alert('Viewing historical log details')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 active:scale-95"
        >
          View Full History →
        </button>
      </div>
    </section>
  );
}

export default ReportHistory;
