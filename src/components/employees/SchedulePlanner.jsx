import React, { useState } from "react";
import { useEmployees } from "../../context/EmployeeContext";

export default function SchedulePlanner() {
  const { employees, schedules, assignSchedule } = useEmployees();
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
  const [activeCell, setActiveCell] = useState(null); // { employeeId, dateString }
  const [editingShift, setEditingShift] = useState("");
  const [editingNotes, setEditingNotes] = useState("");

  const SHIFTS = [
    { label: "Morning (08:00 AM - 05:00 PM)", value: "Morning", color: "bg-sky-50 text-sky-700 border-sky-200" },
    { label: "Evening (02:00 PM - 10:00 PM)", value: "Evening", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { label: "Night (10:00 PM - 06:00 AM)", value: "Night", color: "bg-slate-900 text-slate-100 border-slate-950" },
    { label: "Day Off", value: "Off", color: "bg-red-50 text-red-600 border-red-200" },
  ];

  // Helper to generate next 7 days from selected start
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(selectedWeekStart);
      d.setDate(selectedWeekStart.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const getShiftForEmployee = (employeeId, dateStr) => {
    return schedules.find(s => s.employeeId === employeeId && s.date === dateStr);
  };

  const getShiftBadgeStyle = (shiftName) => {
    if (shiftName === "Morning") return "bg-sky-100 text-sky-800 border-sky-200";
    if (shiftName === "Evening") return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (shiftName === "Night") return "bg-slate-950 text-slate-100 border-slate-950";
    if (shiftName === "Off") return "bg-red-100 text-red-800 border-red-200";
    return "bg-slate-50 text-slate-400 border-slate-100";
  };

  const handleCellClick = (employeeId, dateStr, currentSchedule) => {
    setActiveCell({ employeeId, dateStr });
    setEditingShift(currentSchedule ? currentSchedule.shift : "Morning");
    setEditingNotes(currentSchedule ? currentSchedule.notes || "" : "");
  };

  const handleSaveShift = async () => {
    if (!activeCell) return;
    try {
      await assignSchedule({
        employeeId: activeCell.employeeId,
        date: activeCell.dateStr,
        shift: editingShift,
        notes: editingNotes,
      });
      setActiveCell(null);
    } catch (err) {
      alert("Error saving shift schedule");
    }
  };

  const adjustWeek = (amount) => {
    const nextStart = new Date(selectedWeekStart);
    nextStart.setDate(selectedWeekStart.getDate() + amount);
    setSelectedWeekStart(nextStart);
  };

  // Basic validation check: returns true if employee has a consecutive night to morning shift
  const checkConsecutiveAlert = (employeeId, dateStr, shift) => {
    if (shift !== "Morning") return false;
    
    // Check if previous day had a night shift
    const prevDate = new Date(dateStr);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split("T")[0];
    
    const prevSch = getShiftForEmployee(employeeId, prevDateStr);
    return prevSch && prevSch.shift === "Night";
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      
      {/* Planner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Weekly Shift Planner</h2>
          <p className="text-xs text-slate-500 mt-0.5">Assign shifts, monitor schedules, and check staffing levels.</p>
        </div>
        
        {/* Navigation & Range */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => adjustWeek(-7)}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            ◀ Prev Week
          </button>
          <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
            {weekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} — {weekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <button
            onClick={() => adjustWeek(7)}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            Next Week ▶
          </button>
        </div>
      </div>

      {/* Roster Timeline Grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-left border border-slate-100">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-3.5 text-xs font-extrabold text-slate-500 w-[200px]">Employee</th>
              {weekDays.map((day, idx) => {
                const isToday = day.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
                return (
                  <th key={idx} className={`px-3 py-3.5 text-center text-xs font-extrabold border-l border-slate-100 ${isToday ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}>
                    <span className="block">{day.toLocaleDateString(undefined, { weekday: "short" })}</span>
                    <span className="block text-sm font-black mt-0.5">{day.getDate()}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-xs text-slate-400">No active employees to schedule.</td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={emp.photo} alt={emp.firstName} className="h-8 w-8 rounded-lg object-cover" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block truncate max-w-[120px]">{emp.firstName} {emp.lastName}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">{emp.role}</span>
                    </div>
                  </td>
                  
                  {weekDays.map((day, idx) => {
                    const dateStr = day.toISOString().split("T")[0];
                    const sch = getShiftForEmployee(emp._id, dateStr);
                    const shiftName = sch ? sch.shift : "Not Scheduled";
                    const isAlert = sch && checkConsecutiveAlert(emp._id, dateStr, sch.shift);

                    return (
                      <td
                        key={idx}
                        onClick={() => handleCellClick(emp._id, dateStr, sch)}
                        className="px-2 py-3 text-center border-l border-slate-100 cursor-pointer transition hover:bg-blue-50/30 group"
                      >
                        <div className="relative inline-flex flex-col items-center gap-1">
                          <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-extrabold border uppercase ${getShiftBadgeStyle(shiftName)}`}>
                            {shiftName === "Not Scheduled" ? "-" : shiftName.substring(0, 3)}
                          </span>
                          
                          {/* Alert indicators */}
                          {isAlert && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" title="Double shift warning: Night to Morning consecutive shifts"></span>
                            </span>
                          )}
                          
                          {/* Hover Notes Tooltip */}
                          {sch && sch.notes && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-white text-[9px] py-1 px-2 rounded shadow-lg whitespace-nowrap z-10 font-medium">
                              📝 {sch.notes}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal/Drawer Overlay */}
      {activeCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-4">✍️ Schedule Shift</h3>
            
            {/* Target Details */}
            <div className="mb-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-600 text-lg">📅</div>
              <div>
                <span className="block text-xs font-extrabold text-slate-700">Date: {activeCell.dateStr}</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">
                  Assign shift for {employees.find(e => e._id === activeCell.employeeId)?.firstName}
                </span>
              </div>
            </div>

            {/* Shift Picker */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Select Shift</label>
                <div className="grid grid-cols-2 gap-2">
                  {SHIFTS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setEditingShift(s.value)}
                      className={`rounded-xl border p-2.5 text-center text-xs font-extrabold uppercase transition ${editingShift === s.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Shift Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Opening register duties, Stock receiving..."
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setActiveCell(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShift}
                className="rounded-xl bg-blue-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-100"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Legend & Details */}
      <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-50 pt-4 text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-3 w-6 rounded border bg-sky-100 border-sky-200" /> Morning (MOR)</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-6 rounded border bg-indigo-100 border-indigo-200" /> Evening (EVE)</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-6 rounded border bg-slate-950" /> Night (NIG)</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-6 rounded border bg-red-100 border-red-200" /> Day Off (OFF)</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-500" /> Double Shift Warn</span>
      </div>
      
    </div>
  );
}
