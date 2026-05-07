import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import successAnimation from "../../../assets/animations/success.json";
import { AppDropdown } from "../../../components/AppDropdown";

export const CreateClassPage = () => {
    const navigate = useNavigate();
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    const mockStudents = [
        { id: 1, name: "Aavya S.",  grade: "Grade 10", img: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=100" },
        { id: 2, name: "Ishaan K.", grade: "Grade 10", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
        { id: 3, name: "Meera V.",  grade: "Grade 10", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
        { id: 4, name: "Arjun T.",  grade: "Grade 10", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    ];

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

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white font-sans">
            <TopBar
                title="Create New Class"
                subtitle="Establish a new grade section and optionally map students"
                actions={
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-text px-6 h-10 rounded-xl text-[13px] font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleFinalize}
                            className="btn-primary px-6 h-10 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all shadow-sm shadow-slate-100/30"
                        >
                            Finalize & Create Class
                        </button>
                    </div>
                }
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 space-y-8">

                    {/* Basic Details */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">info</span>
                                    Basic Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                    <FormGroup label="Grade Level" type="select" options={["Grade 9", "Grade 10", "Grade 11", "Grade 12"]} />
                                    <FormGroup label="Section" placeholder="e.g. A, B, C" uppercase />
                                    <FormGroup
                                        label="Primary Class Teacher"
                                        type="select"
                                        searchable
                                        options={["Dr. Sarah Jenkins", "Prof. Michael Chen", "Ms. Elena Rodriguez", "Mr. David Thompson", "Dr. Anita Gupta", "Ms. Chloe Whitmore"]}
                                        placeholder="Search and assign staff..."
                                        icon="person_search"
                                    />
                                    <FormGroup label="Assigned Room / Lab" placeholder="E.g. Room 304" />
                                    <FormGroup label="Daily Shift" type="select" options={["Morning Shift", "Afternoon Shift", "Evening Shift"]} />
                                    <FormGroup label="Academic Session" type="select" options={["2025-26", "2024-25"]} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Students */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">person_add</span>
                                        Map Students <span className="text-[#B0AFA8] font-medium text-sm ml-1">(Optional)</span>
                                    </h3>
                                    <span className="px-3 py-1 bg-[#EAF2D7] text-foreground text-[11px] font-bold rounded-full border border-[#D9EA85]">
                                        {selectedStudents.length} Selected
                                    </span>
                                </div>
                                <p className="text-[#B0AFA8] text-sm">You can skip this step and map students later from the class details page.</p>
                            </div>

                            <div className="relative group max-w-2xl">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px] group-focus-within:text-foreground transition-colors z-10">search</span>
                                <input
                                    type="text"
                                    placeholder="Search students by name, ID or current grade..."
                                    className="w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-[10px] pl-12 pr-6 text-[14px] font-semibold text-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {mockStudents.map((student) => (
                                    <div
                                        key={student.id}
                                        onClick={() => toggleStudent(student)}
                                        className={cn(
                                            "p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4",
                                            selectedStudents.find(s => s.id === student.id)
                                                ? "bg-[#EAF2D7] border-[#D9EA85] shadow-sm"
                                                : "bg-white border-slate-100 hover:border-slate-200 hover:bg-[#F7F8F4]"
                                        )}
                                    >
                                        <img src={student.img} className="size-12 rounded-xl object-cover" />
                                        <div className="flex-1">
                                            <p className="text-[14px] font-bold text-foreground">{student.name}</p>
                                            <p className="text-[12px] text-[#B0AFA8] font-medium">{student.grade}</p>
                                        </div>
                                        <div className={cn(
                                            "size-6 rounded-full border-2 flex items-center justify-center transition-all",
                                            selectedStudents.find(s => s.id === student.id)
                                                ? "bg-primary border-primary text-foreground"
                                                : "border-slate-200"
                                        )}>
                                            {selectedStudents.find(s => s.id === student.id) && (
                                                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex justify-end items-center gap-4 py-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-text px-8 h-10 rounded-xl text-[13px] font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleFinalize}
                            className="btn-primary px-10 h-10 rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-slate-100/30"
                        >
                            Finalize & Create Class
                        </button>
                    </div>
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
                            onClick={() => navigate("/classes")}
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
                            
                            <h3 className="text-[24px] font-bold text-[#3D6B2C] tracking-tight mb-2">Class Created Successfully!</h3>
                            <p className="text-[#B0AFA8] text-[15px] font-medium leading-relaxed mb-10 px-4">
                                Grade 10 - Section A has been established and students have been mapped successfully.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate("/classes/1")}
                                    className="btn-primary w-full h-10 rounded-xl text-[13px] font-bold shadow-xl shadow-primary/20"
                                >
                                    View Class Details
                                </button>
                                <button
                                    onClick={() => navigate("/")}
                                    className="btn-text w-full h-10 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FormGroup = ({ label, placeholder, icon, type = "input", options = [], searchable = false, disabled = false, optional = false, uppercase = false }: any) => {
    const [selectedValue, setSelectedValue] = useState("");
    const [inputValue, setInputValue] = useState("");

    return (
        <div className="space-y-2.5 group">
            <label className="text-[13px] font-bold text-[#B0AFA8] px-1 group-focus-within:text-foreground transition-colors flex items-center justify-between">
                {label}
                {optional && <span className="text-[11px] text-[#B0AFA8] font-medium normal-case tracking-normal">(Optional)</span>}
            </label>
            <div className="relative">
                {icon && type !== "select" && (
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px] group-focus-within:text-foreground transition-colors z-10">
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
                {type === "select" && (
                    <AppDropdown
                        options={options}
                        value={selectedValue}
                        onChange={setSelectedValue}
                        placeholder={placeholder}
                        searchable={searchable}
                    />
                )}
            </div>
        </div>
    );
};
