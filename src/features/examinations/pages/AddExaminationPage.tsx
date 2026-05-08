import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AppDropdown } from "../../../components/AppDropdown";
import { AppDatePicker } from "../../../components/AppDatePicker";
import Lottie from "lottie-react";
import successAnimation from "../../../assets/animations/success.json";

export const AddExaminationPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    const steps = [
        { id: 1, title: "Identity & Schedule", subtitle: "Exam basics & timeline" },
        { id: 2, title: "Subjects", subtitle: "Configuration grid" },
    ];

    // Form State
    const [examTitle, setExamTitle] = useState("");
    const [examType, setExamType] = useState("");
    const [academicTerm, setAcademicTerm] = useState("");
    const [academicYear, setAcademicYear] = useState("Academic Year 2025 - 2026");
    const [targetGrades, setTargetGrades] = useState<string[]>([]);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [publishDate, setPublishDate] = useState<Date | null>(null);

    const [subjects, setSubjects] = useState<any[]>([
        { id: Date.now(), subjectId: "", date: null, startTime: "09:00", duration: 180, maxMarks: 100, passingMarks: 33 }
    ]);

    const ALL_GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
    const EXAM_TYPES = ["Periodic Test (PT)", "Unit Test", "Quarterly", "Half Yearly", "Annual Exam", "Board Exam", "Mock Test", "Practical / Internal", "Continuous Evaluation"];
    const TERMS = ["Term 1", "Term 2", "Annual", "Quarterly"];
    const ACADEMIC_YEARS = ["Academic Year 2025 - 2026", "Academic Year 2024 - 2025", "Academic Year 2023 - 2024"];

    const handleAddSubject = () => {
        setSubjects([...subjects, { id: Date.now(), subjectId: "", date: null, startTime: "09:00", duration: 180, maxMarks: 100, passingMarks: 33 }]);
    };

    const handleRemoveSubject = (id: number) => {
        setSubjects(subjects.filter(s => s.id !== id));
    };

    const handleUpdateSubject = (id: number, field: string, value: any) => {
        setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleFinalize = () => {
        setShowSuccess(true);
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white font-sans">
            <TopBar
                title="Create Examination"
                subtitle="Configure new assessment cycles for the academic year"
                actions={
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-text px-4 py-2 rounded-[10px] text-[13px] transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                }
            />

            <div className="flex-1 overflow-y-auto no-scrollbar relative">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
                    {/* Minimal Stepper */}
                    <div className="mb-16">
                        <div className="flex items-center justify-between relative max-w-sm mx-auto">
                            <div className="absolute top-[11px] left-0 right-0 h-[2px] bg-slate-100 -z-10" />
                            <motion.div
                                className="absolute top-[11px] left-0 h-[2px] bg-foreground -z-10 origin-left"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />

                            {steps.map((s) => {
                                const isActive = step === s.id;
                                const isCompleted = step > s.id;

                                return (
                                    <div key={s.id} className="flex flex-col items-center gap-4 relative bg-white px-4">
                                        <motion.div
                                            className={cn(
                                                "size-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 z-10",
                                                isActive ? "bg-foreground text-white shadow-md shadow-slate-900/10" :
                                                    isCompleted ? "bg-foreground text-white" : "bg-white border-2 border-slate-100 text-[#B0AFA8]"
                                            )}
                                            animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                                        >
                                            {isCompleted ? <span className="material-symbols-outlined text-[14px]">check</span> : s.id}
                                        </motion.div>
                                        <div className="text-center absolute top-10 w-32 -ml-16 left-1/2">
                                            <p className={cn(
                                                "text-[13px] font-bold transition-colors duration-300",
                                                isActive || isCompleted ? "text-foreground" : "text-[#B0AFA8]"
                                            )}>{s.title}</p>
                                            <p className="text-[11px] text-[#B0AFA8] font-medium mt-0.5">{s.subtitle}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="min-h-[400px] mt-20">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                {step === 1 && (
                                    <div className="space-y-12">
                                        {/* Section 1: Basic Identity */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                            <FormGroup
                                                label="Examination Title"
                                                placeholder="e.g. Mid-Term Assessment 2024"
                                                value={examTitle}
                                                onChange={setExamTitle}
                                            />
                                            <FormGroup
                                                label="Exam Category"
                                                type="select"
                                                options={EXAM_TYPES}
                                                placeholder="Select category"
                                                value={examType}
                                                onChange={setExamType}
                                            />
                                        </div>

                                        {/* Section 2: Academic Context */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                            <FormGroup
                                                label="Academic Year"
                                                type="select"
                                                options={ACADEMIC_YEARS}
                                                placeholder="Select year"
                                                value={academicYear}
                                                onChange={setAcademicYear}
                                            />
                                            <FormGroup
                                                label="Academic Term"
                                                type="select"
                                                options={TERMS}
                                                placeholder="Select term"
                                                value={academicTerm}
                                                onChange={setAcademicTerm}
                                            />
                                        </div>

                                        {/* Section 3: Targets */}
                                        <div className="space-y-4">
                                            <label className="text-[12px] font-bold text-[#B0AFA8] tracking-tight px-1 uppercase tracking-widest">Target Grades</label>
                                            <div className="flex flex-wrap gap-2">
                                                {ALL_GRADES.map(grade => {
                                                    const isSelected = targetGrades.includes(grade);
                                                    return (
                                                        <button
                                                            key={grade}
                                                            onClick={() => {
                                                                if (isSelected) setTargetGrades(targetGrades.filter(g => g !== grade));
                                                                else setTargetGrades([...targetGrades, grade]);
                                                            }}
                                                            className={cn(
                                                                "px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all border",
                                                                isSelected
                                                                    ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/10"
                                                                    : "bg-[#F7F8F4] text-[#B0AFA8] border-transparent hover:border-slate-200"
                                                            )}
                                                        >
                                                            {grade}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Section 4: Timeline */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                            <FormGroup
                                                label="Cycle Start Date"
                                                type="date"
                                                placeholder="Start date"
                                                value={startDate}
                                                onChange={setStartDate}
                                            />
                                            <FormGroup
                                                label="Cycle End Date"
                                                type="date"
                                                placeholder="End date"
                                                value={endDate}
                                                onChange={setEndDate}
                                            />
                                            <FormGroup
                                                label="Result Publication"
                                                type="date"
                                                placeholder="Expected date"
                                                value={publishDate}
                                                onChange={setPublishDate}
                                                optional
                                            />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex flex-col">
                                                <h4 className="text-[16px] font-bold text-foreground tracking-tight">Subject Mapping</h4>
                                                <p className="text-[12px] font-medium text-[#B0AFA8]">Define dates, times and assessment criteria per subject</p>
                                            </div>
                                            <button
                                                onClick={handleAddSubject}
                                                className="h-10 px-6 rounded-xl bg-secondary text-white text-[12px] font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                                Add Subject
                                            </button>
                                        </div>

                                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                                            <div className="overflow-x-auto no-scrollbar">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-[#F7F8F4]/50 border-b border-slate-100">
                                                            <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-left w-[250px]">Subject</th>
                                                            <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-left w-[180px]">Date</th>
                                                            <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-left w-[140px]">Start Time</th>
                                                            <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-left w-[120px]">Duration</th>
                                                            <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-left w-[120px]">Max Marks</th>
                                                            <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-left w-[120px]">Pass Marks</th>
                                                            <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-right"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {subjects.map((sub, idx) => (
                                                            <tr key={sub.id} className="group hover:bg-[#F7F8F4]/30 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <AppDropdown
                                                                        options={["Mathematics", "Physics", "Chemistry", "Biology", "English", "History"]}
                                                                        value={sub.subjectId}
                                                                        onChange={(val) => handleUpdateSubject(sub.id, "subjectId", val)}
                                                                        placeholder="Select Subject"
                                                                        className="h-11 bg-transparent border-none shadow-none hover:bg-white transition-all"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <AppDatePicker
                                                                        value={sub.date}
                                                                        onChange={(val) => handleUpdateSubject(sub.id, "date", val)}
                                                                        placeholder="Date"
                                                                        className="h-11 bg-transparent border-none shadow-none hover:bg-white transition-all"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <input
                                                                        type="time"
                                                                        value={sub.startTime}
                                                                        onChange={(e) => handleUpdateSubject(sub.id, "startTime", e.target.value)}
                                                                        className="h-11 w-full bg-transparent border-none outline-none text-[13px] font-bold text-secondary px-3 rounded-lg hover:bg-white transition-all"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-1.5 bg-transparent group-hover/td:bg-white transition-all rounded-lg px-3 h-11 border border-transparent hover:border-slate-100">
                                                                        <input
                                                                            type="number"
                                                                            value={sub.duration}
                                                                            onChange={(e) => handleUpdateSubject(sub.id, "duration", parseInt(e.target.value))}
                                                                            className="w-10 bg-transparent border-none outline-none text-[13px] font-bold text-secondary text-center"
                                                                        />
                                                                        <span className="text-[10px] font-bold text-[#B0AFA8]">min</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <input
                                                                        type="number"
                                                                        value={sub.maxMarks}
                                                                        onChange={(e) => handleUpdateSubject(sub.id, "maxMarks", parseInt(e.target.value))}
                                                                        className="h-11 w-full bg-transparent border-none outline-none text-[13px] font-bold text-secondary px-3 rounded-lg hover:bg-white transition-all text-center"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <input
                                                                        type="number"
                                                                        value={sub.passingMarks}
                                                                        onChange={(e) => handleUpdateSubject(sub.id, "passingMarks", parseInt(e.target.value))}
                                                                        className="h-11 w-full bg-transparent border-none outline-none text-[13px] font-bold text-secondary px-3 rounded-lg hover:bg-white transition-all text-center"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    {subjects.length > 1 && (
                                                                        <button
                                                                            onClick={() => handleRemoveSubject(sub.id)}
                                                                            className="size-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Navigation Actions */}
            <div className="bg-white border-t border-slate-100 py-5 px-6 lg:px-10 z-20">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <button
                        onClick={() => setStep(prev => Math.max(1, prev - 1))}
                        className={cn(
                            "btn-text px-8 h-10 rounded-xl text-[13px] font-bold transition-all",
                            step === 1 && "opacity-0 pointer-events-none"
                        )}
                    >
                        Back
                    </button>

                    <button
                        onClick={() => step < 2 ? setStep(prev => prev + 1) : handleFinalize()}
                        className="btn-primary px-10 h-10 rounded-xl text-[13px] font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 group"
                    >
                        {step === 2 ? "Launch Examination" : "Next Step"}
                        {step < 2 && (
                            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => navigate("/examinations")}
                            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm cursor-pointer"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[40px] p-12 max-w-lg w-full relative z-10 shadow-2xl text-center"
                        >
                            <div className="mb-8 relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                                    className="size-32 mx-auto relative z-10"
                                >
                                    <Lottie animationData={successAnimation} loop={false} className="w-full h-full" />
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 size-32 bg-[#EAF2D7] rounded-full mx-auto"
                                />
                            </div>

                            <h3 className="text-[24px] font-bold text-[#3D6B2C] tracking-tight mb-2">Exam Cycle Created!</h3>
                            <p className="text-[#B0AFA8] text-[15px] font-medium leading-relaxed mb-10 px-4">
                                The examination schedule has been finalized and mapped to the respective grades.
                            </p>

                            <button
                                onClick={() => navigate("/examinations")}
                                className="btn-primary w-full h-10 rounded-xl text-[13px] font-bold"
                            >
                                View Exam Schedule
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FormGroup = ({ label, placeholder, icon, type = "input", options = [], searchable = false, disabled = false, optional = false, value, onChange }: any) => {
    return (
        <div className="space-y-2 group">
            <label className={cn(
                "text-[12px] font-bold transition-colors px-1 flex items-center justify-between tracking-tight",
                "text-[#B0AFA8] group-focus-within:text-foreground"
            )}>
                {label}
                {optional && <span className="text-[10px] text-[#B0AFA8] font-medium normal-case tracking-normal opacity-60">Optional</span>}
            </label>
            <div className="relative">
                {icon && type === "input" && (
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px] group-focus-within:text-primary transition-colors z-10">
                        {icon}
                    </span>
                )}
                {type === "input" && (
                    <input
                        disabled={disabled}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={cn(
                            "w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-[10px] outline-none text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white",
                            icon ? "pl-12 pr-6" : "px-6",
                            disabled && "opacity-50 cursor-not-allowed",
                        )}
                        placeholder={placeholder}
                    />
                )}
                {type === "date" && (
                    <AppDatePicker
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        icon={icon}
                    />
                )}
                {type === "select" && (
                    <AppDropdown
                        options={options}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        searchable={searchable}
                        icon={icon}
                    />
                )}
            </div>
        </div>
    );
};
