import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";

export const AddStaffPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const steps = [
        { id: 1, label: "Personal Details", icon: "badge" },
        { id: 2, label: "Employment & Professional", icon: "work" },
        { id: 3, label: "Logistics & Access", icon: "vpn_key" },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
            <TopBar
                title="Add New Staff"
                subtitle="Onboard a new faculty or administrative member"
                actions={
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:bg-[#F7F8F4] transition-all"
                        >
                            Cancel
                        </button>
                        <button className="btn-primary px-6 py-2 rounded-xl text-[13px] font-bold  transition-all shadow-sm shadow-slate-100/30">
                            {step === 3 ? "Complete Onboarding" : "Save & Continue"}
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
                                        <h4 className="text-foreground font-bold text-lg">Staff Profile Photo</h4>
                                        <p className="text-[#B0AFA8] text-sm">Professional headshot for institutional identity card.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <FormGroup label="Full Name" placeholder="e.g. Dr. Lakshmi K." />
                                    <FormGroup label="Date of Birth" placeholder="DD / MM / YYYY" icon="calendar_today" />
                                    <FormGroup label="Gender" type="select" options={["Select Gender", "Male", "Female", "Other"]} />
                                    <FormGroup label="Blood Group" type="select" options={["Select Group", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} optional />
                                    <FormGroup label="Personal Email" placeholder="personal@example.com" icon="mail" />
                                    <FormGroup label="Mobile Number" placeholder="+91 XXXXX XXXXX" icon="call" />
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest px-1">
                                            Residential Address <span className="text-[10px] text-[#B0AFA8] font-medium normal-case">(Optional)</span>
                                        </label>
                                        <textarea
                                            className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] min-h-[100px] resize-none transition-all"
                                            placeholder="Enter permanent address..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <FormGroup label="Employee ID" placeholder="e.g. STAFF-2024-001" />
                                    <FormGroup label="Joining Date" placeholder="DD / MM / YYYY" icon="calendar_today" />
                                    <FormGroup label="Department" type="select" options={["Select Department", "Mathematics", "Science", "Humanities", "Administration", "Sports"]} />
                                    <FormGroup label="Designation" placeholder="e.g. Senior Faculty" />
                                    <FormGroup label="Qualifications" placeholder="e.g. PhD in Applied Mathematics" />
                                    <FormGroup label="Years of Experience" placeholder="e.g. 8 Years" />
                                    <FormGroup label="Institutional Email" placeholder="faculty@institution.com" icon="workspace_premium" />
                                    <FormGroup label="Emergency Contact" placeholder="+91 XXXXX XXXXX" />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <FormGroup label="Class Teacher For" type="select" options={["Not Assigned", "Grade 10-A", "Grade 11-B", "Grade 12-C"]} />
                                    <FormGroup label="Work Shift" type="select" options={["Morning (8:00 - 15:00)", "Noon (11:00 - 18:00)"]} />
                                    <FormGroup label="Bus Availed" type="select" options={["No", "Yes - Route A", "Yes - Route B"]} />
                                    <FormGroup label="Portal Access Role" type="select" options={["Standard Teacher", "Department Head", "Administrator"]} />
                                </div>

                                <div className="bg-[#F7F8F4] rounded-2xl p-6 border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-foreground">
                                            <span className="material-symbols-outlined">security</span>
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-foreground">Biometric Registration</p>
                                            <p className="text-[11px] text-[#B0AFA8] font-medium">Link RFID / Biometric ID for automated attendance tracking.</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-bold text-foreground hover:bg-[#F7F8F4] transition-all">Link Device</button>
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
                                {step === 3 ? "Register Staff Member" : "Proceed to Employment Info"}
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
