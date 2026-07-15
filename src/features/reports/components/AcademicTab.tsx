import { useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { useApp } from "../../../lib/AppContext";


const chartColors = {
  primary: "#dbe890",
  secondary: "#152328",
  maths: "#6366f1",
  science: "#10b981",
  english: "#f59e0b",
  hindi: "#ef4444",
  social: "#8b5cf6",
};

interface SubjectPerformance {
  subject: string;
  average: number;
  passRate: number;
  topScore: number;
  bottomScore: number;
}

export const AcademicTab = () => {
  const { activeAcademicYear } = useApp();
  const schoolId = localStorage.getItem("school_id") || "";
  const academicYearId = activeAcademicYear?.id || undefined;

  const [subjectData, setSubjectData] = useState<SubjectPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await graphqlRequest<{ subjectPerformance: SubjectPerformance[] }>(`
          query GetSubjectPerformance($schoolId: String!, $academicYearId: String) {
            subjectPerformance(schoolId: $schoolId, academicYearId: $academicYearId) {
              subject
              average
              passRate
              topScore
              bottomScore
            }
          }
        `, { schoolId, academicYearId: academicYearId || undefined });
        if (res?.subjectPerformance) {
          setSubjectData(res.subjectPerformance);
        }
      } catch (err) {
        console.error("Failed to load subject performance:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [schoolId, academicYearId]);

  const radarData = subjectData.map((s) => ({
    subject: s.subject.slice(0, 7),
    average: s.average,
    passRate: s.passRate,
    fullMark: 100,
  }));

  // Compute KPI cards from live data
  const schoolAvg = subjectData.length > 0
    ? (subjectData.reduce((sum, s) => sum + s.average, 0) / subjectData.length).toFixed(1)
    : null;
  const passRate = subjectData.length > 0
    ? (subjectData.reduce((sum, s) => sum + s.passRate, 0) / subjectData.length).toFixed(1)
    : null;
  const topSubject = subjectData.length > 0
    ? subjectData.reduce((best, s) => s.average > best.average ? s : best, subjectData[0])
    : null;
  const atRisk = subjectData.length > 0
    ? subjectData.filter(s => s.bottomScore < 40).length
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-3xl text-[#B0AFA8] animate-spin">sync</span>
      </div>
    );
  }

  if (subjectData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <span className="material-symbols-outlined text-5xl text-[#B0AFA8] mb-4">school</span>
        <p className="text-[#B0AFA8] text-[14px] font-medium">No academic data available yet.</p>
        <p className="text-[#B0AFA8] text-[12px] font-medium mt-1">Subject performance will appear once exams are recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stat Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "School Average", value: `${schoolAvg}%`, icon: "school", trend: "Across all subjects", up: true },
          { label: "Pass Rate", value: `${passRate}%`, icon: "check_circle", trend: "All subjects", up: true },
          { label: "Top Subject", value: topSubject ? `${topSubject.average}%` : "—", icon: "trending_up", trend: topSubject?.subject || "—", up: true },
          { label: "At-Risk Subjects", value: String(atRisk), icon: "warning", trend: "Bottom score < 40%", up: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl px-5 py-4 bg-white border border-slate-100 group hover: transition-all">
            <div className="size-11 rounded-2xl flex items-center justify-center bg-accent shrink-0">
              <span className="material-symbols-outlined text-[22px] text-foreground/70">{s.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#B0AFA8] text-[12px] font-medium truncate">{s.label}</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <p className="text-foreground text-[22px] font-semibold leading-none tracking-tight">{s.value}</p>
                {s.trend && (
                  <span className={cn("text-[11px] font-medium", s.up ? "text-[#2E7D32]" : "text-[#B91C1C]")}>{s.trend}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Radar — powered by live data */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-foreground text-[15px] font-semibold">Subject Performance Radar</h3>
              <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">Average vs Pass Rate comparison</p>
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

      {/* Teacher Performance Table — powered by live data */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-foreground text-[15px] font-semibold">Subject-wise Performance</h3>
            <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">Average marks and pass rates by subject</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {["Subject", "Average", "Pass Rate", "Top Score", "Bottom Score"].map((h) => (
                  <th key={h} className="pb-3 text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjectData.map((s, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-[#F7F8F4]/50 transition-colors">
                  <td className="py-3.5 text-[13px] font-semibold text-foreground">{s.subject}</td>
                  <td className="py-3.5 text-[13px] font-semibold text-foreground">{s.average}%</td>
                  <td className="py-3.5">
                    <span className={cn(
                      "text-[11px] font-bold px-2 py-0.5 rounded-full",
                      s.passRate >= 90 ? "bg-[#EAF2D7] text-[#2E7D32]" : s.passRate >= 80 ? "bg-[#FEF3C7] text-[#B45309]" : "bg-[#FEE2E2] text-[#B91C1C]"
                    )}>{s.passRate}%</span>
                  </td>
                  <td className="py-3.5 text-[13px] font-bold text-[#2E7D32]">{s.topScore}%</td>
                  <td className="py-3.5 text-[13px] font-bold text-[#B91C1C]">{s.bottomScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
