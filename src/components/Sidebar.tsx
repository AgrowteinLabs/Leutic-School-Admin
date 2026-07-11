import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
                ? "text-foreground font-bold bg-accent shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted font-medium",
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
                active ? "fill-1 text-foreground" : "fill-0 text-muted-foreground group-hover:text-foreground group-hover:scale-110"
            )}
            style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
            {icon}
        </span>
        <p className={cn(
            "text-[13.5px] tracking-tight transition-colors",
            active ? "text-foreground" : "text-muted-foreground"
        )}>
            {label}
        </p>
    </Link>
);

const NavSectionHeader = ({ label }: { label: string }) => (        <div className="px-8 pt-6 pb-2">
            <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] whitespace-nowrap">{label}</span>
                <div className="h-[1px] w-full bg-border/60" />
            </div>
        </div>
);



export const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const [now, setNow] = useState(new Date());
    const [showUserMenu, setShowUserMenu] = useState(false);

    const userName = localStorage.getItem("user_name") || "Principal";
    const userRole = localStorage.getItem("user_role") || "ADMIN";

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
        <aside className="w-64 bg-card border-r border-border sticky top-0 h-screen flex flex-col shrink-0 z-50">
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
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-card to-transparent dark:from-transparent pointer-events-none z-10" />
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
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent dark:from-transparent pointer-events-none z-10" />
            </div>

            {/* Bottom — Fixed */}
            <div className="p-6 pt-2 border-t border-border space-y-4">
                {/* Date & Time Widget */}
                <div className="bg-muted rounded-2xl py-3 px-4 border border-border group/time transition-all hover:bg-accent">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-card size-11 rounded-xl shadow-sm shrink-0 transition-all group-hover/time:shadow-md group-hover/time:-translate-y-0.5">
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
                                <span className="text-[9px] font-bold text-muted-foreground uppercase ml-1.5 tracking-wider">
                                    {amPm}
                                </span>
                            </div>
                            <p className="text-[10px] font-medium text-muted-foreground capitalize -mt-0.5">
                                {now.toLocaleDateString("en-IN", { weekday: "long" })}, {now.getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <div className="relative">
                    {/* User Menu Dropdown */}
                    {showUserMenu && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-2xl p-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    navigate("/login");
                                }}
                                className="w-full flex items-center gap-1.5 px-4 py-2.5 text-left text-xs font-bold text-destructive hover:bg-red-50 rounded-xl transition-all"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-full flex items-center gap-3 p-2 -mx-1 rounded-2xl hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border group text-left outline-none"
                    >
                        <div
                            className="size-10 rounded-full bg-muted bg-cover bg-center ring-2 ring-card shadow-sm"
                            style={{
                                backgroundImage: `url("${userRole === "TEACHER" ? "/Avatar/Female Avatar Age35.png" : "/Avatar/Male Avatar Age40.png"}")`,
                            }}
                        ></div>
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-[13px] font-bold text-foreground truncate">
                                {userName}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">
                                {userRole ? userRole.replace("_", " ") : "Principal Account"}
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-muted-foreground ml-auto text-[18px]">
                            unfold_more
                        </span>
                    </button>
                </div>
            </div>
        </aside>
    );
};
