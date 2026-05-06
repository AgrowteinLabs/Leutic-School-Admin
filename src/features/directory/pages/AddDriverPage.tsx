import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import successAnimation from "../../../assets/animations/success.json";
import { AppDropdown } from "../../../components/AppDropdown";
import { AppDatePicker } from "../../../components/AppDatePicker";

export const AddDriverPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const steps = [
        { id: 1, title: "Personal", subtitle: "Driver identity" },
        { id: 2, title: "Compliance", subtitle: "License & legal" },
        { id: 3, title: "Assignment", subtitle: "Vehicle & route" },
    ];

    const [showSuccess, setShowSuccess] = useState(false);

    const handleFinalize = () => {
        setShowSuccess(true);
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white font-sans">
            <TopBar
                title="Register Driver"
                subtitle="Enroll a new transport captain into the school ecosystem"
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
                                                <span className="material-symbols-outlined text-2xl">person</span>
                                                <span className="text-[10px] font-semibold ">Upload</span>
                                            </div>
                                            <div>
                                                <h4 className="text-foreground font-bold text-lg">Driver Profile Photo</h4>
                                                <p className="text-[#B0AFA8] text-sm">Official photo for transport verification system.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            <FormGroup label="Driver Full Name" placeholder="Name as per Government ID" />
                                            <FormGroup label="Mobile Number" placeholder="+91 XXXXX XXXXX" icon="call" />
                                            <FormGroup label="Emergency Contact" placeholder="+91 XXXXX XXXXX" icon="emergency" />
                                            <FormGroup label="Blood Group" type="select" options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} optional searchable />
                                            <div className="col-span-full">
                                                <div className="space-y-2 group">
                                                    <label className="text-[12px] font-bold text-[#B0AFA8] tracking-tight group-focus-within:text-foreground transition-colors px-1">Permanent Address</label>
                                                    <textarea
                                                        className="w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] px-6 py-4 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] min-h-[100px] transition-all no-scrollbar"
                                                        placeholder="Enter permanent residential address..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            <FormGroup label="Driving License No." placeholder="DL-XXXXX-XXXXXX" icon="featured_video" />
                                            <FormGroup label="License Expiry" type="date" placeholder="DD / MM / YYYY" icon="calendar_today" />
                                            <FormGroup label="License Class" type="select" options={["Commercial (HMV)", "Light Motor Vehicle (LMV)", "Heavy Passenger Vehicle"]} searchable />
                                            <FormGroup label="Medical Fitness Status" type="select" options={["Certified Fit", "Pending Review", "Annual Checkup Due"]} />
                                            <FormGroup label="Police Verification Ref" placeholder="PV-XXXX-XXXX" icon="gavel" />
                                            <FormGroup label="Total Driving Experience" placeholder="e.g. 12 Years" />
                                            <FormGroup label="Previous Institution" placeholder="e.g. St. Xavier's Transport" optional />
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                            <FormGroup label="Assigned Vehicle" type="select" options={["DL-12-S-5542 (Route A)", "DL-01-P-9902 (Route B)", "HR-55-G-1123 (Route C)"]} icon="directions_bus" searchable />
                                            <FormGroup label="Primary Shift" type="select" options={["Morning & Evening", "Morning Only", "Evening Only"]} />
                                            <FormGroup label="Assigned Route" type="select" options={["Route A - Aerocity", "Route B - Rohini", "Route C - Dwarka"]} disabled />
                                            <FormGroup label="GPS Tracker ID (Auto)" placeholder="GPS-XXXX-XXX" disabled />
                                        </div>

                                        <div className="bg-[#F7F8F4] rounded-[20px] p-6 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-full bg-white shadow-sm flex items-center justify-center text-foreground">
                                                    <span className="material-symbols-outlined">qr_code_2</span>
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-foreground">Vehicle QR Token</p>
                                                    <p className="text-[13px] text-[#B0AFA8] font-medium mt-0.5">Generate QR for student board pass scanning.</p>
                                                </div>
                                            </div>
                                            <button className="btn-secondary px-6 h-10 rounded-xl text-[12px] font-bold">Generate QR</button>
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
                        {step === 3 ? "Complete Registration" : "Next Step"}
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
                            onClick={() => navigate("/directory")}
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

                            <h3 className="text-[24px] font-bold text-[#3D6B2C] tracking-tight mb-2">Driver Registered!</h3>
                            <p className="text-[#B0AFA8] text-[13px] font-medium leading-relaxed mb-10 px-4">
                                The transport captain has been successfully added to the school network.
                            </p>

                            <button
                                onClick={() => navigate("/directory/drivers")}
                                className="btn-primary w-full h-10 rounded-xl text-[13px] font-bold"
                            >
                                View Transport Directory
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FormGroup = ({ label, placeholder, icon, type = "input", options = [], searchable = false, disabled = false, optional = false, uppercase = false, maxDate }: any) => {
    const [selectedValue, setSelectedValue] = useState("");

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
            </div>
        </div>
    );
};
