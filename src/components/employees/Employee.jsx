import React, { useState } from "react";
import { useEmployees } from "../../context/EmployeeContext";

export const EmployeeCard = ({ employee, onViewDetails, onEdit }) => {
  const { role, branch, status, firstName, lastName, performanceScore, photo, phone, email } = employee;

  // Curated color palette mapping for roles
  const roleColors = {
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    manager: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cashier: "bg-blue-100 text-blue-700 border-blue-200",
    inventory: "bg-amber-100 text-amber-700 border-amber-200",
  };

  const branchNames = {
    "1": "Colombo HO",
    "2": "Kandy City",
    "3": "Galle Fort",
    "4": "Negombo",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* Background soft glow decoration on hover */}
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-50/50 transition-all duration-500 group-hover:scale-150" />
      
      <div className="relative flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"}
            alt={`${firstName} ${lastName}`}
            className="h-16 w-16 rounded-xl border border-slate-100 object-cover"
          />
          <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${status === "Active" ? "bg-green-500" : "bg-red-400"}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${roleColors[role] || "bg-slate-100 text-slate-700"}`}>
              {role}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              📍 {branchNames[branch] || `Branch ${branch}`}
            </span>
          </div>

          <h3 className="mt-2 text-base font-bold text-slate-800 truncate">
            {firstName} {lastName}
          </h3>

          <p className="text-xs text-slate-500 mt-1 truncate">📞 {phone}</p>
          <p className="text-xs text-slate-500 truncate">✉️ {email}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
        {/* Performance Score */}
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-base">★</span>
          <span className="text-xs font-bold text-slate-700">{performanceScore}</span>
          <span className="text-[10px] text-slate-400">/ 5.0 Rating</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(employee)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            onClick={() => onViewDetails(employee)}
            className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm shadow-blue-100"
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export const EmployeeDetailModal = ({ employee, onClose, onEdit }) => {
  const { updateEmployee, deleteEmployee, attendanceLogs, schedules, performanceMetrics } = useEmployees();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const { _id, firstName, lastName, role, branch, email, phone, salary, hireDate, status, photo, performanceScore } = employee;

  // Filter logs specific to this employee
  const employeeLogs = attendanceLogs.filter(log => log.employeeId === _id);
  const employeeSchedules = schedules.filter(sch => sch.employeeId === _id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const performanceInfo = performanceMetrics.find(p => p.employeeId === _id) || {
    punctuality: 80,
    salesAchievement: 85,
    customerRating: 4.0,
    taskCompletion: 80,
  };

  const branchNames = {
    "1": "Colombo Head Office",
    "2": "Kandy City Branch",
    "3": "Galle Fort Branch",
    "4": "Negombo Branch",
  };

  const attendanceRate = employeeLogs.length > 0 
    ? Math.round((employeeLogs.filter(l => l.status === "Present").length / employeeLogs.length) * 100)
    : 100;

  const handleDelete = async () => {
    try {
      await deleteEmployee(_id);
      onClose();
    } catch (err) {
      alert("Error deleting employee");
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = status === "Active" ? "Inactive" : "Active";
    try {
      await updateEmployee(_id, { status: nextStatus });
    } catch (err) {
      alert("Error changing employee status");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Employee Corporate Profile</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition">
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            
            {/* Left Column: Avatar & Basic Stats */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"}
                  alt={`${firstName} ${lastName}`}
                  className="h-40 w-40 rounded-3xl object-cover border-4 border-white shadow-md"
                />
                <span className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white ${status === "Active" ? "bg-green-500" : "bg-red-400"}`} />
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-800">{firstName} {lastName}</h3>
              <p className="text-xs uppercase font-bold text-blue-600 tracking-widest mt-1">{role}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">📍 {branchNames[branch] || `Branch ${branch}`}</p>
              
              {/* Basic Quick Stats */}
              <div className="mt-6 w-full grid grid-cols-2 gap-3 border-t border-slate-100 pt-6">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Performance</span>
                  <span className="text-base font-extrabold text-slate-800">{performanceScore} ★</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Attendance</span>
                  <span className="text-base font-extrabold text-slate-800">{attendanceRate}%</span>
                </div>
              </div>

              {/* Status & Control Actions */}
              <div className="mt-8 w-full flex flex-col gap-2.5">
                <button
                  onClick={handleToggleStatus}
                  className={`w-full rounded-xl py-2.5 text-xs font-bold transition ${status === "Active" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                >
                  {status === "Active" ? "⚠️ Suspend/Deactivate" : "✓ Reactivate Employee"}
                </button>

                <button
                  onClick={() => {
                    onEdit(employee);
                    onClose();
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ✏️ Edit Profile Details
                </button>

                {isConfirmingDelete ? (
                  <div className="mt-1 rounded-xl bg-red-50 p-2.5 border border-red-100">
                    <p className="text-[10px] text-red-700 font-bold mb-2">Are you absolutely sure?</p>
                    <div className="flex gap-2">
                      <button onClick={handleDelete} className="flex-1 rounded-lg bg-red-600 py-1.5 text-[10px] font-bold text-white hover:bg-red-700">Yes, delete</button>
                      <button onClick={() => setIsConfirmingDelete(false)} className="flex-1 rounded-lg bg-white border border-slate-200 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="w-full rounded-xl py-2.5 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-slate-50 transition"
                  >
                    🗑️ Permanently Delete
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Detailed Employee Records */}
            <div className="flex flex-col gap-6">
              
              {/* Contract Information */}
              <div className="rounded-2xl border border-slate-100 p-5">
                <h4 className="text-sm font-extrabold text-slate-800 mb-4 border-b border-slate-50 pb-2">📋 Employment Details</h4>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Email Address</span>
                    <span className="font-bold text-slate-700">{email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Phone Number</span>
                    <span className="font-bold text-slate-700">{phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Monthly Salary</span>
                    <span className="font-bold text-slate-700">Rs. {salary ? salary.toLocaleString() : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Hire Date</span>
                    <span className="font-bold text-slate-700">{hireDate || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Performance Radar Metrics */}
              <div className="rounded-2xl border border-slate-100 p-5">
                <h4 className="text-sm font-extrabold text-slate-800 mb-4 border-b border-slate-50 pb-2">📈 Performance Scorecard</h4>
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-500">Punctuality & Reliability</span>
                      <span className="text-blue-600">{performanceInfo.punctuality}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${performanceInfo.punctuality}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-500">Sales Targets / Productivity</span>
                      <span className="text-emerald-600">{performanceInfo.salesAchievement}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${performanceInfo.salesAchievement}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-500">Customer Satisfaction Rating</span>
                      <span className="text-amber-600">{performanceInfo.customerRating * 20}% ({performanceInfo.customerRating}/5.0)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${performanceInfo.customerRating * 20}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-500">Task Completion & Operations</span>
                      <span className="text-purple-600">{performanceInfo.taskCompletion}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: `${performanceInfo.taskCompletion}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedules & Shift History */}
              <div className="rounded-2xl border border-slate-100 p-5">
                <h4 className="text-sm font-extrabold text-slate-800 mb-3 border-b border-slate-50 pb-2">📅 Upcoming Schedules</h4>
                {employeeSchedules.length === 0 ? (
                  <p className="text-xs text-slate-400">No shifts scheduled for this employee.</p>
                ) : (
                  <div className="max-h-32 overflow-y-auto space-y-2.5 pr-2">
                    {employeeSchedules.slice(0, 5).map((sch) => (
                      <div key={sch._id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-600">{sch.date}</span>
                        <span className="rounded-full bg-blue-100 text-blue-800 font-extrabold px-3 py-0.5 text-[10px]">{sch.shift}</span>
                        <span className="text-slate-400 italic truncate max-w-[200px]">{sch.notes || "No notes"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
