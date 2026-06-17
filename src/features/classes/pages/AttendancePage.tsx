import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import successAnimation from "../../../assets/animations/success.json";
import { TopBar } from "../../../components/Header";
import { AppDropdown } from "../../../components/AppDropdown";
import { AppDatePicker } from "../../../components/AppDatePicker";
import { StatCard } from "../../../components/StatCard";
import { TablePagination } from "../../../components/TablePagination";
import { cn } from "../../../lib/utils";
import { PDSButton } from "../../../components/pds/PDSButton";
import { graphqlRequest } from "../../../lib/graphqlClient";

const GET_CLASSES = `
  query GetClasses($schoolId: String) {
    classes(filter: { schoolId: $schoolId }, page: 1, pageSize: 100) {
      items {
        id
        grade
        section
      }
    }
  }
`;

const GET_STUDENTS = `
  query GetClassStudents($classId: ID!) {
    studentsByClass(classId: $classId, page: 1, pageSize: 200) {
      items {
        id
        name
        admissionNumber
        classId
      }
    }
  }
`;

const GET_STAFF = `
  query GetStaff($schoolId: String) {
    users(filter: { role: "TEACHER", schoolId: $schoolId, page: 1, pageSize: 100 }) {
      items {
        id
        name
        role
        classId
      }
    }
  }
`;

const GET_ATTENDANCES = `
  query GetAttendances($classId: String, $dateFrom: String, $dateTo: String) {
    attendances(filter: { classId: $classId, dateFrom: $dateFrom, dateTo: $dateTo }, page: 1, pageSize: 500) {
      items {
        id
        studentId
        teacherId
        status
      }
    }
  }
`;

const CREATE_ATTENDANCE = `
  mutation CreateAttendance($input: CreateAttendanceDto!) {
    createAttendance(createAttendanceInput: $input) {
      id
    }
  }
`;

const UPDATE_ATTENDANCE = `
  mutation UpdateAttendance($id: ID!, $input: UpdateAttendanceDto!) {
    updateAttendance(id: $id, updateAttendanceInput: $input) {
      id
    }
  }
`;

interface ClassItem {
  id: string;
  grade: string;
  section?: string;
}

interface StudentItem {
  id: string;
  rollNo: string;
  name: string;
  status: string;
  img: string;
  class: string;
  attendanceRecordId: string | null;
  remarks: string;
}

interface StaffItem {
  id: string;
  name: string;
  status: string;
  role: string;
  img: string;
  attendanceRecordId: string | null;
  remarks: string;
  teacherClassId?: string;
  substitution?: string;
  reason?: string;
}

interface ClassSummaryItem {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  averageAttendancePercentage: number;
}

interface BatchStatusItem {
  takenByUserId?: string;
  takenByRole?: string;
  recordCount: number;
  canOverride: boolean;
}

interface GraphQLClassesResponse {
  classes: {
    items: ClassItem[];
  };
}

interface GraphQLStudentsResponse {
  studentsByClass: {
    items: Array<{
      id: string;
      name: string;
      admissionNumber?: string;
      classId?: string;
    }>;
  };
}

interface GraphQLStaffResponse {
  users: {
    items: Array<{
      id: string;
      name: string;
      role?: string;
      classId?: string;
    }>;
  };
}

interface GraphQLAttendancesResponse {
  attendances: {
    items: Array<{
      id: string;
      studentId?: string;
      teacherId?: string;
      status: string;
      remarks?: string;
    }>;
  };
}

interface GraphQLClassAttendanceSummaryResponse {
  classAttendanceSummary: ClassSummaryItem;
}

interface GraphQLAttendanceBatchStatusResponse {
  attendanceBatchStatus: BatchStatusItem;
}

