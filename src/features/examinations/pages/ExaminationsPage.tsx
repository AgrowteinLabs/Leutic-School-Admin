import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";

export const ExaminationsPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const navigate = useNavigate();

  const [exams] = useState([
    {
      id: "EX-2024-001",
      title: "Periodic Test 2 (PT-2)",
      type: "Periodic Test (PT)",
      status: "Completed",
      date: "Oct 12 - Oct 20, 2024",
      classes: ["Grade 10", "Grade 11", "Grade 12"],
      subjects: 12,
      avgScore: 78.4,
    },
    {
      id: "EX-2024-002",
      title: "First Quarterly Examination",
      type: "Quarterly",
      status: "In Progress",
      date: "Nov 05 - Nov 15, 2024",
      classes: ["All Grades"],
      subjects: 8,
      avgScore: null,
    },
    {
      id: "EX-2024-003",
      title: "Unit Test - 3",
      type: "Unit Test",
      status: "Upcoming",
      date: "Dec 10, 2024",
      classes: ["Grade 6", "Grade 7", "Grade 8"],
      subjects: 1,
      avgScore: null,
    },
    {
      id: "EX-2024-004",
      title: "Board Mock Examination",
      type: "Mock Test",
      status: "Upcoming",
      date: "Jan 15, 2025",
      classes: ["Grade 10", "Grade 12"],
      subjects: 6,
      avgScore: null,
    },
  ]);

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "in progress":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "upcoming":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden bg-[#FDFCFB] relative", !isHubChild && "h-screen")}>
      {!isHubChild && (
        <TopBar
          title="Exams & Tests"
          subtitle="Manage school examinations, quizzes, and competitions."
          actions={
            <div className="flex items-center gap-3">
              <button className="btn-secondary h-11 px-6 rounded-[14px] text-[13px] font-bold flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                Bulk Marks Upload
              </button>
              <button 
                onClick={() => navigate("/examinations/add")}
                className="btn-primary h-11 px-6 rounded-[14px] text-[13px] font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/10"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                New Examination
              </button>
            </div>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-10 py-8">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 [&>*]:shadow-none">
            {[
              {
                label: "Overall Academic Progress",
                value: "84.2%",
                trend: "+2.4% from last term",
                trendType: "up" as const,
                icon: "trending_up",
                iconBg: "bg-emerald-50",
              },
              {
                label: "Ongoing Assessments",
                value: "03",
                trend: "Next: Science Mock Test",
                trendType: "stable" as const,
                icon: "pending_actions",
                iconBg: "bg-blue-50",
              },
              {
                label: "Average Attendance (Exams)",
                value: "98.8%",
                trend: "Target: 95%+",
                trendType: "up" as const,
                icon: "event_available",
                iconBg: "bg-amber-50",
              },
            ].map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Examinations List */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/30 overflow-hidden">
            <div className="p-6 border-b border-slate-100/50 flex justify-between items-center bg-white rounded-t-[24px]">
              <div className="flex flex-col">
                <h3 className="text-foreground text-[16px] font-bold tracking-tight">Exam Schedule</h3>
                <p className="text-[11px] font-bold text-[#B0AFA8] mt-0.5">Manage and track assessment cycles</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2 p-1 bg-[#F7F8F4] rounded-xl border border-slate-100">
                  {["All", "Periodic Tests", "Major Exams", "Internal"].map((f) => (
                    <button
                      key={f}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[11px] font-black transition-all",
                        f === "All" ? "bg-white text-secondary shadow-sm" : "text-[#B0AFA8] hover:text-foreground"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => navigate("/examinations/add")}
                  className="h-9 px-4 rounded-lg bg-primary text-white text-[12px] font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Create Exam
                </button>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#F7F8F4]/30 border-b border-slate-100">
                    <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Title & Type</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Schedule</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Classes</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-center">Avg Mark</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {exams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="hover:bg-[#F7F8F4]/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/examinations/${exam.id}`)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-[14px] bg-[#F7F8F4] border border-slate-100 flex items-center justify-center text-[#B0AFA8] group-hover:bg-primary/10 group-hover:text-primary transition-all group-hover:border-primary/20">
                            <span className="material-symbols-outlined text-[20px]">
                              {exam.type === "Quiz" ? "quiz" : exam.type === "Competition" ? "trophy" : "description"}
                            </span>
                          </div>
                          <div className="flex flex-col leading-tight">
                            <p className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">{exam.title}</p>
                            <p className="text-[11px] font-bold text-[#B0AFA8]">{exam.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5 text-secondary/70">
                          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                          <span className="text-[12px] font-bold">{exam.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {exam.classes.slice(0, 2).map((c, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-white border border-slate-100 text-secondary"
                            >
                              {c}
                            </span>
                          ))}
                          {exam.classes.length > 2 && (
                            <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-[#F7F8F4] text-[#B0AFA8]">
                              +{exam.classes.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border",
                          getStatusStyles(exam.status)
                        )}>
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {exam.avgScore ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[14px] font-black text-secondary">{exam.avgScore}%</span>
                            <div className="w-12 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${exam.avgScore}%` }} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-200 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="size-8 rounded-lg hover:bg-slate-50 text-[#B0AFA8] hover:text-secondary transition-all">
                          <span className="material-symbols-outlined text-xl">more_vert</span>
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
    </div>
  );
};
