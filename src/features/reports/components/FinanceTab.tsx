import { cn } from "../../../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  feeCollectionSummary, classWiseFeeData, feeDefaulters, feeReminderFunnel,
} from "../data/sampleData";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

const pieData = [
  { name: "Collected", value: feeCollectionSummary.collected },
  { name: "Pending", value: feeCollectionSummary.pending },
  { name: "Overdue", value: feeCollectionSummary.overdue },
];


export const FinanceTab = () => (
  <div className="space-y-8">
    {/* Summary Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Fees", value: `₹${(feeCollectionSummary.totalFees / 100000).toFixed(1)}L`, icon: "account_balance", color: "text-foreground" },
        { label: "Collected", value: `₹${(feeCollectionSummary.collected / 100000).toFixed(1)}L`, icon: "check_circle", color: "text-[#2E7D32]" },
        { label: "Pending", value: `₹${(feeCollectionSummary.pending / 100000).toFixed(1)}L`, icon: "schedule", color: "text-[#B45309]" },
        { label: "Overdue", value: `₹${(feeCollectionSummary.overdue / 100000).toFixed(1)}L`, icon: "error", color: "text-[#B91C1C]" },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-white border border-slate-100 ">
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
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 ">
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
            <span className="text-[14px] font-bold text-foreground">{feeCollectionSummary.collectionRate}%</span>
          </div>
          <div className="h-3 bg-[#F0F0EC] rounded-full overflow-hidden">
            <div className="h-full bg-[#2E7D32] rounded-full transition-all duration-700" style={{ width: `${feeCollectionSummary.collectionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Class-wise Fee Bar */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-6 ">
        <h3 className="text-foreground text-[15px] font-semibold mb-2">Class-wise Collection Rate</h3>
        <p className="text-[#B0AFA8] text-[11px] font-medium mb-4">Percentage collected per class</p>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={classWiseFeeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="class" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
              formatter={(value) => [`${value}%`, "Collection Rate"]}
            />
            <Bar dataKey="rate" name="Collection %" radius={[6, 6, 0, 0]} barSize={28}>
              {classWiseFeeData.map((entry, i) => (
                <Cell key={i} fill={entry.rate >= 90 ? "#10b981" : entry.rate >= 75 ? "#f59e0b" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Fee Reminder Effectiveness */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
      <h3 className="text-foreground text-[15px] font-semibold mb-2">Fee Reminder Effectiveness</h3>
      <p className="text-[#B0AFA8] text-[11px] font-medium mb-6">Conversion funnel from reminder to payment</p>
      
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          layout="vertical"
          data={feeReminderFunnel}
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="stage" 
            type="category" 
            tick={{ fontSize: 11, fontBold: "700", fill: "#444441" }}
            width={100}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12 }}
            cursor={{ fill: '#F7F8F4' }}
          />
          <Bar 
            dataKey="count" 
            radius={[0, 10, 10, 0]} 
            barSize={32}
          >
            {feeReminderFunnel.map((_, i) => (
              <Cell 
                key={i} 
                fill={i === 4 ? "#10b981" : i === 0 ? "#152328" : "#D9EA85"} 
                fillOpacity={1 - (i * 0.12)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-center">
        <span className="text-[12px] font-medium text-[#B0AFA8]">
          Overall Conversion: <span className="text-foreground font-bold">{((feeReminderFunnel[4].count / feeReminderFunnel[0].count) * 100).toFixed(1)}%</span> (Sent → Paid)
        </span>
      </div>
    </div>

    {/* Defaulters Table */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
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
            {feeDefaulters.map((d, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-[#F7F8F4]/50 transition-colors">
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
                <td className="py-3.5 text-[13px] font-bold text-[#B91C1C]">₹{d.amount.toLocaleString()}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
