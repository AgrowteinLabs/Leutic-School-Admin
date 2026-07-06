import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  memo,
  Component,
  type ReactNode,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { MenuDropdown } from "../../../components/MenuDropdown";
import { TablePagination } from "../../../components/TablePagination";
import { SideDrawer } from "../../../components/SideDrawer";
import { AppDropdown } from "../../../components/AppDropdown";
import { AppDatePicker } from "../../../components/AppDatePicker";
import { AppTimePicker } from "../../../components/AppTimePicker";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { useApp } from "../../../lib/AppContext";

// GraphQL Definitions
const GET_CURRICULUM_DATA = `
  query GetCurriculumData($schoolId: String) {
    classes(filter: { schoolId: $schoolId }, page: 1, pageSize: 100) {
      items {
        id
        grade
        section
      }
    }
    users(filter: { role: "TEACHER", schoolId: $schoolId, page: 1, pageSize: 200 }) {
      items {
        id
        name
        qualifiedGrades
        subjectSpecializations
      }
    }
    curriculumMappings(page: 1, pageSize: 1000) {
      items {
        id
        classId
        grade
        section
        subjectId
        teacherId
        hoursPerWeek
        isAdditional
      }
      total
    }
  }
`;

const CREATE_CURRICULUM_MAPPING = `
  mutation CreateCurriculumMapping($input: CreateCurriculumMappingDto!) {
    createCurriculumMapping(createCurriculumMappingInput: $input) {
      id
    }
  }
`;

const UPDATE_CURRICULUM_MAPPING = `
  mutation UpdateCurriculumMapping($id: ID!, $input: UpdateCurriculumMappingDto!) {
    updateCurriculumMapping(id: $id, updateCurriculumMappingInput: $input) {
      id
      teacherId
    }
  }
`;

const REMOVE_CURRICULUM_MAPPING = `
  mutation RemoveCurriculumMapping($id: ID!) {
    removeCurriculumMapping(id: $id) {
      id
    }
  }
`;

// Subject Master Library
const GET_SUBJECTS = `
  query GetSubjects($schoolId: String!) {
    subjects(schoolId: $schoolId) {
      id
      name
      code
      category
      department
    }
  }
`;

const CREATE_SUBJECT = `
  mutation CreateSubject($input: CreateSubjectInput!) {
    createSubject(input: $input) {
      id
      name
      code
      category
      department
    }
  }
`;

const UPDATE_SUBJECT = `
  mutation UpdateSubject($id: ID!, $input: UpdateSubjectInput!) {
    updateSubject(id: $id, input: $input) {
      id
      name
      code
      category
      department
    }
  }
`;

const REMOVE_SUBJECT = `
  mutation RemoveSubject($id: ID!) {
    removeSubject(id: $id) {
      id
    }
  }
`;

// Grade Configuration Templates
const GET_GRADE_CONFIGS = `
  query GetGradeConfigs($schoolId: String!) {
    gradeConfigs(schoolId: $schoolId) {
      id
      grade
      periodsPerDay
      periodDurationMinutes
      teachingHoursPerWeek
      subjects
    }
  }
`;

const SAVE_GRADE_CONFIG = `
  mutation SaveGradeConfig($input: SetGradeConfigInput!) {
    saveGradeConfig(input: $input) {
      id
      grade
      periodsPerDay
      periodDurationMinutes
      teachingHoursPerWeek
      subjects
    }
  }
`;

const REMOVE_GRADE_CONFIG = `
  mutation RemoveGradeConfig($schoolId: String!, $grade: String!) {
    removeGradeConfig(schoolId: $schoolId, grade: $grade) {
      id
      grade
    }
  }
`;

// Timetable
const GET_CLASS_TIMETABLE = `
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
      curriculumMappingId
      spanPeriods
    }
  }
`;

const SAVE_CLASS_TIMETABLE = `
  mutation SaveClassTimetable($input: SaveClassTimetableInput!) {
    saveClassTimetable(input: $input) {
      id
      day
      period
      subjectName
      teacherName
      curriculumMappingId
      spanPeriods
    }
  }
`;

const GET_TIMETABLE_CONFIG = `
  query GetTimetableConfig($schoolId: String!) {
    timetableConfig(schoolId: $schoolId) {
      schoolStart
      uniformDuration
      defaultDuration
      operationalDays
      breaks {
        id
        period
        placement
        duration
        type
        label
        days
      }
      periodDurationsJson
      perDayDurationsJson
    }
  }
`;

const SAVE_TIMETABLE_CONFIG = `
  mutation SaveTimetableConfig($schoolId: String!, $input: SaveTimetableConfigInput!) {
    saveTimetableConfig(schoolId: $schoolId, input: $input) {
      schoolStart
    }
  }
`;


// const getBackendGradeOptions = (classes: { grade: string }[]) =>
//   Array.from(new Set(classes.map((item) => item.grade).filter(Boolean)));

// Types
interface Subject {
  id: string;
  name: string;
  code: string;
  category: string;
  department: string;
}

interface GradeConfig {
  grade: string;
  subjects: string[]; // Subject IDs (frontend-only join from mappings)
  periodsPerDay?: number;
  periodDurationMinutes?: number;
  teachingHoursPerWeek?: number;
}

interface Mapping {
  id: string;
  grade: string;
  section: string;
  subjectId: string;
  teacherId: string;
  hoursPerWeek: number;
  isAdditional?: boolean; // True if subject is not from the grade template
}

interface GradeGroup {
  id: string;
  label: string;
  grades: string[];
}

interface Teacher {
  id: string;
  name: string;
  dept: string;
  qualification: string;
  teachingScope: string[]; // Grade names this teacher can teach
  specializations: string[]; // Subject IDs this teacher specializes in
}

interface BreakDef {
  id: string;
  period: number;
  placement: "before" | "after";
  duration: number;
  type: "short" | "lunch" | "other";
  label: string;
  days: string[];
}

interface TimetableEntry {
  section: string;
  day: string;
  period: number;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  curriculumMappingId: string;
  spanPeriods?: number;
}

// px per minute — module-level so TimetableGrid and CurriculumPage share it
const SCALE = 2.5;

