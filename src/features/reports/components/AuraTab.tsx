import { cn } from "../../../lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { auraLeaderboard, auraEarningTrend, badgeDistribution } from "../data/sampleData";

const rarityColors = {
  common: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  uncommon: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  rare: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  epic: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  legendary: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
};

export const AuraTab = () => (
  <div className="space-y-8">
    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Aura Awarded", value: "24,680", icon: "auto_awesome", color: "text-amber-500" },
        { label: "Active Earners", value: "892", icon: "people", color: "text-secondary" },
        { label: "Badges Awarded", value: "89", icon: "military_tech", color: "text-purple-600" },
        { label: "Top Score", value: "1,250", icon: "emoji_events", color: "text-amber-600" },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-white border border-slate-100 shadow-sm">
          <div className="size-10 rounded-xl flex items-center justify-center bg-accent shrink-0">
            <span className={cn("material-symbols-outlined text-[20px]", s.color)}>{s.icon}</span>
          </div>
          <div>
            <p className="text-slate-400 text-[11px] font-medium">{s.label}</p>
            <p className="text-secondary text-xl font-semibold leading-tight">{s.value}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Leaderboard */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-500 text-[20px]">leaderboard</span>
          </div>
          <div>
            <h3 className="text-secondary text-[15px] font-semibold">Aura Leaderboard</h3>
            <p className="text-slate-400 text-[11px] font-medium mt-0.5">Top performing students by Aura score</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {auraLeaderboard.map((s, i) => (
          <div key={i} className={cn(
            "flex items-center gap-4 p-4 rounded-2xl border transition-all group",
            i === 0 ? "border-amber-200 bg-amber-50/30" : i === 1 ? "border-slate-200 bg-slate-50/50" : i === 2 ? "border-orange-200 bg-orange-50/20" : "border-slate-100 hover:bg-slate-50/50"
          )}>
            {/* Rank */}
            <div className={cn(
              "size-10 rounded-xl flex items-center justify-center font-black text-[14px] shrink-0",
              i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-500"
            )}>
              #{s.rank}
            </div>

            {/* Avatar */}
            <div className="size-10 rounded-full bg-slate-200 bg-cover bg-center ring-2 ring-white shadow-sm shrink-0"
              style={{ backgroundImage: `url('${s.avatar}')` }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-secondary">{s.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">Class {s.class}</p>
            </div>

            {/* Score Breakdown */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="text-center px-3">
                <p className="text-[10px] text-slate-400 font-medium">Quiz</p>
                <p className="text-[12px] font-bold text-indigo-600">{s.quizPoints}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] text-slate-400 font-medium">Attendance</p>
                <p className="text-[12px] font-bold text-emerald-600">{s.attendancePoints}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] text-slate-400 font-medium">Community</p>
                <p className="text-[12px] font-bold text-amber-600">{s.communityPoints}</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="material-symbols-outlined text-amber-400 text-[18px]">military_tech</span>
              <span className="text-[12px] font-bold text-secondary">{s.badges}</span>
            </div>

            {/* Total */}
            <div className="text-right shrink-0 w-20">
              <p className="text-[16px] font-black text-secondary">{s.totalAura.toLocaleString()}</p>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Aura</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Earning Trend */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-secondary text-[15px] font-semibold mb-1">Aura Earning Sources Over Time</h3>
      <p className="text-slate-400 text-[11px] font-medium mb-6">How students are earning points across categories</p>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={auraEarningTrend}>
          <defs>
            <linearGradient id="quizGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="evtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
          <Area type="monotone" dataKey="quiz" name="Quiz Points" stackId="1" stroke="#6366f1" fill="url(#quizGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="attendance" name="Attendance" stackId="1" stroke="#10b981" fill="url(#attGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="community" name="Community" stackId="1" stroke="#f59e0b" fill="url(#commGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="events" name="Events" stackId="1" stroke="#ef4444" fill="url(#evtGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    {/* Badge Gallery */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-secondary text-[15px] font-semibold mb-1">Badge Distribution</h3>
      <p className="text-slate-400 text-[11px] font-medium mb-6">Badges awarded across the school</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {badgeDistribution.map((b, i) => {
          const r = rarityColors[b.rarity];
          return (
            <div key={i} className={cn("rounded-2xl p-5 border text-center group hover:scale-[1.02] transition-all", r.bg, r.border)}>
              <div className={cn("size-14 rounded-2xl mx-auto flex items-center justify-center mb-3 bg-white shadow-sm", r.border)}>
                <span className={cn("material-symbols-outlined text-[28px]", r.text)}>{b.icon}</span>
              </div>
              <p className="text-[13px] font-bold text-secondary mb-0.5">{b.badge}</p>
              <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-2", r.text)}>{b.rarity}</p>
              <div className="flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                <span className="text-[12px] font-bold text-secondary">{b.count}</span>
                <span className="text-[10px] text-slate-400">awarded</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
