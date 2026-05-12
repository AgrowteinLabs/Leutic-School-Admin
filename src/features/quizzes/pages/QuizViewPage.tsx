import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { PDSButton } from "../../../components/pds/PDSButton";
import { SideDrawer } from "../../../components/SideDrawer";
import { cn } from "../../../lib/utils";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  Search,
  Download,
  Trophy,
  Target,
  Timer,
  CalendarCheck
} from "lucide-react";

export const QuizViewPage = () => {
  const navigate = useNavigate();
  const { id, tab } = useParams();
  const activeTab = tab || "results";

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [expandedOption, setExpandedOption] = useState<{ qId: number, optIdx: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const quiz = {
    id: id || "QZ-8842",
    title: "Organic Chemistry: Carbon Bonds",
    subject: "Chemistry",
    teacher: "Dr. Lakshmi K.",
    publishedAt: "Oct 24, 2024",
    closingDate: "Nov 15, 2024",
    duration: "45 Mins",
    totalQuestions: 20,
    totalMarks: 100,
    participation: {
      completed: 10420,
      total: 12000,
      late: 450
    },
    performance: {
      avgScore: 76.5,
      highScore: 98,
      avgTime: "32m 10s"
    }
  };

  const results = [
    {
      name: "Aavya Sharma",
      roll: "12",
      class: "12-A",
      score: 100,
      time: "28m",
      status: "Completed",
      rank: 1,
      avatar: "/Avatar/Female Avatar Age14.png",
      responses: [
        { qId: 1, text: "Which hybridisation is found in ethane molecule?", input: "sp3", timeTaken: "45s", isCorrect: true, points: 5 },
        { qId: 2, text: "The carbon-carbon bond length in diamond is?", input: "1.54 Å", timeTaken: "30s", isCorrect: true, points: 5 },
        { qId: 4, text: "Select the allotropes of carbon from the following:", input: ["Diamond", "Graphite"], timeTaken: "1m 10s", isCorrect: true, points: 10 },
      ]
    },
    {
      name: "Ishan Verma",
      roll: "15",
      class: "12-B",
      score: 84,
      time: "35m",
      status: "Completed",
      rank: 2,
      avatar: "/Avatar/Male Avatar Age15.png",
      responses: [
        { qId: 1, text: "Which hybridisation is found in ethane molecule?", input: "sp2", correctAnswer: "sp3", timeTaken: "55s", isCorrect: false, points: 0 },
        { qId: 2, text: "The carbon-carbon bond length in diamond is?", input: "1.54 Å", timeTaken: "42s", isCorrect: true, points: 5 },
        { qId: 4, text: "Select the allotropes of carbon from the following:", input: ["Diamond", "Coal"], correctAnswer: ["Diamond", "Graphite"], timeTaken: "1m 30s", isCorrect: false, points: 5 },
      ]
    },
    {
      name: "Rahul Sidh",
      roll: "22",
      class: "12-C",
      score: 15,
      time: "42m",
      status: "Completed",
      rank: 10420,
      avatar: "/Avatar/Male Avatar Age16.png",
      responses: [
        { qId: 1, text: "Which hybridisation is found in ethane molecule?", input: "sp", correctAnswer: "sp3", timeTaken: "1m 10s", isCorrect: false, points: 0 },
        { qId: 2, text: "The carbon-carbon bond length in diamond is?", input: "1.20 Å", correctAnswer: "1.54 Å", timeTaken: "55s", isCorrect: false, points: 0 },
        { qId: 4, text: "Select the allotropes of carbon from the following:", input: ["Coal", "Steel"], correctAnswer: ["Diamond", "Graphite"], timeTaken: "2m 00s", isCorrect: false, points: 0 },
      ]
    },
  ];

  const questions = [
    {
      id: 1,
      text: "Which hybridisation is found in ethane molecule?",
      type: "MCQ",
      difficulty: "Medium",
      points: 5,
      avgCorrect: "84%",
      avgTime: "48s",
      targetTime: "60s",
      totalAttended: 10420,
      distribution: [
        {
          option: "sp3 Hybridisation (C-C single bond)",
          count: 8752,
          isCorrect: true,
          percentage: 84,
          students: Array.from({ length: 50 }).map((_, idx) => ({
            name: `Student ${idx + 1}`,
            class: `${10 + (idx % 3)}-${String.fromCharCode(65 + (idx % 4))}`,
            avatar: `/Avatar/${idx % 2 === 0 ? "Female" : "Male"} Avatar Age14.png`
          }))
        },
        {
          option: "sp2 Hybridisation (C=C double bond) which is often found in unsaturated compounds like ethene.",
          count: 1042,
          isCorrect: false,
          percentage: 10,
          students: Array.from({ length: 20 }).map((_, idx) => ({
            name: `Incorrect Student ${idx + 1}`,
            class: "11-C",
            avatar: `/Avatar/Male Avatar Age15.png`
          }))
        },
        { option: "sp", count: 426, isCorrect: false, percentage: 4, students: [] },
        { option: "dsp2", count: 200, isCorrect: false, percentage: 2, students: [] },
      ]
    },
    {
      id: 2,
      text: "The carbon-carbon bond length in diamond is?",
      type: "MCQ",
      difficulty: "Easy",
      points: 5,
      avgCorrect: "92%",
      avgTime: "32s",
      targetTime: "30s",
      totalAttended: 10410,
      distribution: [
        {
          option: "1.54 Å",
          count: 9586,
          isCorrect: true,
          percentage: 92,
          students: Array.from({ length: 30 }).map((_, idx) => ({
            name: `Top Student ${idx + 1}`,
            class: "12-A",
            avatar: `/Avatar/Female Avatar Age14.png`
          }))
        },
        {
          option: "1.34 Å",
          count: 521,
          isCorrect: false,
          percentage: 5,
          students: Array.from({ length: 10 }).map((_, idx) => ({
            name: `Confused Student ${idx + 1}`,
            class: "12-B",
            avatar: `/Avatar/Male Avatar Age15.png`
          }))
        },
        { option: "1.20 Å", count: 213, isCorrect: false, percentage: 2, students: [] },
        { option: "1.10 Å", count: 100, isCorrect: false, percentage: 1, students: [] },
      ]
    },
    {
      id: 4,
      text: "Select the allotropes of carbon from the following list (Multiple correct answers allowed):",
      type: "MSQ",
      difficulty: "Hard",
      points: 10,
      avgCorrect: "58%",
      avgTime: "1m 12s",
      targetTime: "1m 00s",
      totalAttended: 10380,
      distribution: [
        { option: "Diamond", count: 9800, isCorrect: true, percentage: 94, students: [] },
        { option: "Graphite", count: 8200, isCorrect: true, percentage: 79, students: [] },
        { option: "Coal", count: 2100, isCorrect: false, percentage: 20, students: [] },
        { option: "Fullerene", count: 4500, isCorrect: true, percentage: 43, students: [] },
      ]
    },
  ];

  const filteredStudents = useMemo(() => {
    if (!expandedOption) return [];
    const q = questions.find(qu => qu.id === expandedOption.qId);
    if (!q) return [];
    const opt = q.distribution[expandedOption.optIdx];
    if (!opt) return [];

    return opt.students.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 50);
  }, [expandedOption, searchQuery]);

  const participationRate = (quiz.participation.completed / quiz.participation.total) * 100;

  const renderAnswer = (ans: string | string[], colorClass: string = "text-[#444]") => {
    if (Array.isArray(ans)) {
      return (
        <div className="space-y-1.5 mt-2.5">
          {ans.map((a, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={cn(
                "size-1.5 rounded-full shrink-0",
                colorClass.includes("emerald") ? "bg-emerald-500" : colorClass.includes("rose") ? "bg-rose-500" : "bg-slate-300"
              )} />
              <span className={cn("text-[13px] font-bold leading-none", colorClass)}>
                {a}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return <p className={cn("text-[13px] font-bold italic leading-relaxed", colorClass)}>"{ans}"</p>;
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white selection:bg-primary/5">
      <TopBar
        title={quiz.title}
        subtitle={`${quiz.subject} • ${quiz.teacher}`}
        onBack={() => navigate("/academics/quizzes")}
        actions={
          <div className="flex items-center gap-3">
            <PDSButton variant="ghost" size="md" icon="download" className="text-[#666]">Export PDF</PDSButton>
            <PDSButton variant="primary" size="md" icon="edit" className="shadow-none">Edit quiz</PDSButton>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-8 py-8 space-y-10">

          {/* Institutional Stat Cards - Flat Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="min-w-0">
              <StatCard
                label="Participation rate"
                value={`${Math.round(participationRate)}%`}
                trend={`${quiz.participation.completed.toLocaleString()} students`}
                trendType="stable"
                icon="group"
                iconBg="bg-slate-50"
              />
            </div>
            <div className="min-w-0">
              <StatCard
                label="Class average score"
                value={`${quiz.performance.avgScore}%`}
                trend="+4.2% improvement"
                trendType="up"
                icon="school"
                iconBg="bg-slate-50"
              />
            </div>
            <div className="min-w-0">
              <StatCard
                label="Average time taken"
                value={quiz.performance.avgTime}
                trend="45m target time"
                trendType="stable"
                icon="schedule"
                iconBg="bg-slate-50"
              />
            </div>
            <div className="min-w-0">
              <StatCard
                label="Late submissions"
                value={quiz.participation.late.toLocaleString()}
                trend="Requires review"
                trendType="down"
                icon="error"
                iconBg="bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Area */}
            <div className="lg:col-span-8 space-y-8">
              {/* Institutional Tab Bar with Routes */}
              <div className="border-b border-slate-100 shrink-0">
                <div className="flex gap-8 overflow-x-auto no-scrollbar">
                  {[
                    { id: "results", label: "Student results", icon: "assignment_turned_in" },
                    { id: "questions", label: "Question breakdown", icon: "quiz" }
                  ].map((t) => {
                    const isActive = activeTab === t.id;
                    return (
                      <Link
                        key={t.id}
                        to={`/academics/quizzes/${id}/${t.id}`}
                        className={cn(
                          "flex items-center gap-2.5 pb-4 pt-2 text-[14px] font-semibold tracking-tight transition-all relative shrink-0",
                          isActive ? "text-foreground" : "text-[#B0AFA8] hover:text-foreground/70"
                        )}
                      >
                        <span
                          className={cn("material-symbols-outlined text-[20px] transition-all", isActive ? "text-primary" : "")}
                          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {t.icon}
                        </span>
                        {t.label}
                        {isActive && (
                          <motion.div
                            layoutId="quizTabIndicator"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "results" ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="overflow-hidden bg-white">
                      <table className="w-full text-left border-collapse text-[13px]">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="py-4 font-bold text-[#B0AFA8] !normal-case tracking-tight">Student</th>
                            <th className="px-6 py-4 font-bold text-[#B0AFA8] text-center !normal-case tracking-tight">Class</th>
                            <th className="px-6 py-4 font-bold text-[#B0AFA8] text-center !normal-case tracking-tight">Status</th>
                            <th className="py-4 font-bold text-[#B0AFA8] text-right !normal-case tracking-tight">Marks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                          {results.map((res, i) => (
                            <tr
                              key={i}
                              onClick={() => setSelectedStudent(res)}
                              className="group cursor-pointer transition-all"
                            >
                              <td className="py-5">
                                <div className="flex items-center gap-4">
                                  <div className="size-9 rounded-xl bg-white border border-slate-100 overflow-hidden group-hover:border-primary/20 transition-colors shadow-none">
                                    <img src={res.avatar} alt="" className="size-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{res.name}</p>
                                    <p className="text-[11px] font-medium text-[#B0AFA8] mt-0.5 !normal-case">Roll: {res.roll}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center font-bold text-[#444]">{res.class}</td>
                              <td className="px-6 py-5 text-center">
                                <span className={cn(
                                  "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-all shadow-none",
                                  res.status === "Completed" ? "bg-white text-emerald-700 border-emerald-100" : "bg-white text-amber-700 border-amber-100"
                                )}>
                                  {res.status}
                                </span>
                              </td>
                              <td className="py-5 text-right font-black text-foreground text-[15px] tracking-tight">{res.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="questions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-0"
                  >
                    {questions.map((q, i) => (
                      <div key={i} className={cn(
                        "group py-12 space-y-6 bg-white",
                        i !== questions.length - 1 && "border-b border-slate-100"
                      )}>
                        {/* Question Header & Options Wrapper to eliminate gaps */}
                        <div className="space-y-3.5">
                          {/* Question Header - Refactored for tighter single-row alignment */}
                          <div className="flex gap-4 items-start">
                            <p className="text-[16px] font-bold text-foreground leading-tight shrink-0 pt-px">
                              {q.id}.
                            </p>
                            <div className="flex-1 flex items-start justify-between gap-6">
                              <div className="space-y-2 flex-1">
                                <p className="text-[16px] font-bold text-foreground leading-snug break-words">{q.text}</p>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-[#B0AFA8]">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-lg border border-slate-100 !normal-case",
                                    q.difficulty === "Easy" ? "text-emerald-600" : q.difficulty === "Medium" ? "text-blue-600" : "text-rose-600"
                                  )}>
                                    {q.difficulty}
                                  </span>
                                  <span className="size-1 rounded-full bg-slate-200" />
                                  <span className="!normal-case">{q.type}</span>
                                  <span className="size-1 rounded-full bg-slate-200" />
                                  <span className="!normal-case">{q.points} points</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] font-bold text-[#B0AFA8] !normal-case mb-0.5">Accuracy</p>
                                <p className="text-[18px] font-black text-foreground tracking-tighter leading-none">{q.avgCorrect}</p>
                              </div>
                            </div>
                          </div>

                          {/* Options Section */}
                          {q.distribution && q.distribution.length > 0 && (
                            <div className="pl-9 grid grid-cols-1 gap-2.5">
                              {q.distribution.map((dist, idx) => {
                                const isExpanded = expandedOption?.qId === q.id && expandedOption?.optIdx === idx;
                                const optionLabel = String.fromCharCode(65 + idx);
                                return (
                                  <div key={idx} className="space-y-3">
                                    <button
                                      onClick={() => {
                                        setExpandedOption(isExpanded ? null : { qId: q.id, optIdx: idx });
                                        setSearchQuery("");
                                      }}
                                      className={cn(
                                        "group/opt relative w-full min-h-[44px] rounded-xl transition-all text-left flex items-center px-4 py-3 border shadow-none",
                                        dist.isCorrect ? "bg-white border-emerald-100" : "bg-white border-slate-100 hover:border-slate-200"
                                      )}
                                    >
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${dist.percentage}%` }}
                                        className={cn(
                                          "absolute inset-y-0 left-0 rounded-l-xl opacity-[0.03] transition-colors",
                                          dist.isCorrect ? "bg-emerald-500" : "bg-slate-400"
                                        )}
                                      />
                                      <div className="relative flex-1 flex items-center justify-between gap-6 text-[13px]">
                                        <div className="flex items-start gap-4 flex-1">
                                          <span className={cn(
                                            "size-5 rounded flex items-center justify-center text-[10px] font-black transition-all shrink-0 mt-0.5 shadow-none",
                                            dist.isCorrect ? "bg-emerald-500 text-white" : "bg-slate-100 text-[#888] group-hover/opt:bg-slate-200"
                                          )}>
                                            {optionLabel}
                                          </span>
                                          <span className={cn("font-bold transition-colors leading-tight break-words", dist.isCorrect ? "text-emerald-700" : "text-[#444]")}>
                                            {dist.option}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-6 shrink-0">
                                          <div className="flex -space-x-1.5 opacity-40 group-hover/opt:opacity-100 transition-opacity">
                                            {dist.students && dist.students.slice(0, 3).map((s, si) => (
                                              <img key={si} src={s.avatar} className="size-4 rounded-full border border-white" />
                                            ))}
                                          </div>
                                          <div className="flex items-center gap-2 text-right min-w-[80px] justify-end">
                                            <span className="text-[11px] font-bold text-[#B0AFA8] tabular-nums !normal-case">({dist.count.toLocaleString()})</span>
                                            <span className="font-black text-foreground tabular-nums text-[14px]">{dist.percentage}%</span>
                                          </div>
                                          <ChevronDown size={14} className={cn("text-[#B0AFA8] transition-transform duration-300", isExpanded && "rotate-180")} />
                                        </div>
                                      </div>
                                    </button>

                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="p-5 bg-white rounded-2xl border border-slate-100 space-y-5 mx-2 shadow-none">
                                            <div className="flex items-center gap-3">
                                              <div className="relative flex-1">
                                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0AFA8]" size={14} />
                                                <input
                                                  type="text"
                                                  placeholder="Search student or class..."
                                                  onChange={(e) => setSearchQuery(e.target.value)}
                                                  className="w-full h-10 bg-white border border-slate-100 rounded-xl pl-10 pr-4 text-[12px] focus:outline-none focus:border-primary/30 transition-all placeholder:text-[#B0AFA8]/50"
                                                />
                                              </div>
                                              <PDSButton variant="ghost" className="h-10 px-4 text-[11px] font-bold text-[#666] shrink-0 border-slate-100 shadow-none">
                                                <Download size={14} className="mr-2" /> Export full list
                                              </PDSButton>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                              {filteredStudents.length > 0 ? filteredStudents.map((s, si) => (
                                                <div key={si} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 group/item hover:border-primary/20 transition-all shadow-none">
                                                  <div className="flex items-center gap-3 min-w-0">
                                                    <img src={s.avatar} className="size-7 rounded-lg shrink-0 border border-slate-50" />
                                                    <div className="min-w-0">
                                                      <p className="text-[11px] font-bold text-foreground truncate">{s.name}</p>
                                                      <p className="text-[10px] font-medium text-[#B0AFA8] !normal-case">Roll: {si + 1}</p>
                                                    </div>
                                                  </div>
                                                  <span className="px-1.5 py-0.5 rounded-md bg-white text-[#888] text-[10px] font-black border border-slate-100">
                                                    {s.class}
                                                  </span>
                                                </div>
                                              )) : (
                                                <p className="col-span-full text-[10px] font-bold text-[#B0AFA8] text-center py-4 !normal-case">No matches found</p>
                                              )}
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Efficiency & Participation Footer */}
                        <div className="pl-9 flex items-center pt-6 border-t border-slate-100 gap-12">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[#B0AFA8] !normal-case">Target time</p>
                            <p className="text-[14px] font-black text-[#444] leading-none">{q.targetTime}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[#B0AFA8] !normal-case">Average time taken</p>
                            <p className={cn(
                              "text-[14px] font-black leading-none",
                              parseInt(q.avgTime) > parseInt(q.targetTime) ? "text-rose-500" : "text-emerald-500"
                            )}>
                              {q.avgTime}
                            </p>
                          </div>
                          <div className="space-y-1 border-l border-slate-100 pl-12">
                            <p className="text-[10px] font-bold text-[#B0AFA8] !normal-case">Total attended</p>
                            <p className="text-[14px] font-black text-foreground leading-none">{q.totalAttended.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-10">
              {/* Flat Institutional Participation Card - Two-Tone Progress Bar */}
              <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-none relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground">Participation</h3>
                    <p className="text-[11px] font-medium text-[#B0AFA8] mt-0.5">Overall quiz engagement</p>
                  </div>
                  <div className="size-10 rounded-xl  flex items-center justify-center text-primary shadow-none">
                    <span className="material-symbols-outlined text-[22px]">analytics</span>
                  </div>
                </div>

                {/* Minimalist Gauge Layout */}
                <div className="flex items-end gap-6 mb-8">
                  <div className="relative size-32">
                    <svg className="size-full -rotate-90">
                      <circle cx="64" cy="64" r="58" fill="none" strokeWidth="10" stroke="#F1F1F0" />
                      <circle
                        cx="64" cy="64" r="58"
                        fill="none" strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 58}
                        strokeDashoffset={2 * Math.PI * 58 * (1 - participationRate / 100)}
                        stroke="#EF9800"
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-foreground tracking-tight">{Math.round(participationRate)}%</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 pb-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider">Submissions</p>
                      <p className="text-[20px] font-black text-foreground">{quiz.participation.completed.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider">Target</p>
                      <p className="text-[14px] font-bold text-[#666]">{quiz.participation.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Two-Tone Progress Detail Bar - High Contrast */}
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[#666]">Remaining students</span>
                    <span className="text-primary">{(quiz.participation.total - quiz.participation.completed).toLocaleString()} left</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${participationRate}%` }}
                      className="h-full bg-primary"
                    />
                    <div className="flex-1 h-full bg-slate-200/50" />
                  </div>
                  <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-tight">
                    <div className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full bg-primary" />
                      <span className="text-[#666]">Completed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full bg-slate-200" />
                      <span className="text-[#666]">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimal Topper Spotlight */}
              <div className="space-y-6 px-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[#B0AFA8] !normal-case">Top performer</p>
                  <div className="h-px flex-1 bg-slate-100 mx-4" />
                </div>
                <div className="flex items-center gap-5 group cursor-pointer">
                  <div className="size-14 rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-none group-hover:border-primary/30 transition-all duration-500">
                    <img src={results[0].avatar} alt="" className="size-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{results[0].name}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-[#B0AFA8]">
                      <span className="text-primary">{results[0].score} pts</span>
                      <span className="size-1 rounded-full bg-slate-200" />
                      <span>Rank #1</span>
                    </div>
                  </div>
                </div>
                <PDSButton variant="ghost" className="w-full h-11 border-slate-100 hover:bg-slate-50 text-[12px] font-bold text-[#666] rounded-xl shadow-none">
                  View full leaderboard
                </PDSButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SideDrawer for Student Details */}
      <SideDrawer
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.name || ""}
        subtitle={`Roll ${selectedStudent?.roll} • Class ${selectedStudent?.class} • Rank #${selectedStudent?.rank}`}
      >
        <div className="bg-white pb-24 h-full overflow-y-auto no-scrollbar">
          {/* Flat Metrics Header - No Background, No Shadow */}
          <div className="px-8 py-8 space-y-6 border-b border-slate-100">
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#B0AFA8] mb-1.5 flex items-center gap-1.5">
                  <Trophy size={11} className="text-primary" /> Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground tracking-tight">{selectedStudent?.score}</span>
                  <span className="text-[11px] font-bold text-[#B0AFA8]">/ 100</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#B0AFA8] mb-1.5 flex items-center gap-1.5">
                  <Target size={11} className="text-emerald-500" /> Accuracy
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground tracking-tight">
                    {selectedStudent?.responses.length > 0
                      ? Math.round(selectedStudent?.responses.filter((r: any) => r.isCorrect).length / selectedStudent?.responses.length * 100)
                      : 0}%
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#B0AFA8] mb-1.5 flex items-center gap-1.5">
                  <Timer size={11} className="text-blue-500" /> Time
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground tracking-tight">{selectedStudent?.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-100 shadow-none">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shrink-0 shadow-none">
                  <CalendarCheck size={16} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-foreground leading-none">Submitted on-time</p>
                  <p className="text-[10px] font-medium text-[#B0AFA8] mt-1.5">Oct 25, 2024 • 10:45 AM</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 px-2.5 py-0.5 bg-white rounded-lg border border-emerald-100 shadow-none">Verified</span>
            </div>
          </div>

          {/* Question Review Section */}
          <div className="px-8 py-8 space-y-8 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-[11px] font-bold text-[#B0AFA8]">Question review</h4>
              <span className="text-[10px] font-medium text-[#B0AFA8] !normal-case">{selectedStudent?.responses.length} items</span>
            </div>

            <div className="space-y-10">
              {selectedStudent?.responses.map((resp: any, idx: number) => (
                <div key={idx} className="flex gap-5 group/resp">
                  <div className={cn(
                    "size-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] border shadow-none transition-all duration-500 mt-0.5",
                    resp.isCorrect ? "bg-white border-emerald-100 text-emerald-600" : "bg-white border-rose-100 text-rose-600"
                  )}>
                    {resp.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#B0AFA8] mb-2">
                        <span className="!normal-case tracking-tight">Question {resp.qId}</span>
                        <span className="!normal-case">Time: {resp.timeTaken}</span>
                      </div>
                      <p className="text-[14px] font-bold text-foreground leading-snug group-hover/resp:text-primary transition-colors pr-2">{resp.text}</p>
                    </div>

                    <div className="space-y-4 pl-4 border-l-2 border-slate-100 transition-colors group-hover/resp:border-slate-200">
                      {/* Student Response Area */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#B0AFA8]">Selected answer</span>
                            {!resp.isCorrect && (
                              <span className="text-[10px] font-bold text-rose-500 px-1.5 py-0.5 bg-white border border-rose-100 rounded shadow-none">Wrong</span>
                            )}
                          </div>
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-lg border shadow-none",
                            resp.isCorrect ? "bg-white text-emerald-700 border-emerald-100" : "bg-white text-rose-700 border-rose-100"
                          )}>
                            {resp.isCorrect ? "+" : ""}{resp.points} pts
                          </span>
                        </div>
                        {renderAnswer(resp.input, resp.isCorrect ? "text-emerald-700" : "text-rose-700")}
                      </div>

                      {/* Correct Solution Area */}
                      {!resp.isCorrect && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] font-bold text-[#B0AFA8] block">Correct solution</span>
                          {renderAnswer(resp.correctAnswer, "text-emerald-600")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h4 className="text-[11px] font-bold text-[#B0AFA8] mb-4">Quick actions</h4>
              <PDSButton variant="ghost" className="w-full h-12 justify-between px-4 rounded-xl text-[12px] font-bold text-[#666] border border-slate-100 shadow-none hover:bg-white hover:border-primary/20 hover:text-primary transition-all group/btn">
                <span className="flex items-center gap-3">
                  <Download size={14} className="text-[#B0AFA8] group-hover/btn:text-primary transition-colors" />
                  Download analysis
                </span>
                <ChevronDown size={14} className="-rotate-90 opacity-40" />
              </PDSButton>
            </div>
          </div>
        </div>
      </SideDrawer>
    </div>
  );
};
