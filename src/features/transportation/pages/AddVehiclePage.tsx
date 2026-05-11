import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";

export const AddVehiclePage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    // Step 1: Vehicle Identity
    const [regNumber, setRegNumber] = useState("");
    const [vehicleType, setVehicleType] = useState("Standard Bus (42 Seater)");
    const [manufacturer, setManufacturer] = useState("");
    const [mfgYear, setMfgYear] = useState("");
    const [capacity, setCapacity] = useState("");
    const [fuelType, setFuelType] = useState("Diesel");
    const [chassisNo, setChassisNo] = useState("");

    // Step 2: Compliance & Safety
    const [policyNumber, setPolicyNumber] = useState("");
    const [policyExpiry, setPolicyExpiry] = useState<Date | null>(null);
    const [pucExpiry, setPucExpiry] = useState<Date | null>(null);
    const [fitnessExpiry, setFitnessExpiry] = useState<Date | null>(null);
    const [permitNo, setPermitNo] = useState("");
    const [speedGovernorId, setSpeedGovernorId] = useState("");

    // Step 3: Fleet Tracking
    const [assignedRoute, setAssignedRoute] = useState("Select Route");
    const [gpsImei, setGpsImei] = useState("");
    const [cctvCapacity, setCctvCapacity] = useState("No CCTV");
    const [panicButtonStatus, setPanicButtonStatus] = useState("Calibrated");

    const handleFinalize = () => {
        setShowSuccess(true);
    };

    const steps = [
        { id: 1, title: "Vehicle Identity", subtitle: "Registration details and specifications", icon: "directions_bus", color: "text-primary", bg: "bg-primary/10" },
        { id: 2, title: "Compliance & Safety", subtitle: "Insurance, permits and governor IDs", icon: "verified_user", color: "text-emerald-600", bg: "bg-emerald-50" },
        { id: 3, title: "Fleet Tracking", subtitle: "Route assignment and sensor mapping", icon: "satellite_alt", color: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
            <TopBar
                title="Onboard Vehicle"
                subtitle="Register a new unit to the institutional fleet"
                actions={
                    <div className="flex items-center gap-3">
                        <PDSButton variant="text" onClick={() => navigate(-1)}>Cancel</PDSButton>
                        <PDSButton variant="primary" icon="add_road" onClick={handleFinalize} disabled={activeStep < 3}>Complete Registration</PDSButton>
                    </div>
                }
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
                    
                    {/* Unified Matured UI Container with Accordion Stepper */}
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
                                                    {/* Step 1: Vehicle Identity */}
                                                    {step.id === 1 && (
                                                        <div className="flex flex-col lg:flex-row gap-16">
                                                            <div className="shrink-0">
                                                                <div className="size-40 rounded-[40px] bg-[#F7F8F4] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-[#B0AFA8] hover:border-primary hover:text-primary transition-all cursor-pointer group">
                                                                    <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">local_shipping</span>
                                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-center px-4">Vehicle Photo</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                                <PDSFormGroup label="Registration Number" placeholder="e.g. KL-07-AW-5542" value={regNumber} onChange={setRegNumber} />
                                                                <PDSFormGroup label="Vehicle Type" type="select" options={["Standard Bus (42 Seater)", "Mini Bus (24 Seater)", "Van (12 Seater)", "Electric Shuttle"]} value={vehicleType} onChange={setVehicleType} />
                                                                <PDSFormGroup label="Manufacturer" placeholder="e.g. Tata Marcopolo" value={manufacturer} onChange={setManufacturer} />
                                                                <PDSFormGroup label="Manufacturing Year" placeholder="e.g. 2024" value={mfgYear} onChange={setMfgYear} />
                                                                <PDSFormGroup label="Seating Capacity" placeholder="e.g. 42" icon="event_seat" value={capacity} onChange={setCapacity} />
                                                                <PDSFormGroup label="Fuel Type" type="select" options={["CNG", "Diesel", "Electric", "Petrol"]} value={fuelType} onChange={setFuelType} />
                                                                <PDSFormGroup label="Chassis Number" placeholder="Enter VIN/Chassis Number" className="md:col-span-2" value={chassisNo} onChange={setChassisNo} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Step 2: Compliance */}
                                                    {step.id === 2 && (
                                                        <div className="space-y-16">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-10">
                                                                <PDSFormGroup label="Insurance Policy Number" placeholder="POL-XXX-XXX" icon="policy" value={policyNumber} onChange={setPolicyNumber} />
                                                                <PDSFormGroup label="Insurance Expiry" type="date" value={policyExpiry} onChange={setPolicyExpiry} />
                                                                <PDSFormGroup label="Pollution (PUC) Expiry" type="date" value={pucExpiry} onChange={setPucExpiry} />
                                                                <PDSFormGroup label="Fitness Certificate Expiry" type="date" value={fitnessExpiry} onChange={setFitnessExpiry} />
                                                                <PDSFormGroup label="Permit Registration No." placeholder="PRM-XXXXX-XXXX" value={permitNo} onChange={setPermitNo} />
                                                                <PDSFormGroup label="Speed Governor ID" placeholder="SG-XXXXX" icon="speed" value={speedGovernorId} onChange={setSpeedGovernorId} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Step 3: Logistics */}
                                                    {step.id === 3 && (
                                                        <div className="space-y-12">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-10">
                                                                <PDSFormGroup 
                                                                    label="Primary Route Mapping" 
                                                                    type="select" 
                                                                    options={["Select Route", "Route A - North Coast", "Route B - Central Kochi", "Route C - Suburban South", "Route D - Infopark Express"]} 
                                                                    searchable 
                                                                    value={assignedRoute} 
                                                                    onChange={setAssignedRoute} 
                                                                />
                                                                <PDSFormGroup label="GPS Tracker IMEI" placeholder="XX-XXXXXX-XXXXXX-X" icon="satellite_alt" value={gpsImei} onChange={setGpsImei} />
                                                                <PDSFormGroup label="CCTV Storage Capacity" type="select" options={["No CCTV", "256GB - 7 Days", "512GB - 15 Days", "1TB - 30 Days"]} value={cctvCapacity} onChange={setCctvCapacity} />
                                                                <PDSFormGroup label="Panic Button Calibration" type="select" options={["Calibrated", "Needs Service"]} icon="sensors" value={panicButtonStatus} onChange={setPanicButtonStatus} />
                                                            </div>
                                                            
                                                            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex items-center justify-between">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="size-14 rounded-2xl bg-white flex items-center justify-center text-foreground shadow-sm">
                                                                        <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[15px] font-bold text-foreground">Asset Tagging</p>
                                                                        <p className="text-[13px] text-[#B0AFA8] font-medium">Link vehicle to physical maintenance QR tags</p>
                                                                    </div>
                                                                </div>
                                                                <PDSButton variant="text" icon="download" className="px-6 h-10 bg-white">Download QR</PDSButton>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Section Actions */}
                                                    <div className="flex justify-end pt-8 border-t border-slate-100">
                                                        {step.id < 3 ? (
                                                            <PDSButton variant="primary" className="px-12 h-10" onClick={() => setActiveStep(step.id + 1)}>
                                                                Save & Continue
                                                            </PDSButton>
                                                        ) : (
                                                            <PDSButton variant="primary" className="px-12 h-10" onClick={handleFinalize}>
                                                                Complete Vehicle Registration
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
                title="Vehicle Registered!"
                description="The new unit has been successfully added to the fleet and mapped for tracking."
                buttonText="Go to Fleet Tracker"
                onClose={() => navigate("/transportation")}
            />
        </div>
    );
};
