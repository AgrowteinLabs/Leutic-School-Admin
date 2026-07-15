import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { MenuDropdown } from "../../../components/MenuDropdown";
import { TablePagination } from "../../../components/TablePagination";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { useApp } from "../../../lib/AppContext";

interface StudentRecord {
  name: string;
  id: string;
  grade: string;
  section: string;
  participation: number;
  auraScore: number;
  status: string;
  img: string;
  enrollmentDate: string;
  bloodGroup: string;
  guardianName: string;
  phone: string;
  uid: string;
}

const StudentRow = ({
  student,
  onClick,
  onDelete,
}: {
  student: StudentRecord;
  onClick: (student: StudentRecord) => void;
  onDelete: (student: StudentRecord) => void;
}) => {
  const {
    name,
    id,
    grade,
    section,
    auraScore,
    status,
    img,
    enrollmentDate,
    bloodGroup,
    guardianName,
    phone,
  } = student;

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-[#EAF2D7] text-[#2E7D32] border border-[#D9EA85]";
      case "at risk":
        return "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]";
      default:
        return "bg-[#F0F0EC] text-[#444441] border border-slate-200";
    }
  };

  return (
    <tr
      onClick={() => onClick(student)}
      className="hover:bg-[#F7F8F4] transition-colors group cursor-pointer border-b border-slate-50 last:border-0"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="size-9 rounded-xl bg-cover bg-center border border-slate-100 shadow-sm"
            style={{ backgroundImage: `url("${img}")` }}
          ></div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">
              {name}
            </span>
            <span className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider">
              {id}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-foreground leading-none mb-1">
            {grade}
          </span>
          <span className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider">
            Sec {section}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-foreground">
            {auraScore} pts
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-[12px] font-semibold text-[#444441]">
          {enrollmentDate}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-[12px] font-bold text-foreground">
          {bloodGroup}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[12px] font-bold text-foreground whitespace-nowrap">
            {guardianName}
          </span>
          <span className="text-[10px] font-medium text-[#B0AFA8] whitespace-nowrap">
            {phone}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold capitalize border",
            getStatusStyles(status),
          )}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(student);
            }}
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:bg-white hover:text-foreground hover:shadow-sm transition-all"
            title="View Profile"
          >
            <span className="material-symbols-outlined text-[18px]">
              visibility
            </span>
          </button>
          <button
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:bg-white hover:text-primary hover:shadow-sm transition-all"
            title="Edit Record"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(student);
            }}
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all"
            title="Delete Student"
          >
            <span className="material-symbols-outlined text-[18px]">
              delete
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
};

const mapStatusToDisplay = (status?: string): string => {
  if (!status) return "Active";
  const upper = status.toUpperCase();
  if (upper === "ACTIVE") return "Active";
  if (upper === "AT_RISK" || upper === "AT RISK") return "At Risk";
  if (upper === "GRADUATED") return "Graduated";
  if (upper === "INACTIVE") return "Inactive";
  return status;
};

