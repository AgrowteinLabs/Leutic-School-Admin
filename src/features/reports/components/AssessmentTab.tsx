import { cn } from "../../../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { quizPerformanceData, quizParticipationByClass, competitionResults } from "../data/sampleData";

export const AssessmentTab = () => (
  <div className="space-y-8">
    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Quizzes", value: "32", icon: "quiz", trend: "This term" },
        { label: "Avg Participation", value: "82%", icon: "group", trend: "+5% vs last" },
        { label: "Avg Score", value: "72%", icon: "grade", trend: "+3.2%" },
        { label: "Competitions", value: "8", icon: "emoji_events", trend: "5 won" },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl px-5 py-4 bg-white border border-slate-100 ">
          <div className="size-10 rounded-xl flex items-center justify-center bg-accent shrink-0">
            <span className="material-symbols-outlined text-[20px] text-foreground/70">{s.icon}</span>
          </div>
          <div>
            <p className="text-[#B0AFA8] text-[11px] font-medium">{s.label}</p>
            <p className="text-foreground text-xl font-semibold leading-tight">{s.value}</p>
            <p className="text-[10px] text-[#B0AFA8] font-medium">{s.trend}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quiz Performance */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
        <h3 className="text-foreground text-[15px] font-semibold mb-1">Quiz Score Distribution</h3>
        <p className="text-[#B0AFA8] text-[11px] font-medium mb-6">Average score per quiz</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={quizPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="quiz" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="avgScore" name="Avg Score %" radius={[6, 6, 0, 0]} barSize={24}>
              {quizPerformanceData.map((entry, i) => (
                <Cell key={i} fill={entry.avgScore >= 75 ? "#10b981" : entry.avgScore >= 60 ? "#f59e0b" : "#ef4444"} />
              ))}
            </Bar>
            <Bar dataKey="participation" name="Participation %" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} fillOpacity={0.3} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Class Participation Heatmap-like */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
        <h3 className="text-foreground text-[15px] font-semibold mb-1">Quiz Participation by Class</h3>
        <p className="text-[#B0AFA8] text-[11px] font-medium mb-6">Engagement levels across classes</p>
        <div className="space-y-3">
          {quizParticipationByClass.map((c, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-[12px] font-bold text-foreground w-12 shrink-0">{c.class}</span>
              <div className="flex-1 h-6 bg-[#F7F8F4] rounded-lg overflow-hidden relative">
                <div
                  className={cn(
                    "h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2",
                    c.avgParticipation >= 85 ? "bg-[#2E7D32]" : c.avgParticipation >= 70 ? "bg-[#B45309]" : "bg-[#B91C1C]"
                  )}
                  style={{ width: `${c.avgParticipation}%` }}
                >
                  <span className="text-[10px] font-bold text-white">{c.avgParticipation}%</span>
                </div>
              </div>
              <span className="text-[11px] text-[#B0AFA8] font-medium w-16 text-right shrink-0">{c.quizzesTaken} quizzes</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Time Analysis */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
      <h3 className="text-foreground text-[15px] font-semibold mb-1">Time vs Score Analysis</h3>
      <p className="text-[#B0AFA8] text-[11px] font-medium mb-6">How quiz timing correlates with performance</p>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {quizPerformanceData.map((q, i) => (
          <div key={i} className="bg-[#F7F8F4]/50 rounded-2xl p-4 border border-slate-100 text-center group hover:border-primary/30 transition-all">
            <p className="text-[11px] font-bold text-[#B0AFA8] mb-2 truncate">{q.quiz}</p>
            <div className="relative size-16 mx-auto mb-3">
              <svg className="size-full -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" strokeWidth="4" className="stroke-slate-100" />
                <circle cx="32" cy="32" r="26" fill="none" strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={2 * Math.PI * 26 * (1 - q.avgTime / q.allottedTime)}
                  className="stroke-secondary transition-all duration-1000" strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[12px] font-black text-foreground">{q.avgTime}m</span>
                <span className="text-[8px] text-[#B0AFA8]">/{q.allottedTime}m</span>
              </div>
            </div>
            <p className="text-[12px] font-bold text-foreground">Score: {q.avgScore}%</p>
          </div>
        ))}
      </div>
    </div>

    {/* Competition Results */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#B45309] text-[20px]">emoji_events</span>
          </div>
          <div>
            <h3 className="text-foreground text-[15px] font-semibold">Competition Results</h3>
            <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">Recent inter-school & school events</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {competitionResults.map((c, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-[#F7F8F4]/50 hover:bg-[#F7F8F4] transition-all group">
            <div className="flex items-center gap-4">
              <div className={cn(
                "size-10 rounded-xl flex items-center justify-center font-bold text-[14px]",
                c.position === "1st" ? "bg-[#FEF3C7] text-[#B45309]" : c.position === "2nd" ? "bg-slate-200 text-[#444441]" : "bg-orange-100 text-orange-700"
              )}>
                {c.position}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground">{c.name}</p>
                <p className="text-[10px] text-[#B0AFA8] font-medium">{c.date} • {c.type}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-bold text-foreground">{c.student}</p>
              <p className="text-[10px] font-medium text-primary">+{c.points} Aura</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
