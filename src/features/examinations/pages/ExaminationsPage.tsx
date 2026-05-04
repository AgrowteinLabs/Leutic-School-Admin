import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";

export const ExaminationsPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([
    {
      id: "EX-2024-001",
      title: "Mid-Term Examination 2024",
      type: "Major",
      status: "Completed",
      date: "Oct 12 - Oct 20, 2024",
      classes: ["Grade 10", "Grade 11", "Grade 12"],
      subjects: 12,
      avgScore: 78.4,
    },
    {
      id: "EX-2024-002",
      title: "Science Mock Test",
      type: "Assessment",
      status: "In Progress",
      date: "Nov 05, 2024",
      classes: ["Grade 10A", "Grade 10B"],
      subjects: 1,
      avgScore: null,
    },
    {
      id: "EX-2024-003",
      title: "Annual Sports Quiz",
      type: "Quiz",
      status: "Upcoming",
      date: "Nov 15, 2024",
      classes: ["All Grades"],
      subjects: 1,
      avgScore: null,
    },
    {
      id: "EX-2024-004",
      title: "Mathematics Olympiad",
      type: "Competition",
      status: "Upcoming",
      date: "Dec 02, 2024",
      classes: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
      subjects: 1,
      avgScore: null,
    },
  ]);

  const handleAddExam = () => {
    const newExam = {
      id: `EX-2024-${Math.floor(Math.random() * 900) + 100}`,
      title: "New Assessment Cycle",
      type: "Assessment",
      status: "Upcoming",
      date: "TBD",
      classes: ["Grade 10", "Grade 11"],
      subjects: 1,
      avgScore: null,
    };
    setExams((prev) => [newExam, ...prev]);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-[#EAF2D7]0/10 text-[#2E7D32] border border-[#D9EA85]";
      case "in progress":
        return "bg-[#FEF3C7]0/10 text-[#B45309] border border-[#FDE68A]";
      case "upcoming":
        return "bg-[#EAF2D7]0/10 text-[#3D6B2C] border border-violet-500";
      default:
        return "bg-[#F7F8F4]0/10 text-slate-700 border border-slate-500";
    }
  };

  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden bg-white",
        !isHubChild && "h-screen",
      )}
    >
      {!isHubChild && (
        <TopBar
          title="Exams & Tests"
          subtitle="Manage school examinations, quizzes, and competitions."
          actions={
            <div className="flex items-center gap-3">
              <button className="bg-white border border-slate-100 text-foreground px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-[#F7F8F4] transition-all">
                <span className="material-symbols-outlined text-lg">
                  upload_file
                </span>
                Bulk Marks Upload
              </button>
              <button
                onClick={handleAddExam}
                className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2  transition-all shadow-sm shadow-slate-100/30 "
              >
                <span className="material-symbols-outlined text-sm">
                  add_circle
                </span>
                New Examination
              </button>
            </div>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto mx-auto px-6 lg:px-10 py-6 max-w-[1400px] space-y-8">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "Overall Academic Progress",
              value: "84.2%",
              trend: "+2.4% from last term",
              trendType: "up" as const,
              icon: "trending_up",
            },
            {
              label: "Ongoing Assessments",
              value: "03",
              trend: "Next: Science Mock Test",
              trendType: "stable" as const,
              icon: "pending_actions",
            },
            {
              label: "Average Attendance (Exams)",
              value: "98.8%",
              trend: "Target: 95%+",
              trendType: "up" as const,
              icon: "event_available",
            },
          ].map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Examinations List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/30 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-foreground text-[16px] font-semibold tracking-tight">
              Exam Schedule
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-xl bg-secondary text-white text-xs font-medium capitalize">
                All
              </button>
              <button className="px-3 py-1.5 rounded-xl hover:bg-[#F7F8F4] text-[#B0AFA8] text-xs font-medium capitalize">
                Major Exams
              </button>
              <button className="px-3 py-1.5 rounded-xl hover:bg-[#F7F8F4] text-[#B0AFA8] text-xs font-medium capitalize">
                Mock Tests
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F7F8F4] border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">
                    Title & Type
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">
                    Schedule
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">
                    Classes
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441] text-center">
                    Average Mark
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {exams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="hover:bg-[#F7F8F4] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/examinations/${exam.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] group-hover:bg-primary group-hover:text-foreground transition-all">
                          <span className="material-symbols-outlined">
                            {exam.type === "Quiz"
                              ? "quiz"
                              : exam.type === "Competition"
                                ? "trophy"
                                : "description"}
                          </span>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground group-hover:underline decoration-primary underline-offset-4">
                            {exam.title}
                          </p>
                          <p className="text-xs font-medium capitalize text-[#B0AFA8]">
                            {exam.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[#444441]">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        <span className="text-[11px] font-medium">{exam.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {exam.classes.slice(0, 2).map((c, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium px-2 py-0.5 rounded bg-[#F7F8F4]0/10 text-slate-700 border border-slate-500"
                          >
                            {c}
                          </span>
                        ))}
                        {exam.classes.length > 2 && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#F7F8F4] text-[#B0AFA8]">
                            +{exam.classes.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize border",
                          getStatusColor(exam.status),
                        )}
                      >
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {exam.avgScore ? (
                        <span className="text-sm font-black text-foreground">
                          {exam.avgScore}%
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-foreground/20 capitalize">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#B0AFA8] hover:text-foreground transition-colors">
                        <span className="material-symbols-outlined text-xl">
                          more_vert
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
