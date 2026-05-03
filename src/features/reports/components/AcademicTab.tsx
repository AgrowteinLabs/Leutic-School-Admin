import { cn } from "../../../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  classPerformanceData, subjectPerformanceData, examComparisonData, teacherPerformanceData,
} from "../data/sampleData";

const chartColors = {
  primary: "#dbe890",
  secondary: "#152328",
  maths: "#6366f1",
  science: "#10b981",
  english: "#f59e0b",
  hindi: "#ef4444",
  social: "#8b5cf6",
};

const radarData = subjectPerformanceData.map((s) => ({
  subject: s.subject.slice(0, 7),
  average: s.average,
  passRate: s.passRate,
  fullMark: 100,
}));

export const AcademicTab = () => (
  <div className="space-y-8">
    {/* Stat Row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "School Average", value: "78%", icon: "school", trend: "+2.4%", up: true },
        { label: "Pass Rate", value: "89.6%", icon: "check_circle", trend: "+1.1%", up: true },
        { label: "Highest Class Avg", value: "90% (10-A)", icon: "trending_up", trend: "+4.2%", up: true },
        { label: "At-Risk Students", value: "23", icon: "warning", trend: "-3", up: true },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl px-5 py-4 bg-white border border-slate-100 shadow-sm shadow-slate-100/30 group hover:shadow-md transition-all">
          <div className="size-11 rounded-2xl flex items-center justify-center bg-accent shrink-0">
            <span className="material-symbols-outlined text-[22px] text-secondary/70">{s.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-[12px] font-medium truncate">{s.label}</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-secondary text-[22px] font-semibold leading-none tracking-tight">{s.value}</p>
              <span className={cn("text-[11px] font-medium", s.up ? "text-emerald-600" : "text-rose-500")}>{s.trend}</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Class-wise Performance Chart */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-secondary text-[15px] font-semibold">Class-wise Average Marks</h3>
            <p className="text-slate-400 text-[11px] font-medium mt-0.5">Across all subjects • Current term</p>
          </div>
          <button className="text-[11px] font-medium text-slate-400 hover:text-secondary transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50">View Details</button>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={classPerformanceData} barGap={2} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="class" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            <Bar dataKey="maths" name="Maths" fill={chartColors.maths} radius={[4, 4, 0, 0]} />
            <Bar dataKey="science" name="Science" fill={chartColors.science} radius={[4, 4, 0, 0]} />
            <Bar dataKey="english" name="English" fill={chartColors.english} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Subject Radar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-secondary text-[15px] font-semibold">Subject Performance Radar</h3>
            <p className="text-slate-400 text-[11px] font-medium mt-0.5">Average vs Pass Rate comparison</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#f1f5f9" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
            <Radar name="Average" dataKey="average" stroke={chartColors.secondary} fill={chartColors.secondary} fillOpacity={0.15} strokeWidth={2} />
            <Radar name="Pass Rate" dataKey="passRate" stroke={chartColors.maths} fill={chartColors.maths} fillOpacity={0.1} strokeWidth={2} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Exam Comparison Trend */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-secondary text-[15px] font-semibold">Exam Performance Trend</h3>
          <p className="text-slate-400 text-[11px] font-medium mt-0.5">Unit Tests → Mid Term → Annual progression</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={examComparisonData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="exam" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[50, 100]} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
          <Line type="monotone" dataKey="classAvg" name="Class Average" stroke={chartColors.secondary} strokeWidth={2.5} dot={{ r: 4, fill: chartColors.secondary }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="schoolAvg" name="School Average" stroke={chartColors.maths} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="topPerformer" name="Top Performer" stroke={chartColors.science} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Teacher Performance Table */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-secondary text-[15px] font-semibold">Teacher-wise Performance</h3>
          <p className="text-slate-400 text-[11px] font-medium mt-0.5">Student outcomes grouped by teacher</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-[12px] font-medium hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              {["Teacher", "Subject", "Avg Marks", "Pass Rate", "Students", "Performance"].map((h) => (
                <th key={h} className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teacherPerformanceData.map((t, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 text-[13px] font-semibold text-secondary">{t.teacher}</td>
                <td className="py-3.5 text-[13px] text-slate-500">{t.subject}</td>
                <td className="py-3.5 text-[13px] font-semibold text-secondary">{t.avgMarks}%</td>
                <td className="py-3.5">
                  <span className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-full",
                    t.passRate >= 90 ? "bg-emerald-50 text-emerald-600" : t.passRate >= 80 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                  )}>{t.passRate}%</span>
                </td>
                <td className="py-3.5 text-[13px] text-slate-500">{t.students}</td>
                <td className="py-3.5">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", t.avgMarks >= 80 ? "bg-emerald-500" : t.avgMarks >= 70 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${t.avgMarks}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
