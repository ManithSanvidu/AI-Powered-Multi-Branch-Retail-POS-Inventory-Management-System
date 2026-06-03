import { Clock, ToggleRight } from 'lucide-react';

const scheduled = [
  {
    id: 'sch-1',
    title: 'Daily Sales Summary',
    frequency: 'Every day at 8:00 PM',
    nextRun: 'Today, 8:00 PM',
    type: 'Sales',
    active: true,
  },
  {
    id: 'sch-2',
    title: 'Weekly Inventory Report',
    frequency: 'Every Monday at 9:00 AM',
    nextRun: 'Mon, 9 Jun 2026',
    type: 'Inventory',
    active: true,
  },
  {
    id: 'sch-3',
    title: 'Monthly Branch Performance',
    frequency: 'First day of every month',
    nextRun: '1 Jul 2026',
    type: 'Branch Performance',
    active: true,
  },
  {
    id: 'sch-4',
    title: 'Quarterly Business Summary',
    frequency: 'Every 3 months',
    nextRun: '1 Jul 2026',
    type: 'Business Summary',
    active: false,
  },
];

const TYPE_COLORS = {
  Sales: 'bg-blue-100 text-blue-700',
  Inventory: 'bg-amber-100 text-amber-700',
  'Branch Performance': 'bg-violet-100 text-violet-700',
  'Business Summary': 'bg-emerald-100 text-emerald-700',
};

function ScheduledReports() {
  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
      aria-label="Scheduled Reports"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <Clock size={16} className="text-blue-600" />
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Scheduled Reports</h2>
          <p className="text-xs text-slate-500">Automated report generation schedule</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {scheduled.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/60"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[item.type] ?? 'bg-slate-100 text-slate-600'}`}
                >
                  {item.type}
                </span>
                {!item.active && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    Paused
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">{item.frequency}</p>
              <p className="mt-0.5 text-xs font-medium text-blue-600">
                Next: {item.nextRun}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                title={item.active ? 'Pause schedule' : 'Enable schedule'}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  item.active
                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <ToggleRight size={13} />
                {item.active ? 'Active' : 'Paused'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 px-5 py-3">
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          + Add New Schedule
        </button>
      </div>
    </section>
  );
}

export default ScheduledReports;
