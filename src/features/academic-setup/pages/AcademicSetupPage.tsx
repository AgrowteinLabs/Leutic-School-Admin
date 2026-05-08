import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AppDatePicker } from "../../../components/AppDatePicker";

// PDS Components
import { PDSPageHeader } from "../../../components/pds/PDSPageHeader";
import { PDSStepper } from "../../../components/pds/PDSStepper";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";

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
                <PDSPageHeader
                    title="Academic Year Setup"
                    subtitle="Setup new institutional cycles and manage term transitions"
                    showBack={view === "create"}
                    onBack={() => view === "create" ? navigate("/academics/setup") : navigate(-1)}
                />
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar relative">
                <div className={cn("max-w-[1400px] mx-auto px-6 lg:px-10 py-8", view === "create" && "pb-8")}>
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
                                    <PDSButton
                                        variant="primary"
                                        size="md"
                                        icon="add_circle"
                                        onClick={() => navigate("/academics/setup/new")}
                                    >
                                        Add New Academic Year
                                    </PDSButton>
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
                                className="space-y-16"
                            >
                    <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm shadow-slate-100/50 overflow-visible relative z-10 flex flex-col">
                        {steps.map((s, index) => {
                            const isExpanded = step === s.id;
                            const isCompleted = step > s.id;

                            return (
                                <div key={s.id} className="flex flex-col">
                                    {/* Section Header - Interactive */}
                                    <button 
                                        onClick={() => setStep(s.id)}
                                        className={cn(
                                            "w-full text-left p-10 flex items-center justify-between transition-all outline-none group",
                                            isExpanded ? "bg-slate-50/40" : "hover:bg-slate-50/50",
                                            index === 0 && "rounded-t-[31px]",
                                            index !== 0 && "border-t border-slate-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "size-12 rounded-[20px] flex items-center justify-center transition-all duration-500",
                                                isExpanded ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                                            )}>
                                                <span className="material-symbols-outlined text-[24px]">
                                                    {isCompleted ? "check_circle" : 
                                                     s.id === 1 ? "calendar_today" : 
                                                     s.id === 2 ? "format_list_numbered" : "sync_alt"}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className={cn(
                                                    "font-bold text-[length:var(--font-size-h3)] tracking-tight transition-colors",
                                                    isExpanded ? "text-foreground" : "text-slate-500"
                                                )}>
                                                    {s.title}
                                                </h3>
                                                <p className="text-[length:var(--font-size-input)] font-medium text-[var(--text-color-body-muted)] mt-0.5">{s.subtitle}</p>
                                            </div>
                                        </div>
                                        
                                        {!isExpanded && (
                                            <div className="flex items-center gap-4">
                                                {isCompleted && <span className="text-[11px] font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-full tracking-wider uppercase">Completed</span>}
                                                <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-400 transition-colors">expand_more</span>
                                            </div>
                                        )}
                                    </button>

                                    {/* Section Content - Expandable */}
                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                style={{ overflow: isExpanded ? "visible" : "hidden" }}
                                            >
                                                <div className="p-10 pt-4 space-y-12">
                                                    {s.id === 1 && (
                                                        <div className="space-y-12">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                                <div className="col-span-full">
                                                                    <PDSFormGroup
                                                                        label="Academic Year Label"
                                                                        placeholder="e.g. Academic Year 2025 - 2026"
                                                                        value={yearName}
                                                                        onChange={setYearName}
                                                                    />
                                                                </div>
                                                                <PDSFormGroup
                                                                    label="Academic Start Date"
                                                                    type="date"
                                                                    value={startDate}
                                                                    onChange={handleStartDateChange}
                                                                />
                                                                <PDSFormGroup
                                                                    label="Academic End Date"
                                                                    type="date"
                                                                    value={endDate}
                                                                    onChange={setEndDate}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {s.id === 2 && (
                                                        <div className="space-y-6">
                                                            <div className="flex items-center justify-between px-2 mb-2">
                                                                <div className="flex flex-col">
                                                                    <h4 className="text-[16px] font-extrabold text-foreground tracking-tight">Academic Terms</h4>
                                                                    <p className="text-[11px] font-medium text-[#B0AFA8]">Chronological term mapping</p>
                                                                </div>
                                                                <PDSButton
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    icon="add"
                                                                    onClick={handleAddTerm}
                                                                >
                                                                    Add Term
                                                                </PDSButton>
                                                            </div>

                                                            <div className="relative space-y-3">
                                                                <div className="absolute left-[23px] top-6 bottom-6 w-[1px] bg-slate-100 -z-0 hidden md:block" />
                                                                {terms.map((term, idx) => (
                                                                    <motion.div
                                                                        key={term.id}
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ delay: idx * 0.05 }}
                                                                        className="relative flex items-center gap-5 group"
                                                                    >
                                                                        <div className="size-[48px] rounded-2xl bg-[#F7F8F4] border border-slate-100 flex items-center justify-center text-secondary font-black text-[14px] group-hover:bg-primary group-hover:text-foreground transition-all shrink-0">
                                                                            T{idx + 1}
                                                                        </div>

                                                                        <div className="flex-1 bg-white border border-slate-100 rounded-[20px] p-4 flex flex-col md:flex-row items-center gap-6 group-hover:border-primary/20 transition-all shadow-sm shadow-slate-200/5">
                                                                            <div className="flex-1 w-full md:w-auto">
                                                                                <input
                                                                                    value={term.name}
                                                                                    onChange={(e) => handleUpdateTerm(term.id, "name", e.target.value)}
                                                                                    className="bg-transparent border-none outline-none text-[14px] font-bold text-foreground placeholder-slate-300 w-full focus:text-primary px-2"
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

                                                    {s.id === 3 && (
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

                                                    {/* Section Actions */}
                                                    <div className="flex justify-end pt-8 border-t border-slate-100">
                                                        {s.id < 3 ? (
                                                            <PDSButton variant="primary" className="px-12 h-10" onClick={() => setStep(s.id + 1)}>
                                                                Save & Continue
                                                            </PDSButton>
                                                        ) : (
                                                            <PDSButton variant="primary" className="px-12 h-10" onClick={handleFinalize}>
                                                                Start New Academic Year
                                                            </PDSButton>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                        {/* Silhouette Maintainer */}
                        <div className="h-10 bg-white rounded-b-[32px] pointer-events-none" />
                    </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>


            <PDSSuccessModal
                show={showSuccess}
                title="New Year Setup!"
                description={`The academic year ${yearName} has been successfully setup and scheduled.`}
                buttonText="Return to List"
                onAction={resetForm}
                onClose={resetForm}
            />
        </div>
    );
};
