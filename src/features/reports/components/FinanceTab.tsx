import { useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import {
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
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
  const [defaulters, setDefaulters] = useState<FeeDefaulter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const summaryRes = await graphqlRequest<{ feeCollectionSummary: FeeSummary }>(`
          query GetFeeCollectionSummary($schoolId: String!, $academicYearId: String) {
            feeCollectionSummary(schoolId: $schoolId, academicYearId: $academicYearId) {
              totalFees collected pending overdue collectionRate
              thisMonthCollection monthlyGrowth autoRemindersSent
            }
          }
        `, { schoolId, academicYearId });

        if (summaryRes?.feeCollectionSummary) {
          setSummary(summaryRes.feeCollectionSummary);
        }

        const defaultersRes = await graphqlRequest<{ feeDefaulters: FeeDefaulter[] }>(`
          query GetFeeDefaulters($schoolId: String!, $academicYearId: String, $limit: Int) {
            feeDefaulters(schoolId: $schoolId, academicYearId: $academicYearId, limit: $limit) {
              id name class amount daysOverdue reminders
            }
          }
        `, { schoolId, academicYearId, limit: 10 });

        if (defaultersRes?.feeDefaulters) {
          setDefaulters(defaultersRes.feeDefaulters);
        }
      } catch (err) {
        console.error("Failed to load finance data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [schoolId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-3xl text-[#B0AFA8] animate-spin">sync</span>
      </div>
    );
  }

  if (!summary && defaulters.length === 0) {
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
          <div key={i} className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-white border border-slate-100">
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-foreground text-[15px] font-semibold mb-2">Collection Overview</h3>
          <p className="text-[#B0AFA8] text-[11px] font-medium mb-4">Current academic year</p>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
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
          {/* Collection Rate */}
          <div className="mt-6 pt-4 border-t border-slate-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-medium text-[#444441]">Collection Rate</span>
              <span className="text-[14px] font-bold text-foreground">
                {summary ? `${summary.collectionRate}%` : "—"}
              </span>
            </div>
            <div className="h-3 bg-[#F0F0EC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2E7D32] rounded-full transition-all duration-700"
                style={{ width: `${summary?.collectionRate || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Class-wise Fee Bar — empty state */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-foreground text-[15px] font-semibold mb-2">Class-wise Collection Rate</h3>
          <p className="text-[#B0AFA8] text-[11px] font-medium mb-4">Percentage collected per class</p>
          <div className="flex items-center justify-center h-[340px] text-[#B0AFA8] text-[13px] font-medium">
            No class-wise collection data available
          </div>
        </div>
      </div>

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