export const AttendancePage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = (tab as "students" | "staff") || "students";

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceDate, setAttendanceDate] = useState<Date>(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [classSummary, setClassSummary] = useState<ClassSummaryItem | null>(null);
  const [batchStatus, setBatchStatus] = useState<BatchStatusItem | null>(null);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const schoolId = localStorage.getItem("school_id");
        const res = await graphqlRequest<GraphQLClassesResponse>(GET_CLASSES, { schoolId: schoolId || undefined });
        const items = res.classes?.items || [];
        setClasses(items);
        if (items.length > 0) {
          const firstClass = items[0];
          const label = firstClass.section ? `${firstClass.grade}-${firstClass.section}` : firstClass.grade;
          setSelectedClass(label);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  const activeClass = useMemo(() => {
    return classes.find(c => {
      const label = c.section ? `${c.grade}-${c.section}` : c.grade;
      return label === selectedClass;
    });
  }, [classes, selectedClass]);

  const classOptions = useMemo(() => {
    return classes.map(c => c.section ? `${c.grade}-${c.section}` : c.grade);
  }, [classes]);

  const fetchAttendanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const schoolId = localStorage.getItem("school_id");
      const dateStr = attendanceDate.toISOString().split("T")[0];

      if (activeTab === "students") {
        if (!activeClass?.id) return;

        const summaryQuery = `
          query GetClassAttendanceSummary($classId: ID!, $date: String) {
            classAttendanceSummary(classId: $classId, date: $date) {
              totalStudents
              presentCount
              absentCount
              halfDayCount
              averageAttendancePercentage
            }
          }
        `;

        const batchStatusQuery = `
          query GetAttendanceBatchStatus($classId: ID!, $date: String!) {
            attendanceBatchStatus(classId: $classId, date: $date) {
              takenByUserId
              takenByRole
              recordCount
              canOverride
            }
          }
        `;

        const [studentsData, attendanceData, summaryData, batchStatusData] = await Promise.all([
          graphqlRequest<GraphQLStudentsResponse>(GET_STUDENTS, { classId: activeClass.id }),
          graphqlRequest<GraphQLAttendancesResponse>(GET_ATTENDANCES, { classId: activeClass.id, dateFrom: dateStr, dateTo: dateStr }),
          graphqlRequest<GraphQLClassAttendanceSummaryResponse>(summaryQuery, { classId: activeClass.id, date: dateStr }).catch(() => null),
          graphqlRequest<GraphQLAttendanceBatchStatusResponse>(batchStatusQuery, { classId: activeClass.id, date: dateStr }).catch(() => null)
        ]);

        const studentsList = studentsData?.studentsByClass?.items || [];
        const attendanceList = attendanceData?.attendances?.items || [];

        const summary = summaryData?.classAttendanceSummary;
        const status = batchStatusData?.attendanceBatchStatus;

        setClassSummary(summary || null);
        setBatchStatus(status || null);

        const attMap = new Map(attendanceList.map((a) => [a.studentId, a]));

        const mapped: StudentItem[] = studentsList.map((u) => {
          const att = attMap.get(u.id);
          return {
            id: u.id,
            rollNo: u.admissionNumber || u.id.slice(0, 8),
            name: u.name,
            status: att ? (att.status === "PRESENT" ? "Present" : "Absent") : "Present",
            img: `/Avatar/Male Avatar Age15.png`,
            class: selectedClass,
            attendanceRecordId: att?.id || null,
            remarks: att?.remarks || ""
          };
        });
        setStudents(mapped);
      } else {
        // Staff tab
        const [staffData, attendanceData] = await Promise.all([
          graphqlRequest<GraphQLStaffResponse>(GET_STAFF, { schoolId: schoolId || undefined }),
          graphqlRequest<GraphQLAttendancesResponse>(GET_ATTENDANCES, { dateFrom: dateStr, dateTo: dateStr })
        ]);

        const staffList = staffData?.users?.items || [];
        const attendanceList = attendanceData?.attendances?.items || [];

        const attMap = new Map(attendanceList.map((a) => [a.teacherId, a]));

        const mapped: StaffItem[] = staffList.map((u) => {
          const att = attMap.get(u.id);
          let status = "Present";
          if (att) {
            if (att.status === "ABSENT") {
              status = "Absent";
            } else if (att.status === "HALF_DAY") {
              status = "Half day";
            } else if (att.status === "PRESENT") {
              status = "Present";
            }
          }
          return {
            id: u.id,
            name: u.name,
            status,
            role: u.role || "Staff",
            img: `/Avatar/Female Avatar Age35.png`,
            attendanceRecordId: att?.id || null,
            remarks: att?.remarks || "",
            teacherClassId: u.classId
          };
        });
        setStaff(mapped);
      }
    } catch (err) {
      console.error("Error loading attendance data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeClass?.id, attendanceDate, activeTab, selectedClass]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const updateStudentStatus = (id: string, status: string) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const updateStudentRemarks = (id: string, remarks: string) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, remarks } : s)));
  };

  const updateStaffStatus = (id: string, status: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const markAllStudents = (status: string) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const schoolId = localStorage.getItem("school_id") || "";
      const dateStr = attendanceDate.toISOString().split("T")[0];

      if (activeTab === "students") {
        const batchMutation = `
          mutation SaveClassAttendanceBatch($input: SaveClassAttendanceBatchInput!) {
            saveClassAttendanceBatch(input: $input) {
              id
              studentId
              status
              remarks
              date
            }
          }
        `;
        const entries = students.map(s => ({
          studentId: s.id,
          status: s.status === "Present" ? "PRESENT" : "ABSENT",
          remarks: s.remarks || ""
        }));

        await graphqlRequest(batchMutation, {
          input: {
            schoolId,
            classId: activeClass?.id,
            date: dateStr,
            entries
          }
        });
      } else {
        // Staff individual records save
        const mutations = staff.map(item => {
          let status = "PRESENT";
          let remarks = item.remarks || "";

          if (item.status === "Present") {
            status = "PRESENT";
          } else if (item.status === "Late") {
            status = "PRESENT";
            remarks = "Late";
          } else if (item.status === "Half day") {
            status = "HALF_DAY";
          } else if (item.status === "On leave") {
            status = "ABSENT";
            remarks = "Leave";
          } else if (item.status === "Absent") {
            status = "ABSENT";
          }

          if (item.attendanceRecordId) {
            const input: Record<string, unknown> = { status, remarks };
            return graphqlRequest(UPDATE_ATTENDANCE, { id: item.attendanceRecordId, input });
          } else {
            const classId = item.teacherClassId || activeClass?.id || (classes.length > 0 ? classes[0].id : "default_class");
            const input: Record<string, unknown> = {
              schoolId,
              classId,
              date: dateStr,
              status,
              remarks,
              idempotencyKey: Math.random().toString(36).substr(2, 9),
              teacherId: item.id
            };
            return graphqlRequest(CREATE_ATTENDANCE, { input });
          }
        });

        await Promise.all(mutations);
      }

      setShowSuccess(true);
      await fetchAttendanceData();
    } catch (err) {
      console.error("Failed to save attendance:", err);
      alert("Error saving attendance records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((student) => {
      const matchesSearch =
        (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.rollNo || "").includes(searchTerm);
      return matchesSearch;
    });
  }, [searchTerm, students, selectedClass]);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, staff]);

  const paginatedList = useMemo(() => {
    const list = activeTab === "students" ? filteredStudents : filteredStaff;
    const start = (currentPage - 1) * itemsPerPage;
    return list.slice(start, start + itemsPerPage);
  }, [activeTab, filteredStudents, filteredStaff, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    if (activeTab === "students") {
      if (classSummary) {
        return {
          present: classSummary.presentCount,
          absent: classSummary.absentCount,
          late: classSummary.halfDayCount,
          total: classSummary.totalStudents,
          percentage: classSummary.averageAttendancePercentage
        };
      }
      const list = filteredStudents;
      if (!selectedClass) return { present: 0, absent: 0, late: 0, total: 0, percentage: 0 };
      const present = list.filter(s => s.status === "Present").length;
      const absent = list.filter(s => s.status === "Absent").length;
      const total = list.length;
      return { present, absent, late: 0, total, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
    } else {
      const list = filteredStaff;
      const present = list.filter(s => s.status === "Present").length;
      const absent = list.filter(s => s.status === "Absent" || s.status === "On leave").length;
      const late = list.filter(s => s.status === "Late" || s.status === "Half day").length;
      return { present, absent, late, total: list.length, percentage: 0 };
    }
  }, [activeTab, filteredStudents, filteredStaff, selectedClass, classSummary]);

  const allFilteredArePresent = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every(s => s.status === "Present");
  }, [filteredStudents]);

  const allFilteredAreAbsent = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every(s => s.status === "Absent");
  }, [filteredStudents]);

  const isAttendanceAlreadyTaken = !!batchStatus && batchStatus.recordCount > 0;
  const attendanceTakenBy = batchStatus ? (batchStatus.takenByRole === "SCHOOL_ADMIN" ? "School Admin" : "Class Teacher") : "";

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden bg-[#FDFCFB] relative", !isHubChild && "h-screen")}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#444 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      {!isHubChild && (
        <TopBar
          title="Attendance"
          subtitle="Manage student and staff attendance records."
        />
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: "students", label: "Students", icon: "group" },
              { id: "staff", label: "Staff", icon: "badge" },
            ].map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => navigate(`/attendance/${t.id}`)}
                  className={cn(
                    "flex items-center gap-2.5 pb-4 pt-6 text-[14px] font-semibold tracking-tight transition-all relative shrink-0",
                    isActive ? "text-foreground" : "text-[#B0AFA8] hover:text-foreground/70"
                  )}
                >
                  <span className={cn("material-symbols-outlined text-[20px] transition-all", isActive ? "text-primary" : "")} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {t.icon}
                  </span>
                  {t.label}
                  {isActive && (
                    <motion.div
                      layoutId="attendanceTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-10 py-8">
        <div className="max-w-[1400px] mx-auto space-y-8">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 [&>*]:shadow-none [&>*]:hover:shadow-none">
            <StatCard
              label={`Total ${activeTab === 'students' ? 'students' : 'staff'}`}
              value={stats.total}
              icon="group"
              trendType="stable"
              iconBg="bg-blue-50"
            />
            <StatCard
              label="Present"
              value={stats.present}
              icon="check_circle"
              trend="+2.4%"
              trendType="up"
              iconBg="bg-emerald-50"
            />
            <StatCard
              label={activeTab === 'students' ? "Absent" : "On leave"}
              value={stats.absent}
              icon="cancel"
              trend="-1.2%"
              trendType="down"
              iconBg="bg-rose-50"
            />
            <StatCard
              label={activeTab === 'students' ? "Attendance %" : "Late/Half day"}
              value={activeTab === 'students' ? `${stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%` : stats.late}
              icon={activeTab === 'students' ? "analytics" : "schedule"}
              trendType="stable"
              iconBg="bg-amber-50"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${selectedClass}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/30 overflow-visible flex flex-col"
            >
              {/* Controls Header */}
              <div className="p-3 flex items-center gap-2 border-b border-slate-100/50 bg-white relative z-20 min-h-[56px] flex-nowrap rounded-t-[24px]">
                {activeTab === "students" && (
                  <div className="w-[180px] shrink-0">
                    <AppDropdown
                      icon="school"
                      placeholder="Select class"
                      value={selectedClass}
                      onChange={(val) => { setSelectedClass(val); setCurrentPage(1); }}
                      options={classOptions}
                      height="h-10"
                      searchable={true}
                    />
                  </div>
                )}
                <div className="w-[170px] shrink-0">
                  <AppDatePicker
                    value={attendanceDate}
                    onChange={setAttendanceDate}
                    icon="calendar_today"
                    placeholder="Select date"
                    height="h-10"
                    maxDate={new Date()}
                  />
                </div>

                {/* Search Bar */}
                <div className="flex-1 min-w-[150px] relative h-10 group">
                  <div className="absolute inset-0 bg-[#F7F8F4] border border-slate-100 rounded-[10px] transition-all group-focus-within:border-primary/50 group-focus-within:ring-4 group-focus-within:ring-primary/5 group-focus-within:bg-white overflow-hidden pointer-events-none" />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-[18px] z-20">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder={activeTab === 'students' ? "Find student..." : "Search staff..."}
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="relative w-full h-full bg-transparent border-none outline-none pl-11 pr-4 text-[14px] font-medium text-foreground placeholder-[#B0AFA8] placeholder:font-medium z-10"
                  />
                </div>

                <div className="flex gap-2 shrink-0">
                  {/* Hover Dropdown for Export */}
                  <div className="relative group/export-menu">
                    <button
                      className="btn-secondary h-10 px-4 rounded-xl flex items-center gap-2 group/export whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[18px] group-hover/export:translate-y-[-1px] transition-transform text-secondary/70">download</span>
                      <span className="text-[13px] font-bold">Export</span>
                      <span className="material-symbols-outlined text-[16px] opacity-40 group-hover/export:rotate-180 transition-transform">expand_more</span>
                    </button>

                    {/* Hover Content */}
                    <div className="absolute top-[calc(100%+8px)] right-0 w-[180px] bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 opacity-0 invisible translate-y-2 group-hover/export-menu:opacity-100 group-hover/export-menu:visible group-hover/export-menu:translate-y-0 transition-all duration-200 z-[100] overflow-hidden p-1.5">
                      <button className="w-full px-4 py-2.5 text-[11px] font-bold text-secondary hover:bg-[#F7F8F4] rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap">
                        <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">description</span>
                        Download as CSV
                      </button>
                      <button className="w-full px-4 py-2.5 text-[11px] font-bold text-secondary hover:bg-[#F7F8F4] rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap">
                        <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">picture_as_pdf</span>
                        Download as PDF
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || (activeTab === "students" && batchStatus?.canOverride === false)}
                    className={cn(
                      "btn-primary h-10 px-6 rounded-xl flex items-center gap-2 group/save shadow-sm shadow-slate-100/30 transition-all active:scale-95 whitespace-nowrap",
                      (isLoading || (activeTab === "students" && batchStatus?.canOverride === false)) && "opacity-50 pointer-events-none"
                    )}
                  >
                    <span className={cn("material-symbols-outlined text-[18px] transition-transform", isLoading ? "animate-spin" : "group-hover/save:rotate-12")}>
                      {isLoading ? "sync" : "save"}
                    </span>
                    <span className="text-[13px] font-bold">
                      {isLoading ? "Saving..." : "Save Attendance"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Already Taken Info Banner */}
              {isAttendanceAlreadyTaken && (
                <div className={cn(
                  "px-8 py-3 border-b flex items-center gap-3",
                  batchStatus?.canOverride === false ? "bg-red-50/50 border-red-100/50" : "bg-amber-50/50 border-amber-100/50"
                )}>
                  <div className={cn(
                    "size-6 rounded-full flex items-center justify-center",
                    batchStatus?.canOverride === false ? "bg-red-100" : "bg-amber-100"
                  )}>
                    <span className={cn(
                      "material-symbols-outlined text-[16px]",
                      batchStatus?.canOverride === false ? "text-red-700" : "text-amber-700"
                    )}>
                      {batchStatus?.canOverride === false ? "block" : "info"}
                    </span>
                  </div>
                  <p className={cn(
                    "text-[12px] font-medium",
                    batchStatus?.canOverride === false ? "text-red-800" : "text-amber-800"
                  )}>
                    {batchStatus?.canOverride === false ? (
                      <>
                        Attendance edit window has expired. Records taken by <span className="font-bold underline underline-offset-2">{attendanceTakenBy}</span> are now finalized and cannot be modified.
                      </>
                    ) : (
                      <>
                        Attendance for <span className="font-bold">{selectedClass}</span> for <span className="font-bold">{attendanceDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span> was already taken by <span className="font-bold underline underline-offset-2">{attendanceTakenBy}</span>. Saving will override existing records.
                      </>
                    )}
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F7F8F4]/30 border-b border-slate-100">
                    <tr>
                      {activeTab === 'students' && (
                        <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest w-[80px]">
                          Roll No
                        </th>
                      )}
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">
                        {activeTab === 'students' ? 'Student' : 'Staff'}
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="mb-1">Status</span>
                          {activeTab === "students" && (
                            <div className="relative flex bg-[#F7F8F4] p-0.5 rounded-[12px] border border-slate-200/50 w-[180px] h-8">
                              {/* Animated Master background pill */}
                              <motion.div
                                className={cn(
                                  "absolute top-0.5 bottom-0.5 rounded-[10px] shadow-sm z-0 transition-colors duration-300",
                                  allFilteredArePresent ? "bg-emerald-500" :
                                    allFilteredAreAbsent ? "bg-rose-500" :
                                      "bg-white opacity-0"
                                )}
                                animate={{
                                  left: allFilteredArePresent ? "2px" : allFilteredAreAbsent ? "90px" : "45px",
                                  width: allFilteredArePresent || allFilteredAreAbsent ? "88px" : "0px",
                                  opacity: allFilteredArePresent || allFilteredAreAbsent ? 1 : 0
                                }}
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                              />
                              <button
                                onClick={() => markAllStudents("Present")}
                                className={cn(
                                  "flex-1 z-10 text-[10px] font-black transition-all flex items-center justify-center gap-1 tracking-normal",
                                  allFilteredArePresent ? "text-white" : "text-[#B0AFA8] hover:text-emerald-600"
                                )}
                              >
                                All Present
                              </button>
                              <button
                                onClick={() => markAllStudents("Absent")}
                                className={cn(
                                  "flex-1 z-10 text-[10px] font-black transition-all flex items-center justify-center gap-1 tracking-normal",
                                  allFilteredAreAbsent ? "text-white" : "text-[#B0AFA8] hover:text-rose-600"
                                )}
                              >
                                All Absent
                              </button>
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-right">
                        {activeTab === 'students' ? 'Notes' : 'Substitute'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedList.map((item) => {
                      const studentItem = item as StudentItem;
                      const staffItem = item as StaffItem;
                      return (
                        <tr key={item.id} className="hover:bg-[#F7F8F4]/50 transition-colors group">
                          {activeTab === 'students' && (
                            <td className="px-6 py-4">
                              <span className="text-[13px] font-bold text-secondary">{studentItem.rollNo}</span>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-cover bg-center border border-slate-100 shadow-sm" style={{ backgroundImage: `url("${item.img}")` }} />
                              <div className="flex flex-col leading-tight">
                                <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                                <span className="text-[11px] font-bold text-[#B0AFA8]">{activeTab === 'students' ? studentItem.id : staffItem.role || item.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              {activeTab === 'students' ? (
                              <div className="relative flex bg-[#F7F8F4] p-1 rounded-[14px] border border-slate-100 w-[180px] h-9">
                                {/* Animated background pill */}
                                <motion.div
                                  className={cn(
                                    "absolute top-1 bottom-1 rounded-[10px] shadow-sm z-0",
                                    item.status === "Present" ? "bg-emerald-500 left-1 right-[50%]" : "bg-rose-500 left-[50%] right-1"
                                  )}
                                  layoutId={`status-bg-${item.id}`}
                                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                />

                                <button
                                  onClick={() => updateStudentStatus(item.id, "Present")}
                                  className={cn(
                                    "flex-1 z-10 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5",
                                    item.status === "Present" ? "text-white" : "text-[#B0AFA8] hover:text-foreground"
                                  )}
                                >
                                  <span className={cn("material-symbols-outlined text-[16px]", item.status === "Present" ? "" : "opacity-40")}>check_circle</span>
                                  Present
                                </button>
                                <button
                                  onClick={() => updateStudentStatus(item.id, "Absent")}
                                  className={cn(
                                    "flex-1 z-10 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5",
                                    item.status === "Absent" ? "text-white" : "text-[#B0AFA8] hover:text-foreground"
                                  )}
                                >
                                  <span className={cn("material-symbols-outlined text-[16px]", item.status === "Absent" ? "" : "opacity-40")}>cancel</span>
                                  Absent
                                </button>
                              </div>
                            ) : (
                              <div className="relative flex bg-[#F7F8F4] p-1 rounded-[14px] border border-slate-100 gap-1 w-[320px] h-9">
                                {[
                                  { label: "Present", color: "bg-emerald-500" },
                                  { label: "On leave", color: "bg-rose-500" },
                                  { label: "Half day", color: "bg-amber-500" },
                                  { label: "Late", color: "bg-indigo-500" }
                                ].map((st) => {
                                  const isActive = item.status === st.label;
                                  return (
                                    <button
                                      key={st.label}
                                      onClick={() => updateStaffStatus(item.id, st.label)}
                                      className={cn(
                                        "flex-1 z-10 h-7 rounded-[10px] text-[10px] font-bold transition-all relative overflow-hidden flex items-center justify-center",
                                        isActive
                                          ? "text-white"
                                          : "text-[#B0AFA8] hover:text-foreground"
                                      )}
                                    >
                                      {st.label}
                                      {isActive && (
                                        <motion.div
                                          layoutId={`staff-bg-${item.id}`}
                                          className={cn("absolute inset-0 z-[-1]", st.color)}
                                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                        />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {activeTab === 'students' ? (
                            <input
                              type="text"
                              placeholder="Add note..."
                              value={item.remarks}
                              onChange={(e) => updateStudentRemarks(item.id, e.target.value)}
                              className="bg-transparent border-none text-right text-[12px] font-medium text-[#B0AFA8] outline-none focus:text-foreground transition-colors w-full"
                            />
                          ) : (
                            <div className="flex flex-col items-end leading-tight">
                              {staffItem.substitution ? (
                                <>
                                  <span className="text-[12px] font-bold text-primary">{staffItem.substitution}</span>
                                  <span className="text-[10px] text-[#B0AFA8] font-medium">{staffItem.reason}</span>
                                </>
                              ) : (
                                <span className="text-[11px] text-slate-200 font-medium italic">Full coverage</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>

              <TablePagination
                totalItems={activeTab === "students" ? filteredStudents.length : filteredStaff.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(count) => {
                  setItemsPerPage(count);
                  setCurrentPage(1);
                }}
                itemName={activeTab === "students" ? "students" : "staff members"}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSuccess(false)} className="absolute inset-0 bg-secondary/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[40px] w-full max-w-md p-12 text-center overflow-hidden border border-slate-100 shadow-2xl shadow-secondary/20">
              {/* Lottie Success Animation */}
              <div className="relative mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  className="size-32 mx-auto relative z-10"
                >
                  <Lottie animationData={successAnimation} loop={false} className="w-full h-full" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 size-32 bg-[#EAF2D7] rounded-full mx-auto blur-xl"
                />
              </div>

              <h2 className="text-2xl font-black text-foreground mb-4 tracking-tight">Records Updated</h2>

              <div className="space-y-4 mb-10">
                {activeTab === "students" ? (
                  <>
                    <p className="text-[#444441] text-[14px] font-medium leading-relaxed">
                      The current attendance has successfully <span className="font-bold text-secondary">saved</span>.
                    </p>
                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex items-center gap-3">
                      <span className="material-symbols-outlined text-amber-600 text-[20px]">notifications_active</span>
                      <p className="text-[12px] font-bold text-amber-800 text-left">
                        Absence notifications will be delivered to parents in <span className="underline">30 minutes</span>.
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-[#444441] text-[14px] font-medium leading-relaxed">
                    Staff attendance records for <span className="font-bold">{attendanceDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span> have been successfully updated and synced with the payroll module.
                  </p>
                )}
              </div>

              <PDSButton 
                variant="primary" 
                size="xl" 
                className="w-full"
                onClick={() => setShowSuccess(false)}
              >
                Acknowledge
              </PDSButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
