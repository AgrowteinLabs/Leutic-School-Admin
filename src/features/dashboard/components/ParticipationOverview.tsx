import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { graphqlRequest } from "../../../lib/graphqlClient";

export const ParticipationOverview = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const schoolId = localStorage.getItem("school_id") || "";
                const res = await graphqlRequest<any>(`
                    query GetTodayAttendanceStats($schoolId: String!) {
                        todayAttendanceStats(schoolId: $schoolId) {
                            totalStudents
                            presentCount
                            absentCount
                            lateCount
                            attendancePercentage
                        }
                    }
                `, { schoolId });
                setStats(res.todayAttendanceStats);
            } catch (e) {
                console.error("Failed to fetch today's attendance stats:", e);
            }
        };
        fetchStats();
    }, []);

    const total = stats?.totalStudents ?? 1240;
    const present = stats?.presentCount ?? 1068;
    const absent = stats?.absentCount ?? 124;
    const late = stats?.lateCount ?? 48;
    const percent = stats?.attendancePercentage ?? 86;

    const C = 351.86; // circumference at r=56: 2 × π × 56 ≈ 351.86
    const presentArc = total > 0 ? (present / total) * C : 0;
    const absentArc = total > 0 ? (absent / total) * C : 0;
    const lateArc = total > 0 ? (late / total) * C : 0;

    const attendanceData = [
        { label: "Present", count: present, color: "bg-[#2E7D32]", arc: presentArc, offset: -2, stroke: "#2E7D32" },
        { label: "Absent", count: absent, color: "bg-[#E63535]", arc: absentArc, offset: -(presentArc + 6), stroke: "#E63535" },
        { label: "Late", count: late, color: "bg-[#EF9800]", arc: lateArc, offset: -(presentArc + absentArc + 10), stroke: "#EF9800" },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-foreground text-[15px] font-semibold">Today's Attendance</h3>
                    <p className="text-[#B0AFA8] text-[11px] font-medium mt-0.5">{total.toLocaleString()} total students</p>
                </div>
                <button 
                    onClick={() => navigate("/attendance")}
                    className="text-[11px] font-medium text-[#3D6B2C] hover:underline underline-offset-2"
                >
                    Full Report
                </button>
            </div>

            {/* Segmented ring */}
            <div className="flex items-center justify-center py-4 flex-1">
                <div className="relative">
                    <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                        <circle cx="70" cy="70" r="56" fill="none" stroke="#F0F0EC" strokeWidth="14" />
                        {attendanceData.map(s => (
                            <circle key={s.label}
                                cx="70" cy="70" r="56" fill="none"
                                stroke={s.stroke} strokeWidth="14"
                                strokeDasharray={`${s.arc} ${C - s.arc}`}
                                strokeDashoffset={s.offset}
                                strokeLinecap="butt"
                            />
                        ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-semibold text-foreground">{percent}%</span>
                        <span className="text-[12px] text-[#B0AFA8] font-medium">Present</span>
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="flex items-center justify-between w-full pt-5 border-t border-slate-50 mt-auto">
                {attendanceData.map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1 w-full">
                        <span className="text-[18px] font-semibold text-foreground tracking-tight">{item.count}</span>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                            <span className="text-[11px] font-medium text-[#B0AFA8]">{item.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
