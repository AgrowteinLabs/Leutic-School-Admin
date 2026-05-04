import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

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
    const now = new Date();
    const greeting =
        now.getHours() < 12 ? "Good Morning" : now.getHours() < 17 ? "Good Afternoon" : "Good Evening";

    const quickActions = [
        { label: "Create Class",      icon: "class",          color: "text-[#B45309]",  bg: "bg-[#FEF3C7]", path: "/classes/create" },
        { label: "Enroll Student",    icon: "person_add",     color: "text-[#1565C0]",  bg: "bg-[#DBEAFE]", path: "/directory/enroll-student" },
        { label: "Register Faculty",  icon: "badge",          color: "text-[#3D6B2C]",  bg: "bg-[#EAF2D7]", path: "/directory/add-staff" },
        { label: "Mark Attendance",   icon: "event_available",color: "text-[#2E7D32]",  bg: "bg-[#DCFCE7]", path: "/attendance" },
        { label: "Post Notice",       icon: "campaign",       color: "text-[#B45309]",  bg: "bg-[#FEF3C7]", path: "/communications?compose=true" },
        { label: "Record Finance",    icon: "payments",       color: "text-[#3D6B2C]",  bg: "bg-[#EAF2D7]", path: "/finance" },
        { label: "Add Schedule",      icon: "calendar_add_on",color: "text-[#B91C1C]",  bg: "bg-[#FEE2E2]", path: "/calendar" },
    ];

    return (
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
                                "btn-secondary px-6 flex items-center gap-2 text-[13px]",
                                showQuickMenu && "bg-[#D9EA85]"
                            )}
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Quick Create
                        </button>

                        {showQuickMenu && (
                            <div className="absolute top-[80%] right-0 pt-3 w-64 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl p-2">
                                    <div className="px-3 py-2 mb-1">
                                        <p className="text-[11px] font-semibold text-[#B0AFA8]">Principal Actions</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        {quickActions.map((action) => (
                                            <button
                                                key={action.label}
                                                onClick={() => {
                                                    navigate(action.path);
                                                    setShowQuickMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 p-3 rounded-[10px] hover:bg-[#F7F8F4] transition-all group/item"
                                            >
                                                <div className={cn("size-8 rounded-lg flex items-center justify-center transition-colors", action.bg, action.color)}>
                                                    <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
                                                </div>
                                                <span className="text-[13px] font-semibold text-foreground text-left flex-1">{action.label}</span>
                                                <span className="material-symbols-outlined text-[#B0AFA8] text-[18px] opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0">chevron_right</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-50">
                                        <button className="w-full p-3 rounded-[10px] hover:bg-[#F7F8F4] transition-all flex items-center gap-3 text-[12px] font-semibold text-[#B0AFA8]">
                                            <span className="material-symbols-outlined text-[18px]">settings</span>
                                            Customize Menu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {actions}
                    <button className="relative h-10 w-10 bg-[#F7F8F4] border border-slate-100 rounded-[10px] flex items-center justify-center text-[#444441] hover:bg-[#EAF2D7] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B91C1C] rounded-full text-[9px] text-white font-bold flex items-center justify-center">3</span>
                    </button>
                </div>
            </div>
        </header>
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
