function ReportFilter() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Report Filters</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select report type, branch, and date range to preview reports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Report Type
          </label>
          <select className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#356BB7] focus:ring-2 focus:ring-blue-100">
            <option>Sales Report</option>
            <option>Inventory Report</option>
            <option>Customer Report</option>
            <option>Supplier Report</option>
            <option>Branch Performance Report</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Branch
          </label>
          <select className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#356BB7] focus:ring-2 focus:ring-blue-100">
            <option>All Branches</option>
            <option>Colombo Branch</option>
            <option>Kandy Branch</option>
            <option>Galle Branch</option>
            <option>Jaffna Branch</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">
            From Date
          </label>
          <input
            type="date"
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#356BB7] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">
            To Date
          </label>
          <input
            type="date"
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#356BB7] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </section>
  )
}

export default ReportFilter