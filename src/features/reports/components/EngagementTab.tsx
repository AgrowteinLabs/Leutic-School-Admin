import { cn } from "../../../lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { communityActivityData, parentEngagementData } from "../data/sampleData";

export const EngagementTab = () => (
  <div className="space-y-8">
    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { label: "Total Posts This Month", value: "284", icon: "forum", trend: "+18%", up: true },
        { label: "Active Community Users", value: "892", icon: "groups", trend: "+12%", up: true },
        { label: "Avg Replies/Post", value: "3.4", icon: "reply_all", trend: "+0.6", up: true },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-white border border-slate-100 shadow-sm">
          <div className="size-10 rounded-xl flex items-center justify-center bg-accent shrink-0">
            <span className="material-symbols-outlined text-[20px] text-foreground/70">{s.icon}</span>
          </div>
          <div>
            <p className="text-[#B0AFA8] text-[11px] font-medium">{s.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-foreground text-xl font-semibold leading-tight">{s.value}</p>
              <span className={cn("text-[11px] font-medium", s.up ? "text-[#2E7D32]" : "text-[#B91C1C]")}>{s.trend}</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Community Activity Trend */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-foreground text-[15px] font-semibold mb-1">Community Activity Trend</h3>
      <p className="text-[#B0AFA8] text-[11px] font-medium mb-6">Posts, replies, and reactions over 8 weeks</p>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={communityActivityData}>
          <defs>
            <linearGradient id="teacherGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="replyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
          <Area type="monotone" dataKey="teacherPosts" name="Teacher Posts" stroke="#6366f1" fill="url(#teacherGrad)" strokeWidth={2} dot={{ r: 3 }} />
          <Area type="monotone" dataKey="studentPosts" name="Student Posts" stroke="#10b981" fill="url(#studentGrad)" strokeWidth={2} dot={{ r: 3 }} />
          <Area type="monotone" dataKey="replies" name="Replies" stroke="#f59e0b" fill="url(#replyGrad)" strokeWidth={2} dot={{ r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    {/* Parent Engagement */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-foreground text-[15px] font-semibold mb-1">Parent Engagement Metrics</h3>
      <p className="text-[#B0AFA8] text-[11px] font-medium mb-6">How actively parents are using the platform</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {parentEngagementData.map((p, i) => (
          <div key={i} className="bg-[#F7F8F4]/50 rounded-2xl p-5 border border-slate-100 group hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-medium text-[#B0AFA8]">{p.metric}</p>
              <span className={cn(
                "text-[11px] font-bold flex items-center gap-0.5",
                p.trend === "up" ? "text-[#2E7D32]" : "text-[#B91C1C]"
              )}>
                <span className="material-symbols-outlined text-[14px]">
                  {p.trend === "up" ? "trending_up" : "trending_down"}
                </span>
                {p.change > 0 ? "+" : ""}{p.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{p.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Moderation Stats */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-foreground text-[15px] font-semibold mb-1">Content Moderation Overview</h3>
      <p className="text-[#B0AFA8] text-[11px] font-medium mb-6">Teacher moderation queue status</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Review", value: "12", icon: "pending", color: "bg-[#FEF3C7] text-[#B45309]" },
          { label: "Approved Today", value: "34", icon: "check_circle", color: "bg-[#EAF2D7] text-[#2E7D32]" },
          { label: "Rejected", value: "3", icon: "block", color: "bg-[#FEE2E2] text-[#B91C1C]" },
          { label: "Avg Review Time", value: "2.4h", icon: "timer", color: "bg-[#DBEAFE] text-[#1565C0]" },
        ].map((m, i) => (
          <div key={i} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 bg-[#F7F8F4]/30">
            <div className={cn("size-12 rounded-2xl flex items-center justify-center", m.color)}>
              <span className="material-symbols-outlined text-[24px]">{m.icon}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{m.value}</p>
            <p className="text-[11px] font-medium text-[#B0AFA8]">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
