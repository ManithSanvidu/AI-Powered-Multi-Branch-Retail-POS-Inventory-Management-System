import { useState, useEffect } from 'react';
import { Clock, ToggleRight, X, Plus } from 'lucide-react';

const TYPE_COLORS = {
  Sales: 'bg-blue-100 text-blue-700',
  Inventory: 'bg-amber-100 text-amber-700',
  'Branch Performance': 'bg-violet-100 text-violet-700',
  'Business Summary': 'bg-emerald-100 text-emerald-700',
};

const REPORT_TYPES = ['Sales', 'Inventory', 'Branch Performance', 'Business Summary'];

const FREQUENCY_OPTIONS = [
  'Every day at 8:00 AM',
  'Every day at 8:00 PM',
  'Every Monday at 9:00 AM',
  'Every Friday at 6:00 PM',
  'First day of every month',
  'Every 3 months',
];

const DEFAULT_LIST = [
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

function ScheduledReports({ scheduled }) {
  const [localScheduled, setLocalScheduled] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'Sales',
    frequency: FREQUENCY_OPTIONS[0],
    active: true,
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setLocalScheduled(scheduled && scheduled.length > 0 ? scheduled : DEFAULT_LIST);
  }, [scheduled]);

  const handleToggle = (id) => {
    setLocalScheduled((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const handleOpenModal = () => {
    setForm({ title: '', type: 'Sales', frequency: FREQUENCY_OPTIONS[0], active: true });
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  const handleAddSchedule = () => {
    if (!form.title.trim()) {
      setFormError('Schedule title is required.');
      return;
    }
    const newEntry = {
      id: `sch-${Date.now()}`,
      title: form.title.trim(),
      frequency: form.frequency,
      nextRun: 'Scheduled',
      type: form.type,
      active: form.active,
    };
    setLocalScheduled((prev) => [newEntry, ...prev]);
    setShowModal(false);
  };

  return (
    <>
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
          {localScheduled.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/60"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      TYPE_COLORS[item.type] ?? 'bg-slate-100 text-slate-600'
                    }`}
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
                  onClick={() => handleToggle(item.id)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
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
          <button
            id="btn-add-schedule"
            onClick={handleOpenModal}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 active:scale-95 transition-transform"
          >
            <Plus size={13} />
            Add New Schedule
          </button>
        </div>
      </section>

      {/* Add New Schedule Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
          aria-modal="true"
          role="dialog"
          aria-labelledby="schedule-modal-title"
        >
          <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl border border-slate-200 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                <h3 id="schedule-modal-title" className="text-sm font-semibold text-slate-800">
                  Add New Schedule
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form body */}
            <div className="px-6 py-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Schedule Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="schedule-title-input"
                  type="text"
                  placeholder="e.g. Weekly Sales Summary"
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
                {formError && (
                  <p className="mt-1 text-xs text-red-500">{formError}</p>
                )}
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Report Type
                </label>
                <select
                  id="schedule-type-select"
                  value={form.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white"
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Frequency
                </label>
                <select
                  id="schedule-frequency-select"
                  value={form.frequency}
                  onChange={(e) => handleFormChange('frequency', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white"
                >
                  {FREQUENCY_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Enable immediately</p>
                  <p className="text-xs text-slate-400">Schedule will start running after saving</p>
                </div>
                <button
                  id="schedule-active-toggle"
                  onClick={() => handleFormChange('active', !form.active)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    form.active ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  aria-checked={form.active}
                  role="switch"
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                      form.active ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                id="schedule-cancel-btn"
                onClick={handleCloseModal}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                id="schedule-save-btn"
                onClick={handleAddSchedule}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition active:scale-95 shadow-sm"
              >
                <Plus size={13} />
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ScheduledReports;
