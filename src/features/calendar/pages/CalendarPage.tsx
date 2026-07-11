import { useState, useEffect, useMemo, useCallback } from "react";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { motion, AnimatePresence } from "framer-motion";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";

type CalendarView = "teacher" | "class" | "parent";

interface DBEvent {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  date: string;
  type: "HOLIDAY" | "EXAM" | "ACTIVITY" | "HALF_DAY" | "ANNUAL_DAY";
}

interface DBCalendar {
  id: string;
  name: string;
  classId?: string;
  events: DBEvent[];
}



export const CalendarPage = () => {
  const [activeView, setActiveView] = useState<CalendarView>("teacher");
  
  // Dynamic Month & Selection
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedDayNum, setSelectedDayNum] = useState(new Date().getDate());

  // Lists & Live Data
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [calendars, setCalendars] = useState<DBCalendar[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // Event Creation State
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("ACTIVITY");
  const [isSaving, setIsSaving] = useState(false);

  // Edit/Delete State
  const [editingEvent, setEditingEvent] = useState<DBEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  // Holiday Quick Action State
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDateStr, setHolidayDateStr] = useState("");

  // Success Feedback State
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const schoolId = localStorage.getItem("school_id") || "";

  // Dynamic Grid helpers
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  const rawFirstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // Sun=0, Mon=1...
  const firstDayIndexOffset = (rawFirstDayOfWeek + 6) % 7; // Mon=0 ... Sun=6

  // Fetch classes, teachers, and events
  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      // 1. Get Teachers
      const teachersRes = await graphqlRequest<any>(`
        query GetTeachers($schoolId: ID) {
          users(filter: { role: "TEACHER", schoolId: $schoolId, page: 1, pageSize: 500 }) {
            items {
              id
              name
            }
          }
        }
      `, { schoolId });
      const loadedTeachers = teachersRes.users?.items || [];
      setTeachers(loadedTeachers);
      if (loadedTeachers.length > 0 && !selectedTeacher) {
        setSelectedTeacher(loadedTeachers[0].id);
      }

      // 2. Get Classes
      const classesRes = await graphqlRequest<any>(`
        query GetClasses($schoolId: String) {
          classes(filter: { schoolId: $schoolId }, page: 1, pageSize: 100) {
            items {
              id
              grade
              section
            }
          }
        }
      `, { schoolId });
      const loadedClasses = classesRes.classes?.items || [];
      setClassesList(loadedClasses);
      if (loadedClasses.length > 0 && !selectedClass) {
        setSelectedClass(loadedClasses[0].id);
      }

      // 3. Get Calendars & Events
      // Note: Backend calendars() query doesn't support schoolId filtering.
      // We filter client-side using the schoolId field returned on each item.
      const calendarsRes = await graphqlRequest<any>(`
        query GetCalendars($page: Int, $pageSize: Int) {
          calendars(page: $page, pageSize: $pageSize) {
            items {
              id
              schoolId
              name
              classId
              events {
                id
                calendarId
                title
                description
                date
                type
              }
            }
          }
        }
      `, { page: 1, pageSize: 100 });
      const allCals = calendarsRes.calendars?.items || [];
      // Filter to only this school's calendars (backend doesn't support schoolId param)
      setCalendars(allCals.filter((c: any) => c.schoolId === schoolId));
    } catch (err) {
      console.error("Failed to fetch calendar metadata:", err);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, selectedClass, selectedTeacher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Flatten events
  const allEvents = useMemo(() => {
    const evs: DBEvent[] = [];
    calendars.forEach(cal => {
      if (cal.events) {
        evs.push(...cal.events);
      }
    });
    return evs;
  }, [calendars]);

  // Resolve events for a specific cell
  const getEventsForDay = (dayNum: number) => {
    const cellDate = new Date(currentYear, currentMonth, dayNum);
    cellDate.setHours(0, 0, 0, 0);

    return allEvents.filter(ev => {
      const evDate = new Date(ev.date);
      evDate.setHours(0, 0, 0, 0);
      return evDate.getTime() === cellDate.getTime();
    });
  };

  // Selected Date events (Institutional notices)
  const selectedDayEvents = useMemo(() => {
    const cellDate = new Date(currentYear, currentMonth, selectedDayNum);
    cellDate.setHours(0, 0, 0, 0);

    return allEvents.filter(ev => {
      const evDate = new Date(ev.date);
      evDate.setHours(0, 0, 0, 0);
      return evDate.getTime() === cellDate.getTime();
    });
  }, [allEvents, currentYear, currentMonth, selectedDayNum]);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (activeView === "parent") return;
      setTimetableSlots([]);
      try {
        if (activeView === "class" && selectedClass) {
          const res = await graphqlRequest<any>(`
            query GetClassTimetable($classId: String!) {
              classTimetable(classId: $classId) {
                id
                classId
                day
                period
                subjectId
                subjectName
                teacherId
                teacherName
                spanPeriods
                startTime
                endTime
              }
            }
          `, { classId: selectedClass });
          setTimetableSlots(res.classTimetable || []);
        } else if (activeView === "teacher" && selectedTeacher) {
          const res = await graphqlRequest<any>(`
            query GetTeacherTimetable($teacherId: String!) {
              teacherTimetable(teacherId: $teacherId) {
                id
                classId
                day
                period
                subjectId
                subjectName
                teacherId
                teacherName
                spanPeriods
                startTime
                endTime
              }
            }
          `, { teacherId: selectedTeacher });
          setTimetableSlots(res.teacherTimetable || []);
        }
      } catch (err) {
        console.error("Failed to load timetable from backend:", err);
      }
    };
    fetchTimetable();
  }, [activeView, selectedClass, selectedTeacher]);

  const timetableSlotsForDay = useMemo(() => {
    const dateObj = new Date(currentYear, currentMonth, selectedDayNum);
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const selectedWeekday = weekdays[dateObj.getDay()];

    return timetableSlots
      .filter(slot => slot.day === selectedWeekday)
      .sort((a, b) => a.period - b.period);
  }, [currentYear, currentMonth, selectedDayNum, timetableSlots]);

  // Format period numbers into times using backend startTime when available,
  // falling back to computed time (8:30 AM + (period-1) * 60 min).
  const formatTimeStr = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const amPm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${amPm}`;
  };

  const getPeriodTimeStr = (periodNum: number, slot?: { startTime?: string; endTime?: string }) => {
    if (slot?.startTime) {
      const start = formatTimeStr(slot.startTime);
      if (slot?.endTime) {
        const end = formatTimeStr(slot.endTime);
        return `${start} – ${end}`;
      }
      return start;
    }
    // Fallback: compute from 8:30 AM base, assume 60 min periods
    const startHour = 8;
    const startMin = 30;
    const totalMinutesStart = startHour * 60 + startMin + (periodNum - 1) * 60;
    const totalMinutesEnd = totalMinutesStart + 60;
    let h1 = Math.floor(totalMinutesStart / 60);
    const m1 = totalMinutesStart % 60;
    let h2 = Math.floor(totalMinutesEnd / 60);
    const m2 = totalMinutesEnd % 60;
    const amPm1 = h1 >= 12 ? "PM" : "AM";
    const amPm2 = h2 >= 12 ? "PM" : "AM";
    h1 = h1 % 12;
    if (h1 === 0) h1 = 12;
    h2 = h2 % 12;
    if (h2 === 0) h2 = 12;
    const start = `${h1.toString().padStart(2, "0")}:${m1.toString().padStart(2, "0")} ${amPm1}`;
    const end = `${h2.toString().padStart(2, "0")}:${m2.toString().padStart(2, "0")} ${amPm2}`;
    return `${start} – ${end}`;
  };

  // Handle Event Creation
  const handleCreateEvent = async () => {
    if (!eventTitle || !eventDate || isSaving) return;
    setIsSaving(true);
    try {
      // Find institutional calendar (classId = null)
      const defaultCal = calendars.find(c => !c.classId);
      let calendarId = defaultCal?.id;

      if (!calendarId) {
        // Create an institutional calendar
        const createCalRes = await graphqlRequest<any>(`
          mutation CreateCalendar($input: CreateCalendarDto!) {
            createCalendar(createCalendarInput: $input) {
              id
              name
            }
          }
        `, {
          input: {
            schoolId,
            name: "Institutional Calendar"
          }
        });
        calendarId = createCalRes.createCalendar?.id;
      }

      if (!calendarId) throw new Error("Could not find or create a default calendar.");

      // Create Event
      await graphqlRequest(`
        mutation CreateEvent($input: CreateEventDto!) {
          createEvent(createEventInput: $input) {
            id
            title
          }
        }
      `, {
        input: {
          calendarId,
          title: eventTitle,
          description: eventDesc || "Institutional Event",
          date: new Date(eventDate).toISOString(),
          type: eventType
        }
      });

      // Clear & Reload
      setEventTitle("");
      setEventDesc("");
      setShowNewEventModal(false);
      setEditingEvent(null);
      fetchData();
    } catch (e) {
      console.error("Failed to save calendar event:", e);
      alert("Failed to save event. Check fields and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Open edit modal with pre-filled event data
  const handleOpenEditModal = (event: DBEvent) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDesc(event.description || "");
    setEventDate(event.date.split("T")[0]);
    setEventType(event.type);
    setShowNewEventModal(true);
  };

  // Update an existing event via backend mutation
  const handleUpdateEvent = async () => {
    if (!eventTitle || !eventDate || isSaving || !editingEvent) return;
    setIsSaving(true);
    try {
      await graphqlRequest(`
        mutation UpdateEvent($id: ID!, $input: UpdateEventDto!) {
          updateEvent(id: $id, updateEventInput: $input) {
            id
            title
          }
        }
      `, {
        id: editingEvent.id,
        input: {
          title: eventTitle,
          description: eventDesc || "Institutional Event",
          date: new Date(eventDate).toISOString(),
          type: eventType
        }
      });

      setEditingEvent(null);
      setEventTitle("");
      setEventDesc("");
      setShowNewEventModal(false);
      fetchData();
    } catch (e) {
      console.error("Failed to update event:", e);
      alert("Failed to update event. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete an event via backend mutation
  const handleDeleteEvent = async (eventId: string) => {
    if (isSaving) return;
    setIsSaving(true);
    setDeletingEventId(null);
    try {
      await graphqlRequest(`
        mutation RemoveEvent($id: ID!) {
          removeEvent(id: $id) {
            id
          }
        }
      `, { id: eventId });
      fetchData();
    } catch (e) {
      console.error("Failed to delete event:", e);
      alert("Failed to delete event. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Unified save: create or update depending on whether we're editing
  const handleSaveEvent = () => {
    if (editingEvent) {
      handleUpdateEvent();
    } else {
      handleCreateEvent();
    }
  };

  // Close modal and reset state
  const handleCloseModal = () => {
    setShowNewEventModal(false);
    setEditingEvent(null);
    setEventTitle("");
    setEventDesc("");
    setEventDate("");
    setEventType("ACTIVITY");
  };

  const handleOpenAddModal = () => {
    const clickedDate = new Date(currentYear, currentMonth, selectedDayNum + 1); // fix offset
    setEventDate(clickedDate.toISOString().split("T")[0]);
    setShowNewEventModal(true);
  };

  // Open holiday confirmation modal
  const handleOpenHolidayModal = () => {
    const dateStr = new Date(currentYear, currentMonth, selectedDayNum).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    setHolidayDateStr(dateStr);
    setHolidayName("Public Holiday");
    setShowHolidayModal(true);
  };

  // Create Quick Holiday
  const handleMarkHoliday = async () => {
    if (isSaving || !holidayName.trim()) return;
    setIsSaving(true);
    try {
      const defaultCal = calendars.find(c => !c.classId);
      let calendarId = defaultCal?.id;
      if (!calendarId) {
        const createCalRes = await graphqlRequest<any>(`
          mutation CreateCalendar($input: CreateCalendarDto!) {
            createCalendar(createCalendarInput: $input) {
              id
              name
            }
          }
        `, {
          input: {
            schoolId,
            name: "Institutional Calendar"
          }
        });
        calendarId = createCalRes.createCalendar?.id;
      }
      if (!calendarId) throw new Error("No calendar ID.");

      await graphqlRequest(`
        mutation CreateEvent($input: CreateEventDto!) {
          createEvent(createEventInput: $input) {
            id
          }
        }
      `, {
        input: {
          calendarId,
          title: holidayName || "Public Holiday",
          description: "Marked from Calendar Quick Actions",
          date: new Date(currentYear, currentMonth, selectedDayNum, 12, 0).toISOString(),
          type: "HOLIDAY"
        }
      });

      setShowHolidayModal(false);
      fetchData();

      // Show success feedback
      setSuccessTitle("Holiday Declared");
      setSuccessMessage(`${holidayDateStr} has been marked as "${holidayName || "Public Holiday"}".`);
      setShowSuccess(true);
    } catch (e) {
      console.error(e);
      alert("Failed to mark holiday.");
    } finally {
      setIsSaving(false);
    }
  };

  const typeColorClasses: Record<string, string> = {
    HOLIDAY: "bg-rose-500 text-white",
    EXAM: "bg-amber-500 text-white",
    ACTIVITY: "bg-[#0F2328] text-[#D9EA85]",
    HALF_DAY: "bg-sky-600 text-white",
    ANNUAL_DAY: "bg-indigo-600 text-white"
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title="Calendar & Timetable"
        subtitle="Manage academic schedules, institutional events, and class timings."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm shadow-slate-100/30"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>{" "}New Event
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Perspective Switcher */}
        <div className="px-8 pt-6 border-b border-slate-100 shrink-0 bg-white sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <div className="flex gap-8">
              {[
                { id: "teacher", label: "Teacher Schedules", icon: "school" },
                { id: "class", label: "Class Timetables", icon: "grid_view" },
                { id: "parent", label: "Institutional Calendar", icon: "family_restroom" },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => {
                    setActiveView(view.id as CalendarView);
                    setSelectedDayNum(1); // Reset selected cell to prevent out of bounds
                  }}
                  className={cn(
                    "flex items-center gap-2 pb-4 text-[13px] font-semibold tracking-tight transition-all relative",
                    activeView === view.id
                      ? "text-foreground font-black"
                      : "text-[#B0AFA8] hover:text-foreground",
                  )}
                >
                  <span className="material-symbols-outlined text-lg">
                    {view.icon}
                  </span>
                  {view.label}
                  {activeView === view.id && (
                    <motion.div
                      layoutId="activeViewIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                    />
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
                    className="appearance-none bg-[#F7F8F4] border border-slate-100/50 rounded-xl px-4 py-2 pr-10 text-[13px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer min-w-[160px]"
                  >
                    {activeView === "class" ? (
                      classesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.section ? `${c.grade}-${c.section}` : c.grade}
                        </option>
                      ))
                    ) : (
                      teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
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
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-[#F7F8F4] rounded-lg transition-colors text-[#B0AFA8] flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">
                        chevron_left
                      </span>
                    </button>
                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-[#F7F8F4] rounded-lg transition-colors text-[#B0AFA8] flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex bg-[#F7F8F4] p-1 rounded-xl">
                  <span className="px-4 py-1 text-xs font-bold bg-white text-foreground rounded-lg shadow-sm border border-slate-100/20">
                    Month View
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-7 border-b border-slate-50">
                {days.map((day) => (
                  <div
                    key={day}
                    className="py-3 text-center text-xs font-bold capitalize text-[#B0AFA8]"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {Array.from({ length: firstDayIndexOffset }, (_, i) => `empty-${currentYear}-${currentMonth}-${i}`).map((keyStr) => (
                  <div
                    key={keyStr}
                    className="h-24 border-r border-b border-slate-50 bg-[#F7F8F4]/30"
                  />
                ))}
                {calendarDays.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isSelected = selectedDayNum === day;
                  const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
                  let dayClass = "text-[#444441]";
                  if (isToday) {
                    dayClass = "bg-[#0F2328] text-white";
                  } else if (isSelected) {
                    dayClass = "bg-primary text-foreground font-black";
                  }

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDayNum(day)}
                      className={cn(
                        "h-24 border-r border-b border-slate-50 p-2 transition-all hover:bg-[#F7F8F4]/40 cursor-pointer overflow-hidden flex flex-col justify-between select-none relative focus:outline-none focus:ring-2 focus:ring-primary/20 w-full text-left bg-transparent border-0",
                        isSelected && "bg-primary/5 border-primary/20",
                      )}
                    >
                      <div className="flex justify-between items-center mb-1 w-full">
                        <span
                          className={cn(
                            "size-6 flex items-center justify-center text-xs font-bold rounded-full transition-all",
                            dayClass,
                          )}
                        >
                          {day}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="flex gap-0.5">
                            {Array.from(new Set(dayEvents.map(e => e.type))).slice(0, 3).map((t) => {
                              let dotColor = "bg-primary";
                              if (t === "HOLIDAY") {
                                dotColor = "bg-rose-500";
                              } else if (t === "EXAM") {
                                dotColor = "bg-amber-500";
                              }
                              return (
                                <div key={t} className={cn("size-1.5 rounded-full", dotColor)} />
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-end overflow-hidden mt-1 gap-1 w-full">
                        {dayEvents.slice(0, 2).map((ev) => {
                          let evClass = "bg-[#0F2328]/5 text-[#0F2328] border-[#0F2328]/10";
                          if (ev.type === "HOLIDAY") {
                            evClass = "bg-rose-50 text-rose-700 border-rose-100";
                          } else if (ev.type === "EXAM") {
                            evClass = "bg-amber-50 text-amber-700 border-amber-100";
                          }
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(ev);
                              }}
                              className={cn(
                                "text-[8px] font-black px-1.5 py-0.5 rounded truncate leading-none tracking-tight border text-left cursor-pointer transition-all hover:opacity-80",
                                evClass
                              )}
                              title={`${ev.title} (click to edit/delete)`}
                            >
                              {ev.title}
                            </button>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <span className="text-[8px] font-bold text-slate-400 text-right pr-0.5 leading-none">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contextual Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {(activeView === "teacher" || activeView === "class") && (
              <div className="bg-[#0F2328] rounded-[28px] p-6 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <span className="material-symbols-outlined text-9xl">schedule</span>
                </div>
                <h3 className="text-[15px] font-bold mb-6 flex items-center gap-2 relative z-10 text-[#D9EA85]">
                  <span className="material-symbols-outlined">
                    timer
                  </span>
                  Schedule for {
                    activeView === "class"
                      ? (() => {
                          const cls = classesList.find(c => c.id === selectedClass);
                          return cls ? (cls.section ? `${cls.grade}-${cls.section}` : cls.grade) : "Class";
                        })()
                      : (() => {
                          const t = teachers.find(teach => teach.id === selectedTeacher);
                          return t ? t.name : "Teacher";
                        })()
                  }
                </h3>
                <div className="space-y-5 relative z-10">
                  {timetableSlotsForDay.length > 0 ? (
                    timetableSlotsForDay.map((item, i) => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="size-2 bg-[#D9EA85] rounded-full ring-4 ring-[#D9EA85]/20" />
                          {i !== timetableSlotsForDay.length - 1 && (
                            <div className="w-px h-full bg-white/10 my-1.5" />
                          )}
                        </div>
                        <div className="pb-3 min-w-0">
                          <p className="text-[11px] font-bold text-[#D9EA85] leading-none mb-1">
                            <span className="text-white/40 font-normal">Period {item.period}</span>
                            <span className="text-white/30 mx-1.5">·</span>
                            {getPeriodTimeStr(item.period, item)}
                          </p>
                          <p className="text-[13px] font-bold truncate pr-2">
                            {item.subjectName}
                          </p>
                          <p className="text-[10px] text-white/50 font-bold mt-1 uppercase tracking-wider">
                            {activeView === "class"
                              ? `Teacher: ${item.teacherName}`
                              : (() => {
                                  const cls = classesList.find(c => c.id === item.classId);
                                  return cls ? `Class: ${cls.section ? `${cls.grade}-${cls.section}` : cls.grade}` : "Class";
                                })()
                            }
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-white/40">
                      <span className="material-symbols-outlined text-3xl opacity-50 mb-2">event_busy</span>
                      <p className="text-xs font-bold">No classes scheduled today</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === "parent" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-100/30">
                <h3 className="text-foreground text-base font-black capitalize mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#B91C1C]">campaign</span>{" "}Events on Selected Date
                </h3>
                <div className="space-y-4">
                  {selectedDayEvents.length > 0 ? (
                    selectedDayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-2xl bg-[#F7F8F4] border border-slate-50 hover:border-slate-100 transition-all flex flex-col gap-2 group relative"
                      >
                        <div className="flex justify-between items-start">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight",
                              typeColorClasses[event.type] || "bg-slate-500 text-white"
                            )}
                          >
                            {event.type}
                          </span>
                          <span className="text-[10px] font-bold text-[#B0AFA8]">
                            {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="text-[13px] font-black text-brand-navy pr-6">
                          {event.title}
                        </p>
                        {event.description && (
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {/* Hover Actions: Edit & Delete */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(event); }}
                            className="size-7 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm"
                            title="Edit event"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeletingEventId(event.id); }}
                            className="size-7 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                            title="Delete event"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-[#B0AFA8]/50">
                      <span className="material-symbols-outlined text-3xl mb-2">calendar_today</span>
                      <p className="text-xs font-bold">No institutional events on this date</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-[#D9EA85] rounded-[24px] p-6 text-foreground shadow-sm">
              <h3 className="text-[16px] font-black tracking-tight mb-2">
                Quick Actions
              </h3>
              <p className="text-[11px] font-bold mb-4 opacity-75 leading-relaxed">
                Add quick schedule exceptions or declare holidays.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleOpenHolidayModal}
                  className="w-full bg-[#0F2328] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0F2328]/10 hover:bg-[#0F2328]/95 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">event_busy</span>{" "}Declare Holiday
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Creation/Edit Modal */}
      <AnimatePresence>
        {showNewEventModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full border-0 p-0 block cursor-default"
              onClick={handleCloseModal}
              aria-label="Close modal backdrop"
            />
            <div className="relative bg-white p-8 rounded-[32px] max-w-md w-full border border-slate-100 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-navy tracking-tight">
                  {editingEvent ? "Edit Event" : "Create Institutional Event"}
                </h3>
                <button onClick={handleCloseModal} className="size-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block mb-1.5">Event Title</span>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. Annual Sports Meet"
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all text-foreground"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block mb-1.5">Description</span>
                  <textarea
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="Details about the event..."
                    rows={3}
                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all text-foreground resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block mb-1.5">Date</span>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all text-foreground"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block mb-1.5">Event Type</span>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all text-foreground cursor-pointer"
                    >
                      <option value="ACTIVITY">Activity/Event</option>
                      <option value="HOLIDAY">Holiday</option>
                      <option value="EXAM">Exam</option>
                      <option value="HALF_DAY">Half Day</option>
                      <option value="ANNUAL_DAY">Annual Day</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEvent}
                  disabled={!eventTitle || !eventDate || isSaving}
                  className="flex-1 h-12 bg-primary text-foreground text-[14px] font-bold rounded-2xl hover:bg-primary/95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                  ) : editingEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Holiday Confirmation Modal */}
      <AnimatePresence>
        {showHolidayModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full border-0 p-0 block cursor-default"
              onClick={() => setShowHolidayModal(false)}
              aria-label="Close holiday backdrop"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-8 rounded-[32px] max-w-sm w-full border border-slate-100 shadow-2xl space-y-6"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="size-14 rounded-full bg-amber-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-500 text-3xl">event_busy</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy tracking-tight">Declare Holiday</h3>
                  <p className="text-[13px] text-[#B0AFA8] font-medium mt-1 leading-relaxed">
                    Mark <span className="font-bold text-foreground">{holidayDateStr}</span> as an institutional holiday
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block mb-1.5">Holiday Name</span>
                <input
                  type="text"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="e.g. Public Holiday"
                  className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all text-foreground"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowHolidayModal(false)}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors border border-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkHoliday}
                  disabled={!holidayName.trim() || isSaving}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-white bg-[#0F2328] hover:bg-[#0F2328]/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : "Confirm Holiday"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Feedback Modal */}
      <PDSSuccessModal
        show={showSuccess}
        title={successTitle}
        description={successMessage}
        buttonText="Done"
        onClose={() => setShowSuccess(false)}
        onAction={() => setShowSuccess(false)}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingEventId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full border-0 p-0 block cursor-default"
              onClick={() => setDeletingEventId(null)}
              aria-label="Close delete backdrop"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-8 rounded-[32px] max-w-sm w-full border border-slate-100 shadow-2xl space-y-6"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="size-14 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy tracking-tight">Delete Event?</h3>
                  <p className="text-[13px] text-[#B0AFA8] font-medium mt-1 leading-relaxed">
                    This action cannot be undone. The event will be permanently removed from the calendar.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingEventId(null)}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors border border-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteEvent(deletingEventId)}
                  disabled={isSaving}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
