export const ProgramsTable = () => {
    const events = [
        { name: "Regional Science Fair", date: "Mar 05", type: "Competition", teacher: "Dr. Sunitha V.",  daysLeft: 4  },
        { name: "PTA General Meeting",   date: "Mar 08", type: "Meeting",     teacher: "Admin Office",   daysLeft: 7  },
        { name: "Term 2 Examinations",   date: "Mar 15", type: "Exam",        teacher: "All Teachers",   daysLeft: 14 },
        { name: "Inter-High Arts Expo",  date: "Mar 22", type: "Event",       teacher: "Ms. Amrita S.",  daysLeft: 21 },
    ];

    const typeColors: Record<string, string> = {
        Competition: "bg-[#DBEAFE] text-[#1565C0] border-[#BFDBFE]",
        Meeting:     "bg-[#EAF2D7] text-[#3D6B2C] border-[#D9EA85]",
        Exam:        "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]",
        Event:       "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
    };

    return (
        <div className="flex flex-col gap-1">
            {events.map((event, idx) => (
                <div key={idx} className="flex items-center gap-4 py-3 px-1 border-b border-slate-50 last:border-0 hover:bg-[#F7F8F4] rounded-[10px] transition-colors cursor-pointer group -mx-1">
                    {/* Date */}
                    <div className="flex flex-col items-center justify-center w-12 shrink-0">
                        <span className="text-[10px] text-[#B0AFA8] font-medium leading-none">{event.date.split(" ")[0]}</span>
                        <span className="text-lg font-semibold text-foreground leading-none mt-1">{event.date.split(" ")[1]}</span>
                    </div>

                    <div className="h-8 w-px bg-slate-100 shrink-0" />

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate leading-tight group-hover:text-[#3D6B2C] transition-colors">
                            {event.name}
                        </p>
                        <p className="text-[11px] text-[#B0AFA8] font-normal mt-1">
                            {event.teacher}
                        </p>
                    </div>

                    {/* Type + Days */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${typeColors[event.type] || "bg-[#F0F0EC] text-[#444441] border-slate-200"}`}>
                            {event.type}
                        </span>
                        <span className="text-[10px] text-[#B0AFA8] font-medium leading-none">
                            {event.daysLeft}d left
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
