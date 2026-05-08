import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { AppDropdown } from "../../../components/AppDropdown";

// PDS Components
import { PDSButton } from "../../../components/pds/PDSButton";

export const ExaminationsPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const navigate = useNavigate();

  const [exams] = useState([
    {
      id: "EX-2024-001",
      title: "Periodic Test 2 (PT-2)",
      category: "Periodic Test (PT)",
      term: "Term 2",
      status: "Completed",
      date: "Oct 12 - Oct 20, 2024",
      classes: ["Grade 10", "Grade 11", "Grade 12"],
      subjects: 12,
      avgScore: 78.4,
    },
    {
      id: "EX-2024-002",
      title: "First Quarterly Examination",
      category: "Quarterly",
      term: "Term 1",
      status: "In Progress",
      date: "Nov 05 - Nov 15, 2024",
      classes: ["All Grades"],
      subjects: 8,
      avgScore: null,
    },
    {
      id: "EX-2024-003",
      title: "Unit Test - 3",
      category: "Unit Test",
      term: "Term 3",
      status: "Upcoming",
      date: "Dec 10, 2024",
      classes: ["Grade 6", "Grade 7", "Grade 8"],
      subjects: 1,
      avgScore: null,
    },
    {
      id: "EX-2024-004",
      title: "Board Mock Examination",
      category: "Mock Test",
      term: "Term 2",
      status: "Upcoming",
      date: "Jan 15, 2025",
      classes: ["Grade 10", "Grade 12"],
      subjects: 6,
      avgScore: null,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || selectedCategory === "All Categories" || exam.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, exams]);

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
              <PDSButton
                variant="secondary"
                size="md"
                icon="upload_file"
              >
                Bulk Marks Upload
              </PDSButton>
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
                label: "Total Exams Conducted",
                value: "14",
                trend: "Current Academic Year",
                trendType: "stable" as const,
                icon: "description",
                iconBg: "bg-emerald-50",
              },
              {
                label: "Result Completion",
                value: "92.5%",
                trend: "+5% from last cycle",
                trendType: "up" as const,
                icon: "assignment_turned_in",
                iconBg: "bg-blue-50",
              },
              {
                label: "Upcoming Assessments",
                value: "02",
                trend: "Next: Science Mock Test",
                trendType: "stable" as const,
                icon: "event_upcoming",
                iconBg: "bg-amber-50",
              },
            ].map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Examinations List */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/30 overflow-visible relative z-10">
            <div className="p-3 flex items-center gap-4 border-b border-slate-100/50 bg-white rounded-t-[24px] relative z-20">
              {/* Search Bar */}
              <div className="flex-1 relative h-10 group">
                <div className="absolute inset-0 bg-[#F7F8F4] border border-slate-100 rounded-[12px] transition-all group-focus-within:border-primary/50 group-focus-within:ring-4 group-focus-within:ring-primary/5 group-focus-within:bg-white overflow-hidden pointer-events-none" />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-[18px] z-20">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search examinations by title, category or term..."
                  className="relative w-full h-full bg-transparent border-none outline-none pl-11 pr-4 text-[length:var(--font-size-input)] font-[var(--font-weight-input)] text-foreground placeholder-[#B0AFA8] placeholder:font-medium z-10"
                />
              </div>

              {/* Category Filter */}
              <div className="w-[200px] shrink-0">
                <AppDropdown
                  icon="filter_list"
                  placeholder="All Categories"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={["All Categories", "Periodic Test (PT)", "Quarterly", "Half Yearly", "Annual", "Mock Test"]}
                  height="h-10"
                />
              </div>

              <PDSButton
                variant="primary"
                size="md"
                icon="add"
                onClick={() => navigate("/academics/exams/add")}
              >
                Create Exam
              </PDSButton>
            </div>

            <div className="overflow-x-auto no-scrollbar rounded-b-[24px] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#F7F8F4]/30 border-b border-slate-100">
                    <th className="px-6 py-5 text-[10px] font-semibold text-[#B0AFA8] tracking-widest uppercase">Examination Title</th>
                    <th className="px-6 py-5 text-[10px] font-semibold text-[#B0AFA8] tracking-widest uppercase">Category</th>
                    <th className="px-6 py-5 text-[10px] font-semibold text-[#B0AFA8] tracking-widest uppercase">Academic Term</th>
                    <th className="px-6 py-5 text-[10px] font-semibold text-[#B0AFA8] tracking-widest uppercase">Target Grades</th>
                    <th className="px-6 py-5 text-[10px] font-semibold text-[#B0AFA8] tracking-widest uppercase">Timeline</th>
                    <th className="px-6 py-5 text-[10px] font-semibold text-[#B0AFA8] tracking-widest uppercase">Status</th>
                    <th className="px-6 py-5 text-[10px] font-semibold text-[#B0AFA8] tracking-widest text-right uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="hover:bg-[#F7F8F4]/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/academics/exams/${exam.id}`)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-[14px] bg-[#F7F8F4] border border-slate-100 flex items-center justify-center text-[#B0AFA8] group-hover:bg-primary/10 group-hover:text-primary transition-all group-hover:border-primary/20">
                            <span className="material-symbols-outlined text-[20px]">description</span>
                          </div>
                          <p className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">{exam.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[12px] font-bold text-secondary/80">{exam.category}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-secondary/70">
                          <span className="material-symbols-outlined text-[18px]">bookmark</span>
                          <span className="text-[12px] font-bold">{exam.term}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5">
                          {exam.classes.length > 2 ? (
                            <>
                              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-100 text-secondary">
                                {exam.classes[0]}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#F7F8F4] text-[#B0AFA8]">
                                +{exam.classes.length - 1} more
                              </span>
                            </>
                          ) : (
                            exam.classes.map((c, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-100 text-secondary"
                              >
                                {c}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5 text-secondary/70">
                          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                          <span className="text-[12px] font-bold">{exam.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black tracking-tight border",
                          getStatusStyles(exam.status)
                        )}>
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="size-8 rounded-lg hover:bg-slate-50 text-[#B0AFA8] hover:text-secondary transition-all">
                          <span className="material-symbols-outlined text-xl">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredExams.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-[48px] text-slate-200">search_off</span>
                          <p className="text-[14px] font-bold text-[#B0AFA8]">No examinations found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
