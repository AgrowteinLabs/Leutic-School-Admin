import { cn } from "../../../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { notificationDeliveryData, notificationTimelineData, smsFallbackData } from "../data/sampleData";

export const NotificationTab = () => (
  <div className="space-y-8">
    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Sent", value: "995", icon: "send", color: "text-foreground" },
        { label: "Delivered", value: "977", icon: "done_all", color: "text-[#1565C0]" },
        { label: "Read", value: "758", icon: "visibility", color: "text-[#2E7D32]" },
        { label: "Read Rate", value: "77.6%", icon: "analytics", color: "text-primary" },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-white border border-slate-100 shadow-sm">
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

    {/* Delivery by Role */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-foreground text-[15px] font-semibold mb-1">Delivery & Read Rate by Role</h3>
      <p className="text-[#B0AFA8] text-[11px] font-medium mb-6">Notification effectiveness per user role</p>
      <div className="space-y-5">
        {notificationDeliveryData.map((n, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-foreground">{n.role}</span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="text-[#B0AFA8]">Sent: <span className="font-bold text-foreground">{n.sent}</span></span>
                <span className="text-[#B0AFA8]">Delivered: <span className="font-bold text-[#1565C0]">{n.delivered}</span></span>
                <span className="text-[#B0AFA8]">Read: <span className="font-bold text-[#2E7D32]">{n.read}</span></span>
                <span className={cn(
                  "font-bold px-2 py-0.5 rounded-full text-[10px]",
                  n.rate >= 85 ? "bg-[#EAF2D7] text-[#2E7D32]" : n.rate >= 70 ? "bg-[#FEF3C7] text-[#B45309]" : "bg-[#FEE2E2] text-[#B91C1C]"
                )}>{n.rate}%</span>
              </div>
            </div>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-[#F7F8F4]">
              <div className="bg-[#1565C0]/60 rounded-l-full transition-all duration-700" style={{ width: `${(n.delivered / n.sent) * 100}%` }} />
              <div className="bg-[#2E7D32] rounded-r-full transition-all duration-700" style={{ width: `${(n.read / n.sent) * 100}%` }} />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-[#1565C0]/60" />
                <span className="text-[10px] text-[#B0AFA8]">Delivered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-[#2E7D32]" />
                <span className="text-[10px] text-[#B0AFA8]">Read</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Response Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-foreground text-[15px] font-semibold mb-1">Time to Read Distribution</h3>
        <p className="text-[#B0AFA8] text-[11px] font-medium mb-6">How fast users read notifications after delivery</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={notificationTimelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }} />
            <Bar dataKey="count" name="Notifications" fill="#152328" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SMS Fallback */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-foreground text-[15px] font-semibold mb-1">SMS Fallback Report</h3>
        <p className="text-[#B0AFA8] text-[11px] font-medium mb-6">Push failures that triggered SMS notifications</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={smsFallbackData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            <Bar dataKey="pushFailed" name="Push Failed" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={18} />
            <Bar dataKey="smsSent" name="SMS Sent" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={18} />
            <Bar dataKey="smsDelivered" name="SMS Delivered" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);
