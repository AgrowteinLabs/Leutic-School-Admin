import { useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import {
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { useApp } from "../../../lib/AppContext";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

interface FeeSummary {
  totalFees: number;
  collected: number;
  pending: number;
  overdue: number;
  collectionRate: number;
  thisMonthCollection: number;
  monthlyGrowth: number;
  autoRemindersSent: number;
}

interface ClassWiseFeeItem {
  grade: string;
  collected: number;
  pending: number;
  overdue: number;
  total: number;
  collectionRate?: number;
}

interface FeeReminderFunnelStage {
  stage: string;
  count: number;
  amount?: number;
  percentage?: number;
}

interface FeeDefaulter {
  id: string;
  name: string;
  class: string;
  amount: number;
  daysOverdue: number;
  reminders: number;
}

export const FinanceTab = () => {
  const { activeAcademicYear } = useApp();
  const schoolId = localStorage.getItem("school_id") || "";
  const academicYearId = activeAcademicYear?.id || undefined;
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [classWiseFees, setClassWiseFees] = useState<ClassWiseFeeItem[]>([]);
  const [funnelStages, setFunnelStages] = useState<FeeReminderFunnelStage[]>([]);
  const [defaulters, setDefaulters] = useState<FeeDefaulter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [summaryRes, classWiseRes, funnelRes, defaultersRes] = await Promise.allSettled([
          graphqlRequest<{ feeCollectionSummary: FeeSummary }>(`
            query GetFeeCollectionSummary($schoolId: String!, $academicYearId: String) {
              feeCollectionSummary(schoolId: $schoolId, academicYearId: $academicYearId) {
                totalFees collected pending overdue collectionRate
                thisMonthCollection monthlyGrowth autoRemindersSent
              }
            }
          `, { schoolId, academicYearId }),

          graphqlRequest<{ classWiseFee: ClassWiseFeeItem[] }>(`
            query GetClassWiseFee($schoolId: String!, $academicYearId: String) {
              classWiseFee(schoolId: $schoolId, academicYearId: $academicYearId) {
                grade collected pending overdue total
              }
            }
          `, { schoolId, academicYearId }),

          graphqlRequest<{ feeReminderFunnel: FeeReminderFunnelStage[] }>(`
            query GetFeeReminderFunnel($schoolId: String!) {
              feeReminderFunnel(schoolId: $schoolId) {
                stage count amount percentage
              }
            }
          `, { schoolId }),

          graphqlRequest<{ feeDefaulters: FeeDefaulter[] }>(`
            query GetFeeDefaulters($schoolId: String!, $academicYearId: String, $limit: Int) {
              feeDefaulters(schoolId: $schoolId, academicYearId: $academicYearId, limit: $limit) {
                id name class amount daysOverdue reminders
              }
            }
          `, { schoolId, academicYearId, limit: 10 })
        ]);

        if (summaryRes.status === "fulfilled" && summaryRes.value?.feeCollectionSummary) {
          setSummary(summaryRes.value.feeCollectionSummary);
        }

        if (classWiseRes.status === "fulfilled" && classWiseRes.value?.classWiseFee) {
          const items = Array.isArray(classWiseRes.value.classWiseFee)
            ? classWiseRes.value.classWiseFee
            : [];
          setClassWiseFees(items);
        }

        if (funnelRes.status === "fulfilled" && funnelRes.value?.feeReminderFunnel) {
          const items = Array.isArray(funnelRes.value.feeReminderFunnel)
            ? funnelRes.value.feeReminderFunnel
            : [];
          setFunnelStages(items);
        }

        if (defaultersRes.status === "fulfilled" && defaultersRes.value?.feeDefaulters) {
          setDefaulters(defaultersRes.value.feeDefaulters);
        }
      } catch (err) {
        console.error("Failed to load finance data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [schoolId, academicYearId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-3xl text-[#B0AFA8] animate-spin">sync</span>
      </div>
    );
  }

  if (!summary && defaulters.length === 0 && classWiseFees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <span className="material-symbols-outlined text-5xl text-[#B0AFA8] mb-4">payments</span>
        <p className="text-[#B0AFA8] text-[14px] font-medium">No finance data available yet.</p>
        <p className="text-[#B0AFA8] text-[12px] font-medium mt-1">Fee collection records will appear once configured.</p>
      </div>
    );
  }

  const pieData = summary ? [
    { name: "Collected", value: summary.collected },
    { name: "Pending", value: summary.pending },
    { name: "Overdue", value: summary.overdue },
  ] : [
    { name: "Collected", value: 0 },
    { name: "Pending", value: 0 },
    { name: "Overdue", value: 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Fees", value: summary ? `₹${(summary.totalFees / 100000).toFixed(1)}L` : "—", icon: "account_balance", color: "text-foreground" },
          { label: "Collected", value: summary ? `₹${(summary.collected / 100000).toFixed(1)}L` : "—", icon: "check_circle", color: "text-[#2E7D32]" },
          { label: "Pending", value: summary ? `₹${(summary.pending / 100000).toFixed(1)}L` : "—", icon: "schedule", color: "text-[#B45309]" },
          { label: "Overdue", value: summary ? `₹${(summary.overdue / 100000).toFixed(1)}L` : "—", icon: "error", color: "text-[#B91C1C]" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-white border border-slate-100 shadow-sm shadow-slate-100/50">
            <div className="size-10 rounded-xl flex items-center justify-center bg-accent shrink-0">
              <span className={cn("material-symbols-outlined text-[20px]", s.color)}>{s.icon}</span>
            </div>
            <div>
              <p className="text-[#B0AFA8] text-[11px] font-medium">{s.label}</p>
              <p className="text-foreground text-xl font-semibold leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Fee Collection Donut */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-foreground text-[15px] font-semibold mb-1">Collection Overview</h3>
            <p className="text-[#B0AFA8] text-[11px] font-medium mb-4">Current academic year breakdown</p>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${(Number(value) / 1000).toFixed(0)}K`, ""]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-[11px] font-medium text-[#444441]">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Rate */}
          <div className="mt-6 pt-4 border-t border-slate-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-medium text-[#444441]">Collection Rate</span>
              <span className="text-[14px] font-bold text-foreground">
                {summary ? `${summary.collectionRate}%` : "—"}
              </span>
            </div>
            <div className="h-2.5 bg-[#F0F0EC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2E7D32] rounded-full transition-all duration-700"
                style={{ width: `${summary?.collectionRate || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Class-wise Fee Bar Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground text-[15px] font-semibold">Class-wise Collection Analysis</h3>
              <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">Collected vs Pending vs Overdue per grade</p>
            </div>
          </div>

          {classWiseFees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-[#B0AFA8] text-[13px] font-medium">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">bar_chart</span>
              No class-wise collection data available
            </div>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classWiseFees} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="grade" 
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "#94a3b8" }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
                    formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString()}`, name]}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
                  <Bar dataKey="collected" name="Collected" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="overdue" name="Overdue" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Fee Reminder Funnel */}
      {funnelStages.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#B45309] text-[20px]">filter_alt</span>
            </div>
            <div>
              <h3 className="text-foreground text-[15px] font-semibold">Fee Reminder Funnel</h3>
              <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">Payment collection status and reminder escalation pipeline</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {funnelStages.map((stage, idx) => {
              const stageColors = [
                { border: "border-emerald-200", bg: "bg-emerald-50/50", text: "text-emerald-700", countColor: "text-emerald-800", icon: "task_alt" },
                { border: "border-sky-200", bg: "bg-sky-50/50", text: "text-sky-700", countColor: "text-sky-800", icon: "pending" },
                { border: "border-amber-200", bg: "bg-amber-50/50", text: "text-amber-700", countColor: "text-amber-800", icon: "notifications_active" },
                { border: "border-rose-200", bg: "bg-rose-50/50", text: "text-rose-700", countColor: "text-rose-800", icon: "priority_high" }
              ];
              const config = stageColors[idx % stageColors.length];

              return (
                <div key={idx} className={cn("rounded-2xl border p-5 transition-all flex flex-col justify-between", config.border, config.bg)}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn("text-[12px] font-bold tracking-tight", config.text)}>{stage.stage}</span>
                    <span className={cn("material-symbols-outlined text-[18px]", config.text)}>{config.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={cn("text-2xl font-black", config.countColor)}>{stage.count}</span>
                      <span className="text-[11px] text-slate-500 font-medium">students</span>
                    </div>
                    {stage.amount !== undefined && (
                      <p className="text-[12px] font-semibold text-slate-600 mt-1">₹{stage.amount.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Defaulters Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#B91C1C] text-[20px]">gpp_maybe</span>
            </div>
            <div>
              <h3 className="text-foreground text-[15px] font-semibold">Fee Defaulters</h3>
              <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">Students with overdue fee payments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#FEF3C7] rounded-xl border border-[#FDE68A] text-[#B45309] text-[12px] font-bold hover:bg-amber-100 transition-colors">
              <span className="material-symbols-outlined text-[16px]">send</span>
              Send Reminders
            </button>
            <button className="btn-outline px-4 py-2 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {["Student", "Class", "Amount Due", "Days Overdue", "Reminders Sent", "Action"].map((h) => (
                  <th key={h} className="pb-3 text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#B0AFA8] text-[13px] font-medium">
                    <span className="material-symbols-outlined text-2xl animate-spin inline-block align-middle mr-2">sync</span>
                    Loading defaulters...
                  </td>
                </tr>
              ) : defaulters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#B0AFA8] text-[13px] font-medium">
                    No defaulters found — all fees are up to date.
                  </td>
                </tr>
              ) : (
                defaulters.map((d, i) => (
                  <tr key={d.id || i} className="border-b border-slate-50 hover:bg-[#F7F8F4]/50 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-[#F0F0EC] flex items-center justify-center text-[11px] font-bold text-foreground">
                          {d.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{d.name}</p>
                          <p className="text-[10px] text-[#B0AFA8]">{d.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-[13px] text-[#444441] font-medium">{d.class}</td>
                    <td className="py-3.5 text-[13px] font-bold text-[#B91C1C]">₹{(d.amount || 0).toLocaleString()}</td>
                    <td className="py-3.5">
                      <span className={cn(
                        "text-[11px] font-bold px-2 py-0.5 rounded-full",
                        d.daysOverdue >= 30 ? "bg-[#FEE2E2] text-[#B91C1C]" : "bg-[#FEF3C7] text-[#B45309]"
                      )}>{d.daysOverdue} days</span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <div key={j} className={cn("size-2 rounded-full", j < d.reminders ? "bg-secondary" : "bg-slate-200")} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <button className="text-[11px] font-medium text-foreground hover:text-primary transition-colors underline underline-offset-2">Send Notice</button>
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
