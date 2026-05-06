import { useState, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const TopBar = ({
    title,
    actions,
    onBack,
}: {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    onBack?: () => void;
}) => {
    const navigate = useNavigate();
    const [showQuickMenu, setShowQuickMenu] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const now = new Date();
    const greeting =
        now.getHours() < 12 ? "Good Morning" : now.getHours() < 17 ? "Good Afternoon" : "Good Evening";

    const [allActions, setAllActions] = useState([
        { label: "Create Class", icon: "class", color: "text-[#B45309]", bg: "bg-[#FEF3C7]", path: "/classes/create", description: "New grade levels & sections" },
        { label: "Enroll Student", icon: "person_add", color: "text-[#1565C0]", bg: "bg-[#DBEAFE]", path: "/directory/enroll-student", description: "Admit new student profile" },
        { label: "Register Faculty", icon: "badge", color: "text-[#3D6B2C]", bg: "bg-[#EAF2D7]", path: "/directory/add-staff", description: "Onboard teaching staff" },
        { label: "Mark Attendance", icon: "event_available", color: "text-[#2E7D32]", bg: "bg-[#DCFCE7]", path: "/attendance", description: "Log daily student presence" },
        { label: "Post Notice", icon: "campaign", color: "text-[#B45309]", bg: "bg-[#FEF3C7]", path: "/communications?compose=true", description: "Broadcast school updates" },
        { label: "Record Finance", icon: "payments", color: "text-[#3D6B2C]", bg: "bg-[#EAF2D7]", path: "/finance", description: "Manage fee collections" },
        { label: "Add Schedule", icon: "calendar_add_on", color: "text-[#B91C1C]", bg: "bg-[#FEE2E2]", path: "/calendar", description: "Update classroom timings" },
        { label: "Performance Analytics", icon: "monitoring", color: "text-blue-600", bg: "bg-blue-50", description: "Real-time class performance graphs" },
        { label: "Staff Appraisal", icon: "rate_review", color: "text-amber-600", bg: "bg-amber-50", description: "Teacher performance reviews" },
        { label: "Library Management", icon: "local_library", color: "text-cyan-600", bg: "bg-cyan-50", description: "Track book issues & returns" },
        { label: "Bus Tracking", icon: "directions_bus", color: "text-blue-600", bg: "bg-blue-50", description: "Real-time vehicle monitoring" },
        { label: "Exam Board", icon: "quiz", color: "text-rose-600", bg: "bg-rose-50", description: "Setup examination schedules" },
    ]);

    const [selectedLabels, setSelectedLabels] = useState<string[]>([
        "Create Class", "Enroll Student", "Register Faculty", "Mark Attendance", "Post Notice", "Record Finance", "Add Schedule"
    ]);

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const lastSwapTime = useRef(0);

    const toggleAction = (label: string) => {
        setSelectedLabels(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        );
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragEnter = (index: number) => {
        const now = Date.now();
        if (draggedIndex === null || draggedIndex === index || now - lastSwapTime.current < 150) return;

        lastSwapTime.current = now;
        const updatedActions = [...allActions];
        const movedItem = updatedActions[draggedIndex];

        // Remove and insert
        updatedActions.splice(draggedIndex, 1);
        updatedActions.splice(index, 0, movedItem);

        setAllActions(updatedActions);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        lastSwapTime.current = 0;
    };

    return (
        <>
            <header className="border-b border-slate-100 bg-white shrink-0 sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between px-6 lg:px-10 py-5">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-[#F7F8F4] rounded-[10px] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[#B0AFA8] hover:text-foreground">
                                    arrow_back
                                </span>
                            </button>
                        )}
                        <div className="flex flex-col gap-0.5">
                            <p className="text-[#B0AFA8] text-[13px] font-medium">{greeting}, Principal</p>
                            <h2 className="text-xl font-semibold tracking-tight text-foreground leading-tight">
                                {title}
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <div
                            className="relative group h-full flex items-center"
                            onMouseEnter={() => setShowQuickMenu(true)}
                            onMouseLeave={() => setShowQuickMenu(false)}
                        >
                            <button
                                className={cn(
                                    "btn-secondary h-10 px-6 flex items-center gap-2 text-[13px] font-bold transition-all",
                                    showQuickMenu && "bg-[#D9EA85]"
                                )}
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Quick Create
                            </button>

                            {showQuickMenu && (
                                <div className="absolute top-[90%] right-0 pt-3 w-[480px] z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="bg-white border border-slate-100 rounded-[24px] shadow-2xl p-2">
                                        <div className="px-4 py-3 mb-1 border-b border-slate-50">
                                            <p className="text-[12px] font-bold text-[#B0AFA8]">Principal Command Center</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1">
                                            {allActions.filter(a => selectedLabels.includes(a.label)).map((action) => (
                                                <button
                                                    key={action.label}
                                                    onClick={() => {
                                                        navigate(action.path || "/");
                                                        setShowQuickMenu(false);
                                                    }}
                                                    className="flex items-center gap-3 p-3 rounded-[14px] hover:bg-[#F7F8F4] transition-all group/item text-left"
                                                >
                                                    <div className={cn("size-9 rounded-xl flex items-center justify-center transition-colors shrink-0", action.bg, action.color)}>
                                                        <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[13px] font-bold text-foreground truncate">{action.label}</span>
                                                        <span className="text-[10px] text-[#B0AFA8] font-medium leading-none mt-0.5 truncate">{action.description}</span>
                                                    </div>
                                                </button>
                                            ))}
                                            <div className="col-span-2 mt-2 pt-2 border-t border-slate-50">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowQuickMenu(false);
                                                        setShowCustomizeModal(true);
                                                    }}
                                                    className="w-full p-3 rounded-[14px] hover:bg-[#F7F8F4] transition-all flex items-center justify-center gap-3 text-[12px] font-bold text-[#B0AFA8] hover:text-primary"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">settings</span>
                                                    Customize Action Menu
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {actions}
                        <button className="relative p-2 text-[#B0AFA8] hover:text-foreground transition-all duration-300 group">
                            <span className="material-symbols-outlined text-[24px]">notifications</span>
                            <span className="absolute top-1 right-1 size-4 bg-[#B91C1C] rounded-full text-[9px] text-white font-black flex items-center justify-center border-2 border-white shadow-sm">3</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Customize Actions Modal - Moved outside header for UI stability */}
            {showCustomizeModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-10">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
                        onClick={() => setShowCustomizeModal(false)}
                    />
                    <div className="relative w-full max-w-4xl bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-[#F7F8F4]/30 shrink-0">
                            <div>
                                <h3 className="text-[20px] font-bold text-foreground tracking-tight">Customize Command Center</h3>
                                <p className="text-[13px] font-medium text-[#B0AFA8] mt-1">Configure your primary institutional shortcuts for maximum efficiency.</p>
                            </div>
                            <button
                                onClick={() => setShowCustomizeModal(false)}
                                className="size-12 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#B0AFA8] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[24px]">close</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-10 overflow-y-auto no-scrollbar">
                            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                                <AnimatePresence mode="popLayout">
                                    {allActions.map((action, i) => {
                                        const isSelected = selectedLabels.includes(action.label);
                                        const isDragging = draggedIndex === i;

                                        return (
                                            <motion.div
                                                key={action.label}
                                                layout
                                                draggable
                                                onDragStart={() => handleDragStart(i)}
                                                onDragEnter={() => handleDragEnter(i)}
                                                onDragEnd={handleDragEnd}
                                                onDragOver={(e) => e.preventDefault()}
                                                onClick={() => toggleAction(action.label)}
                                                transition={{ type: "spring", stiffness: 350, damping: 40, mass: 1 }}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-[18px] cursor-pointer border group relative will-change-transform",
                                                    isSelected
                                                        ? "bg-white border-primary/50"
                                                        : "bg-[#F7F8F4]/30 border-slate-200/60 hover:border-slate-300 opacity-60 hover:opacity-100",
                                                    isDragging && "bg-[#F7F8F4] border-dashed border-primary/30 opacity-100 scale-[0.98]"
                                                )}
                                            >
                                                <div className={cn("flex items-center gap-3 shrink-0 transition-opacity duration-300", isDragging ? "opacity-0 pointer-events-none" : "opacity-100")}>
                                                    <span className="material-symbols-outlined text-[#B0AFA8] text-[20px] cursor-grab active:cursor-grabbing">drag_indicator</span>
                                                    <div className={cn("size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", action.bg, action.color)}>
                                                        <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
                                                    </div>
                                                </div>
                                                <div className={cn("flex flex-col flex-1 min-w-0 transition-opacity duration-300", isDragging ? "opacity-0 pointer-events-none" : "opacity-100")}>
                                                    <span className="text-[13px] font-bold text-foreground truncate tracking-tight">{action.label}</span>
                                                    <span className="text-[10px] text-[#B0AFA8] font-medium leading-none mt-0.5 truncate">{action.description}</span>
                                                </div>
                                                <div className={cn(
                                                    "size-5 rounded-full flex items-center justify-center border transition-all shrink-0",
                                                    isDragging ? "opacity-0 pointer-events-none" : "opacity-100",
                                                    isSelected ? "bg-primary border-primary text-white" : "bg-white border-slate-200"
                                                )}>
                                                    {isSelected && <span className="material-symbols-outlined text-[10px] font-bold">check</span>}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* Footer */}
                        <div className="px-10 py-8 bg-[#F7F8F4]/30 border-t border-slate-100 flex items-center justify-between shrink-0">
                            <p className="text-[12px] font-semi-bold text-[#B0AFA8] hidden sm:block">
                                <span className="text-primary font-bold">{selectedLabels.length} of {allActions.length}</span> Actions pinned to header
                            </p>
                            <div className="flex gap-4 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowCustomizeModal(false)}
                                    className="flex-1 sm:flex-none px-8 h-12 rounded-[16px] text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setShowCustomizeModal(false)}
                                    className="flex-1 sm:flex-none btn-primary px-10 h-12 rounded-[16px] text-[14px] font-bold transition-all shadow-xl shadow-primary/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export const Header = ({
    title,
    subtitle,
    actions,
}: {
    title: string;
    subtitle: string;
    actions?: ReactNode;
}) => {
    return (
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-foreground text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                <p className="text-[#B0AFA8] text-sm font-medium">
                    {subtitle}
                </p>
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
    );
};