// ─── Module-level pure utilities (stable references, never recreated) ───────
const timeToMins = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};
const minsToTime = (mins: number) => {
  const h = Math.floor(Math.max(0, mins) / 60);
  const m = Math.max(0, mins) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// ─── Isolated search component — owns its own state so keystrokes don't
//     re-render the parent CurriculumPage or the timetable grid ────────────
const SlotSearchInput = ({
  selectedSection,
  mappings,
  subjects,
  teachers,
  onAssign,
  day,
  period,
  getTeacherConflict,
  onRequestConfirm,
}: {
  selectedSection: string;
  mappings: {
    id: string;
    grade: string;
    section: string;
    subjectId: string;
    teacherId: string;
  }[];
  subjects: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
  onAssign: (e: {
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    curriculumMappingId: string;
  }) => void;
  day?: string;
  period?: number;
  getTeacherConflict?: (
    teacherId: string,
    day: string,
    period: number,
    spanPeriods: number,
    currentSection: string
  ) => TimetableEntry | null;
  onRequestConfirm?: (
    teacherName: string,
    section: string,
    day: string,
    period: number,
    onConfirm: () => void
  ) => void;
}) => {
  const [query, setQuery] = useState("");
  const filtered =
    query.length > 0
      ? mappings
          .filter((m) => `${m.grade}-${m.section}` === selectedSection)
          .filter((m) =>
            subjects
              .find((s) => s.id === m.subjectId)
              ?.name.toLowerCase()
              .includes(query.toLowerCase()),
          )
      : [];
  return (
    <div className="relative group/search">
      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-primary/40 group-focus-within/search:text-primary transition-colors">
        search
      </span>
      <input
        autoFocus
        type="text"
        placeholder="Subject name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-9 bg-white/80 border border-[#EBE8E0] rounded-lg pl-9 pr-3 text-[12px] font-medium placeholder-slate-300 outline-none focus:border-primary/20 focus:bg-white transition-all"
      />
      {query.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#EBE8E0] rounded-lg shadow-[0_20px_50px_rgba(200,180,150,0.35)] max-h-[220px] overflow-y-auto no-scrollbar py-1 animate-in fade-in slide-in-from-top-1 duration-200"
          style={{ zIndex: 10 }}
        >
          {filtered.length > 0 ? (
            filtered.map((m) => {
              const sub = subjects.find((s) => s.id === m.subjectId);
              const teacher = teachers.find((t) => t.id === m.teacherId);
              const conflict = (day && period && getTeacherConflict)
                ? getTeacherConflict(m.teacherId, day, period, 1, selectedSection)
                : null;
              return (
                <button
                  key={m.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (conflict && onRequestConfirm) {
                      onRequestConfirm(
                        teacher?.name || m.teacherId,
                        conflict.section,
                        day || "",
                        period || 0,
                        () => {
                          onAssign({
                            subjectId: m.subjectId,
                            subjectName: sub?.name ?? "",
                            teacherId: m.teacherId,
                            teacherName: teacher?.name ?? m.teacherId,
                            curriculumMappingId: m.id,
                          });
                        }
                      );
                    } else {
                      onAssign({
                        subjectId: m.subjectId,
                        subjectName: sub?.name ?? "",
                        teacherId: m.teacherId,
                        teacherName: teacher?.name ?? m.teacherId,
                        curriculumMappingId: m.id,
                      });
                    }
                  }}
                  className="w-full px-5 py-4 hover:bg-primary/5 text-left transition-colors flex items-center justify-between group/opt"
                >
                  <div className="space-y-0.5 flex-1 pr-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-secondary group-hover/opt:text-primary transition-colors">
                        {sub?.name}
                      </p>
                      {conflict && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-semibold uppercase tracking-wider shrink-0">
                          <span className="material-symbols-outlined text-[10px]">warning</span>
                          Busy ({conflict.section})
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-medium text-slate-400">
                      {teacher?.name ?? m.teacherId}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-primary opacity-0 group-hover/opt:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0">
                    add_circle
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-6 text-center">
              <p className="text-[11px] text-slate-400 font-medium">
                No results found
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Error boundary ──────────────────────────────────────────────────────────
class CurriculumErrorBoundary extends Component<
  { children: ReactNode },
  { err: boolean }
> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  componentDidCatch(e: Error) {
    console.error("[CurriculumPage]", e);
  }
  render() {
    if (this.state.err)
      return (
        <div className="flex-1 flex items-center justify-center p-20 text-center">
          <div className="space-y-4 max-w-xs">
            <span className="material-symbols-outlined text-[48px] text-slate-200 block">
              error
            </span>
            <h3 className="text-[18px] font-semibold text-secondary">
              Something went wrong
            </h3>
            <p className="text-[13px] text-slate-400">
              Try refreshing the page. If the issue persists, contact support.
            </p>
            <button
              onClick={() => this.setState({ err: false })}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      );
    return this.props.children;
  }
}

// ─── TimetableGrid ────────────────────────────────────────────────────────────
// Owns all drag / assign / edit-period state so mouse-move events during drag
// never trigger a CurriculumPage re-render.
interface TimetableGridProps {
  days: string[];
  periods: number[];
  periodConfigByDay: Record<
    string,
    Record<number, { start: string; end: string; dur: number }>
  >;
  breaksByDay: Record<string, BreakDef[]>;
  breakStartByDay: Record<string, Record<string, string>>;
  entriesBySlot: Map<string, TimetableEntry>;
  coveredByDay: Record<string, Set<number>>;
  timeTicks: number[];
  totalDayMinutes: number;
  selectedTimetableSection: string;
  scheduleConfig: {
    schoolStart: string;
    uniformDuration: boolean;
    defaultDuration: number;
  };
  periodDurations: Record<number, number>;
  stickyDayHeaders: boolean;
  mappings: Mapping[];
  subjects: Subject[];
  teachers: Teacher[];
  onEntriesChange: React.Dispatch<React.SetStateAction<TimetableEntry[]>>;
  onPeriodDurationChange: (
    period: number,
    duration: number,
    wasUniform: boolean,
  ) => void;
  timetableRef: React.RefObject<HTMLDivElement | null>;
  getTeacherConflict?: (
    teacherId: string,
    day: string,
    period: number,
    spanPeriods: number,
    currentSection: string
  ) => TimetableEntry | null;
}

const TimetableGrid = memo(
  ({
    days,
    periods,
    periodConfigByDay,
    breaksByDay,
    breakStartByDay,
    entriesBySlot,
    coveredByDay,
    timeTicks,
    totalDayMinutes,
    selectedTimetableSection,
    scheduleConfig,
    periodDurations,
    stickyDayHeaders,
    mappings,
    subjects,
    teachers,
    onEntriesChange,
    onPeriodDurationChange,
    timetableRef,
    getTeacherConflict,
  }: TimetableGridProps) => {
    const [extendingSlot, setExtendingSlot] = useState<{
      day: string;
      period: number;
      entry: TimetableEntry;
      direction: "vertical" | "horizontal";
    } | null>(null);
    const [extensionTarget, setExtensionTarget] = useState<{
      day: string;
      period: number;
    } | null>(null);
    const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
    const [assigningSlot, setAssigningSlot] = useState<{
      day: string;
      period: number;
    } | null>(null);
    const [conflictToConfirm, setConflictToConfirm] = useState<{
      teacherName: string;
      section: string;
      day: string;
      period: number;
      onConfirm: () => void;
    } | null>(null);

    const handleRequestConfirmConflict = useCallback((
      teacherName: string,
      section: string,
      day: string,
      period: number,
      onConfirm: () => void
    ) => {
      setConflictToConfirm({
        teacherName,
        section,
        day,
        period,
        onConfirm,
      });
    }, []);

    const schoolStartMins = timeToMins(scheduleConfig.schoolStart);

    const handleTimetableSlotMouseUp = useCallback((day: string, p: number) => {
      if (extendingSlot && extensionTarget) {
        if (
          extendingSlot.direction === "horizontal" &&
          day === extensionTarget.day &&
          p === extensionTarget.period
        ) {
          const src = days.indexOf(extendingSlot.day);
          const tgt = days.indexOf(extensionTarget.day);
          const newEntries = Array.from(
            { length: tgt - src },
            (_, i) => ({
              ...extendingSlot.entry,
              day: days[src + 1 + i],
              period: extendingSlot.period,
            }),
          );
          onEntriesChange((prev) => [
            ...prev.filter(
              (e) =>
                !(
                  e.section === selectedTimetableSection &&
                  e.period === extendingSlot.period &&
                  days.indexOf(e.day) > src &&
                  days.indexOf(e.day) <= tgt
                ),
            ),
            ...newEntries,
          ]);
        } else if (
          extendingSlot.direction === "vertical" &&
          extendingSlot.day === day
        ) {
          const newSpan = Math.max(
            1,
            extensionTarget.period -
              extendingSlot.period +
              1,
          );
          onEntriesChange((prev) =>
            prev.map((e) =>
              e === extendingSlot.entry
                ? { ...e, spanPeriods: newSpan }
                : e,
            ),
          );
        }
      }
      setExtendingSlot(null);
      setExtensionTarget(null);
    }, [extendingSlot, extensionTarget, days, onEntriesChange, selectedTimetableSection]);

    const handleTimetableSlotMouseEnter = useCallback((day: string, p: number, dIdx: number) => {
      if (
        extendingSlot?.direction !== "horizontal"
      )
        return;
      const src = days.indexOf(extendingSlot.day);
      if (p === extendingSlot.period && dIdx > src)
        setExtensionTarget({ day, period: p });
      else setExtensionTarget(null);
    }, [extendingSlot, days]);

    const handleRemoveEntry = useCallback((entryToRemove: TimetableEntry) => {
      onEntriesChange((prev) => prev.filter((ent) => ent !== entryToRemove));
    }, [onEntriesChange]);

    const handleDecreaseSpan = useCallback((entryToModify: TimetableEntry) => {
      onEntriesChange((prev) =>
        prev.map((ent) =>
          ent === entryToModify
            ? {
                ...ent,
                spanPeriods: (ent.spanPeriods || 1) - 1,
              }
            : ent,
        ),
      );
    }, [onEntriesChange]);

    const handleAssignSlot = useCallback((day: string, period: number, data: any) => {
      onEntriesChange((prev) => [
        ...prev,
        {
          section: selectedTimetableSection,
          day,
          period,
          subjectId: data.subjectId,
          subjectName: data.subjectName,
          teacherId: data.teacherId,
          teacherName: data.teacherName,
          curriculumMappingId: data.curriculumMappingId,
        },
      ]);
      setAssigningSlot(null);
    }, [onEntriesChange, selectedTimetableSection]);

    if (!selectedTimetableSection) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden rounded-b-[23px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[400px] font-black text-slate-50/50 select-none pointer-events-none">
            Schedule
          </div>
          <div className="relative z-10 space-y-8 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="size-24 rounded-[40px] bg-white shadow-2xl shadow-slate-200/50 flex items-center justify-center text-primary mx-auto">
              <span className="material-symbols-outlined text-[48px] animate-pulse">
                calendar_view_day
              </span>
            </div>
            <div className="space-y-3">
              <h3 className="text-[32px] font-semibold text-secondary tracking-tight">
                Academic rhythm
              </h3>
              <p className="text-[15px] font-medium text-slate-400 leading-relaxed">
                Select an institutional roster above to visualize and manage the
                weekly academic flow for your students.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={timetableRef} className="flex-1 bg-transparent">
        <section
          className="max-w-[1200px] mx-auto select-none"
          aria-label="Timetable grid"
          onMouseUp={() => {
            if (extendingSlot) {
              setExtendingSlot(null);
              setExtensionTarget(null);
            }
          }}
          onMouseLeave={() => extendingSlot && setExtensionTarget(null)}
        >
          {/* Day headers */}
          <div
            className={cn(
              "flex border-b border-[#EBE8E0] bg-[#FDFCFB] z-20",
              stickyDayHeaders ? "sticky top-[64px]" : "relative",
            )}
          >
            <div className="w-[100px] shrink-0 border-r border-[#EBE8E0]" />
            {days.map((day, dIdx) => (
              <div
                key={day}
                className={cn(
                  "flex-1 py-5 px-6 bg-[#FDFCFB]/80",
                  dIdx < days.length - 1 && "border-r border-[#EBE8E0]",
                )}
              >
                <span className="text-[length:var(--font-size-body)] font-[var(--font-weight-label)] text-secondary tracking-tight block">
                  {day}
                </span>
                <span className="text-[10px] font-medium text-slate-400 tracking-tight">
                  Class day
                </span>
              </div>
            ))}
          </div>

          {/* Time-based body */}
          <div
            className="flex"
            style={{ height: `${totalDayMinutes * SCALE}px` }}
          >
            {/* Sidebar: time ticks + period labels */}
            <div className="w-[100px] shrink-0 relative border-r border-[#EBE8E0]">
              {timeTicks.map((t) => (
                <div
                  key={t}
                  style={{ top: `${(t - schoolStartMins) * SCALE}px` }}
                  className="absolute right-2 flex items-center pointer-events-none"
                >
                  <span className="text-[8px] text-slate-400 font-medium">
                    {minsToTime(t)}
                  </span>
                </div>
              ))}
              {periods.map((p) => {
                const mon = periodConfigByDay["Monday"]?.[p];
                if (!mon) return null;
                const top = (timeToMins(mon.start) - schoolStartMins) * SCALE;
                const height = mon.dur * SCALE;
                const dur = scheduleConfig.uniformDuration
                  ? scheduleConfig.defaultDuration
                  : periodDurations[p] || scheduleConfig.defaultDuration;
                return (
                  <div
                    key={`lbl-${p}`}
                    style={{ top, height }}
                    className="absolute left-0 right-0 flex flex-col items-center justify-center border-b border-[#EBE8E0] px-1 overflow-hidden"
                  >
                    <span className="text-[20px] font-bold text-secondary/70 leading-none">
                      {p}
                    </span>
                    {editingPeriod === p ? (
                      <div
                        className="flex flex-col items-center gap-1 mt-1"
                        onBlur={(e) => {
                          if (
                            !e.currentTarget.contains(e.relatedTarget)
                          )
                            setEditingPeriod(null);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            type="number"
                            min={5}
                            max={180}
                            value={dur}
                            onChange={(e) => {
                              const v =
                                Number.parseInt(e.target.value) ||
                                scheduleConfig.defaultDuration;
                              onPeriodDurationChange(
                                p,
                                v,
                                scheduleConfig.uniformDuration,
                              );
                            }}
                            className="w-10 text-center text-[11px] font-semibold bg-white border border-[#EBE8E0] rounded-lg px-1 py-1 outline-none focus:border-primary"
                          />
                          <span className="text-[9px] text-slate-400">m</span>
                        </div>
                        <div className="text-[8px] text-slate-300 text-center leading-tight">
                          {mon.start}
                          <br />
                          {mon.end}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingPeriod(p)}
                        className="flex flex-col items-center gap-0.5 group/time"
                      >
                        <span className="text-[9px] font-semibold text-secondary/40 group-hover/time:text-primary transition-colors tracking-wider">
                          {mon.start}
                        </span>
                        <span className="text-[8px] font-medium text-slate-300">
                          —
                        </span>
                        <span className="text-[9px] font-semibold text-secondary/40 group-hover/time:text-primary transition-colors tracking-wider">
                          {mon.end}
                        </span>
                        <span className="text-[8px] text-slate-300 mt-0.5">
                          {dur}m
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Day columns */}
            {days.map((day, dIdx) => {
              const coveredPeriods = coveredByDay[day] ?? new Set<number>();
              return (
                <div
                  key={day}
                  className={cn(
                    "flex-1 relative",
                    dIdx < days.length - 1 && "border-r border-[#EBE8E0]",
                  )}
                  role="presentation"
                  onMouseMove={(e) => {
                    if (
                      extendingSlot?.direction !== "vertical" ||
                      extendingSlot?.day !== day
                    )
                      return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const absMin =
                      schoolStartMins +
                      Math.max(0, e.clientY - rect.top) / SCALE;
                    let found: number | null = null;
                    for (const p of periods) {
                      const cfg = periodConfigByDay[day]?.[p];
                      if (
                        cfg &&
                        timeToMins(cfg.start) <= absMin &&
                        absMin <= timeToMins(cfg.end)
                      ) {
                        found = p;
                        break;
                      }
                    }
                    if (
                      found !== null &&
                      found >= extendingSlot.period &&
                      (extensionTarget?.period !== found ||
                        extensionTarget?.day !== day)
                    ) {
                      setExtensionTarget({ day, period: found });
                    }
                  }}
                >
                  {/* 30-min guide lines */}
                  {timeTicks.map((t) => (
                    <div
                      key={t}
                      style={{ top: `${(t - schoolStartMins) * SCALE}px` }}
                      className="absolute left-0 right-0 border-t border-[#F0EDE8]/80 pointer-events-none"
                    />
                  ))}

                  {/* Break cells */}
                  {(breaksByDay[day] ?? []).map((brk) => {
                    const brkStartTime = breakStartByDay[day]?.[brk.id];
                    if (!brkStartTime) return null;
                    const brkTop =
                      (timeToMins(brkStartTime) - schoolStartMins) * SCALE;
                    const brkHeight = Math.max(20, brk.duration * SCALE);
                    const bIsLunch = brk.type === "lunch";
                    const bIsOther = brk.type === "other";
                    let bgClass = "bg-slate-50/70";
                    let iconColor = "text-slate-400";
                    let iconName = "free_breakfast";
                    let textClass = "text-slate-400";
                    if (bIsLunch) {
                      bgClass = "bg-amber-50/50";
                      iconColor = "text-amber-400";
                      iconName = "restaurant";
                      textClass = "text-amber-600/70";
                    } else if (bIsOther) {
                      bgClass = "bg-violet-50/50";
                      iconColor = "text-violet-400";
                      iconName = "timer";
                      textClass = "text-violet-600/70";
                    }
                    return (
                      <div
                        key={`brk-${brk.id}`}
                        style={{
                          top: brkTop,
                          height: brkHeight,
                          left: 0,
                          right: 0,
                          position: "absolute",
                          zIndex: 5,
                        }}
                        className={cn(
                          "flex items-center justify-center gap-1.5 border-b border-[#EBE8E0]",
                          bgClass,
                        )}
                      >
                        <span
                          className={cn(
                            "material-symbols-outlined text-[12px]",
                            iconColor,
                          )}
                        >
                          {iconName}
                        </span>
                        <div className="flex flex-col leading-tight">
                          <span
                            className={cn(
                              "text-[10px] font-semibold",
                              textClass,
                            )}
                          >
                            {brk.label}
                          </span>
                          <span className="text-[8px] text-slate-300">
                            {brkStartTime} –{" "}
                            {minsToTime(
                              timeToMins(brkStartTime) + brk.duration,
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Ghost vertical extension preview */}
                  {extendingSlot?.direction === "vertical" &&
                    extendingSlot.day === day &&
                    extensionTarget &&
                    (() => {
                      const se = extendingSlot.entry;
                      const curEndP = Math.min(
                        se.period + (se.spanPeriods || 1) - 1,
                        periods.at(-1)!,
                      );
                      const curEndCfg = periodConfigByDay[day]?.[curEndP];
                      const tgtCfg =
                        periodConfigByDay[day]?.[extensionTarget.period];
                      if (!curEndCfg || !tgtCfg) return null;
                      const curEndY =
                        (timeToMins(curEndCfg.end) - schoolStartMins) * SCALE;
                      const tgtEndY =
                        (timeToMins(tgtCfg.end) - schoolStartMins) * SCALE;
                      if (tgtEndY <= curEndY) return null;
                      return (
                        <div
                          className="absolute left-0 right-0 bg-primary/5 border-2 border-dashed border-primary/20 pointer-events-none z-10"
                          style={{ top: curEndY, height: tgtEndY - curEndY }}
                        />
                      );
                    })()}

                  {/* Period cells */}
                  {periods.map((p) => {
                    if (coveredPeriods.has(p)) return null;
                    const dayCfg = periodConfigByDay[day]?.[p];
                    if (!dayCfg) return null;
                    const entry = entriesBySlot.get(`${day}-${p}`);
                    const spanP = entry?.spanPeriods || 1;
                    const cellConflict = (entry && getTeacherConflict)
                      ? getTeacherConflict(entry.teacherId, day, p, spanP, selectedTimetableSection)
                      : null;
                    const endP = Math.min(
                      p + spanP - 1,
                      periods[periods.length - 1],
                    );
                    const endCfg = periodConfigByDay[day]?.[endP];
                    const cellTop =
                      (timeToMins(dayCfg.start) - schoolStartMins) * SCALE;
                    const cellHeight = endCfg
                      ? (timeToMins(endCfg.end) - timeToMins(dayCfg.start)) *
                        SCALE
                      : dayCfg.dur * SCALE;
                    const srcIdx =
                      extendingSlot?.direction === "horizontal"
                        ? days.indexOf(extendingSlot.day)
                        : -1;
                    const tgtIdx =
                      extensionTarget &&
                      extendingSlot?.direction === "horizontal"
                        ? days.indexOf(extensionTarget.day)
                        : -1;
                    const isInHRange =
                      extendingSlot?.direction === "horizontal" &&
                      !!extensionTarget &&
                      p === extendingSlot.period &&
                      dIdx > srcIdx &&
                      dIdx <= tgtIdx;
                    const isDiffTime =
                      dayCfg.start !== periodConfigByDay["Monday"]?.[p]?.start;
                    return (
                      <div
                        key={`${day}-${p}`}
                        style={{
                          top: cellTop,
                          height: cellHeight,
                          left: 0,
                          right: 0,
                          position: "absolute",
                          zIndex: entry ? 2 : 1,
                        }}
                        className={cn(
                          "group border-b border-[#EBE8E0] transition-colors duration-200 py-4 px-4 animate-in fade-in",
                          !entry &&
                            !isInHRange &&
                            "cursor-pointer hover:bg-white/90 hover:z-[15]",
                          isInHRange && "bg-primary/[0.04]",
                          entry &&
                            spanP > 1 &&
                            (cellConflict ? "border-l-[3px] border-l-red-500" : "border-l-[3px] border-l-slate-300"),
                          cellConflict && "bg-red-50/20 hover:bg-red-50/30 border border-red-200/50 shadow-sm",
                        )}
                        role={entry ? undefined : "button"}
                        tabIndex={entry ? undefined : 0}
                        onClick={() => {
                          if (!entry && !extendingSlot) {
                            setAssigningSlot({ day, period: p });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (!entry && !extendingSlot && (e.key === "Enter" || e.key === " ")) {
                            setAssigningSlot({ day, period: p });
                          }
                        }}
                        onMouseEnter={() => handleTimetableSlotMouseEnter(day, p, dIdx)}
                        onMouseUp={() => handleTimetableSlotMouseUp(day, p)}
                      >
                        {spanP === 1 && (
                          <div
                            className={cn(
                              "absolute top-1.5 left-3 flex items-center gap-1 pointer-events-none z-[5]",
                              isDiffTime ? "opacity-70" : "opacity-30",
                            )}
                          >
                            <span className="text-[8px] font-semibold text-secondary tracking-wide">
                              {dayCfg.start}
                            </span>
                            <span className="text-[7px] text-slate-400">–</span>
                            <span className="text-[8px] font-semibold text-secondary tracking-wide">
                              {dayCfg.end}
                            </span>
                            {isDiffTime && (
                              <span className="text-[7px] text-primary font-bold ml-0.5">
                                *
                              </span>
                            )}
                          </div>
                        )}
                        {entry ? (
                          <>
                            {extendingSlot?.direction === "vertical" &&
                              extendingSlot.entry === entry &&
                              extensionTarget &&
                              spanP > 1 &&
                              (() => {
                                const tgtEndCfg =
                                  periodConfigByDay[day]?.[
                                    extensionTarget.period
                                  ];
                                if (!tgtEndCfg || !endCfg) return null;
                                const pct = Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    ((timeToMins(tgtEndCfg.end) -
                                      timeToMins(dayCfg.start)) /
                                      (timeToMins(endCfg.end) -
                                        timeToMins(dayCfg.start))) *
                                      100,
                                  ),
                                );
                                return (
                                  <div
                                    className="absolute left-3 right-3 border-t-2 border-dashed border-slate-400/60 z-20 pointer-events-none"
                                    style={{ top: `${pct}%` }}
                                  />
                                );
                              })()}
                            {spanP > 1 && (
                              <div className="absolute top-3 left-3 flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full z-10">
                                <span className="material-symbols-outlined text-[11px]">
                                  unfold_more
                                </span>
                                <span className="text-[9px] font-semibold tracking-wide">
                                  ×{spanP} periods
                                </span>
                              </div>
                            )}
                            <div className="flex flex-col items-start text-left gap-0.5 animate-in fade-in duration-500 h-full justify-center relative w-full">
                              <div className="flex items-center gap-1.5 w-full flex-wrap">
                                <h4 className="text-[14px] font-semibold text-secondary leading-tight group-hover:text-primary transition-colors">
                                  {entry.subjectName}
                                </h4>
                                {cellConflict && (
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.25 rounded bg-red-50 text-red-600 border border-red-100 text-[8px] font-bold uppercase tracking-wide z-10 shrink-0">
                                    <span className="material-symbols-outlined text-[9px]">error</span>
                                    Conflict: {cellConflict.section}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-medium text-slate-400 tracking-tight">
                                {entry.teacherName}
                              </p>
                              {spanP > 1 && endCfg && (
                                <p className="text-[10px] font-medium text-slate-400 mt-1.5">
                                  {dayCfg.start} — {endCfg.end}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveEntry(entry);
                              }}
                              className="absolute top-3 right-3 size-7 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center text-slate-300 bg-white z-10"
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                close
                              </span>
                            </button>
                            {spanP > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDecreaseSpan(entry);
                                }}
                                className="absolute bottom-3 right-3 size-7 rounded-full opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all flex items-center justify-center text-slate-300 bg-white z-10"
                                title="Remove one period"
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  unfold_less
                                </span>
                              </button>
                            )}
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setExtendingSlot({
                                  day,
                                  period: p,
                                  entry,
                                  direction: "vertical",
                                });
                              }}
                              className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize group/handle flex items-center justify-center z-20 bg-transparent border-0 p-0"
                              aria-label="Resize slot vertically"
                            >
                              <div className="w-8 h-1 rounded-full bg-slate-200 group-hover/handle:bg-primary/40 opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setExtendingSlot({
                                  day,
                                  period: p,
                                  entry,
                                  direction: "horizontal",
                                });
                              }}
                              className="absolute top-0 right-0 bottom-0 w-5 cursor-ew-resize group/rhandle flex items-center justify-center z-20 bg-transparent border-0 p-0"
                              aria-label="Resize slot horizontally"
                            >
                              <div className="h-10 w-[3px] rounded-full bg-slate-200 group-hover/rhandle:bg-primary/50 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                            </button>
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 duration-300">
                            <div className="size-6 rounded-full text-secondary/30 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[18px]">
                                add
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-secondary/30">
                              Assign
                            </span>
                          </div>
                        )}
                        {isInHRange && extendingSlot && (
                          <div className="absolute inset-0 pointer-events-none flex flex-col justify-center px-4 gap-0.5 z-10">
                            <div className="absolute inset-[3px] border border-dashed border-primary/30 rounded-sm" />
                            <p className="text-[13px] font-semibold text-secondary/30 leading-tight">
                              {extendingSlot.entry.subjectName}
                            </p>
                            <p className="text-[11px] text-slate-300">
                              {extendingSlot.entry.teacherName}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Assignment popover */}
                  {assigningSlot?.day === day &&
                    (() => {
                      const ap = assigningSlot.period;
                      const aCfg = periodConfigByDay[day]?.[ap];
                      if (!aCfg) return null;
                      const aTop =
                        (timeToMins(aCfg.start) - schoolStartMins) * SCALE;
                      const aHeight = Math.max(160, aCfg.dur * SCALE);
                      return (
                        <div
                          style={{
                            top: aTop,
                            height: aHeight,
                            left: 0,
                            right: 0,
                            position: "absolute",
                            zIndex: 50,
                          }}
                          className="p-2"
                        >
                          <div className="relative h-full bg-[#FDFCFB] shadow-[0_20px_60px_rgba(200,180,150,0.3)] rounded-xl border border-[#EBE8E0] p-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="relative flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-semibold text-slate-400 tracking-tight">
                                  Assign subject
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssigningSlot(null);
                                  }}
                                  className="text-slate-300 hover:text-secondary transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    close
                                  </span>
                                </button>
                              </div>
                              <SlotSearchInput
                                selectedSection={selectedTimetableSection}
                                mappings={mappings}
                                subjects={subjects}
                                teachers={teachers}
                                onAssign={(data) => handleAssignSlot(day, ap, data)}
                                day={day}
                                period={ap}
                                getTeacherConflict={getTeacherConflict}
                                onRequestConfirm={handleRequestConfirmConflict}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Confirmation Modal (Schedule Conflict Alert) ── */}
        {createPortal(
          <AnimatePresence>
            {conflictToConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-6"
              >
                <div
                  className="absolute inset-0 bg-secondary/40 backdrop-blur-sm"
                  onClick={() => setConflictToConfirm(null)}
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-[32px] shadow-2xl p-8 max-w-md w-full relative z-10 border border-slate-100"
                >
                  <div className="size-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 border border-amber-100">
                    <span className="material-symbols-outlined text-[28px]">
                      warning
                    </span>
                  </div>
                  <h3 className="text-[20px] font-bold text-secondary mb-2">
                    Schedule Conflict
                  </h3>
                  <p className="text-[14px] text-slate-500 leading-relaxed mb-8">
                    Teacher <strong>{conflictToConfirm.teacherName}</strong> is already scheduled for class section <strong>"{conflictToConfirm.section}"</strong> on {conflictToConfirm.day} period {conflictToConfirm.period}.
                    <br /><br />
                    Do you still want to assign them and create a conflict?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConflictToConfirm(null)}
                      className="flex-1 h-12 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:bg-slate-50 transition-all border border-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        conflictToConfirm.onConfirm();
                        setConflictToConfirm(null);
                      }}
                      className="flex-1 h-12 rounded-xl bg-amber-500 text-white text-[13px] font-bold hover:bg-amber-600 transition-all shadow-md shadow-amber-500/10"
                    >
                      Assign Anyway
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    );
  },
);

export const CurriculumPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { schoolProfile, activeAcademicYear } = useApp();
  const activeGrades = schoolProfile?.activeGrades || ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const activeTab =
    (tab as "master" | "grades" | "mapping" | "timetable") || "master";
  const [selectedTimetableSection, setSelectedTimetableSection] = useState("");
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(
    [],
  );
  const [isAllTimetablesLoaded, setIsAllTimetablesLoaded] = useState(false);
  const [isAllTimetablesLoading, setIsAllTimetablesLoading] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges) {
      setPendingTab(newTab);
      setShowConfirmModal(true);
    } else {
      navigate(`/curriculum/${newTab}`);
    }
  };

  const confirmNavigation = () => {
    if (pendingTab) {
      setHasUnsavedChanges(false);
      navigate(`/curriculum/${pendingTab}`);
      setShowConfirmModal(false);
      setPendingTab(null);
    }
  };

  const ALL_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [stickyDayHeaders, setStickyDayHeaders] = useState(true);
  const [activeDays, setActiveDays] = useState([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);
  const days = activeDays;

  // Browser-level navigation guard for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e["returnValue"] = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);
  const [numPeriods, setNumPeriods] = useState(8);
  const periods = useMemo(
    () => Array.from({ length: numPeriods }, (_, i) => i + 1),
    [numPeriods],
  );
  const [scheduleConfig, setScheduleConfig] = useState({
    schoolStart: "08:30",
    uniformDuration: true,
    defaultDuration: 60,
  });
  const [periodDurations, setPeriodDurations] = useState<{
    [key: number]: number;
  }>({});
  // per-day overrides: e.g. Friday periods can be shorter { Friday: { 4: 45 } }
  const [perDayDurations, setPerDayDurations] = useState<{
    [day: string]: { [period: number]: number };
  }>({});
  const [breakConfig, setBreakConfig] = useState<BreakDef[]>([
    {
      id: "b1",
      period: 2,
      placement: "after",
      duration: 15,
      type: "short",
      label: "Short Break",
      days: [],
    },
    {
      id: "b2",
      period: 5,
      placement: "after",
      duration: 40,
      type: "lunch",
      label: "Lunch Break",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    },
    {
      id: "b3",
      period: 4,
      placement: "after",
      duration: 30,
      type: "other",
      label: "Prayer",
      days: ["Friday"],
    },
  ]);
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const configPanelRef = useRef<HTMLDivElement>(null);
  const timetableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showSchedulePanel) {
      // Wait for the peak of the weighted spring before scrolling
      const t = setTimeout(
        () =>
          configPanelRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          }),
        300,
      );
      return () => clearTimeout(t);
    }
  }, [showSchedulePanel]);
  // Per-day period config + break start times (handles before/after placement)
  const { periodConfigByDay, breakStartByDay } = useMemo(() => {
    const allDays = days;
    const pCfg: {
      [day: string]: {
        [p: number]: { start: string; end: string; dur: number };
      };
    } = {};
    const bStarts: { [day: string]: { [id: string]: string } } = {};
    const applicable = (b: BreakDef, day: string) =>
      b.days.length === 0 || b.days.includes(day);
    for (const day of allDays) {
      let cur = timeToMins(scheduleConfig.schoolStart);
      pCfg[day] = {};
      bStarts[day] = {};
      for (const p of periods) {
        for (const brk of breakConfig.filter(
          (b) =>
            b.period === p && b.placement === "before" && applicable(b, day),
        )) {
          bStarts[day][brk.id] = minsToTime(cur);
          cur += brk.duration;
        }
        const baseDur = scheduleConfig.uniformDuration
          ? scheduleConfig.defaultDuration
          : periodDurations[p] || scheduleConfig.defaultDuration;
        const dur = perDayDurations[day]?.[p] ?? baseDur;
        pCfg[day][p] = {
          start: minsToTime(cur),
          end: minsToTime(cur + dur),
          dur,
        };
        cur += dur;
        for (const brk of breakConfig.filter(
          (b) =>
            b.period === p && b.placement === "after" && applicable(b, day),
        )) {
          bStarts[day][brk.id] = minsToTime(cur);
          cur += brk.duration;
        }
      }
    }
    return { periodConfigByDay: pCfg, breakStartByDay: bStarts };
  }, [
    scheduleConfig,
    periodDurations,
    perDayDurations,
    breakConfig,
    periods,
    days,
  ]);

  const totalDayMinutes = useMemo(() => {
    const schoolStart = timeToMins(scheduleConfig.schoolStart);
    let maxEnd = 0;
    for (const day of days) {
      const lastP = periods[periods.length - 1];
      const lastCfg = periodConfigByDay[day]?.[lastP];
      if (lastCfg)
        maxEnd = Math.max(maxEnd, timeToMins(lastCfg.end) - schoolStart);
    }
    return maxEnd + 40;
  }, [scheduleConfig.schoolStart, periodConfigByDay, periods, days]);

  const timeTicks = useMemo(() => {
    const start = timeToMins(scheduleConfig.schoolStart);
    const ticks: number[] = [];
    const first = Math.ceil(start / 30) * 30;
    for (let t = first; t <= start + totalDayMinutes; t += 30) ticks.push(t);
    return ticks;
  }, [scheduleConfig.schoolStart, totalDayMinutes]);

  // O(1) entry lookup by day+period — prevents .find() on every cell render
  const entriesBySlot = useMemo(() => {
    const map = new Map<string, (typeof timetableEntries)[0]>();
    for (const e of timetableEntries)
      if (e.section === selectedTimetableSection)
        map.set(`${e.day}-${e.period}`, e);
    return map;
  }, [timetableEntries, selectedTimetableSection]);

  // Pre-built covered-period Sets — prevents per-day linear scans in render
  const coveredByDay = useMemo(() => {
    const out: Record<string, Set<number>> = {};
    for (const day of days) {
      const s = new Set<number>();
      for (const e of timetableEntries)
        if (
          e.section === selectedTimetableSection &&
          e.day === day &&
          (e.spanPeriods || 1) > 1
        )
          for (let i = 1; i < (e.spanPeriods || 1); i++) s.add(e.period + i);
      out[day] = s;
    }
    return out;
  }, [timetableEntries, selectedTimetableSection, days]);

  // Pre-filtered breaks per day — prevents repeated .filter() inside render loop
  const breaksByDay = useMemo(() => {
    const out: Record<string, BreakDef[]> = {};
    for (const day of days)
      out[day] = breakConfig.filter(
        (b) => b.days.length === 0 || b.days.includes(day),
      );
    return out;
  }, [breakConfig, days]);

  const handlePeriodDurationChange = useCallback(
    (period: number, duration: number, wasUniform: boolean) => {
      setPeriodDurations((prev) => ({ ...prev, [period]: duration }));
      if (wasUniform)
        setScheduleConfig((prev) => ({ ...prev, uniformDuration: false }));
    },
    [],
  );

  // State Data

  const [backendClasses, setBackendClasses] = useState<
    { id: string; grade: string; section: string }[]
  >([]);
  const [initialMappings, setInitialMappings] = useState<Mapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [gradeConfigs, setGradeConfigs] = useState<GradeConfig[]>([]);

  const [selectedTimetableGrade, setSelectedTimetableGrade] = useState(() => {
    return gradeConfigs[0]?.grade || "";
  });

  const [gradeGroups, setGradeGroups] = useState<GradeGroup[]>(() => {
    const schoolId = localStorage.getItem("school_id") || "default";
    const cached = localStorage.getItem(`curriculum_grade_groups_${schoolId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Ignore JSON parsing errors
      }
    }
    return [
      {
        id: "middle",
        label: "Middle School",
        grades: ["Grade 5", "Grade 6", "Grade 7", "Grade 8"],
      },
      {
        id: "high",
        label: "High School",
        grades: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
      },
    ];
  });

  const [sections, setSections] = useState<
    { grade: string; id: string; groupId: string; classId: string }[]
  >([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    if (schoolProfile?.activeGrades) {
      setGradeGroups((prev) =>
        prev.map((gg) =>
          gg.id === "high" ? { ...gg, grades: schoolProfile.activeGrades } : gg
        )
      );
    }
  }, [schoolProfile]);

  // Auto-persist gradeGroups (purely frontend grouping) to localStorage
  useEffect(() => {
    const schoolId = localStorage.getItem("school_id") || "default";
    localStorage.setItem(
      `curriculum_grade_groups_${schoolId}`,
      JSON.stringify(gradeGroups),
    );
  }, [gradeGroups]);

  // Fetch all curriculum data from GraphQL API
  const fetchAllData = useCallback(async () => {
    const schoolId = localStorage.getItem("school_id") || "";
    if (!schoolId) return;

    setIsLoading(true);
    try {
      // Run subjects, gradeConfigs, main curriculum, and timetable config queries in parallel
      const [subjectsResult, gradeConfigsResult, curriculumResult, timetableConfigResult] =
        await Promise.allSettled([
          graphqlRequest<{
            subjects: Array<{
              id: string;
              name: string;
              code: string;
              category: string;
              department: string;
            }>;
          }>(GET_SUBJECTS, { schoolId }),
          graphqlRequest<{
            gradeConfigs: Array<{
              id: string;
              grade: string;
              periodsPerDay: number;
              periodDurationMinutes?: number;
              teachingHoursPerWeek?: number;
              subjects: string[];
            }>;
          }>(GET_GRADE_CONFIGS, { schoolId }),
          graphqlRequest<{
            classes: {
              items: Array<{ id: string; grade: string; section: string }>;
            };
            users: {
              items: Array<{
                id: string;
                name: string;
                qualifiedGrades?: string[];
                subjectSpecializations?: string[];
              }>;
            };
            curriculumMappings: {
              items: Array<{
                id: string;
                schoolId: string;
                classId: string;
                grade: string;
                section: string;
                subjectId: string;
                teacherId: string;
                hoursPerWeek?: number;
                isAdditional?: boolean;
              }>;
            };
          }>(GET_CURRICULUM_DATA, { schoolId }),
          graphqlRequest<{
            timetableConfig: {
              schoolStart: string;
              uniformDuration: boolean;
              defaultDuration: number;
              operationalDays: string[];
              breaks: Array<{
                id: string;
                period: number;
                placement: "before" | "after";
                duration: number;
                type: "short" | "lunch" | "other";
                label: string;
                days: string[];
              }>;
              periodDurationsJson?: string;
              perDayDurationsJson?: string;
            } | null;
          }>(GET_TIMETABLE_CONFIG, { schoolId }),
        ]);

      // 1. Load subjects from backend
      if (subjectsResult.status === "fulfilled") {
        const fetchedSubjects = subjectsResult.value.subjects || [];
        const mappedSubjects: Subject[] = fetchedSubjects.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          category: s.category,
          department: s.department || "General",
        }));
        setSubjects(mappedSubjects);
      }

      // 2. Load grade configs from backend
      if (gradeConfigsResult.status === "fulfilled") {
        const fetchedGCs = gradeConfigsResult.value.gradeConfigs || [];
        setGradeConfigs((prev) => {
          // Merge backend periodsPerDay and subjects into existing frontend configs
          const merged = fetchedGCs.map((gc) => {
            return {
              grade: gc.grade,
              subjects: gc.subjects || [],
              periodsPerDay: gc.periodsPerDay,
              periodDurationMinutes: gc.periodDurationMinutes,
              teachingHoursPerWeek: gc.teachingHoursPerWeek,
            };
          });
          // Keep any existing grades not yet in backend (locally-created ones)
          const backendGrades = new Set(fetchedGCs.map((gc) => gc.grade));
          const localOnly = prev.filter((p) => !backendGrades.has(p.grade));
          return [...merged, ...localOnly];
        });
        // Set numPeriods from first grade config if backend has data
        const firstGC = fetchedGCs[0];
        if (firstGC?.periodsPerDay) {
          setNumPeriods(firstGC.periodsPerDay);
        }
        if (fetchedGCs.length > 0) {
          setSelectedTimetableGrade((prev) => prev || fetchedGCs[0].grade);
        }
      }

      // 3. Process classes/teachers/mappings
      if (curriculumResult.status === "fulfilled") {
        const data = curriculumResult.value;
        const fetchedClasses = data.classes?.items || [];
        setBackendClasses(fetchedClasses);
        const mappedSections = fetchedClasses.map((c) => {
          const gradeNum = parseInt(c.grade.replace(/\D/g, "")) || 10;
          const groupId = gradeNum <= 8 ? "middle" : "high";
          return {
            grade: c.grade,
            id: c.section || "A",
            groupId,
            classId: c.id,
          };
        });
        setSections(mappedSections);

        if (fetchedClasses.length > 0 && !gradeConfigsResult.status) {
          setSelectedTimetableGrade((prev) => prev || fetchedClasses[0].grade);
        }

        const fetchedTeachers = data.users?.items || [];

        const formattedTeachers: Teacher[] = fetchedTeachers.map((t) => ({
          id: t.id,
          name: t.name,
          dept: "General",
          qualification: "Educator",
          teachingScope: t.qualifiedGrades || [],
          specializations: t.subjectSpecializations || [],
        }));
        setTeachers(formattedTeachers);

        const fetchedMappings = data.curriculumMappings?.items || [];
        const classIds = new Set(fetchedClasses.map((c) => c.id));
        const schoolMappings = fetchedMappings.filter(
          (m) => classIds.has(m.classId),
        );
        const frontendMappings: Mapping[] = schoolMappings.map((m) => {
          return {
            id: m.id,
            grade: m.grade || "",
            section: m.section || "",
            subjectId: m.subjectId,
            teacherId: m.teacherId,
            hoursPerWeek: m.hoursPerWeek || 4,
            isAdditional: m.isAdditional || false,
          };
        });
        setInitialMappings(frontendMappings);
        setMappings(frontendMappings);
      }

      // 4. Load timetable configuration from backend
      if (timetableConfigResult && timetableConfigResult.status === "fulfilled") {
        const config = timetableConfigResult.value.timetableConfig;
        if (config) {
          const parsedBreaks = (config.breaks || []).map((b) => ({
            id: b.id,
            period: b.period,
            placement: b.placement as "before" | "after",
            duration: b.duration,
            type: b.type as "short" | "lunch" | "other",
            label: b.label,
            days: b.days || [],
          }));
          let parsedPeriodDurations = {};
          if (config.periodDurationsJson) {
            try {
              parsedPeriodDurations = JSON.parse(config.periodDurationsJson);
              setPeriodDurations(parsedPeriodDurations);
            } catch (e) {
              console.error("Failed to parse periodDurationsJson:", e);
            }
          }
          let parsedPerDayDurations = {};
          if (config.perDayDurationsJson) {
            try {
              parsedPerDayDurations = JSON.parse(config.perDayDurationsJson);
              setPerDayDurations(parsedPerDayDurations);
            } catch (e) {
              console.error("Failed to parse perDayDurationsJson:", e);
            }
          }

          setScheduleConfig({
            schoolStart: config.schoolStart || "08:30",
            uniformDuration: config.uniformDuration ?? true,
            defaultDuration: config.defaultDuration ?? 60,
          });
          if (config.operationalDays && config.operationalDays.length > 0) {
            setActiveDays(config.operationalDays);
          }
          setBreakConfig(parsedBreaks);

          setInitialTimetableConfig(
            JSON.stringify({
              schoolStart: config.schoolStart || "08:30",
              uniformDuration: config.uniformDuration ?? true,
              defaultDuration: config.defaultDuration ?? 60,
              operationalDays: config.operationalDays || [],
              breaks: parsedBreaks,
              periodDurations: parsedPeriodDurations,
              perDayDurations: parsedPerDayDurations,
            })
          );
        } else {
          // Serialize default frontend config
          setInitialTimetableConfig(
            JSON.stringify({
              schoolStart: "08:30",
              uniformDuration: true,
              defaultDuration: 60,
              operationalDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              breaks: breakConfig,
              periodDurations: {},
              perDayDurations: {},
            })
          );
        }
      }
    } catch (err) {
      console.error("Error fetching curriculum data:", err);
    } finally {
      setIsLoading(false);
      // Wait for states to settle before enabling the change listener
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 500);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    setIsAllTimetablesLoaded(false);
    setTimetableEntries([]);
  }, [activeAcademicYear?.id]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [showSubjectDrawer, setShowSubjectDrawer] = useState(false);
  const [showGradeDrawer, setShowGradeDrawer] = useState(false);
  const [showMappingDrawer, setShowMappingDrawer] = useState(false);
  const [showTierDrawer, setShowTierDrawer] = useState(false);
  const [isAddingAdditional, setIsAddingAdditional] = useState(false);
  const [editingMapping, setEditingMapping] = useState<Mapping | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingGrade, setEditingGrade] = useState<GradeConfig | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [gradeToDelete, setGradeToDelete] = useState<GradeConfig | null>(null);

  // Handlers
  // Derived subject areas (replaces hardcoded departments)
  // Derived subject areas for filtering (All distinct areas currently in use)
  const activeSubjectAreas = useMemo(
    () => [...new Set(subjects.map((s) => s.department))].sort((a, b) => a.localeCompare(b)),
    [subjects],
  );

  const handleAddAction = () => {
    if (activeTab === "master") setShowSubjectDrawer(true);
    else if (activeTab === "grades") setShowGradeDrawer(true);
    else if (activeTab === "mapping") {
      setIsAddingAdditional(false);
      setEditingMapping(null);
      setShowMappingDrawer(true);
    }
  };

  const handleQuickAssign = (
    grade: string,
    section: string,
    subjectId: string,
    teacherId: string,
    isFromTemplate: boolean,
  ) => {
    const existingIndex = mappings.findIndex(
      (m) =>
        m.grade === grade && m.section === section && m.subjectId === subjectId,
    );

    if (existingIndex > -1) {
      const newMappings = [...mappings];
      newMappings[existingIndex] = { ...newMappings[existingIndex], teacherId };
      setMappings(newMappings);
    } else {
      const newMapping = {
        id: `m-${Date.now()}`,
        grade,
        section,
        subjectId,
        teacherId,
        isAdditional: !isFromTemplate,
        hoursPerWeek: 4, // Default
      };
      setMappings([...mappings, newMapping]);
    }
    setHasUnsavedChanges(true);
  };

  const handleEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setShowSubjectDrawer(true);
  };

  const handleEditGrade = (config: GradeConfig) => {
    setEditingGrade(config);
    setShowGradeDrawer(true);
  };

  const handleDeleteSubject = (sub: Subject) => {
    setSubjectToDelete(sub);
  };

  const onConfirmDeleteSubject = async () => {
    if (!subjectToDelete) return;
    try {
      await graphqlRequest<{ removeSubject: { id: string } }>(REMOVE_SUBJECT, {
        id: subjectToDelete.id,
      });
      setSubjects((prev) => prev.filter((s) => s.id !== subjectToDelete.id));
      setSubjectToDelete(null);
    } catch (err) {
      console.error("Failed to delete subject:", err);
      alert(err instanceof Error ? err.message : "Failed to delete subject.");
    }
  };

  const handleDeleteGrade = (config: GradeConfig) => {
    setGradeToDelete(config);
  };

  const onConfirmDeleteGrade = async () => {
    if (!gradeToDelete) return;
    const schoolId = localStorage.getItem("school_id") || "";
    if (!schoolId) return;
    try {
      await graphqlRequest(REMOVE_GRADE_CONFIG, {
        schoolId,
        grade: gradeToDelete.grade,
      });
      setGradeConfigs((prev) =>
        prev.filter((g) => g.grade !== gradeToDelete.grade),
      );
      setGradeToDelete(null);
    } catch (err) {
      console.error("Failed to delete grade config:", err);
      alert(err instanceof Error ? err.message : "Failed to delete grade config.");
    }
  };

  const handleAddAdditionalSubject = () => {
    setIsAddingAdditional(true); // Flag for section override
    setShowMappingDrawer(true);
  };

  const onAddSubject = async (subjectData: Omit<Subject, "id">) => {
    const schoolId = localStorage.getItem("school_id") || "";
    if (!schoolId) return;
    try {
      if (editingSubject) {
        // Update existing subject
        const result = await graphqlRequest<{
          updateSubject: {
            id: string;
            name: string;
            code: string;
            category: string;
            department: string;
          };
        }>(UPDATE_SUBJECT, {
          id: editingSubject.id,
          input: {
            name: subjectData.name,
            code: subjectData.code,
            category: subjectData.category,
            department: subjectData.department || "General",
          },
        });
        const updated = result.updateSubject;
        setSubjects((prev) =>
          prev.map((s) =>
            s.id === editingSubject.id
              ? {
                  ...s,
                  name: updated.name,
                  code: updated.code,
                  category: updated.category,
                  department: updated.department,
                }
              : s,
          ),
        );
      } else {
        // Create new subject
        const result = await graphqlRequest<{
          createSubject: {
            id: string;
            name: string;
            code: string;
            category: string;
            department: string;
          };
        }>(CREATE_SUBJECT, {
          input: {
            schoolId,
            name: subjectData.name,
            code: subjectData.code,
            category: subjectData.category,
            department: subjectData.department || "General",
          },
        });
        const created = result.createSubject;
        const newSubject: Subject = {
          id: created.id,
          name: created.name,
          code: created.code,
          category: created.category,
          department: created.department,
        };
        setSubjects((prev) => [newSubject, ...prev]);
      }
      setShowSubjectDrawer(false);
      setEditingSubject(null);
    } catch (err) {
      console.error("Failed to save subject:", err);
      alert(err instanceof Error ? err.message : "Failed to save subject.");
    }
  };

  const onAddGradeConfig = async (newConfig: GradeConfig) => {
    const schoolId = localStorage.getItem("school_id") || "";
    if (!schoolId) return;
    try {
      await graphqlRequest<{
        saveGradeConfig: {
          id: string;
          grade: string;
          periodsPerDay?: number;
          subjects: string[];
        };
      }>(SAVE_GRADE_CONFIG, {
        input: {
          schoolId,
          grade: newConfig.grade,
          periodsPerDay: newConfig.periodsPerDay || numPeriods,
          periodDurationMinutes:
            newConfig.periodDurationMinutes ||
            scheduleConfig.defaultDuration ||
            undefined,
          teachingHoursPerWeek: newConfig.teachingHoursPerWeek || undefined,
          subjects: newConfig.subjects || [],
        },
      });
      setGradeConfigs((prev) => [
        newConfig,
        ...prev.filter((g) => g.grade !== newConfig.grade),
      ]);
    } catch (err) {
      console.error("Failed to save grade config:", err);
      // Still update local state even if backend fails
      setGradeConfigs((prev) => [
        newConfig,
        ...prev.filter((g) => g.grade !== newConfig.grade),
      ]);
    }
    setShowGradeDrawer(false);
    setEditingGrade(null);
  };

  const onAddMapping = (newMapping: Omit<Mapping, "id">) => {
    if (editingMapping?.id) {
      setMappings((prev) =>
        prev.map((m) =>
          m.id === editingMapping.id ? { ...m, ...newMapping } : m,
        ),
      );
    } else {
      setMappings((prev) => [
        { ...newMapping, id: `MAP-${Date.now()}` },
        ...prev,
      ]);
    }
    setShowMappingDrawer(false);
    setEditingMapping(null);
  };

  const handleDeleteMapping = (id: string) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    const schoolId = localStorage.getItem("school_id") || "";
    if (!schoolId) {
      alert("No school ID found.");
      return;
    }

    setIsSaving(true);
    try {
      const toCreate = mappings.filter(
        (m) => m.id.startsWith("MAP-") || m.id.startsWith("m-"),
      );
      const toDelete = initialMappings.filter(
        (im) => !mappings.some((m) => m.id === im.id),
      );
      const toUpdate = mappings.filter((m) => {
        const initial = initialMappings.find((im) => im.id === m.id);
        return initial && initial.teacherId !== m.teacherId;
      });

      await Promise.all([
        ...toCreate.map((m) => {
          const classObj = backendClasses.find(
            (c) => c.grade === m.grade && c.section === m.section,
          );
          if (!classObj) return Promise.resolve();
          return graphqlRequest(CREATE_CURRICULUM_MAPPING, {
            input: {
              schoolId,
              classId: classObj.id,
              teacherId: m.teacherId,
              subjectId: m.subjectId,
              grade: m.grade,
              section: m.section,
              hoursPerWeek: m.hoursPerWeek || 4,
              isAdditional: m.isAdditional || false,
              academicYearId: activeAcademicYear?.id || "",
            },
          });
        }),
        ...toUpdate.map((m) => {
          return graphqlRequest(UPDATE_CURRICULUM_MAPPING, {
            id: m.id,
            input: {
              teacherId: m.teacherId,
            },
          });
        }),
        ...toDelete.map((m) => {
          return graphqlRequest(REMOVE_CURRICULUM_MAPPING, { id: m.id });
        }),
      ]);

      await fetchAllData();
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Error saving curriculum mappings:", err);
      alert("Failed to save curriculum mapping changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTimetableEntries = useCallback((section: string, entries: TimetableEntry[]) => {
    setTimetableEntries((prev) => [
      ...prev.filter((e) => e.section !== section),
      ...entries,
    ]);
  }, []);

  // Tracking states to detect changes for Timetable slots and Configs
  const isInitialLoad = useRef(true);
  const [initialTimetableConfig, setInitialTimetableConfig] = useState<string>("");
  const [initialSectionEntries, setInitialSectionEntries] = useState<string>("[]");

  const currentConfigStr = useMemo(() => {
    return JSON.stringify({
      schoolStart: scheduleConfig.schoolStart,
      uniformDuration: scheduleConfig.uniformDuration,
      defaultDuration: scheduleConfig.defaultDuration,
      operationalDays: activeDays,
      breaks: breakConfig.map((b) => ({
        id: b.id,
        period: b.period,
        placement: b.placement,
        duration: b.duration,
        type: b.type,
        label: b.label,
        days: b.days,
      })),
      periodDurations,
      perDayDurations,
    });
  }, [scheduleConfig, activeDays, breakConfig, periodDurations, perDayDurations]);

  useEffect(() => {
    if (isInitialLoad.current || !initialTimetableConfig) return;
    if (currentConfigStr !== initialTimetableConfig) {
      setHasUnsavedChanges(true);
    }
  }, [currentConfigStr, initialTimetableConfig]);

  const currentSectionEntries = useMemo(() => {
    return timetableEntries
      .filter((e) => e.section === selectedTimetableSection)
      .map((e) => ({
        day: e.day,
        period: e.period,
        subjectId: e.subjectId,
        teacherId: e.teacherId,
        spanPeriods: e.spanPeriods || 1,
      }));
  }, [timetableEntries, selectedTimetableSection]);

  // Load timetable from backend when a section is selected
  const [isTimetableLoading, setIsTimetableLoading] = useState(false);

  useEffect(() => {
    if (isInitialLoad.current || isTimetableLoading) return;
    const currentStr = JSON.stringify(currentSectionEntries);
    if (currentStr !== initialSectionEntries) {
      setHasUnsavedChanges(true);
    }
  }, [currentSectionEntries, initialSectionEntries, isTimetableLoading]);

  const handleDiscardChanges = useCallback(() => {
    if (activeTab === "timetable") {
      if (initialTimetableConfig) {
        try {
          const cfg = JSON.parse(initialTimetableConfig);
          setScheduleConfig({
            schoolStart: cfg.schoolStart,
            uniformDuration: cfg.uniformDuration,
            defaultDuration: cfg.defaultDuration,
          });
          setActiveDays(cfg.operationalDays);
          setBreakConfig(cfg.breaks);
          setPeriodDurations(cfg.periodDurations);
          setPerDayDurations(cfg.perDayDurations);
        } catch (e) {
          console.error("Failed to parse initialTimetableConfig on discard:", e);
        }
      }
      if (initialSectionEntries && selectedTimetableSection) {
        try {
          const entries = JSON.parse(initialSectionEntries);
          const reconstructed = entries.map((slot: any) => ({
            section: selectedTimetableSection,
            day: slot.day,
            period: slot.period,
            subjectId: slot.subjectId,
            subjectName: subjects.find((s) => s.id === slot.subjectId)?.name || slot.subjectId,
            teacherId: slot.teacherId,
            teacherName: teachers.find((t) => t.id === slot.teacherId)?.name || slot.teacherId,
            curriculumMappingId: "",
            spanPeriods: slot.spanPeriods || 1,
          }));
          handleLoadTimetableEntries(selectedTimetableSection, reconstructed);
        } catch (e) {
          console.error("Failed to parse initialSectionEntries on discard:", e);
        }
      }
    } else {
      setMappings(initialMappings);
    }
    setHasUnsavedChanges(false);
  }, [
    activeTab,
    initialTimetableConfig,
    initialSectionEntries,
    selectedTimetableSection,
    initialMappings,
    handleLoadTimetableEntries,
    subjects,
    teachers,
  ]);

  useEffect(() => {
    if (!selectedTimetableSection) return;
    const section = sections.find(
      (s: { grade: string; id: string; classId?: string }) =>
        `${s.grade}-${s.id}` === selectedTimetableSection,
    );
    if (!section?.classId) return;

    const classId = section.classId;
    setIsTimetableLoading(true);
    graphqlRequest<{
      classTimetable: Array<{
        id: string;
        classId: string;
        day: string;
        period: number;
        subjectId: string;
        subjectName: string;
        teacherId: string;
        teacherName: string;
        curriculumMappingId: string;
        spanPeriods?: number;
      }>;
    }>(GET_CLASS_TIMETABLE, { classId })
      .then((data) => {
        const slots = data.classTimetable || [];
        const entries: TimetableEntry[] = slots.map((slot) => {
          return {
            section: selectedTimetableSection,
            day: slot.day,
            period: slot.period,
            subjectId: slot.subjectId,
            subjectName: slot.subjectName,
            teacherId: slot.teacherId,
            teacherName: slot.teacherName || "Unassigned",
            curriculumMappingId: slot.curriculumMappingId,
            spanPeriods: slot.spanPeriods || 1,
          };
        });
        handleLoadTimetableEntries(selectedTimetableSection, entries);
        setInitialSectionEntries(
          JSON.stringify(
            entries.map((e) => ({
              day: e.day,
              period: e.period,
              subjectId: e.subjectId,
              teacherId: e.teacherId,
              spanPeriods: e.spanPeriods || 1,
            }))
          )
        );
      })
      .catch((err) => console.error("Failed to load timetable:", err))
      .finally(() => setIsTimetableLoading(false));
  }, [selectedTimetableSection, sections, handleLoadTimetableEntries]);

  useEffect(() => {
    if (
      activeTab !== "timetable" ||
      isAllTimetablesLoaded ||
      isAllTimetablesLoading ||
      sections.length === 0
    ) {
      return;
    }

    const loadAllTimetables = async () => {
      setIsAllTimetablesLoading(true);
      try {
        const promises = sections.map(async (section) => {
          if (!section.classId) return;
          try {
            const data = await graphqlRequest<{
              classTimetable: Array<{
                id: string;
                classId: string;
                day: string;
                period: number;
                subjectId: string;
                subjectName: string;
                teacherId: string;
                teacherName: string;
                curriculumMappingId: string;
                spanPeriods?: number;
              }>;
            }>(GET_CLASS_TIMETABLE, { classId: section.classId });

            const sectionKey = `${section.grade}-${section.id}`;
            const slots = data.classTimetable || [];
            const entries: TimetableEntry[] = slots.map((slot) => ({
              section: sectionKey,
              day: slot.day,
              period: slot.period,
              subjectId: slot.subjectId,
              subjectName: slot.subjectName,
              teacherId: slot.teacherId,
              teacherName: slot.teacherName || "Unassigned",
              curriculumMappingId: slot.curriculumMappingId,
              spanPeriods: slot.spanPeriods || 1,
            }));

            handleLoadTimetableEntries(sectionKey, entries);
          } catch (err) {
            console.error(
              `Failed to load timetable for section ${section.grade}-${section.id}:`,
              err,
            );
          }
        });

        await Promise.allSettled(promises);
        setIsAllTimetablesLoaded(true);
      } catch (err) {
        console.error("Failed to load all timetables:", err);
      } finally {
        setIsAllTimetablesLoading(false);
      }
    };

    loadAllTimetables();
  }, [
    activeTab,
    isAllTimetablesLoaded,
    isAllTimetablesLoading,
    sections,
    handleLoadTimetableEntries,
  ]);

  const getTeacherConflict = useCallback(
    (
      teacherId: string,
      day: string,
      period: number,
      spanPeriods: number = 1,
      currentSection: string,
    ) => {
      if (!teacherId || teacherId === "Unassigned") return null;

      for (const entry of timetableEntries) {
        if (entry.section === currentSection) continue;
        if (entry.teacherId !== teacherId) continue;
        if (entry.day !== day) continue;

        const entrySpan = entry.spanPeriods || 1;
        const entryStart = entry.period;
        const entryEnd = entry.period + entrySpan - 1;

        const proposedStart = period;
        const proposedEnd = period + spanPeriods - 1;

        if (entryStart <= proposedEnd && proposedStart <= entryEnd) {
          return entry;
        }
      }
      return null;
    },
    [timetableEntries],
  );

  const handleSaveSchedule = async () => {
    const schoolId = localStorage.getItem("school_id") || "";
    if (!schoolId || !selectedTimetableSection) return;
    const section = sections.find(
      (s: { grade: string; id: string; classId?: string }) =>
        `${s.grade}-${s.id}` === selectedTimetableSection,
    );
    if (!section?.classId) {
      alert("Could not find class ID for the selected section.");
      return;
    }
    const classId = section.classId;
    const sectionEntries = timetableEntries.filter(
      (e) => e.section === selectedTimetableSection,
    );
    const slots = sectionEntries.map((e) => {
      let mappingId = e.curriculumMappingId;
      if (!mappingId) {
        const mapping = mappings.find(
          (m) =>
            m.grade === section.grade &&
            m.section === section.id &&
            m.subjectId === e.subjectId &&
            m.teacherId === e.teacherId,
        );
        mappingId = mapping ? mapping.id : "";
      }
      return {
        day: e.day,
        period: e.period,
        curriculumMappingId: mappingId,
        spanPeriods: e.spanPeriods || 1,
      };
    });

    setIsSaving(true);
    try {
      const configInput = {
        schoolStart: scheduleConfig.schoolStart,
        uniformDuration: scheduleConfig.uniformDuration,
        defaultDuration: scheduleConfig.defaultDuration,
        operationalDays: activeDays,
        breaks: breakConfig.map((b) => ({
          id: b.id,
          period: b.period,
          placement: b.placement,
          duration: b.duration,
          type: b.type,
          label: b.label,
          days: b.days,
        })),
        periodDurations,
        perDayDurations,
      };

      // Save general timetable configuration
      await graphqlRequest(SAVE_TIMETABLE_CONFIG, {
        schoolId,
        input: {
          schoolStart: configInput.schoolStart,
          uniformDuration: configInput.uniformDuration,
          defaultDuration: configInput.defaultDuration,
          operationalDays: configInput.operationalDays,
          breaks: configInput.breaks,
          periodDurationsJson: JSON.stringify(configInput.periodDurations),
          perDayDurationsJson: JSON.stringify(configInput.perDayDurations),
        },
      });
      setInitialTimetableConfig(JSON.stringify(configInput));

      await graphqlRequest(SAVE_CLASS_TIMETABLE, {
        input: {
          schoolId,
          classId,
          academicYearId: activeAcademicYear?.id || "",
          slots,
        },
      });
      setInitialSectionEntries(
        JSON.stringify(
          sectionEntries.map((e) => ({
            day: e.day,
            period: e.period,
            subjectId: e.subjectId,
            teacherId: e.teacherId,
            spanPeriods: e.spanPeriods || 1,
          }))
        )
      );
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to save schedule:", err);
      alert(err instanceof Error ? err.message : "Failed to save schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CurriculumErrorBoundary>
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB]">
        {!isHubChild && (
          <>
            <TopBar
              title="Curriculum & Subject Mapping"
              subtitle="Design academic structures, manage subjects, and assign faculty"
              actions={
                <div className="flex gap-3">
                  <button className="btn-outline h-10 px-5 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all">
                    <span className="material-symbols-outlined text-lg">
                      download
                    </span>
                    Export Schema
                  </button>
                </div>
              }
            />

            {/* Tabs Navigation */}
            <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
              <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="flex gap-8 overflow-x-auto no-scrollbar">
                  {[
                    { id: "master", label: "Subject Master", icon: "book_4" },
                    {
                      id: "grades",
                      label: "Grade Templates",
                      icon: "account_tree",
                    },
                    {
                      id: "mapping",
                      label: "Teacher Mapping",
                      icon: "assignment_ind",
                    },
                    {
                      id: "timetable",
                      label: "Weekly Timetable",
                      icon: "calendar_view_week",
                    },
                  ].map((t) => {
                    const isActive = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleTabChange(t.id)}
                        className={cn(
                          "flex items-center gap-2.5 pb-4 pt-6 text-[14px] font-semibold tracking-tight transition-all relative shrink-0",
                          isActive
                            ? "text-foreground"
                            : "text-[#B0AFA8] hover:text-foreground/70",
                        )}
                      >
                        <span
                          className={cn(
                            "material-symbols-outlined text-[20px] transition-all",
                            isActive ? "text-primary" : "",
                          )}
                          style={{
                            fontVariationSettings: isActive
                              ? "'FILL' 1"
                              : "'FILL' 0",
                          }}
                        >
                          {t.icon}
                        </span>
                        {t.label}
                        {isActive && (
                          <motion.div
                            layoutId="curriculumTab"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-10 py-8">
          <div className="max-w-[1400px] mx-auto space-y-8">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/30 flex flex-col min-h-[500px]">
              {/* Header / Search Area (Hidden for Timetable to maximize space) */}
              {activeTab !== "timetable" && (
                <div className="p-3 border-b border-slate-100/50 flex flex-wrap gap-4 items-center justify-between bg-white rounded-t-[24px]">
                  <div className="flex-1">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[20px]">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder={`Search in ${activeTab === "master" ? "Subjects" : activeTab === "grades" ? "Grade Templates" : "Teacher Assignments"}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-base pl-11 pr-4 w-full placeholder:font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MenuDropdown
                      value={sortOrder === "asc" ? "Ascending" : "Descending"}
                      trigger={
                        <button className="btn-outline px-4 gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">
                            {sortOrder === "asc"
                              ? "sort_by_alpha"
                              : "filter_list_off"}
                          </span>
                          {sortOrder === "asc" ? "Ascending" : "Descending"}
                        </button>
                      }
                      items={[
                        {
                          label: "Ascending",
                          onClick: () => setSortOrder("asc"),
                        },
                        {
                          label: "Descending",
                          onClick: () => setSortOrder("desc"),
                        },
                      ]}
                    />

                    <MenuDropdown
                      value={deptFilter}
                      trigger={
                        <button className="btn-outline px-4 gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">
                            filter_list
                          </span>
                          {deptFilter}
                        </button>
                      }
                      items={[
                        {
                          label: "All Departments",
                          onClick: () => setDeptFilter("All Departments"),
                        },
                        ...activeSubjectAreas.map((area: string) => ({
                          label: area,
                          onClick: () => setDeptFilter(area),
                        })),
                      ]}
                    />

                    <div className="h-8 w-px bg-slate-100 mx-1" />

                    {activeTab === "mapping" && (
                      <button
                        onClick={handleAddAdditionalSubject}
                        className="btn-secondary h-10 px-4 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          add_task
                        </span>
                        Custom Mapping
                      </button>
                    )}

                    {activeTab === "grades" && (
                      <button
                        onClick={() => setShowTierDrawer(true)}
                        className="size-10 rounded-xl bg-slate-50 border border-slate-100 text-[#B0AFA8] hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center group relative"
                        title="Manage Academic Tiers"
                      >
                        <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 group-hover:text-primary transition-all">
                          settings
                        </span>
                        <span className="material-symbols-outlined text-[12px] absolute translate-x-[9px] translate-y-[-9px] text-[#B0AFA8] group-hover:text-primary transition-all">
                          account_tree
                        </span>
                      </button>
                    )}

                    {activeTab !== "mapping" && (
                      <button
                        onClick={handleAddAction}
                        className="btn-primary h-10 px-6 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          add
                        </span>
                        {activeTab === "master"
                          ? "New Subject"
                          : "Configure Grade"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Content Table Area */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-20 text-center min-h-[400px]">
                    <span className="material-symbols-outlined text-5xl animate-spin text-primary">
                      sync
                    </span>
                    <p className="text-[13px] font-semibold text-secondary mt-4">
                      Loading Curriculum & Mapping Data...
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-[23px]"
                    >
                      {activeTab === "master" && (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-[#F7F8F4]/50 border-b border-slate-50">
                              {[
                                "Subject Name",
                                "Code",
                                "Category",
                                "Department",
                                "Actions",
                              ].map((h, i) => (
                                <th
                                  key={h}
                                  className={cn(
                                    "px-8 py-4 text-[10px] font-semibold text-[#B0AFA8] tracking-wider uppercase",
                                    i === 4 ? "text-right" : "",
                                  )}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {[...subjects]
                              .sort((a, b) =>
                                sortOrder === "asc"
                                  ? a.name.localeCompare(b.name)
                                  : b.name.localeCompare(a.name),
                              )
                              .filter((s) =>
                                s.name
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()),
                              )
                              .filter(
                                (s) =>
                                  deptFilter === "All Departments" ||
                                  s.department === deptFilter,
                              )
                              .map((sub) => (
                                <tr
                                  key={sub.id}
                                  className="hover:bg-[#F7F8F4]/30 transition-colors group"
                                >
                                  <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                      <span className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">
                                        {sub.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 text-[12px] font-medium text-slate-500">
                                    {sub.code}
                                  </td>
                                  <td className="px-8 py-5">
                                    <span
                                      className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold border capitalize",
                                        sub.category === "Core"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                          : sub.category === "Elective"
                                            ? "bg-blue-50 text-blue-700 border-blue-100"
                                            : sub.category === "Language"
                                              ? "bg-amber-50 text-amber-700 border-amber-100"
                                              : "bg-purple-50 text-purple-700 border-purple-100",
                                      )}
                                    >
                                      {sub.category}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5 text-[length:var(--font-size-input)] font-[var(--font-weight-input)] text-[#444441]">
                                    {sub.department}
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => handleEditSubject(sub)}
                                        className="size-8 rounded-lg text-[#B0AFA8] hover:bg-white hover:text-primary hover:shadow-sm transition-all flex items-center justify-center"
                                        title="Edit Subject"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">
                                          edit
                                        </span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSubject(sub)}
                                        className="size-8 rounded-lg text-[#B0AFA8] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                                        title="Delete Subject"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">
                                          delete
                                        </span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}

                      {activeTab === "grades" && (
                        <div className="flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                            {[...gradeConfigs]
                              .filter((g) =>
                                g.grade
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()),
                              )
                              .sort((a, b) =>
                                sortOrder === "asc"
                                  ? a.grade.localeCompare(b.grade)
                                  : b.grade.localeCompare(a.grade),
                              )
                              .map((config) => {
                                const group = gradeGroups.find((gg) =>
                                  gg.grades.includes(config.grade),
                                );
                                return (
                                  <div
                                    key={config.grade}
                                    className="p-6 rounded-[32px] border border-slate-100 bg-white hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex flex-col h-full cursor-default"
                                  >
                                    <div className="flex justify-between items-start mb-6">
                                      <div>
                                        <h3 className="text-[18px] font-bold text-foreground mb-1">
                                          {config.grade}
                                        </h3>
                                        <p className="text-[11px] font-medium text-[#B0AFA8]">
                                          Default Grade Subjects
                                        </p>
                                      </div>
                                      {group && (
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[9px] font-bold text-[#B0AFA8]">
                                          {group.label}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 flex-1 items-start content-start">
                                      {config.subjects.map((sid) => {
                                        const s = subjects.find(
                                          (sub) => sub.id === sid,
                                        );
                                        if (!s) return null;
                                        return (
                                          <span
                                            key={sid}
                                            className={cn(
                                              "px-2.5 py-1 text-[10px] font-bold rounded-lg border",
                                              s.category === "Core"
                                                ? "bg-emerald-50/50 text-emerald-700 border-emerald-100/50"
                                                : s.category === "Elective"
                                                  ? "bg-blue-50/50 text-blue-700 border-blue-100/50"
                                                  : s.category === "Language"
                                                    ? "bg-amber-50/50 text-amber-700 border-amber-100/50"
                                                    : "bg-purple-50/50 text-purple-700 border-purple-100/50",
                                            )}
                                          >
                                            {s.name}
                                          </span>
                                        );
                                      })}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-medium text-[#B0AFA8]">
                                          {config.subjects.length} Subjects
                                        </span>
                                        <span
                                          onClick={() =>
                                            handleEditGrade(config)
                                          }
                                          className="text-[12px] font-bold text-[#444441] hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group/edit"
                                        >
                                          Edit Template
                                          <span className="material-symbols-outlined text-[16px] group-hover/edit:translate-x-0.5 transition-transform">
                                            arrow_forward
                                          </span>
                                        </span>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleDeleteGrade(config)
                                        }
                                        className="size-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                                        title="Delete Template"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">
                                          delete
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            <button
                              onClick={() => setShowGradeDrawer(true)}
                              className="rounded-[24px] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center gap-3 text-[#B0AFA8] hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group min-h-[220px]"
                            >
                              <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                                add_circle
                              </span>
                              <span className="text-[13px] font-bold">
                                Add Grade Template
                              </span>
                              <span className="text-[11px] font-medium text-center opacity-80 px-4">
                                Create a new default subject package for a
                                specific grade level.
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {activeTab === "mapping" && (
                        <div className="flex flex-col bg-white">
                          {[...sections]
                            .sort((a, b) => {
                              const keyA = `${a.grade}-${a.id}`;
                              const keyB = `${b.grade}-${b.id}`;
                              return sortOrder === "asc"
                                ? keyA.localeCompare(keyB)
                                : keyB.localeCompare(keyA);
                            })
                            .filter((s) => {
                              const fullSearch =
                                `${s.grade} ${s.id}`.toLowerCase();
                              const shortSearch =
                                `${s.grade.replace("Grade ", "")} ${s.id}`.toLowerCase();
                              const normalizedTerm = searchTerm.toLowerCase();
                              return (
                                fullSearch.includes(normalizedTerm) ||
                                shortSearch.includes(normalizedTerm)
                              );
                            })
                            .map((s) => {
                              const gradeConfig = gradeConfigs.find(
                                (gc) => gc.grade === s.grade,
                              );
                              const sectionMappings = mappings.filter(
                                (m) =>
                                  m.grade === s.grade && m.section === s.id,
                              );

                              // Merge template subjects and additional subjects
                              const templateSubjectIds =
                                gradeConfig?.subjects || [];
                              const additionalSubjectIds = sectionMappings
                                .filter((m) => m.isAdditional)
                                .map((m) => m.subjectId);
                              const allSubjectIds = Array.from(
                                new Set([
                                  ...templateSubjectIds,
                                  ...additionalSubjectIds,
                                ]),
                              );

                              return (
                                <div
                                  key={`${s.grade}-${s.id}`}
                                  className="group px-8 py-10 border-b border-slate-100 hover:bg-[#F9F9F8]/40 transition-all flex flex-col lg:flex-row gap-12 lg:gap-16 items-start"
                                >
                                  <div className="w-24 shrink-0 flex flex-col pt-1">
                                    <span className="text-[12px] font-bold text-[#B0AFA8] mb-2">
                                      Grade
                                    </span>
                                    <h4 className="text-[28px] font-bold text-secondary leading-none">
                                      {s.grade.replace("Grade ", "")} {s.id}
                                    </h4>
                                  </div>

                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
                                    {allSubjectIds.map((sid) => {
                                      const sub = subjects.find(
                                        (sub) => sub.id === sid,
                                      );
                                      const mapping = sectionMappings.find(
                                        (m) => m.subjectId === sid,
                                      );
                                      const isFromTemplate =
                                        templateSubjectIds.includes(sid);

                                      // Skip if department filter is active and doesn't match
                                      if (
                                        deptFilter !== "All Departments" &&
                                        sub?.department !== deptFilter
                                      )
                                        return null;

                                      return (
                                        <div
                                          key={sid}
                                          className="flex flex-col gap-1 relative group/item"
                                        >
                                          <div
                                            className={cn(
                                              "absolute -left-6 top-0 bottom-0 w-[1px] transition-colors",
                                              mapping
                                                ? "bg-slate-100 group-hover/item:bg-primary"
                                                : "bg-red-100/50 group-hover/item:bg-red-400",
                                            )}
                                          />
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={cn(
                                                "text-[14px] font-bold leading-tight",
                                                mapping
                                                  ? "text-[#444441]"
                                                  : "text-[#B0AFA8]",
                                              )}
                                            >
                                              {sub?.name}
                                            </span>
                                            {!isFromTemplate && (
                                              <div className="size-1 rounded-full bg-primary" />
                                            )}
                                            {!mapping && (
                                              <span className="text-[8px] font-bold text-red-400">
                                                Required
                                              </span>
                                            )}
                                          </div>
                                          {!isFromTemplate && mapping && (
                                            <button
                                              onClick={() =>
                                                handleDeleteMapping(mapping.id)
                                              }
                                              className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all z-10"
                                              title="Remove Custom Subject"
                                            >
                                              <span className="material-symbols-outlined text-[16px]">
                                                delete
                                              </span>
                                            </button>
                                          )}
                                          <div className="flex flex-col pr-4">
                                            <select
                                              className="bg-transparent border-none p-0 text-[11px] font-medium text-secondary focus:ring-0 cursor-pointer outline-none w-full"
                                              value={mapping?.teacherId || ""}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                if (val) {
                                                  handleQuickAssign(
                                                    s.grade,
                                                    s.id,
                                                    sid,
                                                    val,
                                                    isFromTemplate,
                                                  );
                                                }
                                              }}
                                            >
                                              <option
                                                value=""
                                                disabled
                                                className="text-slate-400"
                                              >
                                                Assign Teacher
                                              </option>
                                              {teachers
                                                .filter((t) =>
                                                  t.specializations.includes(
                                                    sid,
                                                  ),
                                                )
                                                .map((t) => (
                                                  <option
                                                    key={t.id}
                                                    value={t.id}
                                                    className="text-[#444441]"
                                                  >
                                                    {t.name}
                                                  </option>
                                                ))}
                                            </select>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {/* Add Custom Subject Trigger (Ultra-Minimal Link) */}
                                    <div className="flex items-center pt-1">
                                      <button
                                        onClick={() => {
                                          setEditingMapping({
                                            id: "",
                                            grade: s.grade,
                                            section: s.id,
                                            subjectId: "",
                                            teacherId: "",
                                            hoursPerWeek: 4,
                                            isAdditional: true,
                                          });
                                          setIsAddingAdditional(true);
                                          setShowMappingDrawer(true);
                                        }}
                                        className="flex items-center gap-1.5 text-[#B0AFA8] hover:text-primary transition-all group/plus active:scale-95"
                                      >
                                        <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform duration-300">
                                          add
                                        </span>
                                        <span className="text-[11px] font-bold tracking-tight">
                                          Add Custom
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {activeTab === "timetable" && (
                        <div className="flex flex-col bg-[#FDFCFB]/50 backdrop-blur-sm rounded-[24px] -mx-[1px] w-[calc(100%+2px)] border-x border-slate-100">
                          {/* Hierarchical Section Selector (Sleek Typographic Index) */}
                          <div className="px-10 py-8 bg-white border-b border-x border-slate-100 flex flex-col gap-12 rounded-t-[24px] -mx-[1px] w-[calc(100%+2px)]">
                            {/* 1. Academic Index (Grades) */}
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3">
                                <span className="text-[length:var(--font-size-input)] font-[var(--font-weight-input)] text-[var(--text-color-label)] tracking-tight">
                                  Academic index
                                </span>
                                <div className="h-px flex-1 bg-slate-50" />
                              </div>
                              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                                {gradeConfigs.map((config) => (
                                  <button
                                    key={config.grade}
                                    onClick={() => {
                                      setSelectedTimetableGrade(config.grade);
                                      setSelectedTimetableSection("");
                                    }}
                                    className={cn(
                                      "text-[15px] transition-all relative py-1",
                                      selectedTimetableGrade === config.grade
                                        ? "font-semibold text-secondary"
                                        : "font-medium text-slate-400 hover:text-secondary",
                                    )}
                                  >
                                    {config.grade}
                                    {selectedTimetableGrade ===
                                      config.grade && (
                                      <motion.div
                                        layoutId="grade-underline"
                                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary"
                                      />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 2. Class Roster (Sections) */}
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3">
                                <span className="text-[length:var(--font-size-input)] font-[var(--font-weight-input)] text-[var(--text-color-label)] tracking-tight">
                                  Section roster
                                </span>
                                <div className="h-px flex-1 bg-slate-50" />
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                                {sections
                                  .filter(
                                    (s) => s.grade === selectedTimetableGrade,
                                  )
                                  .map((s) => (
                                    <button
                                      key={`${s.grade}-${s.id}`}
                                      onClick={() =>
                                        setSelectedTimetableSection(
                                          `${s.grade}-${s.id}`,
                                        )
                                      }
                                      className={cn(
                                        "size-8 rounded-full text-[13px] transition-all flex items-center justify-center",
                                        selectedTimetableSection ===
                                          `${s.grade}-${s.id}`
                                          ? "font-semibold text-white bg-primary shadow-lg shadow-primary/20"
                                          : "font-medium text-slate-400 hover:text-secondary hover:bg-slate-50",
                                      )}
                                    >
                                      {s.id}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          </div>

                          {/* 3. Selection Summary Overlay (Independent Sticky Bar) */}
                          {selectedTimetableSection && (
                            <div className="sticky top-[-1px] z-30 bg-white border-b border-x border-slate-100 px-10 py-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500 -mx-[1px] w-[calc(100%+2px)]">
                              <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[20px]">
                                    check_circle
                                  </span>
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="text-[11px] font-bold text-[#B0AFA8] tracking-tight">
                                    Active View
                                  </span>
                                  <span className="text-[14px] font-bold text-secondary">
                                    {selectedTimetableGrade} — Section{" "}
                                    {selectedTimetableSection.split("-")[1]}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div
                                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group/toggle"
                                  onClick={() =>
                                    setStickyDayHeaders(!stickyDayHeaders)
                                  }
                                >
                                  <div
                                    className={cn(
                                      "w-7 h-4 rounded-full relative transition-all duration-300",
                                      stickyDayHeaders
                                        ? "bg-primary"
                                        : "bg-slate-200",
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "absolute top-0.5 size-3 rounded-full bg-white transition-all duration-300",
                                        stickyDayHeaders
                                          ? "left-[13px]"
                                          : "left-0.5",
                                      )}
                                    />
                                  </div>
                                  <span className="text-[10px] font-medium text-[#B0AFA8] group-hover/toggle:text-secondary transition-colors ">
                                    Day rows always at top
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() =>
                                      setShowSchedulePanel(!showSchedulePanel)
                                    }
                                    className={cn(
                                      "h-10 px-6 rounded-xl text-[12px] font-bold flex items-center gap-2 transition-all",
                                      showSchedulePanel
                                        ? "bg-secondary text-white shadow-inner"
                                        : "bg-white border border-slate-100 text-[#B0AFA8] hover:bg-[#F7F8F4] hover:text-foreground hover:shadow-sm",
                                    )}
                                  >
                                    <span className="material-symbols-outlined text-[18px]">
                                      {showSchedulePanel
                                        ? "expand_less"
                                        : "settings_input_component"}
                                    </span>
                                    <span>
                                      {configSaved && !showSchedulePanel
                                        ? "Configured"
                                        : "Configure"}
                                    </span>
                                  </button>
                                  <button
                                    onClick={handleSaveSchedule}
                                    disabled={isSaving || isTimetableLoading}
                                    className="btn-primary gap-2 disabled:opacity-60"
                                  >
                                    {isSaving ? (
                                      <span className="material-symbols-outlined text-[18px] animate-spin">
                                        sync
                                      </span>
                                    ) : (
                                      <span className="material-symbols-outlined text-[18px]">
                                        save
                                      </span>
                                    )}
                                    <span>
                                      {isSaving ? "Saving..." : "Save Schedule"}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Schedule Config Panel */}
                          <AnimatePresence>
                            {showSchedulePanel && (
                              <motion.div
                                ref={configPanelRef}
                                key="cfg-panel"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                  height: "auto",
                                  opacity: 1,
                                  transition: {
                                    height: {
                                      type: "spring",
                                      stiffness: 90,
                                      damping: 24,
                                      mass: 1.2,
                                    },
                                    opacity: { duration: 0.4, ease: "easeOut" },
                                  },
                                }}
                                exit={{
                                  height: 0,
                                  opacity: 0,
                                  transition: {
                                    height: {
                                      duration: 0.3,
                                      ease: [0.4, 0, 0.2, 1],
                                    },
                                    opacity: { duration: 0.2 },
                                  },
                                }}
                                style={{ overflow: "hidden" }}
                                className="bg-[#FDFCFB]/50 border-b border-slate-100/50"
                              >
                                <div className="px-8 py-12">
                                  <div className="flex flex-col gap-12">
                                    {/* Curriculum Configuration Section */}
                                    <div className="flex items-center gap-2.5">
                                      <span className="material-symbols-outlined text-[18px] text-primary">
                                        calendar_view_day
                                      </span>
                                      <span className="text-[16px] font-bold text-foreground tracking-tight">
                                        Curriculum Configuration
                                      </span>
                                    </div>
                                    {/* Working days */}
                                    <div className="flex flex-col gap-2.5">
                                      <span className="text-[12px] font-semibold text-[#B0AFA8]">
                                        Operational days
                                      </span>
                                      <div className="flex flex-wrap gap-2">
                                        {ALL_WEEK.map((d) => {
                                          const isActive =
                                            activeDays.includes(d);
                                          const isSun = d === "Sunday";
                                          return (
                                            <button
                                              key={d}
                                              onClick={() =>
                                                setActiveDays((prev) =>
                                                  prev.includes(d)
                                                    ? prev.length > 1
                                                      ? prev.filter(
                                                          (x) => x !== d,
                                                        )
                                                      : prev
                                                    : [
                                                        ...ALL_WEEK.filter(
                                                          (w) =>
                                                            [
                                                              ...prev,
                                                              d,
                                                            ].includes(w),
                                                        ),
                                                      ],
                                                )
                                              }
                                              className={cn(
                                                "h-9 px-4 rounded-lg text-[11px] font-bold border transition-all",
                                                isActive
                                                  ? isSun
                                                    ? "bg-rose-500 text-white border-rose-500"
                                                    : "bg-secondary text-white border-secondary"
                                                  : "bg-[#F7F8F4] border-slate-100 text-[#B0AFA8] hover:border-slate-200",
                                              )}
                                            >
                                              {d.slice(0, 3)}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    <div className="flex items-end gap-14 flex-wrap">
                                      <div className="flex flex-col gap-2.5">
                                        <span className="text-[12px] font-semibold text-[#B0AFA8]">
                                          School starts
                                        </span>
                                        <AppTimePicker
                                          value={scheduleConfig.schoolStart}
                                          onChange={(time) =>
                                            setScheduleConfig((prev) => ({
                                              ...prev,
                                              schoolStart: time,
                                            }))
                                          }
                                          width="w-[130px]"
                                        />
                                      </div>
                                      <div className="flex flex-col gap-2.5">
                                        <span className="text-[12px] font-semibold text-[#B0AFA8]">
                                          Session duration
                                        </span>
                                        <div className="flex items-center gap-2.5">
                                          <input
                                            type="number"
                                            min={5}
                                            max={180}
                                            value={
                                              scheduleConfig.defaultDuration
                                            }
                                            onChange={(e) =>
                                              setScheduleConfig((prev) => ({
                                                ...prev,
                                                defaultDuration:
                                                  parseInt(e.target.value) ||
                                                  60,
                                              }))
                                            }
                                            disabled={
                                              !scheduleConfig.uniformDuration
                                            }
                                            className="h-10 w-16 px-3 text-center rounded-lg border border-slate-100 text-[13px] font-semibold text-foreground outline-none focus:border-primary/40 focus:bg-white bg-[#F7F8F4] disabled:opacity-40 transition-all"
                                          />
                                          <span className="text-[12px] text-[#B0AFA8] font-bold">
                                            min
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2.5">
                                        <span className="text-[12px] font-semibold text-[#B0AFA8]">
                                          Daily periods
                                        </span>
                                        <div className="flex items-center gap-1 h-10">
                                          <button
                                            onClick={() =>
                                              setNumPeriods((p) =>
                                                Math.max(1, p - 1),
                                              )
                                            }
                                            className="size-8 rounded-lg text-secondary hover:text-primary transition-all flex items-center justify-center"
                                          >
                                            <span className="material-symbols-outlined text-[20px]">
                                              remove
                                            </span>
                                          </button>
                                          <div className="flex items-center justify-center min-w-[28px]">
                                            <span className="text-[16px] font-bold text-foreground leading-none">
                                              {numPeriods}
                                            </span>
                                          </div>
                                          <button
                                            onClick={() =>
                                              setNumPeriods((p) =>
                                                Math.min(16, p + 1),
                                              )
                                            }
                                            className="size-8 rounded-lg text-secondary hover:text-primary transition-all flex items-center justify-center"
                                          >
                                            <span className="material-symbols-outlined text-[20px]">
                                              add
                                            </span>
                                          </button>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2.5">
                                        <span className="text-[12px] font-semibold text-[#B0AFA8]">
                                          Duration type
                                        </span>
                                        <div className="flex bg-[#F7F8F4] border border-slate-100 rounded-xl p-1 h-10 w-fit items-center">
                                          <button
                                            onClick={() =>
                                              setScheduleConfig((prev) => ({
                                                ...prev,
                                                uniformDuration: true,
                                              }))
                                            }
                                            className={cn(
                                              "h-full px-4 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-2",
                                              scheduleConfig.uniformDuration
                                                ? "bg-secondary text-white shadow-sm"
                                                : "text-[#B0AFA8] hover:text-secondary",
                                            )}
                                          >
                                            <span className="material-symbols-outlined text-[16px]">
                                              linear_scale
                                            </span>
                                            Uniform
                                          </button>
                                          <button
                                            onClick={() =>
                                              setScheduleConfig((prev) => ({
                                                ...prev,
                                                uniformDuration: false,
                                              }))
                                            }
                                            className={cn(
                                              "h-full px-4 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-2",
                                              !scheduleConfig.uniformDuration
                                                ? "bg-secondary text-white shadow-sm"
                                                : "text-[#B0AFA8] hover:text-secondary",
                                            )}
                                          >
                                            <span className="material-symbols-outlined text-[16px]">
                                              ssid_chart
                                            </span>
                                            Variable
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    {!scheduleConfig.uniformDuration && (
                                      <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-x-4 gap-y-3 pt-6 border-t border-slate-50">
                                        {periods.map((p) => (
                                          <div
                                            key={p}
                                            className="flex flex-col items-center gap-1.5"
                                          >
                                            <span className="text-[11px] text-[#B0AFA8] font-semibold">
                                              P{p}
                                            </span>
                                            <input
                                              type="number"
                                              min={5}
                                              max={180}
                                              value={
                                                periodDurations[p] ||
                                                scheduleConfig.defaultDuration
                                              }
                                              onChange={(e) =>
                                                setPeriodDurations((prev) => ({
                                                  ...prev,
                                                  [p]:
                                                    parseInt(e.target.value) ||
                                                    scheduleConfig.defaultDuration,
                                                }))
                                              }
                                              className="h-10 w-14 text-center rounded-xl border border-slate-100 text-[13px] font-bold text-foreground outline-none focus:border-primary/40 bg-[#F7F8F4] focus:bg-white transition-all"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {/* Moved Day Overrides Here */}
                                    <div className="pt-6 border-t border-slate-50">
                                      <div className="flex items-center gap-2.5 mb-4">
                                        <span className="material-symbols-outlined text-[16px] text-primary">
                                          calendar_today
                                        </span>
                                        <span className="text-[13px] font-bold text-foreground">
                                          Day Overrides
                                        </span>
                                      </div>
                                      <div className="flex flex-col gap-3">
                                        <p className="text-[11px] text-[#B0AFA8] font-medium leading-relaxed">
                                          Assign custom period lengths for
                                          specific operational days.
                                        </p>
                                        <div className="flex gap-1.5">
                                          {days.map((d) => {
                                            const hasOverride =
                                              !!perDayDurations[d] &&
                                              Object.keys(perDayDurations[d])
                                                .length > 0;
                                            return (
                                              <button
                                                key={d}
                                                onClick={() =>
                                                  setPerDayDurations((prev) => {
                                                    if (prev[d]) {
                                                      const next = { ...prev };
                                                      delete next[d];
                                                      return next;
                                                    }
                                                    return { ...prev, [d]: {} };
                                                  })
                                                }
                                                className={cn(
                                                  "h-8 flex-1 rounded-lg text-[10px] font-bold border transition-all",
                                                  hasOverride
                                                    ? "bg-secondary text-white border-secondary"
                                                    : "bg-[#F7F8F4] border-slate-100 text-[#B0AFA8] hover:border-slate-200",
                                                )}
                                              >
                                                {d.slice(0, 3)}
                                              </button>
                                            );
                                          })}
                                        </div>
                                        {Object.keys(perDayDurations).map(
                                          (day) => (
                                            <div
                                              key={day}
                                              className="bg-white rounded-xl border border-slate-100/80 p-3 transition-colors"
                                            >
                                              <div className="flex items-center justify-between mb-3 px-0.5">
                                                <div className="flex items-center gap-2">
                                                  <div className="size-1 rounded-full bg-primary/60" />
                                                  <span className="text-[12px] font-semibold text-foreground/80 tracking-tight">
                                                    {day}
                                                  </span>
                                                </div>
                                                <button
                                                  onClick={() =>
                                                    setPerDayDurations(
                                                      (prev) => {
                                                        const n = { ...prev };
                                                        delete n[day];
                                                        return n;
                                                      },
                                                    )
                                                  }
                                                  className="text-[#B0AFA8] hover:text-rose-500 transition-all"
                                                >
                                                  <span className="material-symbols-outlined text-[14px]">
                                                    close
                                                  </span>
                                                </button>
                                              </div>
                                              <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-x-3 gap-y-2">
                                                {periods.map((p) => {
                                                  const baseDur =
                                                    scheduleConfig.uniformDuration
                                                      ? scheduleConfig.defaultDuration
                                                      : periodDurations[p] ||
                                                        scheduleConfig.defaultDuration;
                                                  const val =
                                                    perDayDurations[day]?.[p] ??
                                                    baseDur;
                                                  const isDiff =
                                                    perDayDurations[day]?.[
                                                      p
                                                    ] !== undefined &&
                                                    perDayDurations[day][p] !==
                                                      baseDur;
                                                  return (
                                                    <div
                                                      key={p}
                                                      className="flex flex-col items-center gap-1"
                                                    >
                                                      <span
                                                        className={cn(
                                                          "text-[10px] font-semibold",
                                                          isDiff
                                                            ? "text-primary"
                                                            : "text-[#B0AFA8]/60",
                                                        )}
                                                      >
                                                        P{p}
                                                      </span>
                                                      <input
                                                        type="number"
                                                        min={5}
                                                        max={180}
                                                        value={val}
                                                        onChange={(e) => {
                                                          const v =
                                                            parseInt(
                                                              e.target.value,
                                                            ) || baseDur;
                                                          setPerDayDurations(
                                                            (prev) => ({
                                                              ...prev,
                                                              [day]: {
                                                                ...(prev[day] ||
                                                                  {}),
                                                                [p]: v,
                                                              },
                                                            }),
                                                          );
                                                        }}
                                                        className={cn(
                                                          "h-10 w-14 text-center rounded-xl border text-[13px] font-bold outline-none transition-all",
                                                          isDiff
                                                            ? "border-primary/40 bg-primary/5 text-primary"
                                                            : "border-slate-100 bg-[#F7F8F4] text-secondary focus:bg-white",
                                                        )}
                                                      />
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>

                                    {/* Breaks & Gaps Section */}
                                    <div className="pt-12 border-t border-slate-200/40">
                                      <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-2.5">
                                          <span className="material-symbols-outlined text-[18px] text-primary">
                                            coffee
                                          </span>
                                          <span className="text-[14px] font-bold text-foreground tracking-tight">
                                            Breaks & Gaps
                                          </span>
                                        </div>
                                        <button
                                          onClick={() =>
                                            setBreakConfig((prev) => [
                                              ...prev,
                                              {
                                                id: `b${Date.now()}`,
                                                period:
                                                  periods[
                                                    Math.floor(
                                                      periods.length / 2,
                                                    )
                                                  ],
                                                placement: "after",
                                                duration: 15,
                                                type: "short",
                                                label: "Short Break",
                                                days: [],
                                              },
                                            ])
                                          }
                                          className="h-9 px-4 rounded-xl text-secondary text-[12px] font-bold flex items-center gap-2 hover:bg-secondary/5 transition-all"
                                        >
                                          <span className="material-symbols-outlined text-[18px]">
                                            add
                                          </span>
                                          Add New Break
                                        </button>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        {breakConfig.map((brk) => {
                                          const appliesToAllDays =
                                            brk.days.length === 0;

                                          return (
                                            <div
                                              key={brk.id}
                                              className="group bg-[#FDFCFB]/50 hover:bg-white rounded-xl border border-slate-100 p-3 transition-all flex flex-wrap items-start gap-x-6 gap-y-4"
                                            >
                                              {/* Category & Label */}
                                              <div className="flex flex-col gap-1.5 min-w-[180px] flex-1 lg:flex-none">
                                                <span className="text-[10.5px] font-semibold text-[#B0AFA8] ml-1">
                                                  Type & Name
                                                </span>
                                                <div className="flex items-center gap-3">
                                                  <div className="flex rounded-lg border border-slate-100 overflow-hidden bg-slate-50/50 h-8 p-0.5 shrink-0">
                                                    <button
                                                      onClick={() =>
                                                        setBreakConfig((prev) =>
                                                          prev.map((b) =>
                                                            b.id === brk.id
                                                              ? {
                                                                  ...b,
                                                                  type: "short",
                                                                  label:
                                                                    b.label ===
                                                                      "Lunch Break" ||
                                                                    b.label ===
                                                                      "Special Break"
                                                                      ? "Short Break"
                                                                      : b.label,
                                                                }
                                                              : b,
                                                          ),
                                                        )
                                                      }
                                                      className={cn(
                                                        "px-2 rounded-md transition-all",
                                                        brk.type === "short"
                                                          ? "bg-white text-slate-600 shadow-sm"
                                                          : "text-slate-300 hover:text-slate-500",
                                                      )}
                                                    >
                                                      <span className="material-symbols-outlined text-[14px]">
                                                        free_breakfast
                                                      </span>
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        setBreakConfig((prev) =>
                                                          prev.map((b) =>
                                                            b.id === brk.id
                                                              ? {
                                                                  ...b,
                                                                  type: "lunch",
                                                                  label:
                                                                    b.label ===
                                                                      "Short Break" ||
                                                                    b.label ===
                                                                      "Special Break"
                                                                      ? "Lunch Break"
                                                                      : b.label,
                                                                }
                                                              : b,
                                                          ),
                                                        )
                                                      }
                                                      className={cn(
                                                        "px-2 rounded-md transition-all",
                                                        brk.type === "lunch"
                                                          ? "bg-white text-amber-500 shadow-sm"
                                                          : "text-slate-300 hover:text-slate-500",
                                                      )}
                                                    >
                                                      <span className="material-symbols-outlined text-[14px]">
                                                        restaurant
                                                      </span>
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        setBreakConfig((prev) =>
                                                          prev.map((b) =>
                                                            b.id === brk.id
                                                              ? {
                                                                  ...b,
                                                                  type: "other",
                                                                  label:
                                                                    b.label ===
                                                                      "Short Break" ||
                                                                    b.label ===
                                                                      "Lunch Break"
                                                                      ? "Special Break"
                                                                      : b.label,
                                                                }
                                                              : b,
                                                          ),
                                                        )
                                                      }
                                                      className={cn(
                                                        "px-2 rounded-md transition-all",
                                                        brk.type === "other"
                                                          ? "bg-white text-violet-400 shadow-sm"
                                                          : "text-slate-300 hover:text-slate-500",
                                                      )}
                                                    >
                                                      <span className="material-symbols-outlined text-[14px]">
                                                        timer
                                                      </span>
                                                    </button>
                                                  </div>
                                                  <input
                                                    type="text"
                                                    value={brk.label}
                                                    onChange={(e) =>
                                                      setBreakConfig((prev) =>
                                                        prev.map((b) =>
                                                          b.id === brk.id
                                                            ? {
                                                                ...b,
                                                                label:
                                                                  e.target
                                                                    .value,
                                                              }
                                                            : b,
                                                        ),
                                                      )
                                                    }
                                                    className="bg-transparent border-none text-[12px] font-bold text-foreground outline-none w-full"
                                                    placeholder="Break Label"
                                                  />
                                                </div>
                                              </div>

                                              {/* Timing Group (Placement + Period + Length) */}
                                              <div className="flex items-start gap-4 flex-wrap lg:flex-nowrap">
                                                {/* Placement */}
                                                <div className="flex flex-col gap-1.5 shrink-0">
                                                  <span className="text-[10.5px] font-semibold text-[#B0AFA8]">
                                                    Placement
                                                  </span>
                                                  <div className="flex rounded-lg border border-slate-100 overflow-hidden bg-white h-9 p-1">
                                                    <button
                                                      onClick={() =>
                                                        setBreakConfig((prev) =>
                                                          prev.map((b) =>
                                                            b.id === brk.id
                                                              ? {
                                                                  ...b,
                                                                  placement:
                                                                    "before",
                                                                }
                                                              : b,
                                                          ),
                                                        )
                                                      }
                                                      className={cn(
                                                        "px-3 rounded-md text-[10px] font-bold transition-all",
                                                        brk.placement ===
                                                          "before"
                                                          ? "bg-secondary text-white shadow-sm"
                                                          : "text-[#B0AFA8] hover:text-secondary",
                                                      )}
                                                    >
                                                      Before
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        setBreakConfig((prev) =>
                                                          prev.map((b) =>
                                                            b.id === brk.id
                                                              ? {
                                                                  ...b,
                                                                  placement:
                                                                    "after",
                                                                }
                                                              : b,
                                                          ),
                                                        )
                                                      }
                                                      className={cn(
                                                        "px-3 rounded-md text-[10px] font-bold transition-all",
                                                        brk.placement ===
                                                          "after"
                                                          ? "bg-secondary text-white shadow-sm"
                                                          : "text-[#B0AFA8] hover:text-secondary",
                                                      )}
                                                    >
                                                      After
                                                    </button>
                                                  </div>
                                                </div>

                                                {/* Period & Length */}
                                                <div className="flex items-center gap-3 shrink-0">
                                                  <div className="flex flex-col gap-1.5">
                                                    <span className="text-[10.5px] font-semibold text-[#B0AFA8]">
                                                      Period
                                                    </span>
                                                    <select
                                                      value={brk.period}
                                                      onChange={(e) =>
                                                        setBreakConfig((prev) =>
                                                          prev.map((b) =>
                                                            b.id === brk.id
                                                              ? {
                                                                  ...b,
                                                                  period:
                                                                    parseInt(
                                                                      e.target
                                                                        .value,
                                                                    ),
                                                                }
                                                              : b,
                                                          ),
                                                        )
                                                      }
                                                      className="h-9 px-2 rounded-lg border border-slate-100 text-[11px] font-bold text-foreground outline-none bg-white"
                                                    >
                                                      {periods.map((p) => (
                                                        <option
                                                          key={p}
                                                          value={p}
                                                        >
                                                          P{p}
                                                        </option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                  <div className="flex flex-col gap-1.5">
                                                    <span className="text-[10.5px] font-semibold text-[#B0AFA8]">
                                                      Length
                                                    </span>
                                                    <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-lg h-9 px-2">
                                                      <input
                                                        type="number"
                                                        min={5}
                                                        max={120}
                                                        value={brk.duration}
                                                        onChange={(e) =>
                                                          setBreakConfig(
                                                            (prev) =>
                                                              prev.map((b) =>
                                                                b.id === brk.id
                                                                  ? {
                                                                      ...b,
                                                                      duration:
                                                                        parseInt(
                                                                          e
                                                                            .target
                                                                            .value,
                                                                        ) || 15,
                                                                    }
                                                                  : b,
                                                              ),
                                                          )
                                                        }
                                                        className="w-8 text-center bg-transparent border-none text-[11px] font-bold text-foreground outline-none"
                                                      />
                                                      <span className="text-[9px] text-[#B0AFA8] font-bold">
                                                        min
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Days Selector */}
                                              <div className="flex flex-col gap-1.5 lg:border-l lg:border-slate-100 lg:pl-6">
                                                <span className="text-[10.5px] font-semibold text-[#B0AFA8]">
                                                  Operational Days
                                                </span>
                                                <div className="flex items-center gap-1">
                                                  {days.map((d) => {
                                                    const active =
                                                      appliesToAllDays ||
                                                      brk.days.includes(d);
                                                    return (
                                                      <button
                                                        key={d}
                                                        onClick={() => {
                                                          setBreakConfig(
                                                            (prev) =>
                                                              prev.map((b) => {
                                                                if (
                                                                  b.id !==
                                                                  brk.id
                                                                )
                                                                  return b;
                                                                if (
                                                                  appliesToAllDays
                                                                )
                                                                  return {
                                                                    ...b,
                                                                    days: [d],
                                                                  };
                                                                const newDays =
                                                                  b.days.includes(
                                                                    d,
                                                                  )
                                                                    ? b.days.filter(
                                                                        (x) =>
                                                                          x !==
                                                                          d,
                                                                      )
                                                                    : [
                                                                        ...b.days,
                                                                        d,
                                                                      ];
                                                                return {
                                                                  ...b,
                                                                  days: newDays,
                                                                };
                                                              }),
                                                          );
                                                        }}
                                                        className={cn(
                                                          "h-8 px-3 rounded-lg text-[10px] font-bold transition-all",
                                                          active
                                                            ? "bg-secondary text-white shadow-sm"
                                                            : "bg-white border border-slate-100 text-slate-300 hover:text-slate-400",
                                                        )}
                                                      >
                                                        {d.slice(0, 3)}
                                                      </button>
                                                    );
                                                  })}
                                                  <button
                                                    onClick={() =>
                                                      setBreakConfig((prev) =>
                                                        prev.map((b) =>
                                                          b.id === brk.id
                                                            ? { ...b, days: [] }
                                                            : b,
                                                        ),
                                                      )
                                                    }
                                                    className={cn(
                                                      "h-8 px-4 rounded-lg text-[10px] font-bold transition-all ml-1",
                                                      appliesToAllDays
                                                        ? "bg-primary text-foreground"
                                                        : "bg-slate-50 text-slate-400",
                                                    )}
                                                  >
                                                    All
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Delete */}
                                              <div className="flex-1 flex justify-end pt-5">
                                                <button
                                                  onClick={() =>
                                                    setBreakConfig((prev) =>
                                                      prev.filter(
                                                        (b) => b.id !== brk.id,
                                                      ),
                                                    )
                                                  }
                                                  className="size-7 rounded-lg flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                >
                                                  <span className="material-symbols-outlined text-[16px]">
                                                    delete
                                                  </span>
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      {breakConfig.length === 0 && (
                                        <div className="text-[11px] text-slate-300 font-medium text-center py-6 border border-dashed border-[#EBE8E0] rounded-[16px]">
                                          No breaks configured
                                        </div>
                                      )}
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex items-center justify-end pt-12 border-t border-slate-200/40">
                                      <button
                                        onClick={() => {
                                          setConfigSaved(true);
                                          setShowSchedulePanel(false);
                                          setTimeout(
                                            () =>
                                              timetableRef.current?.scrollIntoView(
                                                {
                                                  behavior: "smooth",
                                                  block: "start",
                                                },
                                              ),
                                            260,
                                          );
                                        }}
                                        className="btn-primary gap-2 shadow-lg shadow-secondary/10"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">
                                          check_circle
                                        </span>
                                        Apply Configuration
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <TimetableGrid
                            days={days}
                            periods={periods}
                            periodConfigByDay={periodConfigByDay}
                            breaksByDay={breaksByDay}
                            breakStartByDay={breakStartByDay}
                            entriesBySlot={entriesBySlot}
                            coveredByDay={coveredByDay}
                            timeTicks={timeTicks}
                            totalDayMinutes={totalDayMinutes}
                            selectedTimetableSection={selectedTimetableSection}
                            scheduleConfig={scheduleConfig}
                            periodDurations={periodDurations}
                            stickyDayHeaders={stickyDayHeaders}
                            mappings={mappings}
                            subjects={subjects}
                            teachers={teachers}
                            onEntriesChange={setTimetableEntries}
                            onPeriodDurationChange={handlePeriodDurationChange}
                            timetableRef={timetableRef}
                            getTeacherConflict={getTeacherConflict}
                          />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {activeTab !== "timetable" && (
                <div className="bg-white rounded-b-[24px]">
                  <TablePagination
                    currentPage={currentPage}
                    totalItems={
                      activeTab === "master"
                        ? subjects.length
                        : activeTab === "grades"
                          ? gradeConfigs.length
                          : mappings.length
                    }
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                    itemName={
                      activeTab === "master"
                        ? "subjects"
                        : activeTab === "grades"
                          ? "templates"
                          : "mappings"
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Global Action Bar (Quiet Luxury Save Mechanism) ── */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6"
            >
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-2 pl-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-2 rounded-full bg-primary animate-pulse" />
                  <div className="flex flex-col">
                    <p className="text-[13px] font-bold text-secondary">
                      Save Changes?
                    </p>
                    <p className="text-[10px] text-[#B0AFA8] font-medium">
                      You have changes that need to be saved.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDiscardChanges}
                    className="h-10 px-6 rounded-xl text-[12px] font-bold text-[#B0AFA8] hover:text-secondary hover:bg-slate-50 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={activeTab === "timetable" ? handleSaveSchedule : handleSaveChanges}
                    className="h-10 px-8 bg-secondary text-white rounded-xl text-[12px] font-bold shadow-lg shadow-secondary/10 hover:bg-secondary/90 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-[18px] text-primary",
                        isSaving && "animate-spin",
                      )}
                    >
                      sync
                    </span>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Confirmation Modal (Quiet Luxury Navigation Guard) ── */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            >
              <div
                className="absolute inset-0 bg-secondary/40 backdrop-blur-sm"
                onClick={() => setShowConfirmModal(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[32px] shadow-2xl p-8 max-w-md w-full relative z-10 border border-slate-100"
              >
                <div className="size-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 border border-amber-100">
                  <span className="material-symbols-outlined text-[28px]">
                    warning
                  </span>
                </div>
                <h3 className="text-[20px] font-bold text-secondary mb-2">
                  Unsaved Changes
                </h3>
                <p className="text-[14px] text-[#B0AFA8] leading-relaxed mb-8">
                  You have pending teacher assignments. Moving to another tab
                  will discard these modifications. Are you sure you want to
                  proceed?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 h-12 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:bg-slate-50 transition-all"
                  >
                    Stay Here
                  </button>
                  <button
                    onClick={confirmNavigation}
                    className="flex-1 h-12 rounded-xl bg-red-50 text-red-600 text-[13px] font-bold hover:bg-red-100 transition-all"
                  >
                    Discard & Move
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drawers */}
        <SideDrawer
          isOpen={showSubjectDrawer}
          onClose={() => {
            setShowSubjectDrawer(false);
            setEditingSubject(null);
          }}
          title={editingSubject ? "Edit Subject" : "Add New Subject"}
          subtitle={
            editingSubject
              ? "Update the details for this academic subject."
              : "Add a new subject to your school library. Once added, you can assign it to grades and teachers."
          }
        >
          <SubjectForm
            initialData={editingSubject}
            onClose={() => {
              setShowSubjectDrawer(false);
              setEditingSubject(null);
            }}
            onSubmit={onAddSubject}
          />
        </SideDrawer>

        <SideDrawer
          isOpen={showGradeDrawer}
          onClose={() => {
            setShowGradeDrawer(false);
            setEditingGrade(null);
          }}
          title={editingGrade ? "Edit Grade Template" : "Set Grade Subjects"}
          subtitle="Choose which subjects are taught by default for this grade. These will be added to all sections automatically."
        >
          <GradeConfigForm
            subjects={subjects}
            gradeOptions={activeGrades}
            initialData={editingGrade}
            onClose={() => {
              setShowGradeDrawer(false);
              setEditingGrade(null);
            }}
            onSubmit={onAddGradeConfig}
          />
        </SideDrawer>

        <SideDrawer
          isOpen={showMappingDrawer}
          onClose={() => {
            setShowMappingDrawer(false);
            setEditingMapping(null);
          }}
          title={
            editingMapping
              ? "Update Assignment"
              : isAddingAdditional
                ? "Assign Custom Subject"
                : "Assign Teacher"
          }
          subtitle="Assign a teacher to a specific subject and class. We will show a warning if the teacher’s profile doesn’t match."
        >
          <MappingForm
            subjects={subjects}
            teachers={teachers}
            mappings={mappings}
            gradeConfigs={gradeConfigs}
            initialData={editingMapping}
            isAdditional={isAddingAdditional}
            onClose={() => {
              setShowMappingDrawer(false);
              setEditingMapping(null);
            }}
            onSubmit={onAddMapping}
          />
        </SideDrawer>

        <SideDrawer
          isOpen={showTierDrawer}
          onClose={() => setShowTierDrawer(false)}
          title="Group Grades"
          subtitle="Organize your grades into groups like Primary, Secondary, or High School."
        >
          <TierManagementForm
            groups={gradeGroups}
            setGroups={setGradeGroups}
          />
        </SideDrawer>

        <DeleteConfirmationModal
          isOpen={!!subjectToDelete}
          onClose={() => setSubjectToDelete(null)}
          name={subjectToDelete?.name || ""}
          onConfirm={onConfirmDeleteSubject}
        />

        <DeleteConfirmationModal
          isOpen={!!gradeToDelete}
          onClose={() => setGradeToDelete(null)}
          name={gradeToDelete?.grade || ""}
          onConfirm={onConfirmDeleteGrade}
        />
      </div>
    </CurriculumErrorBoundary>
  );
};

// --- Functional Components (Drawers & Forms) ---

const SubjectForm = ({
  onClose,
  onSubmit,
  initialData,
}: {
  onClose: () => void;
  onSubmit: (data: Omit<Subject, "id">) => void;
  initialData: Subject | null;
}) => {
  const ACADEMIC_AREAS = [
    "Mathematics",
    "Science",
    "Humanities",
    "Languages",
    "Arts",
    "Technology",
    "Administration",
    "Sports",
  ];
  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [category, setCategory] = useState(initialData?.category || "Core");

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-8 flex-1">
        <FormGroup
          label="Subject Name"
          placeholder="e.g. Political Science"
          value={name}
          onChange={setName}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormGroup
            label="Subject Code"
            placeholder="e.g. POL-101"
            value={code}
            onChange={setCode}
          />
          <div className="space-y-2.5 group">
            <span className="text-[length:var(--font-size-label)] font-[var(--font-weight-label)] text-[var(--text-color-label)] px-1 group-focus-within:text-foreground transition-colors block">
              Subject Area
            </span>
            <AppDropdown
              options={ACADEMIC_AREAS}
              value={department}
              onChange={setDepartment}
              placeholder="e.g. Science"
              searchable
            />
            {department && (
              <div className="flex gap-2 mt-2 px-1 items-start">
                <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">
                  info
                </span>
                <p className="text-[length:var(--font-size-small)] text-[var(--text-color-body-muted)] font-medium leading-relaxed">
                  <span className="text-primary font-bold">
                    {department} includes:
                  </span>{" "}
                  {department === "Mathematics"
                    ? "Algebra, Geometry, Calculus, Statistics"
                    : department === "Science"
                      ? "Physics, Chemistry, Biology, Environmental Science"
                      : department === "Humanities"
                        ? "History, Geography, Political Science, Economics"
                        : department === "Languages"
                          ? "English, Literature, Regional Languages, Foreign Languages"
                          : department === "Arts"
                            ? "Music, Dance, Visual Arts, Drama, Photography"
                            : department === "Technology"
                              ? "Computer Science, AI, Robotics, ICT, Web Design"
                              : department === "Administration"
                                ? "Business Studies, Accountancy, Entrepreneurship, Ethics"
                                : department === "Sports"
                                  ? "Physical Education, Yoga, Athletics, Health & Fitness"
                                  : ""}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 group">
          <span className="text-[length:var(--font-size-label)] font-[var(--font-weight-label)] text-[var(--text-color-label)] px-1 group-focus-within:text-foreground transition-colors block">
            Category Type
          </span>
          <AppDropdown
            options={[
              "Core (Mandatory)",
              "Elective (Optional)",
              "Language",
              "Co-Scholastic (Arts/Sports)",
            ]}
            value={
              category === "Core"
                ? "Core (Mandatory)"
                : category === "Elective"
                  ? "Elective (Optional)"
                  : category
            }
            onChange={(val) =>
              setCategory(val.split(" ")[0] as Subject["category"])
            }
            placeholder="Select category"
          />
        </div>
      </div>
      <div className="p-8 border-t border-slate-50 bg-[#FBFBFA] flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl text-[length:var(--font-size-input)] font-[var(--font-weight-input)] text-[var(--text-color-body-muted)] hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit({ name, code, department, category })}
          className="flex-[2] btn-primary h-12 rounded-xl text-[length:var(--font-size-input)] font-[var(--font-weight-input)] shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {initialData ? "Update Subject" : "Create Subject"}
        </button>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  name,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  onConfirm: () => void;
}) => {
  const [confirmText, setConfirmText] = useState("");
  const isMatched = confirmText.toLowerCase() === name.toLowerCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-red-100 overflow-hidden"
          >
            <div className="p-8 text-center space-y-6">
              <div className="size-20 rounded-[24px] bg-red-50 flex items-center justify-center text-red-600 mx-auto animate-pulse">
                <span className="material-symbols-outlined text-[40px]">
                  delete_forever
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-[20px] font-bold text-foreground tracking-tight">
                  Delete this subject?
                </h3>
                <p className="text-[length:var(--font-size-input)] text-[#444441] leading-relaxed">
                  Permanently remove{" "}
                  <span className="font-bold text-foreground">{name}</span> from
                  the library. This will affect all grade templates.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[length:var(--font-size-small)] font-[var(--font-weight-label)] text-[var(--text-color-label)] capitalize tracking-normal">
                  Type <span className="text-foreground">{name}</span> to
                  confirm
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={name}
                  className="w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-[14px] px-6 text-center text-[length:var(--font-size-body)] font-[var(--font-weight-input)] text-foreground focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-6 bg-red-50/30 border-t border-red-50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl text-[length:var(--font-size-input)] font-[var(--font-weight-input)] text-[var(--text-color-label)] hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!isMatched}
                onClick={onConfirm}
                className="flex-[2] btn-danger h-12 rounded-2xl transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const GradeConfigForm = ({
  subjects,
  gradeOptions,
  onClose,
  onSubmit,
  initialData,
}: {
  subjects: Subject[];
  gradeOptions: string[];
  onClose: () => void;
  onSubmit: (data: GradeConfig) => void;
  initialData: GradeConfig | null;
}) => {
  const [grade, setGrade] = useState(initialData?.grade || "");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialData?.subjects || [],
  );
  const [formSearch, setFormSearch] = useState("");

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
        <FormGroup
          label="Target Grade Level"
          type="select"
          options={gradeOptions}
          value={grade}
          onChange={setGrade}
        />

        <div className="space-y-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search subjects..."
              className="w-full h-10 pl-10 pr-4 bg-[#F7F8F4] border border-slate-200 rounded-xl text-[length:var(--font-size-input)] outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
              value={formSearch}
              onChange={(e) => setFormSearch(e.target.value)}
            />
          </div>

          {["Core", "Elective", "Language", "Co-Scholastic"].map((cat) => {
            const catSubjects = subjects
              .filter((s) => s.category === cat)
              .filter(
                (s) =>
                  s.name.toLowerCase().includes(formSearch.toLowerCase()) ||
                  s.code.toLowerCase().includes(formSearch.toLowerCase()),
              );

            if (catSubjects.length === 0) return null;

            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div
                    className={cn(
                      "size-1.5 rounded-full",
                      cat === "Core"
                        ? "bg-emerald-400"
                        : cat === "Elective"
                          ? "bg-blue-400"
                          : cat === "Language"
                            ? "bg-amber-400"
                            : "bg-purple-400",
                    )}
                  />
                  <span className="text-[length:var(--font-size-small)] font-medium text-[var(--text-color-label)]">
                    {cat}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {catSubjects.map((s) => (
                    <label
                      key={s.id}
                      aria-label={s.name}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all duration-200 group/item relative overflow-hidden",
                        selectedSubjects.includes(s.id)
                          ? "bg-primary/5 border-primary/40"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50",
                      )}
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(s.id)}
                          onChange={() => toggleSubject(s.id)}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            "size-5 rounded-lg border flex items-center justify-center transition-all duration-200",
                            selectedSubjects.includes(s.id)
                              ? "bg-primary border-primary text-white scale-110"
                              : "bg-slate-100 border-slate-200 group-hover/item:border-slate-300",
                          )}
                        >
                          {selectedSubjects.includes(s.id) && (
                            <span className="material-symbols-outlined text-[14px] font-bold animate-in zoom-in duration-200">
                              check
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={cn(
                            "text-[length:var(--font-size-input)] font-[var(--font-weight-input)] truncate leading-tight transition-colors",
                            selectedSubjects.includes(s.id)
                              ? "text-foreground"
                              : "text-[#444441] group-hover/item:text-foreground",
                          )}
                        >
                          {s.name}
                        </span>
                        <span className="text-[length:var(--font-size-small)] text-[var(--text-color-label)] font-medium tracking-wide">
                          {s.code}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-8 border-t border-slate-50 bg-[#FBFBFA] flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl text-[length:var(--font-size-input)] font-[var(--font-weight-input)] text-[var(--text-color-label)] hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit({ grade, subjects: selectedSubjects })}
          disabled={selectedSubjects.length === 0}
          className="flex-[2] btn-primary h-12 rounded-xl text-[length:var(--font-size-input)] font-[var(--font-weight-input)] shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          {initialData ? "Update Template" : "Save Template"}
        </button>
      </div>
    </div>
  );
};

const MappingForm = ({
  subjects,
  teachers,
  mappings,
  initialData,
  isAdditional,
  onClose,
  onSubmit,
  gradeConfigs,
}: {
  subjects: Subject[];
  teachers: Teacher[];
  mappings: Mapping[];
  initialData: Mapping | null;
  isAdditional: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Mapping, "id">) => void;
  gradeConfigs: GradeConfig[];
}) => {
  const [grade, setGrade] = useState(initialData?.grade || "");
  const [section, setSection] = useState(initialData?.section || "");
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || "");
  const [teacherId, setTeacherId] = useState(initialData?.teacherId || "");

  // Update when initialData changes (for contextual + button)
  useEffect(() => {
    if (initialData) {
      if (initialData.grade) setGrade(initialData.grade);
      if (initialData.section) setSection(initialData.section);
      if (initialData.subjectId) setSubjectId(initialData.subjectId);
      if (initialData.teacherId) setTeacherId(initialData.teacherId);
    }
  }, [initialData]);

  const isFormValid = grade && section && subjectId && teacherId;

  // Derived warning intelligence
  const selectedTeacher = teachers.find((t) => t.id === teacherId);
  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const scopeMismatch =
    selectedTeacher && !selectedTeacher.teachingScope.includes(grade);
  const specMismatch =
    selectedTeacher && !selectedTeacher.specializations.includes(subjectId);

  // Teacher workload calculation
  const teacherMappings = (mappings || []).filter(
    (m) => m.teacherId === teacherId,
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-6 flex-1 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <FormGroup
            label="Grade"
            type="select"
            options={gradeConfigs.map((g) => g.grade)}
            value={grade}
            onChange={setGrade}
          />
          <FormGroup
            label="Section"
            placeholder="e.g. A"
            value={section}
            onChange={setSection}
          />
        </div>

        <FormGroup
          label="Select Subject"
          type="select"
          options={[
            { val: "", label: "Choose a Subject", disabled: true },
            ...subjects.map((s) => ({ val: s.id, label: s.name })),
          ]}
          value={subjectId}
          onChange={setSubjectId}
          icon="subject"
        />

        <FormGroup
          label="Assign Teacher"
          type="select"
          options={[
            { val: "", label: "Choose a Teacher", disabled: true },
            ...teachers.map((t) => ({ val: t.id, label: t.name })),
          ]}
          value={teacherId}
          onChange={setTeacherId}
          icon="person"
        />

        {/* ── Soft Warning Engine ── */}
        {selectedTeacher && (
          <div className="space-y-3">
            {/* Scope Warning — Amber */}
            {scopeMismatch && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">
                  warning
                </span>
                <div>
                  <p className="text-[12px] font-bold text-amber-800 mb-1">
                    Grade Scope Mismatch
                  </p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    <span className="font-bold">{selectedTeacher.name}</span> is
                    not currently assigned to teach{" "}
                    <span className="font-bold">{grade}</span>. Their approved
                    scope is: {selectedTeacher.teachingScope.join(", ")}.
                    <span className="block mt-1 text-[10px] text-amber-600 italic">
                      You may still proceed — this warning is advisory only.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Specialization Warning — Blue */}
            {specMismatch && selectedSubject && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
                <span className="material-symbols-outlined text-blue-500 text-[20px] mt-0.5">
                  info
                </span>
                <div>
                  <p className="text-[12px] font-bold text-blue-800 mb-1">
                    Subject Specialization Advisory
                  </p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    <span className="font-bold">{selectedSubject.name}</span> is
                    not listed in{" "}
                    <span className="font-bold">{selectedTeacher.name}</span>
                    &apos;s specializations. Their trained subjects:{" "}
                    {selectedTeacher.specializations
                      .map(
                        (sid) =>
                          subjects.find((s) => s.id === sid)?.name || sid,
                      )
                      .join(", ")}
                    .
                    <span className="block mt-1 text-[10px] text-blue-600 italic">
                      Cross-discipline assignments are allowed at admin
                      discretion.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Workload Panel */}
            <div className="bg-[#F7F8F4] border border-slate-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">
                    badge
                  </span>
                  <span className="text-[12px] font-bold text-foreground">
                    {selectedTeacher.name}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#B0AFA8]">
                  {selectedTeacher.qualification}
                </span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-white rounded-lg border border-slate-50 p-3 text-center">
                  <p className="text-[18px] font-bold text-foreground">
                    {teacherMappings.length}
                  </p>
                  <p className="text-[9px] font-medium text-[#B0AFA8] mt-0.5">
                    Active Classes
                  </p>
                </div>
                <div className="flex-1 bg-white rounded-lg border border-slate-50 p-3 text-center">
                  <p className="text-[18px] font-bold text-foreground">
                    {selectedTeacher.teachingScope.length}
                  </p>
                  <p className="text-[9px] font-medium text-[#B0AFA8] mt-0.5">
                    Grade Scope
                  </p>
                </div>
              </div>
              {teacherMappings.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-medium text-[#B0AFA8]">
                    Current Assignments
                  </p>
                  {teacherMappings.map((m) => {
                    const sub = subjects.find((s) => s.id === m.subjectId);
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-[11px] py-1.5 px-2 rounded-lg hover:bg-white transition-colors"
                      >
                        <span className="font-semibold text-[#444441]">
                          {sub?.name || m.subjectId}
                        </span>
                        <span className="text-[#B0AFA8] font-medium">
                          {m.grade} {m.section}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="p-8 border-t border-slate-50 bg-[#FBFBFA] flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl text-[length:var(--font-size-input)] font-[var(--font-weight-input)] text-[var(--text-color-body-muted)] hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            isFormValid &&
            onSubmit({
              grade,
              section,
              subjectId,
              teacherId,
              hoursPerWeek: 4,
              isAdditional,
            })
          }
          disabled={!isFormValid}
          className="flex-[2] btn-primary h-12 rounded-xl text-[length:var(--font-size-input)] font-[var(--font-weight-input)] shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
        >
          {initialData?.id ? "Update Mapping" : "Confirm Assignment"}
        </button>
      </div>
    </div>
  );
};

const TierManagementForm = ({
  groups,
  setGroups,
}: {
  groups: GradeGroup[];
  setGroups: React.Dispatch<React.SetStateAction<GradeGroup[]>>;
}) => {
  // Derive all possible grades from configs

  const removeGrade = (groupId: string, grade: string) => {
    const newGroups = groups.map((g) => {
      if (g.id === groupId) {
        return { ...g, grades: g.grades.filter((gr: string) => gr !== grade) };
      }
      return g;
    });
    setGroups(newGroups);
  };

  const addGrade = (groupId: string, grade: string) => {
    const newGroups = groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          grades: [...g.grades, grade].sort((a: string, b: string) => {
            const numA = parseInt(a.replace(/\D/g, ""));
            const numB = parseInt(b.replace(/\D/g, ""));
            return numA - numB;
          }),
        };
      }
      return g;
    });
    setGroups(newGroups);
  };

  const addNewTier = () => {
    const newId = `tier-${Date.now()}`;
    setGroups([
      ...groups,
      { id: newId, label: "New Academic Tier", grades: [] },
    ]);
  };

  const removeTier = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
        {/* Tier List */}
        <div className="space-y-8">
          {groups.map((group) => (
            <div
              key={group.id}
              className="p-6 rounded-[32px] border border-slate-100 bg-white hover:border-slate-200 transition-all group/tier relative"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="size-10 rounded-2xl bg-[#F7F8F4] flex items-center justify-center text-primary shrink-0 border border-slate-100">
                    <span className="material-symbols-outlined text-[20px]">
                      layers
                    </span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <input
                      className="bg-transparent border-none text-[14px] font-bold text-foreground outline-none focus:ring-0 p-0 w-full placeholder:text-slate-300"
                      value={group.label}
                      placeholder="Name this tier..."
                      onChange={(e) => {
                        const newGroups = groups.map((g) =>
                          g.id === group.id
                            ? { ...g, label: e.target.value }
                            : g,
                        );
                        setGroups(newGroups);
                      }}
                    />
                    <span className="text-[length:var(--font-size-small)] font-medium text-[var(--text-color-label)] mt-1">
                      Tier Name
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeTier(group.id)}
                    className="size-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center opacity-0 group-hover/tier:opacity-100"
                    title="Delete Tier"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      delete
                    </span>
                  </button>
                </div>
              </div>

              {/* Grade Chips */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2.5">
                  {group.grades.length === 0 ? (
                    <div className="w-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-50 rounded-2xl bg-slate-50/30">
                      <p className="text-[11px] text-[#B0AFA8] font-medium">
                        No grades assigned to this tier yet
                      </p>
                    </div>
                  ) : (
                    group.grades.map((grade: string) => (
                      <button
                        key={grade}
                        onClick={() => removeGrade(group.id, grade)}
                        className="px-4 py-2 bg-[#F7F8F4] border border-slate-100 rounded-xl text-[12px] font-semibold text-[#444441] hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all flex items-center gap-2 group/chip"
                      >
                        {grade}
                        <span className="material-symbols-outlined text-[14px] text-[#B0AFA8] group-hover/chip:text-red-500 transition-colors">
                          close
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <div className="pt-2 space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <p className="text-[10px] font-medium text-[#B0AFA8]">
                      Available Grades
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 px-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                      .map((n) => `Grade ${n}`)
                      .filter(
                        (g) => !groups.some((tg) => tg.grades.includes(g)),
                      ).length === 0 ? ( // ONLY unassigned
                      <div className="flex items-center gap-2 text-slate-400 py-2">
                        <span className="material-symbols-outlined text-[16px]">
                          check_circle
                        </span>
                        <p className="text-[10px] font-semibold italic">
                          All institutional grades have been categorized.
                        </p>
                      </div>
                    ) : (
                      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                        .map((n) => `Grade ${n}`)
                        .filter(
                          (g) => !groups.some((tg) => tg.grades.includes(g)),
                        )
                        .map((g) => (
                          <button
                            key={g}
                            onClick={() => addGrade(group.id, g)}
                            className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[11px] font-bold text-[#444441] hover:bg-primary/5 hover:border-primary/40 transition-all active:scale-95 flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[14px] text-primary/60">
                              add
                            </span>
                            {g}
                          </button>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addNewTier}
            className="w-full h-12 rounded-xl text-[#B0AFA8] hover:text-primary transition-all flex items-center justify-center gap-2 group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
              add
            </span>
            <span className="text-[length:var(--font-size-input)] font-[var(--font-weight-input)]">
              Define New Academic Tier
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const FormGroup = ({
  label,
  type = "text",
  placeholder,
  options,
  value,
  onChange,
  icon,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  options?: (string | { val: string; label: string; disabled?: boolean })[];
  value?: string;
  onChange?: (val: string) => void;
  icon?: string;
}) => {
  let inputElement = null;

  if (type === "select") {
    inputElement = (
      <AppDropdown
        options={(options ?? []).map((o) =>
          typeof o === "string" ? o : o.label,
        )}
        value={
          typeof value === "string"
            ? value
            : (options ?? []).find(
                (
                  o,
                ): o is { val: string; label: string; disabled?: boolean } =>
                  typeof o !== "string" && o.val === value,
              )?.label || ""
        }
        onChange={(val: string) => {
          const opts = options ?? [];
          const selected = opts.find(
            (o) => (typeof o === "string" ? o : o.label) === val,
          );
          if (onChange) {
            onChange(
              typeof selected === "string"
                ? selected
                : ((selected as { val: string } | undefined)?.val ?? ""),
            );
          }
        }}
        placeholder={placeholder}
        icon={icon}
      />
    );
  } else if (type === "date") {
    inputElement = (
      <AppDatePicker
        value={value ? new Date(value) : null}
        onChange={(d) => onChange?.(d.toISOString())}
        placeholder={placeholder}
        icon={icon}
      />
    );
  } else {
    inputElement = (
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px] group-focus-within:text-primary transition-colors z-10">
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-[10px] outline-none text-[length:var(--font-size-body)] font-[var(--font-weight-input)] text-foreground placeholder-[var(--text-color-label)] transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white",
            icon ? "pl-12 pr-6" : "px-6",
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5 group">
      <label className="text-[length:var(--font-size-label)] font-[var(--font-weight-label)] text-[var(--text-color-label)] px-1 group-focus-within:text-foreground transition-colors">
        {label}
      </label>
      <div className="relative">
        {inputElement}
      </div>
    </div>
  );
};
