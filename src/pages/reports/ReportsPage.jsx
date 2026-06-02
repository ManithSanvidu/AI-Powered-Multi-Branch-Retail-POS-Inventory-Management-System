import ReportFilter from '../../components/reports/ReportFilter'

const summaryCards = [
  {
    title: 'Total Sales',
    value: 'LKR 2.4M',
    description: 'Sales revenue this month',
  },
  {
    title: 'Total Orders',
    value: '1,248',
    description: 'Completed POS transactions',
  },
  {
    title: 'Low Stock Items',
    value: '36',
    description: 'Products needing attention',
  },
  {
    title: 'Active Branches',
    value: '08',
    description: 'Branches included in reports',
  },
]

const reportRows = [
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
]

const scheduledReports = [
  {
    title: 'Daily Sales Summary',
    time: 'Every day at 8:00 PM',
  },
  {
    title: 'Weekly Inventory Report',
    time: 'Every Monday at 9:00 AM',
  },
  {
    title: 'Monthly Branch Performance',
    time: 'First day of every month',
  },
]

const reportHistory = [
  {
    action: 'Sales Report exported as PDF',
    date: '02 Jun 2026',
  },
  {
    action: 'Inventory Summary exported as Excel',
    date: '01 Jun 2026',
  },
  {
    action: 'Branch Performance Report generated',
    date: '31 May 2026',
  },
]

const statusStyles = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Review: 'bg-yellow-100 text-yellow-700',
  Scheduled: 'bg-blue-100 text-[#356BB7]',
}

function ReportsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#356BB7] via-[#4977B6] to-[#6B8AB8] p-4 text-slate-800 md:p-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-2xl shadow-slate-900/20 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#356BB7]">
                Reporting Module
              </p>
              <h1 className="text-3xl font-bold text-slate-800 md:text-4xl">
                Reports & Business Analytics
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                View sales, inventory, branch performance, and export business
                reports for the AI-Powered Multi-Branch Retail POS and Inventory
                Management System.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-200"
              >
                Export Excel
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#356BB7] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#2f5fa3]"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10"
            >
              <p className="text-sm font-semibold text-slate-500">
                {card.title}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-800">
                {card.value}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {card.description}
              </p>
            </article>
          ))}
        </section>

        <div className="mb-6">
          <ReportFilter />
        </div>

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Report Preview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Static sample data preview before backend API integration.
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-[#356BB7]">
              Static UI
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-sm text-slate-600">
                  <th className="rounded-l-xl px-4 py-4 font-bold">Report ID</th>
                  <th className="px-4 py-4 font-bold">Branch</th>
                  <th className="px-4 py-4 font-bold">Type</th>
                  <th className="px-4 py-4 font-bold">Period</th>
                  <th className="px-4 py-4 font-bold">Amount</th>
                  <th className="rounded-r-xl px-4 py-4 font-bold">Status</th>
                </tr>
              </thead>

              <tbody>
                {reportRows.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-slate-100 text-sm text-slate-700 last:border-b-0"
                  >
                    <td className="px-4 py-4 font-semibold">{report.id}</td>
                    <td className="px-4 py-4">{report.branch}</td>
                    <td className="px-4 py-4">{report.type}</td>
                    <td className="px-4 py-4">{report.period}</td>
                    <td className="px-4 py-4 font-semibold">{report.amount}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[report.status]}`}
                      >
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10">
            <h2 className="text-xl font-bold text-slate-800">
              Scheduled Reports
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Planned automated reports for future backend integration.
            </p>

            <div className="mt-5 space-y-4">
              {scheduledReports.map((report) => (
                <div
                  key={report.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <h3 className="font-bold text-slate-800">{report.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{report.time}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10">
            <h2 className="text-xl font-bold text-slate-800">
              Report History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Recently generated reports and export activities.
            </p>

            <div className="mt-5 space-y-4">
              {reportHistory.map((history) => (
                <div
                  key={history.action}
                  className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="font-semibold text-slate-700">
                    {history.action}
                  </p>
                  <span className="text-sm text-slate-500">{history.date}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}

export default ReportsPage