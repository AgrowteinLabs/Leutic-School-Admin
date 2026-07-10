import React, { useState, useCallback, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Trophy,
  Check,
  Edit3,
  GripVertical,
  Minus,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptions: number[]; // Now an array for multi-select
  isMultiple: boolean;
  time: number;
  points: number;
}

interface QuizData {
  title: string;
  subject: string;
  instructions: string;
  durationPerQuestion: string;
  maxScore: string;
  deadline: Date;
  recipient: string;
  allowLate: boolean;
  shuffleQuestions: boolean;
  questions: Question[];
}

// ----------------------------------------------------------------------
// Step 1: Details (Memoized to prevent re-renders when other steps update)
// ----------------------------------------------------------------------
const Step1Details = memo(({
  quizData,
  updateQuizData
}: {
  quizData: QuizData;
  updateQuizData: (data: Partial<QuizData>) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PDSFormGroup
          label="Quiz Title"
          placeholder="e.g. Molecular Biology basics"
          value={quizData.title}
          onChange={(val) => updateQuizData({ title: val })}
        />
        <PDSFormGroup
          label="Assigned To"
          type="select"
          searchable
          options={[
            "All Students",
            "Tier: Pre-Primary",
            "Tier: Primary",
            "Tier: Middle School",
            "Tier: High School",
            "Tier: Senior Secondary",
            "Class: Grade 10-A",
            "Class: Grade 10-B",
            "Class: Grade 11-A",
            "Class: Grade 11-B",
            "Class: Grade 12-A",
          ]}
          value={quizData.recipient}
          onChange={(val) => updateQuizData({ recipient: val })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PDSFormGroup
          label="Subject"
          type="select"
          options={["Chemistry", "Physics", "Mathematics", "Biology", "History", "Literature"]}
          value={quizData.subject}
          onChange={(val) => updateQuizData({ subject: val })}
        />
        <PDSFormGroup
          label="Submission Deadline"
          type="datetime"
          value={quizData.deadline}
          onChange={(val) => updateQuizData({ deadline: val })}
          icon="calendar_today"
        />
      </div>

      <PDSFormGroup
        label="Administrative Instructions"
        type="textarea"
        rows={3}
        placeholder="Enter instructions for students..."
        value={quizData.instructions}
        onChange={(val) => updateQuizData({ instructions: val })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PDSFormGroup
          label="Time per Q (sec)"
          placeholder="30"
          value={quizData.durationPerQuestion}
          onChange={(val) => updateQuizData({ durationPerQuestion: val })}
        />
        <PDSFormGroup
          label="Maximum Score"
          placeholder="100"
          value={quizData.maxScore}
          onChange={(val) => updateQuizData({ maxScore: val })}
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-white flex items-center justify-center text-primary border border-slate-100 shadow-sm shadow-primary/5">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-foreground">Late Submissions</p>
            <p className="text-[11px] font-medium text-[#B0AFA8]">Allow submissions after the deadline</p>
          </div>
        </div>
        <button
          onClick={() => updateQuizData({ allowLate: !quizData.allowLate })}
          className={cn(
            "w-10 h-5 rounded-full transition-all relative p-1",
            quizData.allowLate ? "bg-primary" : "bg-slate-200"
          )}
        >
          <div className={cn("size-3 rounded-full bg-white transition-all", quizData.allowLate ? "translate-x-5" : "translate-x-0")} />
        </button>
      </div>
    </motion.div>
  );
});

// ----------------------------------------------------------------------
// Question Editor Component (Highly optimized for specific question)
// ----------------------------------------------------------------------
const QuestionEditor = memo(({
  question,
  index,
  updateQuestion,
  removeQuestion,
  cloneQuestion
}: {
  question: Question;
  index: number;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  cloneQuestion?: (id: string) => void;
}) => {

  const [localText, setLocalText] = useState(question.text);
  const [localOptions, setLocalOptions] = useState(question.options);

  // Resync local state when the active question changes
  React.useEffect(() => {
    setLocalText(question.text);
    setLocalOptions(question.options);
  }, [question.id, question.text, question.options]);

  // Debounce text updates to the global state (400ms)
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (localText !== question.text) {
        updateQuestion(question.id, { text: localText });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [localText, question.id, updateQuestion, question.text]);

  // Debounce option updates to the global state (400ms)
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (JSON.stringify(localOptions) !== JSON.stringify(question.options)) {
        updateQuestion(question.id, { options: localOptions });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [localOptions, question.id, updateQuestion, question.options]);

  const updateOption = (optIndex: number, val: string) => {
    const newOptions = [...localOptions];
    newOptions[optIndex] = val;
    setLocalOptions(newOptions);
  };

  const removeOption = (optIndex: number) => {
    if (localOptions.length <= 2) return; // Maintain minimum 2 options
    const newOptions = localOptions.filter((_, i) => i !== optIndex);
    setLocalOptions(newOptions);
    // Adjust correct options if the removed one was selected
    const newCorrect = question.correctOptions
      .filter(i => i !== optIndex)
      .map(i => i > optIndex ? i - 1 : i);
    updateQuestion(question.id, { correctOptions: newCorrect.length > 0 ? newCorrect : [0] });
  };

  const addOption = () => {
    setLocalOptions([...localOptions, ""]);
  };

  const toggleOption = (idx: number) => {
    if (question.isMultiple) {
      const newCorrect = question.correctOptions.includes(idx)
        ? question.correctOptions.filter(i => i !== idx)
        : [...question.correctOptions, idx];
      updateQuestion(question.id, { correctOptions: newCorrect });
    } else {
      updateQuestion(question.id, { correctOptions: [idx] });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <h5 className="text-[15px] font-black text-foreground tracking-tight flex items-center gap-3">
          <span className="text-foreground font-black text-[15px]">
            {(index + 1).toString().padStart(2, '0')}.
          </span>
          Active Question
        </h5>
        <div className="flex gap-2">
          {cloneQuestion && (
            <PDSButton variant="text" className="text-primary hover:bg-primary/5" icon="content_copy" onClick={() => cloneQuestion(question.id)}>Clone</PDSButton>
          )}
          <PDSButton variant="text" className="text-red-500 hover:bg-red-50" icon="delete" onClick={() => removeQuestion(question.id)}>Remove</PDSButton>
        </div>
      </div>

      <PDSFormGroup
        label="Question Content"
        type="textarea"
        rows={4}
        placeholder="Type your question here..."
        value={localText}
        onChange={setLocalText}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-foreground block">Answer Options</label>
          <div className="flex items-center gap-3 px-1">
            <span className="text-[10px] font-semibold text-[#B0AFA8]">Multiple answers</span>
            <button
              onClick={() => {
                const isMulti = !question.isMultiple;
                updateQuestion(question.id, {
                  isMultiple: isMulti,
                  correctOptions: isMulti ? question.correctOptions : (question.correctOptions.length > 0 ? [question.correctOptions[0]] : [0])
                });
              }}
              className={cn(
                "w-9 h-5 rounded-full transition-all relative p-1 shrink-0",
                question.isMultiple ? "bg-emerald-500" : "bg-slate-200"
              )}
            >
              <div className={cn("size-3 rounded-full bg-white transition-all", question.isMultiple ? "translate-x-4" : "translate-x-0")} />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {localOptions.map((opt, i) => (
            <div key={i} className="group relative flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white hover:border-primary/20 transition-all">
              <button
                onClick={() => toggleOption(i)}
                className={cn(
                  "size-9 rounded-full flex items-center justify-center text-[12px] font-black transition-all shrink-0",
                  question.correctOptions.includes(i)
                    ? "bg-primary text-secondary"
                    : "bg-slate-50 text-[#B0AFA8] hover:bg-slate-100"
                )}
              >
                {String.fromCharCode(65 + i)}
              </button>

              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`Type option ${String.fromCharCode(65 + i).toLowerCase()}...`}
                  className="w-full bg-transparent text-[14px] font-bold text-foreground outline-none placeholder:text-[#B0AFA8]/50"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                {question.correctOptions.includes(i) && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-secondary">
                    <CheckCircle2 size={12} strokeWidth={3} />
                    <span className="text-[10px] font-bold">Correct answer</span>
                  </div>
                )}
                <button
                  onClick={() => removeOption(i)}
                  className="size-8 rounded-lg flex items-center justify-center text-[#B0AFA8] hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addOption}
            className="w-full h-12 border-2 border-dashed border-slate-100 rounded-2xl text-[13px] font-bold text-[#B0AFA8] hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2 group"
          >
            <div className="size-6 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Plus size={14} />
            </div>
            Add another option
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
        <div className="space-y-4">
          <label className="text-[13px] font-bold text-foreground block">Time Limit (Sec)</label>
          <div className="flex gap-3">
            {[10, 15, 30, 45, 60].map(t => (
              <button key={t} className={cn(
                "px-4 py-2 rounded-xl text-[12px] font-bold transition-all",
                question.time === t ? "bg-primary text-secondary" : "bg-slate-50 text-[#B0AFA8] hover:bg-slate-100"
              )} onClick={() => updateQuestion(question.id, { time: t })}>
                {t}s
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[13px] font-bold text-foreground block">Points awarded</label>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 py-1">
              <button
                onClick={() => updateQuestion(question.id, { points: Math.max(1, question.points - 1) })}
                className="size-8 rounded-lg flex items-center justify-center text-[#B0AFA8] hover:text-foreground hover:bg-slate-50 transition-all"
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <span className="text-[20px] font-black text-foreground tracking-tighter min-w-[32px] text-center">
                {question.points}
              </span>
              <button
                onClick={() => updateQuestion(question.id, { points: question.points + 1 })}
                className="size-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
              {[1, 2, 5, 10].map(p => (
                <button
                  key={p}
                  onClick={() => updateQuestion(question.id, { points: p })}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[11px] font-black transition-all",
                    question.points === p
                      ? "bg-primary text-secondary"
                      : "text-[#B0AFA8] hover:text-foreground hover:bg-slate-50"
                  )}
                >
                  {p}pt
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ----------------------------------------------------------------------
// Step 2: Question Lab
// ----------------------------------------------------------------------
const Step2QuestionLab = memo(({
  questions,
  setQuestions,
  activeId,
  setActiveId
}: {
  questions: Question[];
  setQuestions: (qs: Question[]) => void;
  activeId: string;
  setActiveId: (id: string) => void;
}) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const addQuestion = () => {
    const newQ: Question = {
      id: Date.now().toString(),
      text: "",
      options: ["", ""],
      correctOptions: [0],
      isMultiple: false,
      time: 30,
      points: 5
    };
    setQuestions([...questions, newQ]);
    setActiveId(newQ.id);
  };

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  }, [questions, setQuestions]);

  const removeQuestion = useCallback((id: string) => {
    const newQs = questions.filter(q => q.id !== id);
    setQuestions(newQs);
    if (activeId === id) {
      setActiveId(newQs.length > 0 ? newQs[0].id : "");
    }
  }, [questions, activeId, setQuestions]);

  const cloneQuestion = useCallback((id: string) => {
    const qToClone = questions.find(q => q.id === id);
    if (qToClone) {
      const newQ = { ...qToClone, id: Date.now().toString() };
      const index = questions.findIndex(q => q.id === id);
      const newQs = [...questions];
      newQs.splice(index + 1, 0, newQ);
      setQuestions(newQs);
      setActiveId(newQ.id);
    }
  }, [questions, setQuestions]);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    requestAnimationFrame(() => setDraggedIdx(idx));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;

    const newQs = [...questions];
    const movedItem = newQs[draggedIdx];
    newQs.splice(draggedIdx, 1);
    newQs.splice(targetIdx, 0, movedItem);
    setQuestions(newQs);
    setDraggedIdx(targetIdx);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedIdx(null);
  };

  const activeIndex = questions.findIndex(q => q.id === activeId);
  const activeQuestion = questions[activeIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Scrollable Question Tabs (Optimized for many questions) */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
        {questions.map((q, i) => (
          <div key={q.id} className="group relative flex items-center shrink-0">
            <button
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(i)}
              onDrop={handleDrop}
              onDragEnd={() => setDraggedIdx(null)}
              onClick={() => setActiveId(q.id)}
              className={cn(
                "pl-6 pr-10 py-2.5 rounded-2xl text-[13px] font-bold whitespace-nowrap transition-all cursor-grab active:cursor-grabbing relative border-2",
                draggedIdx === i
                  ? "bg-slate-50/50 border-dashed border-slate-200 text-transparent"
                  : q.id === activeId
                    ? "bg-secondary text-primary border-secondary shadow-none"
                    : "bg-slate-50 text-[#B0AFA8] hover:bg-slate-100 border-transparent shadow-none",
              )}>
              {draggedIdx === i ? "" : `Question ${i + 1}`}
            </button>
            {questions.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeQuestion(q.id);
                }}
                className={cn(
                  "absolute right-3 size-5 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10",
                  q.id === activeId
                    ? "text-primary hover:bg-white/10"
                    : "text-slate-400 hover:bg-red-50 hover:text-red-500"
                )}
              >
                <X size={12} strokeWidth={3} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addQuestion}
          className="size-10 shrink-0 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {activeQuestion ? (
        <QuestionEditor
          key={activeQuestion.id} // Re-mounts if ID changes, isolated re-renders otherwise
          question={activeQuestion}
          index={activeIndex}
          updateQuestion={updateQuestion}
          removeQuestion={removeQuestion}
          cloneQuestion={cloneQuestion}
        />
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
          <div className="size-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#B0AFA8] mb-4">
            <Plus size={32} />
          </div>
          <h4 className="text-[16px] font-bold text-foreground">No questions yet</h4>
          <p className="text-[13px] text-[#B0AFA8] mt-1 mb-6">Add your first question to start building the assessment.</p>
          <PDSButton variant="primary" icon="add" onClick={addQuestion}>Add First Question</PDSButton>
        </div>
      )}
    </motion.div>
  );
});

// ----------------------------------------------------------------------
// Step 3: Final Review
// ----------------------------------------------------------------------
const Step3Review = memo(({
  quizData,
  updateQuizData,
  onEditQuestion
}: {
  quizData: QuizData;
  updateQuizData: (updates: Partial<QuizData>) => void;
  onEditQuestion: (id: string) => void;
}) => {
  const totalPoints = quizData.questions.reduce((acc, q) => acc + q.points, 0);
  const totalTime = quizData.questions.reduce((acc, q) => acc + q.time, 0);
  const timeInMins = Math.ceil(totalTime / 60);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  // Drag state for Reorder is handled internally by framer-motion.


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Expandable Master Tile */}
      <div className="bg-slate-50/50 rounded-[28px] border border-slate-100/50 overflow-hidden">
        {/* Top Visible Section */}
        <div className="p-6 md:px-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Left: Title & Subtitle */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="size-12 shrink-0 rounded-[20px] bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm shadow-primary/5 mt-1">
              <Trophy size={22} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[20px] font-black text-foreground tracking-tight leading-tight break-words">{quizData.title || "Untitled Assessment"}</h3>
              <div className="text-[13px] font-bold text-[#B0AFA8] mt-1.5 break-words flex flex-wrap items-center">
                <span>{quizData.subject || "General"}</span>
                <span className="mx-3 opacity-40">•</span>
                <span>{quizData.questions.length} Questions</span>
                <span className="mx-3 opacity-40">•</span>
                <span>Deadline: {quizData.deadline ? new Date(quizData.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "None"}</span>
                <button
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors ml-4 pl-4 border-l border-slate-200/60 h-4"
                >
                  <span className="underline decoration-2 underline-offset-2">{isDetailsExpanded ? "Less Info" : "More Info"}</span>
                  {isDetailsExpanded ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Metrics & Controls */}
          <div className="flex flex-wrap items-center gap-6 shrink-0 mt-2 md:mt-0">
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-bold text-[#B0AFA8]">Shuffle</span>
              <button
                onClick={() => updateQuizData({ shuffleQuestions: !quizData.shuffleQuestions })}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative p-1 shrink-0",
                  quizData.shuffleQuestions ? "bg-primary" : "bg-slate-200"
                )}
              >
                <div className={cn("size-3 rounded-full bg-white transition-all", quizData.shuffleQuestions ? "translate-x-5" : "translate-x-0")} />
              </button>
            </div>
            <div className="w-px h-6 bg-slate-200/60 hidden md:block" />
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-bold text-[#B0AFA8] mb-0.5">Total Time</p>
              <p className="text-[15px] font-black text-foreground leading-none">{timeInMins}<span className="text-[11px] ml-0.5 text-[#B0AFA8]">min</span></p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-bold text-[#B0AFA8] mb-0.5">Total Score</p>
              <p className="text-[15px] font-black text-foreground leading-none">{totalPoints}<span className="text-[11px] ml-0.5 text-[#B0AFA8]">pts</span></p>
            </div>
          </div>
        </div>

        {/* Expandable Details Area */}
        <AnimatePresence>
          {isDetailsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-100/50 bg-white/50 overflow-hidden"
            >
              <div className="p-6 md:px-8 space-y-8">
                <div>
                  <p className="text-[11px] font-bold text-[#B0AFA8] mb-2">Instructions</p>
                  <p className="text-[13px] text-foreground font-medium leading-relaxed whitespace-pre-wrap break-words">{quizData.instructions || "No specific instructions provided."}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100/50">
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-[#B0AFA8]">Target Audience</p>
                    <p className="text-[14px] font-bold text-foreground break-words">{quizData.recipient || "All Students"}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-[#B0AFA8]">Late Submissions</p>
                    <p className="text-[14px] font-bold text-foreground">{quizData.allowLate ? "Allowed" : "Strict Deadline"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Ultra-Compact Question Review List with DnD */}
      <div className="px-2">
        {quizData.questions.length === 0 ? (
          <div className="py-16 text-center text-[#B0AFA8] font-medium border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/20">
            No questions defined.
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={quizData.questions}
            onReorder={(newQs) => updateQuizData({ questions: newQs })}
            className="flex flex-col"
          >
            {quizData.questions.map((q, i) => (
              <Reorder.Item
                key={q.id}
                value={q}
                whileDrag={{
                  scale: 1.02,
                  zIndex: 50,
                  cursor: "grabbing",
                  borderRadius: "24px",
                  backgroundColor: "#ffffff",
                  borderBottomColor: "transparent"
                }}
                className="group py-5 flex gap-6 items-start cursor-grab px-4 border-b border-slate-100/50 last:border-0 bg-white hover:bg-slate-50/30 transition-colors w-full min-w-0"
              >
                <div className="flex items-center gap-3 pt-1.5 shrink-0">
                  <GripVertical size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                  <span className="text-[12px] font-black text-[#B0AFA8] w-6">{(i + 1).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-6">
                    <p className="text-[15px] font-bold text-foreground leading-tight break-words flex-1 min-w-0 max-w-full">{q.text || "Untitled Question"}</p>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-[#B0AFA8]">{q.time}s</span>
                        <span className="px-2.5 py-1 rounded-lg bg-primary/20 text-secondary text-[10px] font-bold">{q.points}pt</span>
                      </div>
                      <button
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking edit
                        onClick={() => onEditQuestion(q.id)}
                        className="p-1.5 rounded-lg text-[#B0AFA8] hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={cn(
                        "px-4 py-1.5 rounded-2xl text-[12px] font-bold border flex items-start gap-1.5 transition-all max-w-full",
                        q.correctOptions.includes(idx)
                          ? "bg-primary border-primary text-secondary shadow-sm shadow-primary/10"
                          : "bg-white border-slate-100 text-[#B0AFA8]"
                      )}>
                        {q.correctOptions.includes(idx) && <Check size={12} strokeWidth={4} className="mt-0.5 shrink-0" />}
                        <span className="break-words flex-1 min-w-0">{opt || `Option ${idx + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </motion.div>
  );
});

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------
export const CreateQuizPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [activeQuestionId, setActiveQuestionId] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Global Assessment State
  const [quizData, setQuizData] = useState<QuizData>({
    title: "",
    subject: "",
    instructions: "",
    durationPerQuestion: "",
    maxScore: "",
    deadline: new Date(),
    recipient: "All Students",
    allowLate: false,
    shuffleQuestions: false,
    questions: [
      {
        id: Date.now().toString(),
        text: "",
        options: ["", ""],
        correctOptions: [0],
        isMultiple: false,
        time: 30,
        points: 5
      }
    ]
  });

  // Ensure activeQuestionId is set when entering Step 2
  useEffect(() => {
    if (activeStep === 2 && !activeQuestionId && quizData.questions.length > 0) {
      setActiveQuestionId(quizData.questions[0].id);
    }
  }, [activeStep, activeQuestionId, quizData.questions]);

  const updateQuizData = useCallback((updates: Partial<QuizData>) => {
    setQuizData(prev => ({ ...prev, ...updates }));
  }, []);

  // Auto-save effect triggered by any change in quizData
  React.useEffect(() => {
    setSaveStatus("Saving...");
    const handler = setTimeout(() => {
      setSaveStatus(`Draft Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 1000); // Mock 1-second auto-save to cloud
    return () => clearTimeout(handler);
  }, [quizData]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const schoolId = localStorage.getItem("school_id") || "";
      const input = {
        schoolId,
        title: quizData.title,
        subject: quizData.subject,
        durationMinutes: parseInt(quizData.durationPerQuestion) || 30,
        targetGrade: quizData.recipient.startsWith("Class:") 
          ? quizData.recipient.replace("Class: ", "") 
          : quizData.recipient,
        status: "ACTIVE",
        questions: quizData.questions.map((q) => ({
          questionText: q.text,
          options: q.options,
          correctOptionIndex: q.correctOptions[0] || 0,
          points: q.points
        }))
      };
      
      await graphqlRequest<any>(`
        mutation CreateQuiz($input: CreateQuizInput!) {
          createQuiz(input: $input) {
            id
            title
          }
        }
      `, { input });
      setShowSuccess(true);
    } catch (err: any) {
      console.error("Failed to publish quiz:", err);
      alert("Failed to publish quiz: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
      <TopBar
        title="Create New Quiz"
        subtitle="Design a modern assessment for your students"
        actions={
          <div className="flex items-center gap-3">
            <PDSButton variant="text" onClick={() => navigate(-1)}>Discard</PDSButton>
            {activeStep === 3 ? (
              <PDSButton variant="primary" icon="check_circle" onClick={handlePublish} loading={isPublishing}>Publish Quiz</PDSButton>
            ) : (
              <PDSButton variant="primary" icon="arrow_forward" onClick={() => setActiveStep(prev => prev + 1)}>Next Step</PDSButton>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6">

          {/* Progress Tracker */}
          <div className="flex items-center gap-4 mb-6 px-2">
            {[
              { step: 1, label: "Quiz Details" },
              { step: 2, label: "Question Lab" },
              { step: 3, label: "Final Review" }
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className={cn(
                  "size-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all",
                  activeStep === s.step
                    ? "bg-secondary text-primary"
                    : activeStep > s.step
                      ? "bg-primary text-secondary"
                      : "bg-white border border-slate-100 text-[#B0AFA8]"
                )}>
                  {activeStep > s.step ? <Check size={14} strokeWidth={4} /> : s.step}
                </div>
                <span className={cn(
                  "text-[13px] font-bold tracking-tight",
                  activeStep === s.step ? "text-foreground" : "text-[#B0AFA8]"
                )}>{s.label}</span>
                {s.step < 3 && <div className="w-12 h-px bg-slate-100 mx-2" />}
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden flex flex-col">

            {/* Form Header */}
            <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-[20px] bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">{activeStep === 1 ? "description" : activeStep === 2 ? "quiz" : "fact_check"}</span>
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-[18px] tracking-tight text-foreground">
                    {activeStep === 1 ? "Quiz Information" : activeStep === 2 ? "Add Questions" : "Final Review"}
                  </h4>
                  <p className="text-[12px] font-medium text-[#B0AFA8]">
                    {activeStep === 1 ? "Set the basic details for your quiz" : activeStep === 2 ? "Add questions and select the correct answers" : "Review your quiz details before publishing"}
                  </p>
                </div>
              </div>

              {/* Draft Saved Indicator */}
              {saveStatus && (
                <div className="flex items-center gap-2 text-[#B0AFA8] bg-white px-3 py-1.5 rounded-xl">
                  {saveStatus === "Saving..." ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="size-3 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <CheckCircle2 size={14} className="text-primary" />
                  )}
                  <span className="text-[11px] font-medium italic tracking-tight">{saveStatus}</span>
                </div>
              )}
            </div>

            <div className="px-10 py-6">
              <AnimatePresence mode="wait">
                {activeStep === 1 && <Step1Details key="step1" quizData={quizData} updateQuizData={updateQuizData} />}
                {activeStep === 2 && (
                  <Step2QuestionLab
                    key="step2"
                    questions={quizData.questions}
                    setQuestions={(qs) => updateQuizData({ questions: qs })}
                    activeId={activeQuestionId}
                    setActiveId={setActiveQuestionId}
                  />
                )}
                {activeStep === 3 && (
                  <Step3Review
                    key="step3"
                    quizData={quizData}
                    updateQuizData={updateQuizData}
                    onEditQuestion={(id) => {
                      setActiveQuestionId(id);
                      setActiveStep(2);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <div>
                {activeStep > 1 && (
                  <PDSButton variant="text" icon="arrow_back" onClick={() => setActiveStep(prev => prev - 1)}>Previous</PDSButton>
                )}
              </div>
              <div className="flex gap-4">
                <PDSButton variant="text" onClick={() => navigate(-1)}>Discard Assessment</PDSButton>
                {activeStep === 3 ? (
                  <PDSButton key="btn-publish" variant="primary" icon="send" onClick={handlePublish} loading={isPublishing}>Publish to Portal</PDSButton>
                ) : (
                  <PDSButton key={`btn-next-${activeStep}`} variant="primary" icon="arrow_forward" onClick={() => setActiveStep(prev => prev + 1)}>Next Step</PDSButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PDSSuccessModal
        show={showSuccess}
        onClose={() => navigate("/academics/quizzes")}
        title="Assessment Published!"
        description="Your quiz has been successfully broadcasted to the selected student modules. Track performance in the Quiz Lab."
      />
    </div>
  );
};
