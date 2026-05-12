import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import {
  Plus
} from "lucide-react";
import { AppDropdown } from "../../../components/AppDropdown";

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

  const quizzes: Quiz[] = [
    {
      id: "Q-101",
      title: "Atoms and Molecules",
      subject: "Chemistry",
      questions: 6,
      duration: "10 Mins",
      points: 30,
      status: "Published",
      closingDate: "23 Nov 2025",
      type: "Weekly Assessment",
      allowLate: false,
      completedCount: 24,
      totalStudents: 30
    },
    {
      id: "Q-102",
      title: "Ancient Civilizations",
      subject: "History",
      questions: 12,
      duration: "20 Mins",
      points: 60,
      status: "Draft",
      closingDate: "30 Nov 2025",
      type: "General Quiz",
      allowLate: true,
      completedCount: 0,
      totalStudents: 45
    },
    {
      id: "Q-103",
      title: "Linear Equations",
      subject: "Mathematics",
      questions: 10,
      duration: "15 Mins",
      points: 50,
      status: "Ended",
      closingDate: "10 Nov 2025",
      type: "Unit Test",
      allowLate: false,
      completedCount: 38,
      totalStudents: 40
    }
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          <AnimatePresence mode="popLayout">
            {quizzes.map((quiz, i) => {
              const isPassed = new Date(quiz.closingDate) < new Date();
              const deadlineDay = new Date(quiz.closingDate).toLocaleDateString('en-US', { weekday: 'short' });

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
                          strokeDashoffset={2 * Math.PI * 24 * (1 - (quiz.completedCount / quiz.totalStudents))}
                          stroke={(quiz.completedCount / quiz.totalStudents) > 0.8 ? "#2E7D32" : (quiz.completedCount / quiz.totalStudents) > 0.5 ? "#EF9800" : "#E63535"}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-black text-foreground">{Math.round((quiz.completedCount / quiz.totalStudents) * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Minimal Deadline Sub-line */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[16px] text-[#B0AFA8]">calendar_today</span>
                    <span className="text-[11px] font-bold text-[#B0AFA8]">
                      {deadlineDay}, {quiz.closingDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-widest leading-none mb-1">Duration</span>
                        <span className="text-[11px] font-black text-foreground leading-none">{quiz.duration}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-widest leading-none mb-1">Ques</span>
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

      </div>
    </div>
  );
};
