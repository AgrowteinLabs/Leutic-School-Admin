import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";

const StudentRow = ({
  student,
  onClick,
}: {
  student: any;
  onClick: (student: any) => void;
}) => {
  const { name, id, grade, participation, auraScore, status, img } = student;

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

  const getProgressColor = (percent: number) => {
    if (percent > 80) return "bg-primary";
    if (percent > 60) return "bg-[#B45309]";
    return "bg-[#B91C1C]/40";
  };

  return (
    <tr
      onClick={() => onClick(student)}
      className="hover:bg-[#F7F8F4] transition-colors group cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="size-8 rounded-full bg-cover bg-center border border-slate-100"
            style={{ backgroundImage: `url("${img}")` }}
          ></div>
          <span className="text-[13px] font-semibold text-foreground group-hover:underline decoration-primary underline-offset-4">
            {name}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-[#444441]">{id}</td>
      <td className="px-6 py-4 text-sm text-foreground">{grade}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-[#F0F0EC] rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all", getProgressColor(participation))}
              style={{ width: `${participation}%` }}
            ></div>
          </div>
          <span className="text-xs font-semibold text-[#444441]">
            {participation}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EAF2D7] text-foreground border border-[#D9EA85]">
          {auraScore}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize",
            getStatusStyles(status),
          )}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-[#B0AFA8] hover:text-foreground transition-colors">
          <span className="material-symbols-outlined text-xl">more_vert</span>
        </button>
      </td>
    </tr>
  );
};

export const StudentsPage = ({
  isHubChild,
  externalStudents,
  onAddStudent,
}: {
  isHubChild?: boolean;
  externalStudents?: any[];
  onAddStudent?: () => void;
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("Grade Level (All)");
  const [activityFilter, setActivityFilter] = useState("Activity Level (All)");

  const [internalStudents, setInternalStudents] = useState([
    {
      name: "Aavya S.",
      id: "OA-2024-001",
      grade: "12th Grade",
      participation: 92,
      auraScore: 98.4,
      attendanceRate: 98,
      gpa: 3.9,
      enrollmentDate: "Aug 2021",
      status: "Active",
      img: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=400&h=400&fit=crop",
      uid: "aavya-s",
    },
    {
      name: "Ishaan K.",
      id: "OA-2024-042",
      grade: "10th Grade",
      participation: 45,
      auraScore: 64.2,
      attendanceRate: 72,
      gpa: 2.1,
      enrollmentDate: "Aug 2022",
      status: "At Risk",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      uid: "ishaan-i",
    },
    {
      name: "Meera V.",
      id: "OA-2024-118",
      grade: "11th Grade",
      participation: 88,
      auraScore: 91.5,
      attendanceRate: 94,
      gpa: 3.7,
      enrollmentDate: "Jan 2022",
      status: "Active",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      uid: "mira-patel",
    },
    {
      name: "Vedant K.",
      id: "OA-2024-085",
      grade: "9th Grade",
      participation: 76,
      auraScore: 84.2,
      attendanceRate: 88,
      gpa: 3.2,
      enrollmentDate: "Aug 2023",
      status: "Graduated",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      uid: "vedant-kulkarni",
    },
    {
      name: "Sanya G.",
      id: "OA-2024-201",
      grade: "12th Grade",
      participation: 95,
      auraScore: 97.2,
      attendanceRate: 99,
      gpa: 4.0,
      enrollmentDate: "Aug 2021",
      status: "Active",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      uid: "sanya-g",
    },
    {
      name: "Arjun T.",
      id: "OA-2024-156",
      grade: "11th Grade",
      participation: 82,
      auraScore: 88.5,
      attendanceRate: 91,
      gpa: 3.5,
      enrollmentDate: "Aug 2022",
      status: "Active",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      uid: "arjun-rao",
    },
    {
      name: "Diya M.",
      id: "OA-2024-092",
      grade: "10th Grade",
      participation: 68,
      auraScore: 72.1,
      attendanceRate: 85,
      gpa: 2.8,
      enrollmentDate: "Jan 2023",
      status: "Active",
      img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop",
      uid: "diya-m",
    },
    {
      name: "Rohan P.",
      id: "OA-2024-305",
      grade: "9th Grade",
      participation: 54,
      auraScore: 61.8,
      attendanceRate: 78,
      gpa: 2.4,
      enrollmentDate: "Aug 2023",
      status: "At Risk",
      img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop",
      uid: "rohan-das",
    },
  ]);

  const students = externalStudents || internalStudents;

  const handleAddStudent = () => {
    if (onAddStudent) {
      onAddStudent();
      return;
    }
    const newStudent = {
      name: "New Student",
      id: `OA-2024-${Math.floor(Math.random() * 900) + 100}`,
      grade: "10th Grade",
      participation: 85,
      auraScore: 75.0,
      attendanceRate: 100,
      gpa: 3.5,
      enrollmentDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      status: "Active",
      img: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=400&h=400&fit=crop",
      uid: `new-student-${Date.now()}`,
    };
    setInternalStudents((prev) => [newStudent, ...prev]);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGrade =
        gradeFilter === "Grade Level (All)" || student.grade === gradeFilter;

      const matchesActivity =
        activityFilter === "Activity Level (All)" ||
        (activityFilter === "High" && student.participation > 80) ||
        (activityFilter === "Moderate" &&
          student.participation >= 50 &&
          student.participation <= 80) ||
        (activityFilter === "Low" && student.participation < 50);

      return matchesSearch && matchesGrade && matchesActivity;
    });
  }, [searchTerm, gradeFilter, activityFilter]);

  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden",
        !isHubChild && "h-screen",
      )}
    >
      {!isHubChild && (
        <TopBar
          title="Student Directory"
          subtitle="Manage student profiles and academic performance"
          actions={
            <>
              <button className="btn-outline h-10 px-6 rounded-[10px] text-[13px] flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-sm">upload_file</span>
                Bulk CSV Import
              </button>
              <button
                onClick={handleAddStudent}
                className="btn-primary h-10 px-6 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Add New Student
              </button>
            </>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto mx-auto px-6 lg:px-10 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: "1,240", icon: "group" },
            { label: "Active Programs", value: "18",   icon: "local_activity" },
            { label: "Avg Aura Score",  value: "82%",  icon: "star" },
            { label: "At Risk",         value: "24",   icon: "warning", iconBg: "bg-[#FEE2E2]" },
          ].map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-foreground transition-colors">
                search
              </span>
              <input
                className="w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary text-foreground placeholder-[#B0AFA8]"
                placeholder="Search by name, grade, or ID..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-white border border-slate-100 rounded-[10px] text-sm px-3 py-2 text-foreground focus:ring-primary outline-none"
            >
              <option>Grade Level (All)</option>
              <option>9th Grade</option>
              <option>10th Grade</option>
              <option>11th Grade</option>
              <option>12th Grade</option>
            </select>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="bg-white border border-slate-100 rounded-[10px] text-sm px-3 py-2 text-foreground focus:ring-primary outline-none"
            >
              <option>Activity Level (All)</option>
              <option>High</option>
              <option>Moderate</option>
              <option>Low</option>
            </select>
            <button className="p-2 border border-slate-100 rounded-[10px] hover:bg-[#F7F8F4] transition-colors">
              <span className="material-symbols-outlined text-[#B0AFA8] text-lg">filter_list</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  {["Student Name", "ID", "Grade", "Participation", "Aura Score", "Status", "Actions"].map((h, i) => (
                    <th key={h} className={`px-6 py-4 text-[11px] font-bold text-[#444441]${i === 6 ? " text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    onClick={(s) => navigate(`/students/${s.id.replace("#", "")}`)}
                  />
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#B0AFA8] text-[13px] font-medium">
                      No students match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-[#F7F8F4] px-6 py-4 flex items-center justify-between border-t border-slate-100">
            <p className="text-xs text-[#B0AFA8] font-medium">
              Showing {filteredStudents.length} of {students.length} students
            </p>
            <div className="flex items-center gap-2">
              <button className="size-8 flex items-center justify-center rounded border border-slate-100 bg-white text-[#B0AFA8] disabled:opacity-50" disabled>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="size-8 !min-h-0 flex items-center justify-center rounded btn-primary text-xs font-medium">1</button>
              <button className="size-8 flex items-center justify-center rounded border border-slate-100 bg-white text-xs font-medium hover:bg-[#F7F8F4] transition-colors">2</button>
              <button className="size-8 flex items-center justify-center rounded border border-slate-100 bg-white text-xs font-medium hover:bg-[#F7F8F4] transition-colors">3</button>
              <button className="size-8 flex items-center justify-center rounded border border-slate-100 bg-white text-[#B0AFA8] hover:bg-[#F7F8F4] transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
