import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import successAnimation from "../../../assets/animations/success.json";
import { AppDropdown } from "../../../components/AppDropdown";
import { AppDatePicker } from "../../../components/AppDatePicker";

export const AddStaffPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    const steps = [
        { id: 1, title: "Personal", subtitle: "Basic info & contact" },
        { id: 2, title: "Employment", subtitle: "Role & department" },
        { id: 3, title: "Access", subtitle: "System & logistics" },
    ];

    const handleFinalize = () => {
        setShowSuccess(true);
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white font-sans">
            <TopBar
                title="Onboard Staff"
                subtitle="Add a new faculty or administrative member"
                actions={
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-text"
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
                            {/* Background Line */}
                            <div className="absolute top-[11px] left-0 right-0 h-[2px] bg-slate-100 -z-10" />

                            {/* Active Line Animation */}
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

                    {/* Form Container with AnimatePresence */}
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
                                    <div className="space-y-10">
                                        <div className="flex items-center gap-6 pb-6">
                                            <div className="size-24 rounded-3xl bg-[#F7F8F4] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-[#B0AFA8] hover:border-primary hover:text-primary transition-all cursor-pointer">
                                                <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                                                <span className="text-[10px] font-semibold">Upload</span>
                                            </div>
                                            <div>
                                                <h4 className="text-[16px] font-bold text-foreground">Profile Photo</h4>
                                                <p className="text-[#B0AFA8] text-[13px] font-medium mt-1">Upload a professional headshot for the ID card.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            <FormGroup label="Full Name" placeholder="Enter staff name" />
                                            <FormGroup label="Date of Birth" type="date" placeholder="DD / MM / YYYY" icon="calendar_today" maxDate={new Date()} />
                                            <FormGroup label="Gender" type="chips" options={["Male", "Female", "Other"]} />
                                            <FormGroup label="Blood Group" type="select" options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} optional searchable />
                                            <FormGroup label="Personal Email" placeholder="personal@example.com" icon="mail" />
                                            <FormGroup label="Mobile Number" placeholder="+91 XXXXX XXXXX" icon="call" />

                                            <div className="md:col-span-2 space-y-2.5 group">
                                                <label className="text-[13px] font-bold text-[#B0AFA8] px-1 group-focus-within:text-foreground transition-colors flex items-center justify-between">
                                                    Residential Address <span className="text-[11px] text-[#B0AFA8] font-medium normal-case tracking-normal">(Optional)</span>
                                                </label>
                                                <textarea
                                                    className="w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] px-6 py-4 outline-none text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] min-h-[100px] resize-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white"
                                                    placeholder="Enter permanent address..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            <FormGroup label="Employee ID" placeholder="e.g. STAFF-2024-001" />
                                            <FormGroup label="Joining Date" type="date" placeholder="DD / MM / YYYY" icon="calendar_today" maxDate={new Date()} />
                                            <FormGroup label="Subject Area" type="select" options={["Mathematics", "Science", "Humanities", "Languages", "Arts", "Technology", "Administration", "Sports"]} searchable />
                                            <FormGroup label="Designation" placeholder="e.g. Senior Faculty" />
                                            <FormGroup label="Qualifications" placeholder="e.g. PhD in Applied Mathematics" />
                                            <FormGroup label="Years of Experience" placeholder="e.g. 8 Years" />
                                            <FormGroup label="Institutional Email" placeholder="faculty@institution.com" icon="workspace_premium" />
                                            <FormGroup label="Emergency Contact" placeholder="+91 XXXXX XXXXX" icon="call" />
                                        </div>

                                        {/* Teaching Scope & Specializations */}
                                        <div className="border-t border-slate-100 pt-10 space-y-8">
                                            <div>
                                                <h4 className="text-[15px] font-bold text-foreground mb-1">Academic Profile</h4>
                                                <p className="text-[13px] text-[#B0AFA8] font-medium">Define which grades and subjects this staff member is qualified to teach.</p>
                                            </div>
                                            <FormGroup
                                                label="Teaching Scope"
                                                type="multi-chips"
                                                options={["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"]}
                                            />
                                            <FormGroup
                                                label="Subject Specializations"
                                                type="multi-chips"
                                                options={["Mathematics", "English", "Physics", "Chemistry", "History", "Computer Science", "Dance", "Urdu", "Hindi"]}
                                            />
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            <FormGroup label="Class Teacher For" type="select" options={["Not Assigned", "Grade 10-A", "Grade 11-B", "Grade 12-C"]} searchable />
                                            <FormGroup label="Work Shift" type="select" options={["Morning (8:00 - 15:00)", "Noon (11:00 - 18:00)"]} />
                                            <FormGroup label="Bus Availed" type="select" options={["No", "Yes - Route A", "Yes - Route B"]} />
                                            <FormGroup label="Portal Access Role" type="select" options={["Standard Teacher", "Department Head", "Administrator"]} />
                                        </div>

                                        <div className="bg-[#F7F8F4] rounded-[20px] p-6 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-full bg-white shadow-sm flex items-center justify-center text-foreground">
                                                    <span className="material-symbols-outlined">fingerprint</span>
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-foreground">Biometric Link</p>
                                                    <p className="text-[13px] text-[#B0AFA8] font-medium mt-0.5">Register RFID / Biometrics for attendance.</p>
                                                </div>
                                            </div>
                                            <button className="btn-outline">
                                                Link Device
                                            </button>
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
                            "btn-text",
                            step === 1 && "opacity-0 pointer-events-none"
                        )}
                    >
                        Back
                    </button>

                    <button
                        onClick={() => step < 3 ? setStep(prev => prev + 1) : handleFinalize()}
                        className="btn-primary gap-2 group"
                    >
                        {step === 3 ? "Finalize & Onboard" : "Next Step"}
                        {step < 3 && (
                            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Success Modal */}

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => navigate("/directory")}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-[440px] bg-white rounded-[40px] p-10 text-center shadow-2xl border border-slate-100"
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

                            <h3 className="text-[24px] font-bold text-[#3D6B2C] tracking-tight mb-2">Staff Onboarded Successfully!</h3>
                            <p className="text-[#B0AFA8] text-[15px] font-medium leading-relaxed mb-10 px-4">
                                The new staff member has been registered and credentials have been sent to their email.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate("/staff/ST-1024-001")}
                                    className="btn-primary w-full"
                                >
                                    View Staff Profile
                                </button>
                                <button
                                    onClick={() => navigate("/directory/staff")}
                                    className="btn-text w-full"
                                >
                                    Back to Directory
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FormGroup = ({ label, placeholder, icon, type = "input", options = [], searchable = false, disabled = false, optional = false, uppercase = false, maxDate }: any) => {
    const [selectedValue, setSelectedValue] = useState("");
    const [inputValue, setInputValue] = useState("");

    return (
        <div className="space-y-2.5 group">
            <label className="text-[13px] font-bold text-[#B0AFA8] px-1 group-focus-within:text-foreground transition-colors flex items-center justify-between">
                {label}
                {optional && <span className="text-[11px] text-[#B0AFA8] font-medium normal-case tracking-normal">(Optional)</span>}
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
                        value={inputValue}
                        onChange={(e) => setInputValue(uppercase ? e.target.value.toUpperCase() : e.target.value)}
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
                    <div className="flex items-center gap-2 w-full">
                        {options.map((opt: string) => (
                            <button
                                key={opt}
                                onClick={() => setSelectedValue(opt)}
                                className={cn(
                                    "flex-1 h-12 rounded-[10px] text-[13px] font-bold transition-all border outline-none",
                                    selectedValue === opt
                                        ? "bg-foreground text-white border-foreground shadow-md shadow-slate-900/10"
                                        : "bg-[#F7F8F4] border-slate-100 text-[#B0AFA8] hover:border-slate-300 hover:text-foreground hover:bg-white"
                                )}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
                {type === "multi-chips" && (
                    <MultiChipSelect options={options} />
                )}
            </div>
        </div>
    );
};

const MultiChipSelect = ({ options }: { options: string[] }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const toggle = (opt: string) => {
        setSelected(prev => prev.includes(opt) ? prev.filter(s => s !== opt) : [...prev, opt]);
    };
    
    const selectAll = () => setSelected(options);
    const deselectAll = () => setSelected([]);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => toggle(opt)}
                        className={cn(
                            "px-4 py-2.5 rounded-[10px] text-[12px] font-bold transition-all border outline-none",
                            selected.includes(opt)
                                ? "bg-foreground text-white border-foreground shadow-md shadow-slate-900/10"
                                : "bg-[#F7F8F4] border-slate-100 text-[#B0AFA8] hover:border-slate-300 hover:text-foreground hover:bg-white"
                        )}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            <div className="flex items-center justify-between px-1">
                <p className="text-[11px] text-primary font-bold">{selected.length} selected</p>
                <button 
                    type="button" 
                    onClick={selected.length === options.length ? deselectAll : selectAll}
                    className={cn(
                        "text-[11px] font-bold transition-colors",
                        selected.length === options.length ? "text-red-400 hover:text-red-500" : "text-[#B0AFA8] hover:text-primary"
                    )}
                >
                    {selected.length === options.length ? "Deselect All" : "Select All"}
                </button>
            </div>
        </div>
    );
};
