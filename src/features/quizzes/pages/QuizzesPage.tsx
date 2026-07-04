import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import {
  Plus
} from "lucide-react";
import { AppDropdown } from "../../../components/AppDropdown";
import { graphqlRequest } from "../../../lib/graphqlClient";

interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: number;
  duration: string;
  points: number;
  status: "Draft" | "Published" | "Ended";
  closingDate: string;
  type: string;
  allowLate: boolean;
  completedCount: number;
  totalStudents: number;
}

export const QuizzesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const schoolId = localStorage.getItem("school_id") || "";
        const res = await graphqlRequest<any>(`
          query GetQuizzes($page: Int, $pageSize: Int, $schoolId: String) {
            quizzes(page: $page, pageSize: $pageSize, schoolId: $schoolId) {
              items {
                id
                title
                subject
                durationMinutes
                status
                targetGrade
                questions {
                  id
                  points
                }
              }
              total
            }
          }
        `, { page: 1, pageSize: 50, schoolId });
        
        const mapped = (res.quizzes?.items || []).map((q: any) => {
          const totalPoints = (q.questions || []).reduce((acc: number, curr: any) => acc + (curr.points || 0), 0);
          return {
            id: q.id,
            title: q.title,
            subject: q.subject,
            questions: (q.questions || []).length,
            duration: `${q.durationMinutes} Mins`,
            points: totalPoints,
            status: q.status === "ACTIVE" ? "Published" : q.status === "DRAFT" ? "Draft" : "Ended",
            closingDate: "2026-12-31",
            type: q.targetGrade || "General Quiz",
            allowLate: false,
            completedCount: 0,
            totalStudents: 30
          };
        });
        setQuizzes(mapped);
      } catch (err) {
        console.error("Failed to load quizzes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBFBFA]">
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 py-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">

        {/* Action Bar: Search, Filter, Create */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[350px]">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search by quiz title, ID or subject..."
                className="w-full h-10 pl-11 pr-4 bg-[#F7F8F4] border border-slate-100 rounded-[10px] text-[14px] font-medium text-foreground placeholder-[#B0AFA8] placeholder:font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <AppDropdown
              options={["Chemistry", "Physics", "Mathematics", "Biology", "History", "Literature"]}
              value={""}
              onChange={() => { }}
              width="w-44"
              placeholder="All Subjects"
            />

            <button className="h-10 w-10 bg-[#F7F8F4] border border-slate-100 rounded-[10px] flex items-center justify-center text-[#B0AFA8] hover:text-primary hover:bg-white hover:border-primary/30 transition-all outline-none">
              <span className="material-symbols-outlined text-[20px]">
                tune
              </span>
            </button>

            <button
              onClick={() => navigate("/academics/quizzes/add")}
              className="btn-primary h-10 px-6 rounded-[10px] text-[13px] font-bold flex items-center gap-2 transition-all ml-auto"
            >
              <span className="material-symbols-outlined text-[20px]">
                add_circle
              </span>
              New Quiz
            </button>
          </div>
        </div>

        {/* Quiz Grid */}
        {loading ? (
          <div className="text-center py-20 text-[14px] text-slate-400 font-medium">Loading Quiz Lab...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            <AnimatePresence mode="popLayout">
              {quizzes.map((quiz, i) => {
                const isPassed = new Date(quiz.closingDate) < new Date();

                return (
                  <motion.div
                    key={quiz.id}
                    layout
                    onClick={() => navigate(`/academics/quizzes/${quiz.id}`)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-100 rounded-[22px] p-6 transition-all cursor-pointer hover:border-primary/40 group relative flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black border",
                            quiz.status === "Published" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                              quiz.status === "Draft" ? "bg-slate-50 text-slate-500 border-slate-100" :
                                "bg-amber-50 text-amber-700 border-amber-100"
                          )}>
                            {quiz.status}
                          </span>
                          {isPassed && quiz.allowLate && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black bg-amber-50 text-amber-600 border border-amber-100">
                              Late entry
                            </span>
                          )}
                        </div>
                        <h3 className="text-[19px] font-black text-foreground tracking-tight group-hover:text-primary transition-colors leading-none line-clamp-1">
                          {quiz.title}
                        </h3>
                        <p className="text-[12px] font-bold text-[#B0AFA8]">{quiz.subject} <span className="text-slate-200 px-1">|</span> {quiz.type}</p>
                      </div>

                      {/* Circular Participation Gauge */}
                      <div className="relative size-14 shrink-0">
                        <svg className="size-full -rotate-90">
                          <circle cx="28" cy="28" r="24" fill="none" strokeWidth="3.5" stroke="#F7F8F4" />
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            fill="none"
                            strokeWidth="3.5"
                            strokeDasharray={2 * Math.PI * 24}
                            strokeDashoffset={2 * Math.PI * 24 * (1 - (quiz.completedCount / (quiz.totalStudents || 1)))}
                            stroke="#2E7D32"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-black text-foreground">{quiz.completedCount}</span>
                          <span className="text-[7px] font-bold text-[#B0AFA8] uppercase tracking-tighter">Done</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata indicators */}
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                      <div className="flex gap-6">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-widest leading-none mb-1">Duration</span>
                          <span className="text-[11px] font-black text-foreground leading-none">{quiz.duration}</span>
                        </div>
                        <div className="flex flex-col border-l border-slate-50 pl-6">
                          <span className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-widest leading-none mb-1">Questions</span>
                          <span className="text-[11px] font-black text-foreground leading-none">{quiz.questions} Qst</span>
                        </div>
                        <div className="flex flex-col border-l border-slate-50 pl-6">
                          <span className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-widest leading-none mb-1">Marks</span>
                          <span className="text-[11px] font-black text-foreground leading-none">{quiz.points} Pts</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">arrow_forward</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty State / Add New Card */}
            <motion.div
              onClick={() => navigate("/academics/quizzes/add")}
              className="group border-2 border-dashed border-slate-200 rounded-[28px] p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer min-h-[260px]"
            >
              <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#B0AFA8] group-hover:bg-white group-hover:text-primary transition-all">
                <Plus size={28} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-foreground tracking-tight">Create New Assessment</p>
                <p className="text-[12px] font-medium text-[#B0AFA8]">Design a quiz from scratch</p>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
};
