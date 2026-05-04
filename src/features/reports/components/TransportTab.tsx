import { cn } from "../../../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { busRouteData, driverActivityData } from "../data/sampleData";

export const TransportTab = () => (
  <div className="space-y-8">
    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Active Buses", value: "4/5", icon: "directions_bus", color: "text-[#2E7D32]" },
        { label: "Total Sessions Today", value: "10", icon: "route", color: "text-[#1565C0]" },
        { label: "Avg Route Duration", value: "1h 07m", icon: "timer", color: "text-foreground" },
        { label: "Auto-Stops (Idle)", value: "2", icon: "stop_circle", color: "text-[#B45309]" },
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

    {/* Bus Route Summary Table */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[#DBEAFE] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#1565C0] text-[20px]">directions_bus</span>
          </div>
          <div>
            <h3 className="text-foreground text-[15px] font-semibold">Bus Route Summary</h3>
            <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">This month's tracking overview</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              {["Bus Number", "Driver", "Route", "Sessions", "Avg Duration", "Status"].map((h) => (
                <th key={h} className="pb-3 text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {busRouteData.map((b, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-[#F7F8F4]/50 transition-colors">
                <td className="py-3.5">
                  <span className="text-[13px] font-bold text-foreground bg-[#F7F8F4] px-2 py-1 rounded-lg">{b.bus}</span>
                </td>
                <td className="py-3.5 text-[13px] font-medium text-foreground">{b.driver}</td>
                <td className="py-3.5 text-[13px] text-[#444441]">{b.route}</td>
                <td className="py-3.5 text-[13px] font-semibold text-foreground">{b.sessions}</td>
                <td className="py-3.5 text-[13px] text-[#444441]">{b.avgDuration}</td>
                <td className="py-3.5">
                  <span className={cn(
                    "text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase flex items-center gap-1.5 w-fit",
                    b.status === "active" ? "bg-[#EAF2D7] text-[#2E7D32] border-green-100" : "bg-[#F0F0EC] text-[#444441] border-slate-200"
                  )}>
                    <span className={cn("size-1.5 rounded-full", b.status === "active" ? "bg-[#2E7D32] animate-pulse" : "bg-[#B0AFA8]")} />
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Driver Activity Chart */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-foreground text-[15px] font-semibold mb-1">Weekly Driver Activity</h3>
      <p className="text-[#B0AFA8] text-[11px] font-medium mb-6">Sessions and tracking hours per day</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={driverActivityData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
          <Bar dataKey="totalHours" name="Active Hours" fill="#152328" radius={[6, 6, 0, 0]} barSize={24} />
          <Bar dataKey="activeSessions" name="Sessions" fill="#dbe890" radius={[6, 6, 0, 0]} barSize={24} />
          <Bar dataKey="idleEvents" name="Idle Auto-Stops" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Tracking Interval Info */}
    <div className="bg-secondary text-white rounded-2xl border-l-[6px] border-primary p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <span className="material-symbols-outlined text-8xl">speed</span>
      </div>
      <div className="flex items-start gap-4 relative z-10">
        <div className="btn-primary p-2.5 rounded-xl flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">info</span>
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-primary mb-1.5">Dynamic Tracking Intervals</h4>
          <div className="space-y-1 text-[12px] text-white/80 font-medium">
            <p>• <span className="text-white font-bold">&gt; 20 km/h:</span> Location updates every 10 seconds</p>
            <p>• <span className="text-white font-bold">10–20 km/h:</span> Updates every 20 seconds</p>
            <p>• <span className="text-white font-bold">Idle / &lt; 10 km/h:</span> Updates every 30–40 seconds</p>
            <p>• <span className="text-white font-bold">30+ min idle:</span> Auto-stop tracking session</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
