import { cn } from "../../../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, Line,
} from "recharts";
import { dailyAttendanceData, attendanceTrendData, chronicAbsentees } from "../data/sampleData";

export const AttendanceTab = () => {
  const totals = dailyAttendanceData.reduce(
    (acc, c) => ({ total: acc.total + c.total, present: acc.present + c.present, absent: acc.absent + c.absent, halfDay: acc.halfDay + c.halfDay }),
    { total: 0, present: 0, absent: 0, halfDay: 0 }
  );
  const overallPct = ((totals.present / totals.total) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Students", value: totals.total.toString(), icon: "group" },
          { label: "Present Today", value: totals.present.toString(), icon: "check_circle", color: "text-[#2E7D32]" },
          { label: "Absent", value: totals.absent.toString(), icon: "cancel", color: "text-[#B91C1C]" },
          { label: "Half Day", value: totals.halfDay.toString(), icon: "timelapse", color: "text-[#B45309]" },
          { label: "Overall", value: `${overallPct}%`, icon: "monitoring", color: "text-foreground" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-white border border-slate-100 ">
            <div className="size-10 rounded-xl flex items-center justify-center bg-accent shrink-0">
              <span className={cn("material-symbols-outlined text-[20px]", s.color || "text-foreground/70")}>{s.icon}</span>
            </div>
            <div>
              <p className="text-[#B0AFA8] text-[11px] font-medium">{s.label}</p>
              <p className="text-foreground text-xl font-semibold leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class-wise Attendance */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-foreground text-[15px] font-semibold">Class-wise Attendance</h3>
              <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">Today's snapshot</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={dailyAttendanceData} layout="vertical" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="class" type="category" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }} />
              <Bar dataKey="percentage" name="Attendance %" fill="#152328" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Trend */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-foreground text-[15px] font-semibold">Weekly Attendance Trend</h3>
              <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">12-week rolling average</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={attendanceTrendData}>
              <defs>
                <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#152328" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#152328" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[80, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              <Area type="monotone" dataKey="percentage" name="Attendance %" stroke="#152328" fill="url(#attendanceGrad)" strokeWidth={2.5} dot={{ r: 3, fill: "#152328" }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="target" name="Target (90%)" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chronic Absentees Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#B91C1C] text-[20px]">warning</span>
            </div>
            <div>
              <h3 className="text-foreground text-[15px] font-semibold">Chronic Absenteeism Alert</h3>
              <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">Students with attendance below 75%</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#FEE2E2] rounded-xl border border-red-100 text-[#B91C1C] text-[12px] font-bold hover:bg-red-100 transition-colors">
            <span className="material-symbols-outlined text-[16px]">notification_important</span>
            Notify Parents
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {["Student", "Class", "Attendance", "Days Absent", "Severity", "Action"].map((h) => (
                  <th key={h} className="pb-3 text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chronicAbsentees.map((s, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-[#F7F8F4]/50 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-[#F0F0EC] flex items-center justify-center text-[11px] font-bold text-foreground">
                        {s.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{s.name}</p>
                        <p className="text-[10px] text-[#B0AFA8]">{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-[13px] text-[#444441] font-medium">{s.class}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-[#F0F0EC] rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", s.status === "critical" ? "bg-[#B91C1C]" : "bg-[#B45309]")} style={{ width: `${s.attendance}%` }} />
                      </div>
                      <span className="text-[12px] font-bold text-foreground">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-[13px] font-semibold text-foreground">{s.daysAbsent}</td>
                  <td className="py-3.5">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase",
                      s.status === "critical" ? "bg-[#FEE2E2] text-[#B91C1C] border-red-100" : "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                    )}>{s.status}</span>
                  </td>
                  <td className="py-3.5">
                    <button className="text-[11px] font-medium text-foreground hover:text-primary transition-colors underline underline-offset-2">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
