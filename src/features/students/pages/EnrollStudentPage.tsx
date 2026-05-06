import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import successAnimation from "../../../assets/animations/success.json";
import { AppDropdown } from "../../../components/AppDropdown";
import { AppDatePicker } from "../../../components/AppDatePicker";

export const EnrollStudentPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [guardianRelation, setGuardianRelation] = useState("");

    const steps = [
        { id: 1, title: "Student", subtitle: "Personal details" },
        { id: 2, title: "Guardians", subtitle: "Parental info" },
        { id: 3, title: "Academic", subtitle: "Logistics & mapping" },
    ];

    const [showSuccess, setShowSuccess] = useState(false);

    const handleFinalize = () => {
        setShowSuccess(true);
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white font-sans">
            <TopBar
                title="Enroll Student"
                subtitle="Complete institutional registration for new admissions"
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
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                                            <div className="size-24 rounded-3xl bg-[#F7F8F4] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-[#B0AFA8] hover:border-primary hover:text-primary transition-all cursor-pointer">
                                                <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                                                <span className="text-[10px] font-semibold">Upload</span>
                                            </div>
                                            <div>
                                                <h4 className="text-foreground font-bold text-lg">Student Profile Photo</h4>
                                                <p className="text-[#B0AFA8] text-sm">Clear, passport-sized photo for institutional records.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            <FormGroup label="First Name" placeholder="e.g. Rahul" />
                                            <FormGroup label="Last Name" placeholder="e.g. Sharma" />
                                            <FormGroup label="Roll Number" placeholder="e.g. 1024" />
                                            <FormGroup label="Date of Birth" type="date" placeholder="DD / MM / YYYY" icon="calendar_today" maxDate={new Date()} />
                                            <FormGroup label="Gender" type="chips" options={["Male", "Female", "Other"]} />
                                            <FormGroup label="Blood Group" type="select" options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} optional searchable />
                                            <FormGroup label="Adhaar / National ID" placeholder="XXXX-XXXX-XXXX" />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            {/* Father's Info */}
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-xl bg-accent/50 text-foreground flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                                    </div>
                                                    <h5 className="text-[15px] font-bold text-foreground tracking-tight">Father's Information</h5>
                                                </div>
                                                <div className="space-y-8">
                                                    <FormGroup label="Father's Full Name" placeholder="e.g. Suresh Sharma" />
                                                    <FormGroup label="Email Address" placeholder="suresh.s@example.com" icon="mail" />
                                                    <FormGroup label="Mobile Number" placeholder="+91 XXXXX XXXXX" icon="call" />
                                                    <FormGroup label="Occupation" placeholder="e.g. Senior Architect" />
                                                </div>
                                            </div>

                                            {/* Mother's Info */}
                                            <div className="space-y-8 md:border-l md:border-slate-100 md:pl-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-xl bg-accent/50 text-foreground flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-[18px]">person_3</span>
                                                    </div>
                                                    <h5 className="text-[15px] font-bold text-foreground tracking-tight">Mother's Information</h5>
                                                </div>
                                                <div className="space-y-8">
                                                    <FormGroup label="Mother's Full Name" placeholder="e.g. Priya Sharma" />
                                                    <FormGroup label="Email Address" placeholder="priya.s@example.com" icon="mail" />
                                                    <FormGroup label="Mobile Number" placeholder="+91 XXXXX XXXXX" icon="call" />
                                                    <FormGroup label="Occupation" placeholder="e.g. Content Lead" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Guardian Info */}
                                        <div className="space-y-8 pt-10 border-t border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-2xl bg-foreground/5 text-foreground flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[20px]">family_restroom</span>
                                                </div>
                                                <div>
                                                    <h5 className="text-[16px] font-bold text-foreground tracking-tight">Guardian / Emergency Contact</h5>
                                                    <p className="text-[13px] text-[#B0AFA8] font-medium mt-0.5">Assigned contact person for safety protocols</p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "grid grid-cols-1 gap-x-10 gap-y-8 transition-all duration-300",
                                                guardianRelation === "Other" ? "md:grid-cols-4" : "md:grid-cols-3"
                                            )}>
                                                <FormGroup label="Full Name" placeholder="Full Legal Name" />
                                                <FormGroup
                                                    label="Relationship"
                                                    type="select"
                                                    options={["Father", "Mother", "Grandparent", "Sibling", "Aunt", "Uncle", "Legal Guardian", "Other"]}
                                                    searchable
                                                    value={guardianRelation}
                                                    onChange={setGuardianRelation}
                                                />
                                                {guardianRelation === "Other" && (
                                                    <FormGroup label="Specify Relation" placeholder="e.g. Neighbor / Cousin" />
                                                )}
                                                <FormGroup label="Contact Number" placeholder="+91 XXXXX XXXXX" icon="call" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            <FormGroup label="Admission Grade" type="select" options={["9th Grade", "10th Grade", "11th Grade", "12th Grade"]} searchable />
                                            <FormGroup label="Academic Session" type="select" options={["2025-26", "2024-25"]} />
                                            <FormGroup label="Admission Number" placeholder="Auto-generated: OA-2024-XXX" disabled />
                                            <FormGroup label="Bus Transportation" type="select" options={["Not Required", "Route A - North", "Route B - Central", "Route C - Suburban"]} searchable />
                                            <div className="col-span-full">
                                                <div className="space-y-2 group">
                                                    <label className="text-[12px] font-bold text-[#B0AFA8] tracking-tight group-focus-within:text-foreground transition-colors px-1">Residential Address</label>
                                                    <textarea
                                                        className="w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] px-6 py-4 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] min-h-[120px] transition-all no-scrollbar"
                                                        placeholder="Enter full residential address..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Navigation Actions - Fixed at bottom */}
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
                        onClick={() => step < 3 ? setStep(prev => prev + 1) : handleFinalize()}
                        className="btn-primary px-10 h-10 rounded-xl text-[13px] font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 group"
                    >
                        {step === 3 ? "Complete Enrollment" : "Next Step"}
                        {step < 3 && (
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
                            onClick={() => navigate("/students")}
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

                            <h3 className="text-[24px] font-bold text-[#3D6B2C] tracking-tight mb-2">Student Enrolled!</h3>
                            <p className="text-[#B0AFA8] text-[15px] font-medium leading-relaxed mb-10 px-4">
                                Registration for the new academic session has been completed successfully.
                            </p>

                            <button
                                onClick={() => navigate("/directory/students")}
                                className="btn-primary w-full h-10 rounded-xl text-[13px] font-bold"
                            >
                                View Student Records
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FormGroup = ({ label, placeholder, icon, type = "input", options = [], searchable = false, disabled = false, optional = false, uppercase = false, maxDate, value: propsValue, onChange: propsOnChange }: any) => {
    const [localValue, setLocalValue] = useState("");
    const selectedValue = propsValue !== undefined ? propsValue : localValue;
    const setSelectedValue = propsOnChange || setLocalValue;

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
                        className={cn(
                            "w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-[10px] outline-none text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white",
                            icon ? "pl-12 pr-6" : "px-6",
                            disabled && "opacity-50 cursor-not-allowed",
                            uppercase && "uppercase placeholder:normal-case"
                        )}
                        placeholder={placeholder}
                    />
                )}
                {type === "date" && (
                    <AppDatePicker
                        value={selectedValue ? new Date(selectedValue) : null}
                        onChange={(d) => setSelectedValue(d.toISOString())}
                        placeholder={placeholder}
                        icon={icon}
                        maxDate={maxDate}
                    />
                )}
                {type === "select" && (
                    <AppDropdown
                        options={options}
                        value={selectedValue}
                        onChange={setSelectedValue}
                        placeholder={placeholder}
                        searchable={searchable}
                        icon={icon}
                    />
                )}
                {type === "chips" && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {options.map((opt: string) => (
                            <button
                                key={opt}
                                onClick={() => setSelectedValue(opt)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all border-2",
                                    selectedValue === opt
                                        ? "bg-foreground text-white border-foreground shadow-lg shadow-slate-900/10 scale-105"
                                        : "bg-white border-slate-100 text-[#B0AFA8] hover:border-slate-200"
                                )}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
