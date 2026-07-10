import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  Trophy,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Hash
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { SideDrawer } from "../../../components/SideDrawer";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  time: number;
  points: number;
  hint?: string;
}

export const AddQuizDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [quizData, setQuizData] = useState({
    title: "",
    subject: "",
    instructions: "",
    durationPerQuestion: "",
    maxScore: "",
    deadline: "Fri, 28 Nov 2025 - 11:59 PM",
    allowLate: false,
    questions: [] as Question[]
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "1",
    text: "",
    options: ["", ""],
    correctOption: 0,
    time: 30,
    points: 5
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "New Quiz" : step === 2 ? "Configure Questions" : "Review Quiz"}
      subtitle={step === 1 ? "Enter basic details for the assessment" : step === 2 ? quizData.title : "Verify details before publishing"}
      maxWidth="max-w-[500px]"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Quiz Name</label>
                  <input
                    type="text"
                    placeholder="Enter Quiz title"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium outline-none focus:border-primary/30 transition-all"
                    value={quizData.title}
                    onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Subject</label>
                  <select
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium outline-none focus:border-primary/30 transition-all appearance-none"
                    value={quizData.subject}
                    onChange={(e) => setQuizData({ ...quizData, subject: e.target.value })}
                  >
                    <option value="">Select the subject</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Instructions</label>
                  <textarea
                    placeholder="Enter the instructions, if any"
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium outline-none focus:border-primary/30 transition-all resize-none"
                    value={quizData.instructions}
                    onChange={(e) => setQuizData({ ...quizData, instructions: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Time per Q (sec)</label>
                    <input
                      type="text"
                      placeholder="e.g. 30"
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium outline-none focus:border-primary/30 transition-all"
                      value={quizData.durationPerQuestion}
                      onChange={(e) => setQuizData({ ...quizData, durationPerQuestion: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Max Score</label>
                    <input
                      type="text"
                      placeholder="e.g. 100"
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium outline-none focus:border-primary/30 transition-all"
                      value={quizData.maxScore}
                      onChange={(e) => setQuizData({ ...quizData, maxScore: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Submission Deadline</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8]" />
                    <input
                      type="text"
                      className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium outline-none"
                      value={quizData.deadline}
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[13px] font-bold text-foreground">Allow Late Submission</span>
                  <button
                    onClick={() => setQuizData({ ...quizData, allowLate: !quizData.allowLate })}
                    className={cn(
                      "w-10 h-5 rounded-full transition-all relative",
                      quizData.allowLate ? "bg-primary" : "bg-slate-200"
                    )}
                  >
                    <div className={cn("absolute top-1 size-3 rounded-full bg-white transition-all", quizData.allowLate ? "right-1" : "left-1")} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Question Nav */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                  {["Question 1", "Question 2", "Question 3"].map((q, i) => (
                    <button key={i} className={cn(
                      "px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all",
                      i === 0 ? "bg-primary text-secondary" : "bg-white border border-slate-100 text-[#B0AFA8]"
                    )}>
                      {q}
                    </button>
                  ))}
                  <button className="size-9 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[13px] font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Hash size={16} className="text-primary" /> Question 1
                    </h4>
                    <button className="text-red-500 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <textarea
                    placeholder="Type your question"
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium outline-none focus:border-primary/30 transition-all resize-none"
                    value={currentQuestion.text}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  />

                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Answer Options</label>
                    <div className="space-y-3">
                      {currentQuestion.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <button
                            onClick={() => setCurrentQuestion({ ...currentQuestion, correctOption: i })}
                            className={cn(
                              "size-6 rounded-lg border-2 flex items-center justify-center transition-all",
                              currentQuestion.correctOption === i ? "bg-primary border-primary text-secondary" : "border-slate-200"
                            )}
                          >
                            {currentQuestion.correctOption === i && <CheckCircle2 size={14} />}
                          </button>
                          <input
                            type="text"
                            placeholder={`Enter option ${i + 1}`}
                            className="flex-1 h-12 px-4 bg-white border border-slate-100 rounded-xl text-[14px] font-medium outline-none"
                            value={opt}
                            onChange={(e) => updateOption(i, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addOption}
                      className="text-[12px] font-bold text-primary flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <Plus size={14} /> Add options
                    </button>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-50">
                    <label className="text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest flex items-center gap-2">
                      <HelpCircle size={14} /> Hint (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter any hint for question"
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Time (In sec)</label>
                      <div className="flex gap-2">
                        {["10s", "15s", "30s"].map(t => (
                          <button key={t} className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                            t === "30s" ? "bg-primary text-secondary" : "bg-slate-50 text-[#B0AFA8]"
                          )}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest text-right block">Score</label>
                      <div className="flex items-center justify-end gap-4">
                        <button className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#B0AFA8]">-</button>
                        <span className="text-xl font-black text-foreground">5</span>
                        <button className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-primary">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{quizData.subject}</span>
                    <h3 className="text-2xl font-black text-foreground tracking-tight">{quizData.title}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-foreground">
                      <Clock size={14} className="text-primary" /> 10 Mins
                    </div>
                    <div className="size-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-2 text-[12px] font-bold text-foreground">
                      <HelpCircle size={14} className="text-blue-500" /> 6 Questions
                    </div>
                    <div className="size-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-2 text-[12px] font-bold text-foreground">
                      <Trophy size={14} className="text-amber-500" /> 30 Points
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest border-b border-slate-50 pb-2">Review Questions</h4>
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-white space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-[#B0AFA8] uppercase tracking-widest">Question {i}</span>
                          <div className="flex gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[9px] font-bold text-[#B0AFA8]">30 Sec</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[9px] font-bold text-emerald-600">5 Pts</span>
                          </div>
                        </div>
                        <p className="text-[14px] font-bold text-foreground leading-snug">How many moles are present in 40 g of He?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4].map(opt => (
                            <div key={opt} className={cn(
                              "p-2.5 rounded-xl border text-[12px] font-medium transition-all",
                              opt === 2 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-white border-slate-100 text-[#B0AFA8]"
                            )}>
                              Option {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-100 bg-white relative z-20">
          <div className="flex items-center gap-4">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#B0AFA8] hover:bg-slate-100 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button
              onClick={step === 3 ? onClose : handleNext}
              className="flex-1 h-14 bg-primary text-secondary rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
            >
              {step === 1 ? "Proceed to Questions" : step === 2 ? "Save and Review" : "Publish Quiz"}
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};
