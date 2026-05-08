import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AppDatePicker } from "../../../components/AppDatePicker";
import Lottie from "lottie-react";
import successAnimation from "../../../assets/animations/success.json";

export const AcademicSetupPage = ({ isHubChild, routeSub }: { isHubChild?: boolean; routeSub?: string }) => {
    const navigate = useNavigate();
    const [view, setView] = useState<"list" | "create">(routeSub === "new" ? "create" : "list");
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    // Sync view with routeSub
    useEffect(() => {
        if (routeSub === "new") {
            setView("create");
        } else {
            setView("list");
            setStep(1);
        }
    }, [routeSub]);

    // Mock Data for List
    const [academicYears] = useState([
        { id: 1, name: "Academic Year 2023 - 2024", start: "June 01, 2023", end: "May 31, 2024", status: "Completed", terms: 3 },
        { id: 2, name: "Academic Year 2024 - 2025", start: "June 01, 2024", end: "May 31, 2025", status: "Active", terms: 3 },
        { id: 3, name: "Academic Year 2025 - 2026", start: "June 01, 2025", end: "May 31, 2026", status: "Draft", terms: 2 },
    ]);

    // Sort: Latest first
    const sortedYears = useMemo(() => {
        return [...academicYears].sort((a, b) => b.id - a.id);
    }, [academicYears]);

    const steps = [
        { id: 1, title: "Calendar", subtitle: "Year definition" },
        { id: 2, title: "Terms", subtitle: "Semester mapping" },
        { id: 3, title: "Rollover", subtitle: "Data migration" },
    ];

    // Form State
    const [yearName, setYearName] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
        if (date) {
            const nextYear = date.getFullYear() + 1;
            const autoEndDate = new Date(nextYear, 4, 31); // May is 4 (0-indexed)
            setEndDate(autoEndDate);
            
            if (!yearName) {
                setYearName(`Academic Year ${date.getFullYear()} - ${nextYear}`);
            }
        }
    };

    const [terms, setTerms] = useState<any[]>([
        { id: 1, name: "Term 1", start: null, end: null },
        { id: 2, name: "Term 2", start: null, end: null }
    ]);

    const [rolloverOptions, setRolloverOptions] = useState({
        students: true,
        teachers: true,
        subjects: true,
        timetable: false,
        auraPoints: false
    });

    const handleAddTerm = () => {
        setTerms([...terms, { id: Date.now(), name: `Term ${terms.length + 1}`, start: null, end: null }]);
    };

    const handleRemoveTerm = (id: number) => {
        setTerms(terms.filter(t => t.id !== id));
    };

    const handleUpdateTerm = (id: number, field: string, value: any) => {
        setTerms(terms.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleFinalize = () => {
        setShowSuccess(true);
    };

    const resetForm = () => {
        setStep(1);
        setShowSuccess(false);
        setYearName("");
        setStartDate(null);
        setEndDate(null);
        setTerms([
            { id: 1, name: "Term 1", start: null, end: null },
            { id: 2, name: "Term 2", start: null, end: null }
        ]);
        navigate("/academics/setup");
    };

    return (
        <div className={cn("flex-1 flex flex-col overflow-hidden bg-white font-sans", !isHubChild && "h-screen")}>
            {!isHubChild && (
                <TopBar
                    title="Academic Year Setup"
                    subtitle="Initialize new institutional cycles and manage term transitions"
                    actions={
                        <div className="flex gap-3">
                            <button
                                onClick={() => view === "create" ? navigate("/academics/setup") : navigate(-1)}
                                className="btn-text px-4 py-2 rounded-[10px] text-[13px] transition-all"
                            >
                                {view === "create" ? "Cancel" : "Back"}
                            </button>
                        </div>
                    }
                />
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar relative">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
                    <AnimatePresence mode="wait">
                        {view === "list" ? (
                            <motion.div
                                key="list-view"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <h3 className="text-[18px] font-bold text-foreground tracking-tight leading-tight">School Academic Years</h3>
                                        <p className="text-[12px] font-medium text-[#B0AFA8] mt-0.5">List of all academic years and their dates</p>
                                    </div>
                                    <button 
                                        onClick={() => navigate("/academics/setup/new")}
                                        className="btn-primary h-10 px-6 rounded-xl text-[12px] font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/10"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                        Add New Academic Year
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {sortedYears.map((year) => (
                                        <div key={year.id} className="p-6 rounded-[28px] bg-white border border-slate-100 transition-all hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="size-10 rounded-xl bg-[#F7F8F4] flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-foreground transition-all">
                                                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                                </div>
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[9px] font-bold tracking-tight border",
                                                    year.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    year.status === "Completed" ? "bg-slate-50 text-[#B0AFA8] border-slate-100" :
                                                    "bg-indigo-50 text-indigo-600 border-indigo-100"
                                                )}>
                                                    {year.status}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <h4 className="text-[15px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{year.name}</h4>
                                                <p className="text-[11px] font-bold text-[#B0AFA8]">{year.terms} Academic Terms</p>
                                            </div>

                                            <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-[#B0AFA8] uppercase tracking-widest leading-none mb-1.5">Cycle Period</span>
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-secondary/80">
                                                        <span>{year.start}</span>
                                                        <span className="material-symbols-outlined text-[14px] text-slate-300">arrow_forward</span>
                                                        <span>{year.end}</span>
                                                    </div>
                                                </div>
                                                <button className="size-8 flex items-center justify-center text-[#B0AFA8] hover:text-primary transition-all">
                                                    <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="create-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-[1000px] mx-auto pb-32"
                            >
                                {/* Restored Stepper */}
                                <div className="mb-12">
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
                                                            "text-[12px] font-bold transition-colors duration-300",
                                                            isActive || isCompleted ? "text-foreground" : "text-[#B0AFA8]"
                                                        )}>{s.title}</p>
                                                        <p className="text-[11px] text-[#B0AFA8] font-medium mt-0.5">{s.subtitle}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="min-h-[300px] mt-16">
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
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                        <div className="col-span-full">
                                                            <FormGroup 
                                                                label="Academic Year Label" 
                                                                placeholder="e.g. Academic Year 2025 - 2026" 
                                                                value={yearName} 
                                                                onChange={setYearName} 
                                                            />
                                                        </div>
                                                        <FormGroup 
                                                            label="Academic Start Date" 
                                                            type="date" 
                                                            value={startDate} 
                                                            onChange={handleStartDateChange} 
                                                        />
                                                        <FormGroup 
                                                            label="Academic End Date" 
                                                            type="date" 
                                                            value={endDate} 
                                                            onChange={setEndDate} 
                                                        />
                                                    </div>

                                                </div>
                                            )}

                                            {step === 2 && (
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between px-2 mb-2">
                                                        <div className="flex flex-col">
                                                            <h4 className="text-[16px] font-extrabold text-foreground tracking-tight">Academic Terms</h4>
                                                            <p className="text-[11px] font-medium text-[#B0AFA8]">Chronological term mapping</p>
                                                        </div>
                                                        <button 
                                                            onClick={handleAddTerm}
                                                            className="h-9 px-4 rounded-lg bg-[#F7F8F4] text-slate-600 text-[13px] font-bold flex items-center gap-2 hover:bg-slate-200/50 hover:text-foreground transition-all active:scale-95"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">add</span>
                                                            Add Term
                                                        </button>
                                                    </div>

                                                    <div className="relative space-y-3">
                                                        {/* Timeline Line */}
                                                        <div className="absolute left-[23px] top-6 bottom-6 w-[1px] bg-slate-100 -z-0 hidden md:block" />

                                                        {terms.map((term, idx) => (
                                                            <motion.div 
                                                                key={term.id}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                style={{ '--base-z': 30 - idx } as any}
                                                                className="relative flex items-center gap-5 group z-[var(--base-z)] hover:z-[60] focus-within:z-[60]"
                                                            >
                                                                {/* Index Badge */}
                                                                <div className="size-[48px] rounded-2xl bg-[#F7F8F4] border border-slate-100 flex items-center justify-center text-secondary font-black text-[14px] group-hover:bg-primary group-hover:text-foreground transition-all shrink-0">
                                                                    T{idx + 1}
                                                                </div>

                                                                <div className="flex-1 bg-white border border-slate-100 rounded-[20px] p-4 flex flex-col md:flex-row items-center gap-6 group-hover:border-primary/20 transition-all shadow-sm shadow-slate-200/5">
                                                                    <div className="flex-1 w-full md:w-auto">
                                                                        <input 
                                                                            value={term.name} 
                                                                            onChange={(e) => handleUpdateTerm(term.id, "name", e.target.value)}
                                                                            className="bg-transparent border-none outline-none text-[14px] font-bold text-foreground placeholder-slate-300 w-full focus:text-primary"
                                                                        />
                                                                    </div>

                                                                    <div className="flex items-center gap-4 flex-[2] w-full md:w-auto">
                                                                        <div className="flex-1">
                                                                            <AppDatePicker 
                                                                                height="h-10"
                                                                                placeholder="Starts"
                                                                                value={term.start} 
                                                                                onChange={(val: any) => handleUpdateTerm(term.id, "start", val)} 
                                                                                placement={idx === terms.length - 1 ? "top" : "bottom"}
                                                                            />
                                                                        </div>
                                                                        <span className="material-symbols-outlined text-slate-200 text-[16px]">arrow_forward</span>
                                                                        <div className="flex-1">
                                                                            <AppDatePicker 
                                                                                height="h-10"
                                                                                placeholder="Ends"
                                                                                value={term.end} 
                                                                                onChange={(val: any) => handleUpdateTerm(term.id, "end", val)} 
                                                                                placement={idx === terms.length - 1 ? "top" : "bottom"}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {terms.length > 1 && (
                                                                        <button 
                                                                            onClick={() => handleRemoveTerm(term.id)}
                                                                            className="size-8 rounded-lg flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {step === 3 && (
                                                <div className="space-y-12">
                                                    <div className="space-y-6">
                                                        <h4 className="text-[16px] font-bold text-foreground tracking-tight px-2">Data Rollover Settings</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {[
                                                                { id: 'students', label: 'Carry Over Students', desc: 'Promote active students to next grade' },
                                                                { id: 'teachers', label: 'Maintain Staff Records', desc: 'Keep existing assignments' },
                                                                { id: 'subjects', label: 'Clone Subject Master', desc: 'Copy subject mappings' },
                                                                { id: 'timetable', label: 'Clone Timetable', desc: 'Mirror current schedule structure' },
                                                                { id: 'auraPoints', label: 'Reset Metrics', desc: 'Clean engagement scores' },
                                                            ].map((opt) => (
                                                                <button
                                                                    key={opt.id}
                                                                    onClick={() => setRolloverOptions(prev => ({ ...prev, [opt.id]: !prev[opt.id as keyof typeof prev] }))}
                                                                    className={cn(
                                                                        "p-6 rounded-[24px] text-left border transition-all flex items-center gap-6",
                                                                        rolloverOptions[opt.id as keyof typeof rolloverOptions] 
                                                                            ? "bg-white border-primary shadow-lg shadow-primary/5 ring-4 ring-primary/5" 
                                                                            : "bg-[#F7F8F4] border-transparent opacity-70 hover:opacity-100"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "size-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                                        rolloverOptions[opt.id as keyof typeof rolloverOptions] 
                                                                            ? "bg-primary border-primary text-foreground" 
                                                                            : "border-slate-300"
                                                                    )}>
                                                                        {rolloverOptions[opt.id as keyof typeof rolloverOptions] && (
                                                                            <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-[14px] font-bold text-foreground">{opt.label}</p>
                                                                        <p className="text-[11px] font-medium text-[#B0AFA8]">{opt.desc}</p>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Fixed Navigation Actions for Creation View */}
            {view === "create" && !showSuccess && (
                <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 py-6 px-6 lg:px-10 z-40">
                    <div className="max-w-[1000px] mx-auto flex items-center justify-between">
                        <button
                            onClick={() => step === 1 ? navigate("/academics/setup") : setStep(prev => Math.max(1, prev - 1))}
                            className="btn-text px-8 h-12 rounded-xl text-[13px] font-bold transition-all"
                        >
                            {step === 1 ? "Cancel Setup" : "Back"}
                        </button>

                        <button
                            onClick={() => step < 3 ? setStep(prev => prev + 1) : handleFinalize()}
                            className="btn-primary px-10 h-12 rounded-xl text-[13px] font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 group"
                        >
                            {step === 3 ? "Start New Year" : "Next Step"}
                            {step < 3 && (
                                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Global Success Modal via Portal */}
            {showSuccess && createPortal(
                <AnimatePresence>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetForm}
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

                            <h3 className="text-[24px] font-bold text-[#3D6B2C] tracking-tight mb-2">New Year Initialized!</h3>
                            <p className="text-[#B0AFA8] text-[15px] font-medium leading-relaxed mb-10 px-4">
                                The academic year {yearName} has been successfully setup and scheduled.
                            </p>

                            <button
                                onClick={resetForm}
                                className="btn-primary w-full h-11 rounded-xl text-[13px] font-bold shadow-lg"
                            >
                                Return to List
                            </button>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}

        </div>
    );
};

const FormGroup = ({ label, placeholder, icon, type = "input", options = [], disabled = false, optional = false, value, onChange }: any) => {
    return (
        <div className="space-y-2 group">
            <label className={cn(
                "text-[12px] font-bold transition-colors px-1 flex items-center justify-between tracking-tight",
                "text-[#B0AFA8] group-focus-within:text-foreground"
            )}>
                {label}
            </label>
            <div className="relative">
                {type === "input" && (
                    <input
                        disabled={disabled}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={cn(
                            "w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-[10px] outline-none text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] transition-all focus:border-primary/50 focus:bg-white px-6",
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
            </div>
        </div>
    );
};
