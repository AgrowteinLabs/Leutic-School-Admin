import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";

export const AddVehiclePage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const steps = [
        { id: 1, label: "Vehicle Specifications", icon: "directions_bus" },
        { id: 2, label: "Compliance & Insurance", icon: "verified_user" },
        { id: 3, label: "Asset Tagging", icon: "qr_code_2" },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
            <TopBar
                title="Register New Vehicle"
                subtitle="Add a new bus or van to the institutional fleet"
                actions={
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:bg-[#F7F8F4] transition-all"
                        >
                            Cancel
                        </button>
                        <button className="btn-primary px-6 py-2 rounded-xl text-[13px] font-bold  transition-all shadow-sm shadow-slate-100/30">
                            {step === 3 ? "Register Asset" : "Save & Continue"}
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
                                        <span className="material-symbols-outlined text-2xl">local_shipping</span>
                                        <span className="text-[10px] font-bold uppercase">Upload Photo</span>
                                    </div>
                                    <div>
                                        <h4 className="text-foreground font-bold text-lg">Vehicle Visual Reference</h4>
                                        <p className="text-[#B0AFA8] text-sm">Clear profile photo of the bus for visual identification.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <FormGroup label="Registration Number" placeholder="e.g. DL-12-S-5542" icon="license" />
                                    <FormGroup label="Vehicle Type" type="select" options={["Select Type", "Standard Bus (42 Seater)", "Mini Bus (24 Seater)", "Van (12 Seater)", "Electric Shuttle"]} />
                                    <FormGroup label="Manufacturer & Model" placeholder="e.g. Tata Marcopolo 2024" />
                                    <FormGroup label="Seating Capacity" placeholder="e.g. 42" icon="event_seat" />
                                    <FormGroup label="Fuel / Power Type" type="select" options={["CNG", "Diesel", "Electric", "Petrol"]} />
                                    <FormGroup label="Chassis Number" placeholder="Enter full VIN/Chassis Number" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <FormGroup label="Insurance Policy Number" placeholder="POL-XXX-XXX" icon="policy" />
                                    <FormGroup label="Insurance Expiry Date" placeholder="DD / MM / YYYY" icon="calendar_today" />
                                    <FormGroup label="Pollution (PUC) Expiry" placeholder="DD / MM / YYYY" />
                                    <FormGroup label="Fitness Certificate Expiry" placeholder="DD / MM / YYYY" />
                                    <FormGroup label="Permit Registration No." placeholder="PRM-XXXXX-XXXX" />
                                    <FormGroup label="Speed Governor ID" placeholder="SG-XXXXX" icon="speed" />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <FormGroup label="Assigned Route" type="select" options={["Select Route", "Route A - North", "Route B - Central", "Route C - Suburban"]} />
                                    <FormGroup label="GPS Tracker IMEI" placeholder="XX-XXXXXX-XXXXXX-X" icon="satellite_alt" />
                                    <FormGroup label="CCTV Storage Capacity" type="select" options={["No CCTV", "256GB - 7 Days", "512GB - 15 Days", "1TB - 30 Days"]} />
                                    <FormGroup label="Panic Button Calibration" type="select" options={["Calibrated", "Needs Service"]} icon="sensors" />
                                </div>

                                <div className="bg-[#F7F8F4] rounded-2xl p-6 border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-foreground">
                                            <span className="material-symbols-outlined">qr_code_2</span>
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-foreground">Asset QR Identification</p>
                                            <p className="text-[11px] text-[#B0AFA8] font-medium">Auto-generated QR for fleet maintenance tracking.</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-bold text-foreground hover:bg-[#F7F8F4] transition-all">Download QR</button>
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
                                onClick={() => step < 3 ? setStep(prev => prev + 1) : navigate("/transportation")}
                                className="bg-secondary text-white px-10 py-3.5 rounded-2xl text-[13px] font-bold hover:shadow-xl  transition-all  shadow-lg shadow-secondary/10"
                            >
                                {step === 3 ? "Complete Registration" : "Proceed to Compliance"}
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
                <select className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 text-[14px] font-semibold text-foreground appearance-none cursor-pointer group-focus-within:border-primary/20">
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
