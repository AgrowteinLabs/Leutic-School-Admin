import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";

export const EnrollStudentPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const steps = [
        { id: 1, label: "Student Details", icon: "person" },
        { id: 2, label: "Guardian Info", icon: "family_restroom" },
        { id: 3, label: "Academic & Logistics", icon: "school" },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
            <TopBar
                title="Enroll New Student"
                subtitle="Complete institutional registration for new admissions"
                actions={
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:bg-[#F7F8F4] transition-all"
                        >
                            Cancel
                        </button>
                        <button className="btn-primary px-6 py-2 rounded-xl text-[13px] font-bold  transition-all shadow-sm shadow-slate-100/30">
                            {step === 3 ? "Complete Enrollment" : "Save & Continue"}
                        </button>
                    </div>
                }
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-[1000px] mx-auto px-8 py-10">
                    {/* Stepper */}
                    <div className="flex items-center justify-between mb-12 relative">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#F7F8F4] -translate-y-1/2 z-0" />
                        {steps.map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                                <div
                                    className={cn(
                                        "size-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2",
                                        step === s.id
                                            ? "bg-primary border-primary text-foreground shadow-lg shadow-primary/20 scale-110"
                                            : step > s.id
                                                ? "bg-secondary border-secondary text-white"
                                                : "bg-white border-slate-100 text-[#B0AFA8] pointer-events-none"
                                    )}
                                    onClick={() => step > s.id && setStep(s.id)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {step > s.id ? "check" : s.icon}
                                    </span>
                                </div>
                                <span className={cn(
                                    "text-[11px] font-bold uppercase tracking-widest",
                                    step === s.id ? "text-foreground" : "text-[#B0AFA8]"
                                )}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm shadow-slate-50/50">
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                                    <div className="size-24 rounded-3xl bg-[#F7F8F4] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-[#B0AFA8] hover:border-primary hover:text-primary transition-all cursor-pointer">
                                        <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                                        <span className="text-[10px] font-bold uppercase">Upload</span>
                                    </div>
                                    <div>
                                        <h4 className="text-foreground font-bold text-lg">Student Profile Photo</h4>
                                        <p className="text-[#B0AFA8] text-sm">Clear, passport-sized photo for institutional records.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <FormGroup label="First Name" placeholder="e.g. Rahul" />
                                    <FormGroup label="Last Name" placeholder="e.g. Sharma" />
                                    <FormGroup label="Roll Number" placeholder="e.g. 1024" />
                                    <FormGroup label="Date of Birth" placeholder="DD / MM / YYYY" icon="calendar_today" />
                                    <FormGroup label="Gender" type="select" options={["Select Gender", "Male", "Female", "Other"]} />
                                    <FormGroup label="Blood Group" type="select" options={["Select Group", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} optional />
                                    <FormGroup label="Adhaar / National ID" placeholder="XXXX-XXXX-XXXX" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-12 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    {/* Father's Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                                            <div className="size-8 rounded-xl bg-[#DBEAFE] text-[#1565C0] flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[18px]">person</span>
                                            </div>
                                            <h5 className="text-[14px] font-bold text-foreground tracking-tight">Father's Information</h5>
                                        </div>
                                        <div className="space-y-4">
                                            <FormGroup label="Father's Full Name" placeholder="e.g. Suresh Sharma" />
                                            <FormGroup label="Email Address" placeholder="suresh.s@example.com" icon="mail" />
                                            <FormGroup label="Mobile Number" placeholder="+91 XXXXX XXXXX" icon="call" />
                                            <FormGroup label="Occupation" placeholder="e.g. Senior Architect" />
                                        </div>
                                    </div>

                                    {/* Mother's Info */}
                                    <div className="space-y-6 lg:border-l lg:border-slate-100 lg:pl-12">
                                        <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                                            <div className="size-8 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[18px]">person_3</span>
                                            </div>
                                            <h5 className="text-[14px] font-bold text-foreground tracking-tight">Mother's Information</h5>
                                        </div>
                                        <div className="space-y-4">
                                            <FormGroup label="Mother's Full Name" placeholder="e.g. Principal" />
                                            <FormGroup label="Email Address" placeholder="priya.s@example.com" icon="mail" />
                                            <FormGroup label="Mobile Number" placeholder="+91 XXXXX XXXXX" icon="call" />
                                            <FormGroup label="Occupation" placeholder="e.g. Content Lead" />
                                        </div>
                                    </div>
                                </div>

                                {/* Guardian Info */}
                                <div className="space-y-6 pt-10 border-t border-slate-100">
                                    <div className="flex items-center gap-3 pb-2">
                                        <div className="size-8 rounded-xl bg-[#F0F0EC] text-[#444441] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px]">family_restroom</span>
                                        </div>
                                        <div>
                                            <h5 className="text-[14px] font-bold text-foreground tracking-tight">Guardian / Emergency Contact</h5>
                                            <p className="text-[10px] text-[#B0AFA8] font-bold uppercase tracking-wider mt-0.5">Capture details if assigned instead of parents</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-[#F7F8F4] rounded-[24px] border border-slate-100/50">
                                        <FormGroup label="Guardian Full Name" placeholder="Full Legal Name" />
                                        <FormGroup label="Relationship" placeholder="e.g. Grandparent" />
                                        <FormGroup label="Contact Number" placeholder="+91 XXXXX XXXXX" icon="call" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <FormGroup label="Admission Grade" type="select" options={["Select Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade"]} />
                                    <FormGroup label="Academic Session" type="select" options={["2025-26", "2024-25"]} />
                                    <FormGroup label="Admission Number" placeholder="Auto-generated: OA-2024-XXX" disabled />
                                    <FormGroup label="Bus Transportation" type="select" options={["Not Required", "Route A - North", "Route B - Central", "Route C - Suburban"]} />
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">
                                            Residential Address <span className="text-[10px] text-[#B0AFA8] font-medium normal-case">(Optional)</span>
                                        </label>
                                        <textarea
                                            className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] min-h-[120px] resize-none transition-all"
                                            placeholder="Enter full residential address..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-50">
                            <button
                                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                                className={cn(
                                    "px-8 py-3.5 rounded-2xl border border-slate-100 text-[13px] font-bold text-[#B0AFA8] hover:bg-[#F7F8F4] transition-all",
                                    step === 1 && "invisible"
                                )}
                            >
                                Back
                            </button>
                            <button
                                onClick={() => step < 3 ? setStep(prev => prev + 1) : navigate("/directory")}
                                className="bg-secondary text-white px-10 py-3.5 rounded-2xl text-[13px] font-bold hover:shadow-xl  transition-all  shadow-lg shadow-secondary/10"
                            >
                                {step === 3 ? "Register Student" : "Proceed to Guardian Info"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormGroup = ({ label, placeholder, icon, type = "input", options = [], disabled = false, optional = false }: any) => (
    <div className="space-y-1.5 group">
        <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1 group-focus-within:text-primary transition-colors flex items-center justify-between">
            {label}
            {optional && <span className="text-[10px] text-[#B0AFA8] font-medium normal-case tracking-normal">(Optional)</span>}
        </label>
        <div className="relative">
            {icon && (
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px] group-focus-within:text-foreground transition-colors">
                    {icon}
                </span>
            )}
            {type === "input" && (
                <input
                    disabled={disabled}
                    className={cn(
                        "w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl py-3.5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] transition-all",
                        icon ? "pl-12 pr-5" : "px-5",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    placeholder={placeholder}
                />
            )}
            {type === "select" && (
                <select className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground appearance-none cursor-pointer">
                    {options.map((opt: string) => (
                        <option key={opt}>{opt}</option>
                    ))}
                </select>
            )}
            {type === "select" && (
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] pointer-events-none">
                    expand_more
                </span>
            )}
        </div>
    </div>
);
