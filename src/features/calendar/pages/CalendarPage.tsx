import { useState } from "react";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";

type CalendarView = "teacher" | "class" | "parent";

export const CalendarPage = () => {
  const [activeView, setActiveView] = useState<CalendarView>("teacher");
  const [selectedClass, setSelectedClass] = useState("10B");
  const [selectedTeacher, setSelectedTeacher] = useState("Dr. Sunitha V.");

  const teacherSchedule = [
    {
      time: "08:00 AM",
      event: "Mathematics - 10B",
      type: "class",
      room: "Room 304",
    },
    {
      time: "09:30 AM",
      event: "Advanced Algebra - 12A",
      type: "class",
      room: "Room 102",
    },
    {
      time: "11:00 AM",
      event: "Department Meeting",
      type: "meeting",
      room: "Staff Lounge",
    },
    {
      time: "01:00 PM",
      event: "Geometry - 10A",
      type: "class",
      room: "Room 301",
    },
    {
      time: "02:30 PM",
      event: "Office Hours",
      type: "other",
      room: "Office 12",
    },
  ];

  const administrativeEvents = [
    {
      date: "Oct 26",
      title: "Mid-Term Break",
      type: "holiday",
      color: "bg-red-500",
    },
    {
      date: "Oct 31",
      title: "Cultural Annual Day",
      type: "event",
      color: "bg-primary",
    },
    {
      date: "Nov 05",
      title: "Teacher Training",
      type: "meeting",
      color: "bg-secondary",
    },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title="Calendar & Timetable"
        subtitle="Manage academic schedules, institutional events, and class timings."
        actions={
          <div className="flex items-center gap-3">
            <button className="bg-white border border-slate-100 text-foreground px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-[#F7F8F4] transition-all">
              <span className="material-symbols-outlined text-lg">print</span>
              Export PDF
            </button>
            <button className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2  transition-all shadow-sm shadow-slate-100/30 ">
              <span className="material-symbols-outlined text-sm">
                add_circle
              </span>
              New Event
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {/* Perspective Switcher */}
        <div className="px-8 pt-6 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex justify-between items-center">
            <div className="flex gap-8">
              {[
                { id: "teacher", label: "Teacher Schedules", icon: "school" },
                { id: "class", label: "Class Timetables", icon: "grid_view" },
                {
                  id: "parent",
                  label: "Institutional Calendar",
                  icon: "family_restroom",
                },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as CalendarView)}
                  className={cn(
                    "flex items-center gap-2 pb-4 text-[13px] font-semibold tracking-tight transition-all relative",
                    activeView === view.id
                      ? "text-foreground"
                      : "text-[#B0AFA8] hover:text-foreground",
                  )}
                >
                  <span className="material-symbols-outlined text-lg">
                    {view.icon}
                  </span>
                  {view.label}
                  {activeView === view.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Contextual Selector */}
            {activeView !== "parent" && (
              <div className="flex items-center gap-3 pb-4">
                <span className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest">
                  View for:
                </span>
                <div className="relative">
                  <select
                    value={activeView === "class" ? selectedClass : selectedTeacher}
                    onChange={(e) =>
                      activeView === "class"
                        ? setSelectedClass(e.target.value)
                        : setSelectedTeacher(e.target.value)
                    }
                    className="appearance-none bg-[#F7F8F4] border border-slate-100/50 rounded-xl px-4 py-2 pr-10 text-[13px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[140px]"
                  >
                    {activeView === "class" ? (
                      ["10A", "10B", "11A", "11B", "12A", "12B"].map((c) => (
                        <option key={c} value={c}>
                          Grade {c}
                        </option>
                      ))
                    ) : (
                      [
                        "Ms. Preetha",
                        "Ms. Saritha N S",
                        "Ms. Latha Viswanathan",
                        "Dr. Stefna Dias",
                        "Ms. Maneesha O M",
                        "Ms. Rajini Murali",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#B0AFA8] text-lg">
                    expand_more
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Calendar Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/30 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-foreground">
                    October 2023
                  </h3>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-[#F7F8F4] rounded transition-colors text-[#B0AFA8]">
                      <span className="material-symbols-outlined">
                        chevron_left
                      </span>
                    </button>
                    <button className="p-1 hover:bg-[#F7F8F4] rounded transition-colors text-[#B0AFA8]">
                      <span className="material-symbols-outlined">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex bg-[#F7F8F4] p-1 rounded-xl">
                  <button className="px-3 py-1 text-xs font-medium bg-white text-foreground rounded-md shadow-sm shadow-slate-100/30">
                    Month
                  </button>
                  <button className="px-3 py-1 text-xs font-medium text-[#B0AFA8]">
                    Week
                  </button>
                  <button className="px-3 py-1 text-xs font-medium text-[#B0AFA8]">
                    Day
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 border-b border-slate-50">
                {days.map((day) => (
                  <div
                    key={day}
                    className="py-3 text-center text-xs font-medium capitalize text-[#B0AFA8]"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="h-20 border-r border-b border-slate-50 bg-[#F7F8F4]"
                  />
                ))}
                {calendarDays.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      "h-20 border-r border-b border-slate-50 p-1.5 transition-colors hover:bg-[#F7F8F4] overflow-hidden",
                      day === 24 && "bg-primary/5",
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={cn(
                          "size-6 flex items-center justify-center text-xs font-medium rounded-full",
                          day === 24
                            ? "btn-primary"
                            : "text-[#444441]",
                        )}
                      >
                        {day}
                      </span>
                      {day === 31 && (
                        <span className="size-1.5 bg-primary rounded-full" />
                      )}
                      {day === 26 && (
                        <span className="size-1.5 bg-red-500 rounded-full" />
                      )}
                    </div>
                    {day === 24 && (
                      <div className="space-y-1">
                        <div className="bg-secondary text-white text-[8px] font-bold px-1.5 py-1 rounded truncate leading-none">
                          Math Exam P1
                        </div>
                        <div className="btn-primary text-[8px] font-bold px-1.5 py-1 rounded truncate leading-none">
                          Staff Review
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contextual Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {(activeView === "teacher" || activeView === "class") && (
              <div className="bg-secondary rounded-2xl p-6 text-white shadow-2xl">
                <h3 className="text-[16px] font-semibold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    timer
                  </span>
                  Schedule for {activeView === "class" ? selectedClass : selectedTeacher}
                </h3>
                <div className="space-y-4">
                  {teacherSchedule.map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="size-2 bg-primary rounded-full ring-4 ring-primary/20" />
                        {i !== teacherSchedule.length - 1 && (
                          <div className="w-px h-full bg-white/10 my-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-medium text-primary capitalize leading-none mb-1">
                          {item.time}
                        </p>
                        <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">
                          {item.event}
                        </p>
                        <p className="text-[10px] text-white/40 font-medium">
                          {item.room} • {item.type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 bg-white/5 border border-white/10 py-3 rounded-2xl text-xs font-medium capitalize tracking-[0.2em] hover:bg-white/10 transition-colors">
                  Adjust Weekly Slots
                </button>
              </div>
            )}

            {activeView === "parent" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-100/30">
                <h3 className="text-foreground text-lg font-black capitalize mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#B91C1C]">
                    campaign
                  </span>
                  Key Notices
                </h3>
                <div className="space-y-4">
                  {administrativeEvents.map((event, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-[#F7F8F4] border border-slate-50 hover:border-slate-100 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium text-white capitalize",
                            event.color,
                          )}
                        >
                          {event.type}
                        </span>
                        <span className="text-[10px] font-bold text-[#B0AFA8]">
                          {event.date}
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-foreground">
                        {event.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-primary rounded-2xl p-6 text-foreground shadow-lg">
              <h3 className="text-lg font-black italic tracking-tighter mb-2 underline decoration-white/50 underline-offset-4">
                Quick CRUD
              </h3>
              <p className="text-[11px] font-medium mb-4 opacity-70">
                Instantly swap a substitute or cancel a class slot.
              </p>
              <div className="space-y-3">
                <button className="w-full bg-secondary text-white py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-lg">
                  <span className="material-symbols-outlined text-sm">
                    swap_horiz
                  </span>
                  Assign Substitute
                </button>
                <button className="w-full bg-white text-foreground py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-sm shadow-slate-100/30 border border-slate-100">
                  <span className="material-symbols-outlined text-sm">
                    event_busy
                  </span>
                  Mark Holiday
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
