import { useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { graphqlRequest } from "../../../lib/graphqlClient";


interface ClassAttendance {
  class: string;
  total: number;
  present: number;
  absent: number;
  halfDay: number;
  percentage: number;
}

interface ChronicAbsentee {
  id: string;
  name: string;
  class: string;
  attendance: number;
  daysAbsent: number;
  status: string;
}

export const AttendanceTab = () => {
  const schoolId = localStorage.getItem("school_id") || "";

  const [dailyData, setDailyData] = useState<ClassAttendance[]>([]);
  const [absentees, setAbsentees] = useState<ChronicAbsentee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dailyRes, absenteesRes] = await Promise.allSettled([
          graphqlRequest<{ dailyAttendance: ClassAttendance[] }>(`
            query GetDailyAttendance($schoolId: String!, $date: String) {
              dailyAttendance(schoolId: $schoolId, date: $date) {
                class total present absent halfDay percentage
              }
            }
          `, { schoolId }),
          graphqlRequest<{ chronicAbsentees: ChronicAbsentee[] }>(`
            query GetChronicAbsentees($schoolId: String!, $threshold: Float, $limit: Int) {
              chronicAbsentees(schoolId: $schoolId, threshold: $threshold, limit: $limit) {
                id name class attendance daysAbsent status
              }
            }
          `, { schoolId, threshold: 75, limit: 10 }),
        ]);

        if (dailyRes.status === "fulfilled" && dailyRes.value?.dailyAttendance) {
          setDailyData(dailyRes.value.dailyAttendance);
        }
        if (absenteesRes.status === "fulfilled" && absenteesRes.value?.chronicAbsentees) {
          setAbsentees(absenteesRes.value.chronicAbsentees);
        }
      } catch (err) {
        console.error("Failed to load attendance data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [schoolId]);

  // Compute summary stats from live data
  const totals = dailyData.length > 0
    ? dailyData.reduce(
        (acc, c) => ({ total: acc.total + c.total, present: acc.present + c.present, absent: acc.absent + c.absent, halfDay: acc.halfDay + c.halfDay }),
        { total: 0, present: 0, absent: 0, halfDay: 0 }
      )
    : null;

  const overallPct = totals ? ((totals.present / totals.total) * 100).toFixed(1) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-3xl text-[#B0AFA8] animate-spin">sync</span>
      </div>
    );
  }

  if (dailyData.length === 0 && absentees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <span className="material-symbols-outlined text-5xl text-[#B0AFA8] mb-4">event_available</span>
        <p className="text-[#B0AFA8] text-[14px] font-medium">No attendance data available yet.</p>
        <p className="text-[#B0AFA8] text-[12px] font-medium mt-1">Daily attendance records will appear once marked.</p>
      </div>
    );
  }

  const statsCards = [
    { label: "Total Students", value: totals ? totals.total.toString() : "—", icon: "group" },
    { label: "Present Today", value: totals ? totals.present.toString() : "—", icon: "check_circle", color: "text-[#2E7D32]" },
    { label: "Absent", value: totals ? totals.absent.toString() : "—", icon: "cancel", color: "text-[#B91C1C]" },
    { label: "Half Day", value: totals ? totals.halfDay.toString() : "—", icon: "timelapse", color: "text-[#B45309]" },
    { label: "Overall", value: overallPct ? `${overallPct}%` : "—", icon: "monitoring", color: "text-foreground" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-white border border-slate-100">
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
        <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-foreground text-[15px] font-semibold">Class-wise Attendance</h3>
              <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">Today's snapshot</p>
            </div>
          </div>
          {dailyData.length === 0 ? (
            <div className="flex items-center justify-center h-[320px] text-[#B0AFA8] text-[13px] font-medium">
              No attendance data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dailyData} layout="vertical" barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="class" type="category" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }} />
                <Bar dataKey="percentage" name="Attendance %" fill="#152328" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chronic Absentees */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
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
              {absentees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#B0AFA8] text-[13px] font-medium">
                    No chronic absentees detected.
                  </td>
                </tr>
              ) : (
                absentees.map((s, i) => (
                  <tr key={s.id || i} className="border-b border-slate-50 hover:bg-[#F7F8F4]/50 transition-colors">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