export const StudentsPage = ({
  isHubChild,
  externalStudents,
  onAddStudent,
}: {
  isHubChild?: boolean;
  externalStudents?: StudentRecord[];
  onAddStudent?: () => void;
}) => {
  const navigate = useNavigate();
  const { schoolProfile } = useApp();
  const activeGrades = schoolProfile?.activeGrades || ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("Grade Level (All)");
  const [statusFilter, setStatusFilter] = useState("Status (All)");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [overviewTotals, setOverviewTotals] = useState({
    totalStudents: "",
    activePrograms: "",
  });

  const [students, setStudents] = useState<StudentRecord[]>(
    externalStudents || [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<any>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const schoolId = localStorage.getItem("school_id") || "";

    const query = `
      query GetStudentsAndClasses($filter: UsersFilterDto!, $schoolId: String) {
        users(filter: $filter) {
          total
          items {
            id
            role
            name
            firstName
            lastName
            email
            mobileNo
            schoolId
            admissionNumber
            rollNumber
            address
            classId
            enrollmentGrade
            studentStatus
            bloodGroup
            auraPoints
            guardians {
              relationship
              fullName
              mobileNo
              email
              occupation
            }
            createdAt
          }
        }
        classes(filter: { schoolId: $schoolId }, page: 1, pageSize: 100) {
          total
          items {
            id
            grade
            section
          }
        }
      }
    `;

    const statsQuery = `
      query GetDirectoryStats($schoolId: ID!, $tab: String!) {
        directoryStats(schoolId: $schoolId, tab: $tab) {
          totalCount
          activeProgramsCount
          avgAuraPoints
          atRiskCount
        }
      }
    `;

    let mappedStatus: string | undefined = undefined;
    if (statusFilter === "Active") mappedStatus = "ACTIVE";
    else if (statusFilter === "At Risk") mappedStatus = "AT_RISK";
    else if (statusFilter === "Graduated") mappedStatus = "GRADUATED";
    else if (statusFilter === "Inactive") mappedStatus = "INACTIVE";

    let mappedGrade: string | undefined = undefined;
    if (gradeFilter !== "Grade Level (All)") {
      mappedGrade = gradeFilter;
    }

    try {
      const [data, statsRes] = await Promise.all([
        graphqlRequest<{
          users: {
            total: number;
            items: any[];
          };
          classes?: {
            total?: number;
            items: any[];
          };
        }>(query, {
          filter: {
            directoryTab: "STUDENTS",
            schoolId: schoolId || undefined,
            search: searchTerm || undefined,
            grade: mappedGrade,
            studentStatus: mappedStatus,
            page: 1,
            pageSize: 100,
          },
          schoolId: schoolId || undefined,
        }),
        graphqlRequest<any>(statsQuery, { schoolId, tab: "STUDENTS" }).catch(() => null)
      ]);

      const classesList = data.classes?.items || [];
      const classMap = new Map(classesList.map((c) => [c.id, c]));
      if (statsRes?.directoryStats) {
        setStatsData(statsRes.directoryStats);
      }

      let totalStudentsCount = "";
      if (statsRes?.directoryStats?.totalCount !== undefined) {
        totalStudentsCount = String(statsRes.directoryStats.totalCount);
      } else if (data.users?.total !== undefined && data.users?.total !== null) {
        totalStudentsCount = String(data.users.total);
      }

      let activeProgramsCount = "";
      if (statsRes?.directoryStats?.activeProgramsCount !== undefined) {
        activeProgramsCount = String(statsRes.directoryStats.activeProgramsCount);
      } else if (data.classes?.total !== undefined && data.classes?.total !== null) {
        activeProgramsCount = String(data.classes.total);
      }

      setOverviewTotals({
        totalStudents: totalStudentsCount,
        activePrograms: activeProgramsCount,
      });

      // Map users directly
      const mappedStudents: StudentRecord[] = data.users.items
        .map((user) => {
          const matchedClass = user.classId ? classMap.get(user.classId) : null;
          return {
            name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Student",
            id: user.admissionNumber || user.id.slice(0, 8),
            grade: user.enrollmentGrade || (matchedClass ? matchedClass.grade : "Unassigned"),
            section: matchedClass ? matchedClass.section || "" : "",
            participation: 0,
            auraScore: user.auraPoints ?? 0,
            status: mapStatusToDisplay(user.studentStatus),
            img: "/Avatar/Male Avatar Age16.png",
            enrollmentDate: new Date(user.createdAt).toLocaleDateString(
              "en-IN",
              { month: "short", day: "2-digit", year: "numeric" },
            ),
            bloodGroup: user.bloodGroup || "—",
            guardianName: user.guardians?.[0]?.fullName || "Guardian of " + user.name,
            phone: user.guardians?.[0]?.mobileNo || user.mobileNo || "—",
            uid: user.id,
          };
        });

      setStudents(mappedStudents);
    } catch (err: unknown) {
      console.error("Failed to fetch students:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to load students.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [externalStudents, searchTerm, gradeFilter, statusFilter]);

  useEffect(() => {
    if (externalStudents) return;
    fetchStudents();
  }, [fetchStudents, externalStudents]);

  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(
    null,
  );
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const confirmDelete = async () => {
    if (deleteConfirmationText === studentToDelete?.name) {
      const deleteMutation = `
        mutation RemoveUser($id: ID!) {
          removeUser(id: $id) {
            id
            name
          }
        }
      `;
      try {
        await graphqlRequest(deleteMutation, {
          id: studentToDelete.uid || studentToDelete.id,
        });
        setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
        setStudentToDelete(null);
        setDeleteConfirmationText("");
      } catch (err: unknown) {
        console.error("Delete failed:", err);
        const errMsg =
          err instanceof Error ? err.message : "Failed to delete student.";
        alert(errMsg);
      }
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGrade =
        gradeFilter === "Grade Level (All)" || student.grade === gradeFilter;

      const matchesStatus =
        statusFilter === "Status (All)" || student.status === statusFilter;

      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [searchTerm, gradeFilter, statusFilter, students]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden bg-transparent relative font-sans",
        !isHubChild && "h-screen",
      )}
    >
      {!isHubChild && (
        <TopBar
          title="Student Registry"
          subtitle="Manage active student profiles, academic status and institutional records"
          actions={
            <div className="flex items-center gap-3">
              <button className="h-10 px-5 rounded-[10px] bg-white border border-slate-100 text-[#444441] text-[13px] font-bold flex items-center gap-2 hover:bg-[#F7F8F4] transition-all shadow-sm shadow-slate-100/20">
                <span className="material-symbols-outlined text-[18px]">
                  file_download
                </span>
                Export List
              </button>
              <button
                onClick={() =>
                  onAddStudent
                    ? onAddStudent()
                    : navigate("/directory/enroll-student")
                }
                className="h-10 px-6 rounded-xl bg-primary text-foreground text-[13px] font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  person_add
                </span>
                Enroll Student
              </button>
            </div>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 no-scrollbar">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Students",
                value: overviewTotals.totalStudents,
                icon: "group",
              },
              {
                label: "Active Programs",
                value: overviewTotals.activePrograms,
                icon: "local_activity",
              },
              {
                label: "Avg Aura Points",
                value: statsData?.avgAuraPoints !== undefined ? statsData.avgAuraPoints.toFixed(1) : "",
                icon: "auto_awesome",
              },
              {
                label: "Students At Risk",
                value: statsData?.atRiskCount !== undefined ? String(statsData.atRiskCount) : "",
                icon: "warning",
                iconBg: "bg-[#FEE2E2]",
              },
            ].map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Unified Student Registry Card */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/30 flex flex-col">
            {/* Integrated Search and Filters */}
            <div className="p-3 flex items-center gap-3 border-b border-slate-100/50 rounded-t-[24px] relative z-20">
              <div className="flex-1">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg z-20">
                    search
                  </span>
                  <input
                    className="input-base pl-11 pr-4 w-full placeholder:font-medium"
                    placeholder="Search by name, grade, or ID..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <MenuDropdown
                  value={gradeFilter}
                  trigger={
                    <button className="btn-outline gap-3">
                      <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">
                        calendar_view_day
                      </span>
                      {gradeFilter === "Grade Level (All)"
                        ? "Grade"
                        : gradeFilter}
                    </button>
                  }
                  items={[
                    "Grade (All)",
                    ...activeGrades,
                  ].map((opt) => ({
                    label: opt,
                    onClick: () =>
                      setGradeFilter(
                        opt === "Grade (All)" ? "Grade Level (All)" : opt,
                      ),
                  }))}
                  width="w-56"
                />
                <MenuDropdown
                  value={statusFilter}
                  trigger={
                    <button className="btn-outline gap-3">
                      <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">
                        radio_button_checked
                      </span>
                      {statusFilter === "Status (All)"
                        ? "Status"
                        : statusFilter}
                    </button>
                  }
                  items={["Status (All)", "Active", "At Risk", "Graduated"].map(
                    (opt) => ({
                      label: opt,
                      onClick: () => setStatusFilter(opt),
                    }),
                  )}
                  width="w-48"
                />
                <button
                  onClick={() =>
                    onAddStudent
                      ? onAddStudent()
                      : navigate("/directory/students/add")
                  }
                  className="btn-primary gap-2 ml-1"
                >
                  <span className="material-symbols-outlined text-sm font-black">
                    add
                  </span>
                  Enroll Student
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-slate-100 bg-[#F7F8F4]/30">
                  <tr>
                    {[
                      "Student Name",
                      "Grade/Sec",
                      "Aura Score",
                      "Joining",
                      "Blood Group",
                      "Guardian/Phone",
                      "Status",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest",
                          i === 7 ? "text-right" : "",
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-40">
                          <span className="material-symbols-outlined text-5xl animate-spin">
                            sync
                          </span>
                          <p className="text-[13px] font-bold text-[#B0AFA8]">
                            Loading student records...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-red-500">
                          <span className="material-symbols-outlined text-5xl">
                            error
                          </span>
                          <p className="text-[13px] font-bold">{error}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student) => (
                      <StudentRow
                        key={student.id}
                        student={student}
                        onClick={(s) => navigate(`/students/${s.uid || s.id}`)}
                        onDelete={(s) => {
                          setStudentToDelete(s);
                          setDeleteConfirmationText("");
                        }}
                      />
                    ))
                  )}
                  {!isLoading && !error && filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-40">
                          <span className="material-symbols-outlined text-5xl">
                            person_search
                          </span>
                          <p className="text-[13px] font-bold text-[#B0AFA8]">
                            No student records found
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              totalItems={filteredStudents.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(count) => {
                setItemsPerPage(count);
                setCurrentPage(1);
              }}
              itemName="students"
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {studentToDelete && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStudentToDelete(null)}
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
                  <h3 className="text-[20px] font-bold text-foreground">
                    Remove student record?
                  </h3>
                  <p className="text-[13px] text-[#444441] leading-relaxed">
                    This will permanently remove{" "}
                    <span className="font-bold text-foreground">
                      {studentToDelete.name}
                    </span>{" "}
                    and all associated academic data.{" "}
                    <span className="font-bold text-red-600">
                      This action cannot be undone.
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-[#B0AFA8] capitalize tracking-normal">
                    Type{" "}
                    <span className="text-foreground">
                      {studentToDelete.name}
                    </span>{" "}
                    to confirm
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder={studentToDelete.name}
                    className="w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-[14px] px-6 text-center text-[14px] font-bold text-foreground focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-6 bg-red-50/30 border-t border-red-50 flex gap-3">
                <button
                  onClick={() => setStudentToDelete(null)}
                  className="flex-1 h-10 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteConfirmationText !== studentToDelete.name}
                  onClick={confirmDelete}
                  className="flex-[2] bg-red-600 text-white h-10 rounded-2xl text-[14px] font-bold shadow-xl shadow-red-500/20 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
