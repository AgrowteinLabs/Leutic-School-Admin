import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";
import { graphqlRequest } from "../../../lib/graphqlClient";

export const AddDriverPage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    // Step 1 State
    const [fullName, setFullName] = useState("");
    const [mobile, setMobile] = useState("");
    const [emergencyContact, setEmergencyContact] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [nationalId, setNationalId] = useState("");
    const [address, setAddress] = useState("");

    // Step 2 State
    const [licenseNo, setLicenseNo] = useState("");
    const [licenseExpiry, setLicenseExpiry] = useState<Date | null>(null);
    const [licenseClass, setLicenseClass] = useState("");
    const [policeVerification, setPoliceVerification] = useState("");
    const [medicalFitness, setMedicalFitness] = useState("");
    const [exp, setExp] = useState("");

    // Step 3 State
    const [assignedVehicle, setAssignedVehicle] = useState("");
    const [shift, setShift] = useState("");
    const [assignedRoute, setAssignedRoute] = useState("");

    const handleFinalize = async () => {
        const schoolId = localStorage.getItem("school_id") || "";
        const driverPassword = "Driver" + Math.random().toString(36).substring(2, 10) + "!";

        const createMutation = `
            mutation CreateDriver($input: CreateUserDto!) {
                createUser(createUserInput: $input) {
                    id
                    driverLicenseNo
                    driverStatus
                }
            }
        `;

        try {
            await graphqlRequest(createMutation, {
                input: {
                    role: "DRIVER",
                    name: fullName,
                    mobileNo: mobile,
                    password: driverPassword,
                    schoolId,
                    driverLicenseNo: licenseNo,
                    licenseExpiry: licenseExpiry ? licenseExpiry.toISOString().split("T")[0] : null,
                    licenseClass: licenseClass || undefined,
                    driverStatus: "ACTIVE",
                    yearsExperience: exp || undefined,
                }
            });
            setShowSuccess(true);
        } catch (err) {
            console.error("Failed to onboard driver:", err);
            alert("Failed to onboard driver. Please try again.");
        }
    };

    const steps = [
        { id: 1, title: "Driver Identity", subtitle: "Personal information and contact details", icon: "person", color: "text-primary", bg: "bg-primary/10" },
        { id: 2, title: "Compliance & Legal", subtitle: "Driving license and verification details", icon: "gavel", color: "text-emerald-600", bg: "bg-emerald-50" },
        { id: 3, title: "Assignment & Route", subtitle: "Vehicle mapping and shift scheduling", icon: "directions_bus", color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
            <TopBar
                title="Register Driver"
                subtitle="Enroll a new transport captain into the school ecosystem"
                actions={
                    <div className="flex items-center gap-3">
                        <PDSButton variant="text" onClick={() => navigate(-1)}>Cancel</PDSButton>
                        <PDSButton variant="primary" icon="how_to_reg" onClick={handleFinalize} disabled={activeStep < 3}>Complete Registration</PDSButton>
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
                                                    {/* Step 1: Personal Details */}
                                                    {step.id === 1 && (
                                                        <div className="flex flex-col lg:flex-row gap-16">
                                                            <div className="shrink-0">
                                                                <div className="size-40 rounded-[40px] bg-[#F7F8F4] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-[#B0AFA8] hover:border-primary hover:text-primary transition-all cursor-pointer group">
                                                                    <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">person_add</span>
                                                                    <span className="text-[11px] font-bold uppercase tracking-wider">Driver Photo</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                                <PDSFormGroup label="Driver Full Name" placeholder="As per Govt. ID" value={fullName} onChange={setFullName} />
                                                                <PDSFormGroup label="Mobile Number" placeholder="+91 XXXX" icon="call" value={mobile} onChange={setMobile} />
                                                                <PDSFormGroup label="Emergency Contact" placeholder="+91 XXXX" icon="emergency" value={emergencyContact} onChange={setEmergencyContact} />
                                                                <PDSFormGroup label="Blood Group" type="select" options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} optional searchable value={bloodGroup} onChange={setBloodGroup} />
                                                                <PDSFormGroup label="National ID" placeholder="XXXX-XXXX-XXXX" value={nationalId} onChange={setNationalId} />
                                                                <PDSFormGroup label="Residential Address" type="textarea" placeholder="Full address..." value={address} onChange={setAddress} rows={2} className="md:col-span-2" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Step 2: Compliance */}
                                                    {step.id === 2 && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                            <PDSFormGroup label="Driving License No." placeholder="DL-XXXXX" icon="featured_video" value={licenseNo} onChange={setLicenseNo} />
                                                            <PDSFormGroup label="License Expiry" type="date" value={licenseExpiry} onChange={setLicenseExpiry} />
                                                            <PDSFormGroup label="License Class" type="select" options={["Commercial (HMV)", "Light Motor Vehicle (LMV)"]} value={licenseClass} onChange={setLicenseClass} />
                                                            <PDSFormGroup label="Police Verification" placeholder="PV-Ref-XXX" icon="gavel" value={policeVerification} onChange={setPoliceVerification} />
                                                            <PDSFormGroup label="Medical Fitness" type="select" options={["Certified Fit", "Review Pending"]} value={medicalFitness} onChange={setMedicalFitness} />
                                                            <PDSFormGroup label="Years of Exp." placeholder="e.g. 10 Years" value={exp} onChange={setExp} />
                                                        </div>
                                                    )}

                                                    {/* Step 3: Assignment */}
                                                    {step.id === 3 && (
                                                        <div className="space-y-12">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                                <PDSFormGroup label="Assigned Vehicle" type="select" options={["Bus 01 - Route A", "Bus 02 - Route B", "Bus 03 - Route C"]} value={assignedVehicle} onChange={setAssignedVehicle} icon="directions_bus" searchable />
                                                                <PDSFormGroup label="Primary Shift" type="select" options={["Morning & Evening", "Morning Only", "Evening Only"]} value={shift} onChange={setShift} />
                                                                <PDSFormGroup label="Assigned Route" type="select" options={["Route A - North", "Route B - South"]} value={assignedRoute} onChange={setAssignedRoute} searchable />
                                                            </div>
                                                            
                                                            <div className="bg-emerald-50/50 p-8 rounded-[32px] border border-emerald-100 flex items-center justify-between">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="size-14 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-900/5">
                                                                        <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[15px] font-bold text-foreground">Transport Token</p>
                                                                        <p className="text-[13px] text-[#B0AFA8] font-medium">Generate QR for passenger verification during boarding</p>
                                                                    </div>
                                                                </div>
                                                                <PDSButton variant="primary" icon="qr_code_scanner" className="px-8 h-10">Generate QR</PDSButton>
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
                                                                Complete Registration
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
                title="Driver Registered!"
                description="The transport captain has been successfully added to the school network."
                buttonText="Go to Transport Hub"
                onClose={() => navigate("/transportation")}
            />
        </div>
    );
};
