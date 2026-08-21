import { useNavigate } from "react-router-dom";

interface AttendanceStats {
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendancePercentage: number;
}

interface ParticipationOverviewProps {
    stats: AttendanceStats | null;
    isLoading?: boolean;
    error?: string | null;
}

/** Convert polar coordinates to SVG cartesian */
const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180; // -90 to start from top (12 o'clock)
    return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
    };
};

/** Create an SVG arc path between two angles */
const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
): string => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y,
        "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
    ].join(" ");
};

export const ParticipationOverview = ({ stats, isLoading = false, error = null }: ParticipationOverviewProps) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 h-[290px] flex flex-col justify-center items-center">
                <p className="text-[12px] text-[#B0AFA8] font-bold text-center">Loading attendance stats...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 h-[290px] flex flex-col justify-center items-center text-center">
                <span className="material-symbols-outlined text-[32px] text-[#B0AFA8] mb-2">info</span>
                <h3 className="text-foreground text-[14px] font-semibold mb-1">Attendance Today</h3>
                <p className="text-[11px] text-[#71716A] px-4">{error || "Attendance stats are not available."}</p>
            </div>
        );
    }

    const total = stats.totalStudents;
    const present = stats.presentCount;
    const absent = stats.absentCount;
    const late = stats.lateCount;
    const percent = stats.attendancePercentage;

    const CX = 70;
    const CY = 70;
    const R = 56;
    const STROKE = 14;
    const GAP_DEGREES = 3; // gap between segments in degrees

    const segments = [
        { label: "Present", count: present, stroke: "#2E7D32", color: "bg-[#2E7D32]" },
        { label: "Absent", count: absent, stroke: "#E63535", color: "bg-[#E63535]" },
        { label: "Late", count: late, stroke: "#EF9800", color: "bg-[#EF9800]" },
    ].filter((s) => s.count > 0);

    const activeCount = segments.length;
    const totalGapDegrees = activeCount > 1 ? activeCount * GAP_DEGREES : 0;
    const usableDegrees = total > 0 ? 360 - totalGapDegrees : 0;

    let currentAngle = 0;
    const renderedSegments = segments.map((seg) => {
        const sweep = total > 0 ? (seg.count / total) * usableDegrees : 0;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sweep;
        currentAngle = endAngle + GAP_DEGREES;
        return { ...seg, startAngle, endAngle };
    });

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
                    <svg width="140" height="140" viewBox="0 0 140 140">
                        {/* Background ring */}
                        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F0F0EC" strokeWidth={STROKE} />
                        {/* Segments as arcs */}
                        {renderedSegments.map((seg) => (
                            <path
                                key={seg.label}
                                d={describeArc(CX, CY, R, seg.startAngle, seg.endAngle)}
                                fill="none"
                                stroke={seg.stroke}
                                strokeWidth={STROKE}
                                strokeLinecap="round"
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
                {segments.map((item) => (
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
