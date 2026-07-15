import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";
import { graphqlRequest } from "../../../lib/graphqlClient";

const DISPLAY_TO_CATEGORY_ENUM: Record<string, string> = {
  "Sports": "SPORTS",
  "Creative Arts": "ARTS",
  "STEM & Technology": "STEM",
  "Leadership & Community": "LEADERSHIP",
};

const CATEGORY_ENUM_TO_DISPLAY: Record<string, string> = {
  SPORTS: "Sports",
  ARTS: "Creative Arts",
  STEM: "STEM & Technology",
  LEADERSHIP: "Leadership & Community",
};

export const AddProgramPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("edit");
    const isEditing = !!editId;

    const [activeStep, setActiveStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);

    // Step 1: Basic Info
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");

    // Step 2: Schedule & Venue
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [location, setLocation] = useState("");

    // Step 3: Target & Lead
    const [targetGrades, setTargetGrades] = useState<string[]>([]);
    const [leadTeacher, setLeadTeacher] = useState("");
    const [capacity, setCapacity] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch existing program data when editing
    useEffect(() => {
        if (!editId) return;
        setIsLoadingEdit(true);
        const fetchProgram = async () => {
            try {
                const res = await graphqlRequest<any>(`
                    query GetSpecialProgram($id: ID!) {
                        specialProgram(id: $id) {
                            id
                            name
                            category
                            leadTeacher
                            enrolledStudentsCount
                            startDate
                            endDate
                            location
                            targetGrades
                            status
                        }
                    }
                `, { id: editId });
                const p = res?.specialProgram;
                if (p) {
                    setName(p.name || "");
                    const displayCat = CATEGORY_ENUM_TO_DISPLAY[p.category] || "";
                    setCategory(displayCat);
                    setLeadTeacher(p.leadTeacher || "");
                    setCapacity(p.enrolledStudentsCount ? String(p.enrolledStudentsCount) : "");
                    setStartDate(p.startDate ? new Date(p.startDate) : null);
                    setEndDate(p.endDate ? new Date(p.endDate) : null);
                    setLocation(p.location || "");
                    if (p.targetGrades) {
                        setTargetGrades(p.targetGrades.split(", ").filter(Boolean));
                    }
                }
            } catch (err) {
                console.error("Failed to load program for editing:", err);
            } finally {
                setIsLoadingEdit(false);
            }
        };
        fetchProgram();
    }, [editId]);

    const handleFinalize = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const schoolId = localStorage.getItem("school_id") || "";
        const categoryEnum = DISPLAY_TO_CATEGORY_ENUM[category] || "STEM";

        const input = {
            name,
            category: categoryEnum,
            leadTeacher: leadTeacher || "To be assigned",
            enrolledStudentsCount: capacity ? parseInt(capacity, 10) : 0,
            status: "ACTIVE",
            startDate: startDate ? startDate.toISOString() : undefined,
            endDate: endDate ? endDate.toISOString() : undefined,
            location: location || undefined,
            targetGrades: targetGrades.length > 0 ? targetGrades.join(", ") : undefined,
        };

        try {
            if (isEditing && editId) {
                // Update existing program
                await graphqlRequest(`
                    mutation UpdateSpecialProgram($id: ID!, $input: UpdateSpecialProgramInput!) {
                        updateSpecialProgram(id: $id, input: $input) {
                            id
                            name
                            status
                            leadTeacher
                            startDate
                            endDate
                            location
                            targetGrades
                            enrolledStudentsCount
                        }
                    }
                `, { id: editId, input });
            } else {
                // Create new program
                await graphqlRequest(`
                    mutation CreateSpecialProgram($input: CreateSpecialProgramInput!) {
                        createSpecialProgram(input: $input) {
                            id
                            name
                            status
                            leadTeacher
                            startDate
                            endDate
                            location
                            targetGrades
                            enrolledStudentsCount
                        }
                    }
                `, {
                    input: {
                        schoolId,
                        ...input,
                    }
                });
            }
            setShowSuccess(true);
        } catch (err) {
            console.error("Failed to save program:", err);
            alert(`Failed to ${isEditing ? "update" : "create"} program. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, title: "Program Details", subtitle: "Name, category, and overview", icon: "info", color: "text-primary", bg: "bg-primary/10" },
        { id: 2, title: "Schedule & Venue", subtitle: "Date and location settings", icon: "event", color: "text-emerald-600", bg: "bg-emerald-50" },
        { id: 3, title: "Participants", subtitle: "Target levels and staff assignment", icon: "group_work", color: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
            <TopBar
                title={isEditing ? "Edit Program" : "Create New Program"}
                subtitle={isEditing ? "Modify program details and settings" : "Configure details for your new school activity"}
                actions={
                    <div className="flex items-center gap-3">
                        <PDSButton variant="text" onClick={() => navigate(-1)}>Cancel</PDSButton>
                        <PDSButton variant="primary" icon="check_circle" onClick={handleFinalize} disabled={activeStep < 3 || isSubmitting || isLoadingEdit}>{isSubmitting ? "Saving..." : isEditing ? "Update Program" : "Create Program"}</PDSButton>
                    </div>
                }
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
                    
                    {/* Accordion Stepper */}
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
                                                    {step.id === 1 && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                            <PDSFormGroup label="Program Name" placeholder="e.g. Annual Science Fair 2024" value={name} onChange={setName} className="md:col-span-2" />
                                                            <PDSFormGroup 
                                                                label="Category" 
                                                                type="select" 
                                                                options={["Sports", "Creative Arts", "STEM & Technology", "Leadership & Community"]} 
                                                                value={category} 
                                                                onChange={setCategory} 
                                                                searchable 
                                                            />
                                                            <PDSFormGroup label="Short Description" placeholder="Briefly describe the program's objectives..." value={description} onChange={setDescription} />
                                                        </div>
                                                    )}

                                                    {step.id === 2 && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                            <PDSFormGroup label="Start Date" type="date" value={startDate} onChange={setStartDate} />
                                                            <PDSFormGroup label="End Date" type="date" value={endDate} onChange={setEndDate} />
                                                            <PDSFormGroup label="Venue / Location" placeholder="e.g. Main Auditorium or School Ground" value={location} onChange={setLocation} className="md:col-span-2" />
                                                        </div>
                                                    )}

                                                    {step.id === 3 && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                            <div className="md:col-span-2">
                                                                <PDSFormGroup 
                                                                    label="For Classes" 
                                                                    type="chips" 
                                                                    options={["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"]} 
                                                                    value={targetGrades} 
                                                                    onChange={setTargetGrades} 
                                                                />
                                                            </div>
                                                            <PDSFormGroup label="Number of Students" placeholder="e.g. 50" value={capacity} onChange={setCapacity} />
                                                            <PDSFormGroup 
                                                                label="Teacher in-charge" 
                                                                type="select"
                                                                searchable
                                                                options={["Sarah Jenkins (Senior Faculty)", "Michael Chen (HOD Science)", "Robert Wilson (Sports Lead)", "Emma Thompson (Arts Coordinator)", "David Miller (IT Head)"]}
                                                                placeholder="Search for faculty member..." 
                                                                value={leadTeacher} 
                                                                onChange={setLeadTeacher} 
                                                                className="md:col-span-2" 
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Section Actions */}
                                                    <div className="flex justify-end pt-8 border-t border-slate-100">
                                                        {step.id < 3 ? (
                                                            <PDSButton variant="primary" className="px-12 h-10" onClick={() => setActiveStep(step.id + 1)}>
                                                                Continue
                                                            </PDSButton>
                                                        ) : (
                                                            <PDSButton variant="primary" className="px-12 h-10" onClick={handleFinalize}>
                                                                {isEditing ? "Update Program" : "Create Program"}
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

                        <div className="h-10 bg-white rounded-b-[32px] pointer-events-none" />
                    </div>
                </div>
            </div>

            <PDSSuccessModal 
                show={showSuccess}
                title={isEditing ? "Program Updated!" : "Program Created!"}
                description={isEditing ? "The school program has been successfully updated." : "The new school program has been successfully created and scheduled."}
                buttonText="Return to Programs"
                onClose={() => navigate("/academics/programs")}
            />
        </div>
    );
};
