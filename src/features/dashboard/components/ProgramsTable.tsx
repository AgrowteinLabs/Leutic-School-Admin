import { useState, useEffect } from "react";
import { graphqlRequest } from "../../../lib/graphqlClient";

interface DBEvent {
    id: string;
    title: string;
    description?: string;
    date: string;
    type: "HOLIDAY" | "EXAM" | "ACTIVITY" | "HALF_DAY" | "ANNUAL_DAY";
}

interface DBCalendar {
    id: string;
    name: string;
    events: DBEvent[];
}

export const ProgramsTable = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                interface GetCalendarsResponse {
                    calendars: {
                        items: DBCalendar[];
                    };
                }
                const res = await graphqlRequest<GetCalendarsResponse>(`
                    query GetCalendarsWithEvents {
                        calendars(page: 1, pageSize: 10) {
                            items {
                                id
                                name
                                events {
                                    id
                                    title
                                    description
                                    date
                                    type
                                }
                            }
                        }
                    }
                `);
                
                // Flatten and gather events from all calendars
                const allEvents: DBEvent[] = [];
                res.calendars?.items?.forEach(cal => {
                    if (cal.events) {
                        allEvents.push(...cal.events);
                    }
                });

                // Filter future events (or today onwards)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const mapped = allEvents
                    .map(ev => {
                        const evDate = new Date(ev.date);
                        const diffMs = evDate.getTime() - today.getTime();
                        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                        
                        const dateText = evDate.toLocaleDateString("en-IN", { month: "short", day: "2-digit" }); // e.g. "Mar 05"
                        
                        // Map EventType enum to UI type
                        let uiType = "Event";
                        if (ev.type === "EXAM") uiType = "Exam";
                        else if (ev.type === "HOLIDAY") uiType = "Holiday";
                        else if (ev.type === "ACTIVITY") uiType = "Competition";
                        else if (ev.type === "HALF_DAY") uiType = "Meeting";

                        return {
                            name: ev.title,
                            date: dateText,
                            type: uiType,
                            teacher: ev.description || "School Calendar",
                            daysLeft: daysLeft,
                            originalDate: evDate
                        };
                    })
                    .filter(ev => ev.daysLeft >= 0)
                    .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
                    .slice(0, 5); // limit to next 5 upcoming

                setEvents(mapped);
            } catch (err) {
                console.error("Failed to load calendars events:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const typeColors: Record<string, string> = {
        Competition: "bg-[#DBEAFE] text-[#1565C0] border-[#BFDBFE]",
        Meeting: "bg-[#EAF2D7] text-[#3D6B2C] border-[#D9EA85]",
        Exam: "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]",
        Event: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
        Holiday: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
    };

    return (
        <div className="flex flex-col gap-1">
            {isLoading ? (
                <p className="text-[12px] text-[#B0AFA8] font-bold text-center py-6">Loading upcoming events...</p>
            ) : events.length > 0 ? (
                events.map((event, idx) => (
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
                                {event.daysLeft === 0 ? "Today" : `${event.daysLeft}d left`}
                            </span>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-[12px] text-[#B0AFA8] font-bold text-center py-6">No upcoming events this week</p>
            )}
        </div>
    );
};
