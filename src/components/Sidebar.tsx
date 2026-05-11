import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

interface NavItemProps {
    icon: string;
    label: string;
    path: string;
    active?: boolean;
}

const NavItem = ({ icon, label, path, active }: NavItemProps) => (
    <Link
        to={path}
        className={cn(
            "mx-3 flex items-center gap-4 px-5 py-3 transition-all duration-300 rounded-[14px] group text-left relative mb-1",
            active
                ? "text-foreground font-bold bg-[#EAF2D7] shadow-sm shadow-[#D9EA85]/20"
                : "text-[#71716A] hover:text-foreground hover:bg-[#F7F8F4] font-medium",
        )}
    >
        {active && (
            <motion.div
                layoutId="activeSideIndicator"
                className="absolute left-0 inset-y-3.5 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(217,234,133,0.4)]"
            />
        )}
        <span
            className={cn(
                "material-symbols-outlined text-[20px] transition-all duration-300",
                active ? "fill-1 text-foreground" : "fill-0 text-[#B0AFA8] group-hover:text-foreground group-hover:scale-110"
            )}
            style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
            {icon}
        </span>
        <p className={cn(
            "text-[13.5px] tracking-tight transition-colors",
            active ? "text-foreground" : "text-[#71716A]"
        )}>
            {label}
        </p>
    </Link>
);

const NavSectionHeader = ({ label }: { label: string }) => (
    <div className="px-8 pt-6 pb-2">
        <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-[#B0AFA8]/60 uppercase tracking-[0.2em] whitespace-nowrap">{label}</span>
            <div className="h-[1px] w-full bg-slate-100/60" />
        </div>
    </div>
);



export const Sidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const isActive = (path: string) => {
        if (path === "/") {
            return currentPath === "/";
        }
        return currentPath.startsWith(path);
    };

    const timeParts = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }).split(" ");

    const timeStr = timeParts[0];
    const amPm = timeParts[1];



    return (
        <aside className="w-64 bg-white border-r border-slate-100 sticky top-0 h-screen flex flex-col shrink-0 z-50">
            {/* Logo */}
            <div className="px-8 py-10">
                <img
                    src="/letuic_lg.png"
                    alt="Letuic Principal Dashboard"
                    className="w-28 h-auto object-contain -ml-1"
                />
            </div>

            {/* Nav Items — Scrollable */}
            <div className="flex-1 relative flex flex-col overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
                <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                    <nav className="flex flex-col gap-0.5 pb-4">
                        <NavSectionHeader label="Overview" />
                        <NavItem icon="space_dashboard" label="Home" path="/" active={isActive("/")} />
                        <NavItem icon="grid_view" label="Classes" path="/classes" active={isActive("/classes")} />

                        <NavSectionHeader label="Management" />
                        <NavItem icon="event_available" label="Attendance" path="/attendance" active={isActive("/attendance")} />
                        <NavItem icon="school" label="Academics" path="/academics/exams" active={location.pathname.startsWith("/academics")} />
                        <NavItem icon="menu_book" label="Curriculum" path="/curriculum" active={isActive("/curriculum")} />
                        <NavItem icon="badge" label="Student & Staff" path="/directory" active={isActive("/directory")} />

                        <NavSectionHeader label="Administration" />
                        <NavItem icon="payments" label="Finance" path="/finance" active={isActive("/finance")} />
                        <NavItem icon="mark_chat_unread" label="Messages" path="/communications" active={isActive("/communications")} />
                        <NavItem icon="directions_bus" label="Transportation" path="/transportation" active={isActive("/transportation")} />
                        <NavItem icon="calendar_today" label="Events" path="/calendar" active={isActive("/calendar")} />

                        <NavSectionHeader label="Insights" />
                        <NavItem icon="hub" label="Community" path="/community" active={isActive("/community")} />
                        <NavItem icon="monitoring" label="Reports" path="/reports" active={isActive("/reports")} />

                        <NavSectionHeader label="System" />
                        <NavItem icon="settings" label="Settings" path="/settings" active={isActive("/settings")} />
                    </nav>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
            </div>

            {/* Bottom — Fixed */}
            <div className="p-6 pt-2 border-t border-slate-50 space-y-4">
                {/* Date & Time Widget */}
                <div className="bg-[#F7F8F4] rounded-2xl py-3 px-4 border border-slate-100 group/time transition-all hover:bg-[#EAF2D7]">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-white size-11 rounded-xl shadow-sm shrink-0 transition-all group-hover/time:shadow-md group-hover/time:-translate-y-0.5">
                            <span className="text-[8px] font-bold text-primary uppercase leading-none tracking-wider mb-1">
                                {now.toLocaleDateString("en-IN", { month: "short" })}
                            </span>
                            <span className="text-[17px] font-bold text-foreground leading-none">
                                {now.toLocaleDateString("en-IN", { day: "2-digit" })}
                            </span>
                        </div>

                        <div className="flex flex-col justify-center min-w-0">
                            <div className="flex items-baseline gap-0.3">
                                <span className="text-[16px] font-bold text-foreground tracking-tight">
                                    {timeStr.split(":")[0]}
                                </span>
                                <span className="text-[16px] font-bold text-primary animate-blink mx-0.5">:</span>
                                <span className="text-[16px] font-bold text-foreground tracking-tight">
                                    {timeStr.split(":")[1]}
                                </span>
                                <span className="text-[9px] font-bold text-[#B0AFA8] uppercase ml-1.5 tracking-wider">
                                    {amPm}
                                </span>
                            </div>
                            <p className="text-[10px] font-medium text-[#B0AFA8] capitalize -mt-0.5">
                                {now.toLocaleDateString("en-IN", { weekday: "long" })}, {now.getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3 p-2 -mx-1 rounded-2xl hover:bg-[#F7F8F4] transition-colors cursor-pointer border border-transparent hover:border-slate-100 group">
                    <div
                        className="size-10 rounded-full bg-slate-200 bg-cover bg-center ring-2 ring-white shadow-sm"
                        style={{
                            backgroundImage: "url('/Avatar/Male Avatar Age40.png')",
                        }}
                    ></div>
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-[13px] font-bold text-foreground truncate">
                            Principal
                        </p>
                        <p className="text-[11px] text-[#B0AFA8] mt-0.5 font-medium">
                            Principal Account
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-[#B0AFA8] ml-auto text-[18px]">
                        unfold_more
                    </span>
                </div>
            </div>
        </aside>
    );
};
