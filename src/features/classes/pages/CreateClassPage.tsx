import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";

export const CreateClassPage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    // Step 1: Configuration & Faculty
    const [gradeLevel, setGradeLevel] = useState("");
    const [sectionName, setSectionName] = useState("");
    const [room, setRoom] = useState("");
    const [shift, setShift] = useState("");
    const [session, setSession] = useState("2025-26");
    const [classTeacher, setClassTeacher] = useState("");
    const [capacity, setCapacity] = useState("40");

    // Step 2: Students
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const mockStudents = [
        { id: 1, name: "Aavya S.",  grade: "Grade 10", img: "/Avatar/Female Avatar Age10.png" },
        { id: 2, name: "Ishaan K.", grade: "Grade 10", img: "/Avatar/Male Avatar Age10.png" },
        { id: 3, name: "Meera V.",  grade: "Grade 10", img: "/Avatar/Female Avatar Age11.png" },
        { id: 4, name: "Arjun T.",  grade: "Grade 10", img: "/Avatar/Male Avatar Age11.png" },
        { id: 5, name: "Sneha R.",  grade: "Grade 10", img: "/Avatar/Female Avatar Age12.png" },
        { id: 6, name: "Kabir M.",  grade: "Grade 10", img: "/Avatar/Male Avatar Age12.png" },
        { id: 7, name: "Diya M.",   grade: "Grade 10", img: "/Avatar/Female Avatar Age13.png" },
        { id: 8, name: "Rohan P.",  grade: "Grade 10", img: "/Avatar/Male Avatar Age13.png" },
    ];

    const filteredStudents = mockStudents.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleStudent = (student: any) => {
        if (selectedStudents.find(s => s.id === student.id)) {
            setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
        } else {
            setSelectedStudents([...selectedStudents, student]);
        }
    };

    const handleFinalize = () => {
        setShowSuccess(true);
    };

    const steps = [
        { id: 1, title: "Class & Faculty Setup", subtitle: "Grade, section, teacher and scheduling", icon: "domain", color: "text-primary", bg: "bg-primary/10" },
        { id: 2, title: "Student Enrollment", subtitle: "Map students to this section (Optional)", icon: "group_add", color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
            <TopBar
                title="Create Class"
                subtitle="Establish a new academic section within the institution"
                actions={
                    <div className="flex items-center gap-3">
                        <PDSButton variant="text" onClick={() => navigate(-1)}>Cancel</PDSButton>
                        <PDSButton variant="primary" icon="check_circle" onClick={handleFinalize} disabled={activeStep < 2}>Complete Setup</PDSButton>
                    </div>
                }
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
                    
                    <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm shadow-slate-100/50 overflow-visible relative z-10 flex flex-col">
                        
                        {steps.map((step, index) => {
                            const isExpanded = activeStep === step.id;
                            const isCompleted = activeStep > step.id;

                            return (
                                <div key={step.id} className="flex flex-col">
                                    {/* Section Header */}
                                    <button 
                                        onClick={() => setActiveStep(step.id)}
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
                                                isExpanded ? step.bg : "bg-slate-100",
                                                isExpanded ? step.color : "text-slate-400"
                                            )}>
                                                <span className="material-symbols-outlined text-[24px]">
                                                    {isCompleted ? "check_circle" : step.icon}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className={cn(
                                                    "font-bold text-[length:var(--font-size-h3)] tracking-tight transition-colors",
                                                    isExpanded ? "text-foreground" : "text-slate-500"
                                                )}>
                                                    {step.title}
                                                </h3>
                                                <p className="text-[length:var(--font-size-input)] font-medium text-[var(--text-color-body-muted)] mt-0.5">{step.subtitle}</p>
                                            </div>
                                        </div>
                                        
                                        {!isExpanded && (
                                            <div className="flex items-center gap-4">
                                                {isCompleted && <span className="text-[11px] font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-full tracking-wider uppercase">Completed</span>}
                                                <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-400 transition-colors">expand_more</span>
                                            </div>
                                        )}
                                    </button>

                                    {/* Section Content */}
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
                                                    
                                                    {/* Step 1: Configuration & Faculty */}
                                                    {step.id === 1 && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                                                            <PDSFormGroup label="Grade Level" type="select" options={["Grade 9", "Grade 10", "Grade 11", "Grade 12"]} value={gradeLevel} onChange={setGradeLevel} />
                                                            <PDSFormGroup label="Section Name" placeholder="e.g. A, B, C" value={sectionName} onChange={setSectionName} />
                                                            <PDSFormGroup label="Academic Session" type="select" options={["2025-26", "2024-25"]} value={session} onChange={setSession} />
                                                            
                                                            <PDSFormGroup
                                                                label="Class Teacher"
                                                                type="select"
                                                                searchable
                                                                options={["Dr. Sarah Jenkins", "Prof. Michael Chen", "Ms. Elena Rodriguez", "Mr. David Thompson"]}
                                                                placeholder="Select faculty..."
                                                                icon="person_search"
                                                                value={classTeacher}
                                                                onChange={setClassTeacher}
                                                            />
                                                            <PDSFormGroup label="Student Capacity" placeholder="e.g. 40" value={capacity} onChange={setCapacity} />
                                                            <PDSFormGroup label="Room / Lab Number" placeholder="E.g. Room 304" value={room} onChange={setRoom} />
                                                            <PDSFormGroup label="Daily Shift" type="select" options={["Morning Shift", "Afternoon Shift", "Evening Shift"]} value={shift} onChange={setShift} className="md:col-span-1" />
                                                        </div>
                                                    )}

                                                    {/* Step 2: Students */}
                                                    {step.id === 2 && (
                                                        <div className="space-y-10">
                                                            <div className="flex items-center justify-between gap-4 py-2">
                                                                <div className="relative group flex-1 max-w-xl h-10">
                                                                    <div className="absolute inset-0 bg-[#F7F8F4] border border-slate-100 rounded-[12px] transition-all group-focus-within:border-primary/50 group-focus-within:ring-4 group-focus-within:ring-primary/5 group-focus-within:bg-white overflow-hidden pointer-events-none" />
                                                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-color-label)] group-focus-within:text-primary transition-colors text-[18px] z-20">search</span>
                                                                    <input
                                                                        type="text"
                                                                        value={searchQuery}
                                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                                        placeholder="Search students by name..."
                                                                        className="relative w-full h-10 bg-transparent border-none outline-none pl-11 pr-4 text-[length:var(--font-size-input)] font-[var(--font-weight-input)] text-foreground placeholder-[var(--text-color-label)] z-10"
                                                                    />
                                                                </div>
                                                                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[12px] font-bold rounded-xl border border-emerald-100 flex items-center gap-2 shrink-0">
                                                                    <span className="material-symbols-outlined text-[18px]">done_all</span>
                                                                    {selectedStudents.length} Selected
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {filteredStudents.map((student) => (
                                                                    <div
                                                                        key={student.id}
                                                                        onClick={() => toggleStudent(student)}
                                                                        className={cn(
                                                                            "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 relative group/item",
                                                                            selectedStudents.find(s => s.id === student.id)
                                                                                ? "bg-emerald-50 border-emerald-100 ring-2 ring-emerald-500/10"
                                                                                : "bg-white border-slate-100 hover:border-slate-200 hover:bg-[#F7F8F4]"
                                                                        )}
                                                                    >
                                                                        <div className="size-10 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                                                                            <img src={student.img} className="size-full object-cover" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[13px] font-bold text-foreground truncate">{student.name}</p>
                                                                            <p className="text-[11px] text-[#B0AFA8] font-bold uppercase tracking-wider">{student.grade}</p>
                                                                        </div>
                                                                        <div className={cn(
                                                                            "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                                            selectedStudents.find(s => s.id === student.id)
                                                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                                                : "border-slate-200 group-hover/item:border-slate-300"
                                                                        )}>
                                                                            {selectedStudents.find(s => s.id === student.id) && (
                                                                                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {filteredStudents.length === 0 && (
                                                                    <div className="col-span-full py-10 text-center">
                                                                        <p className="text-[13px] font-medium text-[#B0AFA8]">No students found matching "{searchQuery}"</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Section Actions */}
                                                    <div className="flex justify-end pt-8 border-t border-slate-100">
                                                        {step.id < 2 ? (
                                                            <PDSButton variant="primary" className="px-12 h-10" onClick={() => setActiveStep(step.id + 1)}>
                                                                Save & Continue
                                                            </PDSButton>
                                                        ) : (
                                                            <PDSButton variant="primary" className="px-12 h-10" onClick={handleFinalize}>
                                                                Finalize & Create Class
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
                        <div className="h-10 bg-white rounded-b-[32px]" />
                    </div>
                </div>
            </div>

            <PDSSuccessModal 
                show={showSuccess}
                title="Class Created!"
                description="Section has been successfully established and students have been mapped."
                buttonText="View Class List"
                onClose={() => navigate("/classes")}
            />
        </div>
    );
};
