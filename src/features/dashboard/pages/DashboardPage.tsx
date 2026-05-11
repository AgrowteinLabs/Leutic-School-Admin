import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../../../components/StatCard";
import { ParticipationOverview } from "../components/ParticipationOverview";
import { ProgramsTable } from "../components/ProgramsTable";
import { AlertsSection } from "../components/Alerts";
import { TopBar } from "../../../components/Header";
import { StudentDrawer } from "../../students/components/StudentDrawer";
import { cn } from "../../../lib/utils";
import {
    Users,
    UserPlus,
    Megaphone,
    WalletCards,
    GraduationCap,
    Bus,
    Contact,
    Search,
    Backpack,
    BookUser,
    IdCard,
    TruckIcon,
} from "lucide-react";

export const DashboardPage = () => {
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const mockStudents = [
        {
            name: "Aavya S.",
            id: "OA-2024-001",
            grade: "12th Grade",
            section: "A",
            participation: 92,
            auraScore: 98.4,
            attendanceRate: 98,
            gpa: 3.9,
            status: "Active",
            img: "/Avatar/Female Avatar Age17.png",
            phone: "+91 98472-11002"
        },
        {
            name: "Manoj P.",
            id: "OA-2024-112",
            grade: "11th Grade",
            section: "C",
            participation: 62,
            auraScore: 68.2,
            attendanceRate: 72,
            gpa: 2.8,
            status: "At Risk",
            img: "/Avatar/Male Avatar Age16.png",
            phone: "+91 91234-56789"
        }
    ];

    const handleSearch = () => {
        // Mocking a search result for "Aavya" or "Manoj"
        setSelectedStudent(mockStudents[0]);
        setIsDrawerOpen(true);
    };

    const handleClassMonitorClick = () => {
        setSelectedStudent(mockStudents[1]); // Mocking the "Critical" student
        setIsDrawerOpen(true);
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FBFBFA]">
            <TopBar
                title="Home Overview"
                subtitle="Daily insight and performance overview"
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 space-y-6">

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Total Students"
                            value="1,240"
                            trend="+2.1%"
                            trendType="up"
                            icon="group"
                        />
                        <StatCard
                            label="Teachers"
                            value="86"
                            trend="Full Staff"
                            trendType="stable"
                            icon="person"
                        />
                        <StatCard
                            label="Attendance Today"
                            value="86%"
                            trend="+1.2%"
                            trendType="up"
                            icon="fact_check"
                        />
                        <StatCard
                            label="Pending Actions"
                            value="07"
                            trend="3 urgent"
                            trendType="down"
                            icon="pending_actions"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        {/* Main Left Column — 8 cols */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Quick Access */}
                            <div className="py-2 px-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[#B0AFA8] text-[10px] font-bold uppercase tracking-[0.15em]">Quick Access</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex-1 max-w-2xl relative">
                                        <div className="ai-border-container ai-border-on-load rounded-[18px]">
                                            <div className="ai-border-content rounded-[17px] flex items-center gap-3 p-1.5 focus-within:shadow-[0_0_20px_rgba(217,234,133,0.2)] transition-all duration-500 group/search border border-transparent focus-within:border-primary/20">
                                                <div className="pl-4 text-[#B0AFA8] group-focus-within/search:text-primary transition-colors">
                                                    <Search size={18} strokeWidth={2.5} />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Know Your Student — Search Name, ID or Roll Number..."
                                                    className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-foreground placeholder-[#B0AFA8] placeholder:font-medium py-2.5 px-1"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                />
                                                <button
                                                    onClick={handleSearch}
                                                    className="btn-primary h-10 px-6 rounded-xl text-[12px] font-bold whitespace-nowrap shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300"
                                                >
                                                    Get Profile
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Icons */}
                                    <div className="flex items-center gap-8 pb-1 px-2">
                                        {[
                                            { label: "Attendance", icon: Users, color: "text-[#2E7D32]", path: "/attendance" },
                                            {
                                                label: "Onboard",
                                                icon: UserPlus,
                                                color: "text-[#1565C0]",
                                                isMenu: true,
                                                options: [
                                                    { label: "Student", path: "/directory/students/add", icon: Backpack },
                                                    { label: "Teacher", path: "/directory/staff/add", icon: BookUser },
                                                    { label: "Driver", path: "/directory/drivers/add", icon: IdCard },
                                                    { label: "Bus", path: "/transportation/add-vehicle", icon: TruckIcon },
                                                ]
                                            },
                                            { label: "Announcement", icon: Megaphone, color: "text-[#B45309]", path: "/communications/announcements/add" },
                                            { label: "Collect Fee", icon: WalletCards, color: "text-[#3D6B2C]", path: "/finance" },
                                            { label: "Exam Marks", icon: GraduationCap, color: "text-[#B91C1C]", path: "/academics/marks" },
                                            { label: "Bus Tracker", icon: Bus, color: "text-[#1565C0]", path: "/transportation" },
                                            { label: "Staff Directory", icon: Contact, color: "text-[#444441]", path: "/directory" },
                                        ].map((action, i) => {
                                            if (action.isMenu) {
                                                return (
                                                    <div key={i} className="group/morph relative min-w-fit">
                                                        <div className="flex flex-col items-center group cursor-pointer transition-all duration-500">
                                                            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-white border border-slate-100 transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1) group-hover/morph:w-[380px] group-hover/morph:rounded-full group-hover/morph:bg-white relative group-hover/morph:border-slate-200 mb-2.5 overflow-hidden">
                                                                {/* Original Icon */}
                                                                <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover/morph:opacity-0 group-hover/morph:scale-0 group-hover/morph:rotate-90">
                                                                    <action.icon size={22} strokeWidth={2.2} className={action.color} />
                                                                </div>

                                                                {/* Fresh Color Content with Integrated Segment Dividers */}
                                                                <div className="absolute inset-0 opacity-0 group-hover/morph:opacity-100 transition-all duration-500 flex items-center pointer-events-none group-hover/morph:pointer-events-auto">
                                                                    {[
                                                                        { ...action.options[0], bg: "bg-emerald-50", hoverBg: "hover:bg-emerald-50/50", text: "text-emerald-600" },
                                                                        { ...action.options[1], bg: "bg-blue-50", hoverBg: "hover:bg-blue-50/50", text: "text-blue-600" },
                                                                        { ...action.options[2], bg: "bg-amber-50", hoverBg: "hover:bg-amber-50/50", text: "text-amber-600" },
                                                                        { ...action.options[3], bg: "bg-indigo-50", hoverBg: "hover:bg-indigo-50/50", text: "text-indigo-600" },
                                                                    ].map((opt, idx) => (
                                                                        <div
                                                                            key={opt.label}
                                                                            onClick={(e) => { e.stopPropagation(); navigate(opt.path); }}
                                                                            className={cn(
                                                                                "flex-1 h-full flex items-center justify-center gap-2 group/item transition-all duration-300 cursor-pointer relative",
                                                                                opt.hoverBg,
                                                                                idx < 3 && "border-r border-slate-50"
                                                                            )}
                                                                        >
                                                                            <div className={cn("size-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover/item:scale-110", opt.bg, opt.text)}>
                                                                                <opt.icon size={16} strokeWidth={2.5} />
                                                                            </div>
                                                                            <span className="text-[10px] font-bold text-foreground opacity-0 group-hover/morph:opacity-100 transition-all duration-500 delay-100 whitespace-nowrap">
                                                                                {opt.label}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <span className="text-[11px] font-semibold text-[#B0AFA8] group-hover/morph:opacity-0 transition-all duration-300 tracking-tight h-4">
                                                                {action.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => action.path && navigate(action.path)}
                                                    className="flex flex-col items-center gap-2.5 group cursor-pointer min-w-fit"
                                                >
                                                    <div className={cn(
                                                        "size-12 rounded-full flex items-center justify-center bg-white border border-slate-100 transition-all duration-300 group-hover:scale-110",
                                                        action.color
                                                    )}>
                                                        <action.icon size={22} strokeWidth={2} />
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-[#B0AFA8] group-hover:text-foreground transition-colors tracking-tight">
                                                        {action.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Attendance + Upcoming */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <ParticipationOverview />

                                <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-foreground text-[15px] font-semibold">Upcoming This Week</h3>
                                        <button className="text-[11px] font-medium text-[#3D6B2C] hover:underline underline-offset-2">
                                            Full Calendar
                                        </button>
                                    </div>
                                    <ProgramsTable />
                                </div>
                            </div>

                        </div>

                        {/* Notifications — 4 cols */}
                        <div className="lg:col-span-4 relative h-[600px] lg:h-auto">
                            <div className="lg:absolute lg:inset-0">
                                <AlertsSection />
                            </div>
                        </div>
                    </div>

                    {/* Class Monitor */}
                    <div className="w-full relative">
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div>
                                <h3 className="text-[#B0AFA8] text-[10px] font-bold uppercase tracking-[0.15em]">Class Monitor</h3>

                            </div>
                            <button
                                onClick={() => navigate("/classes")}
                                className="text-[11px] font-bold text-[#3D6B2C] hover:underline underline-offset-4 decoration-primary/30 transition-all"
                            >
                                Full Report
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
                            {[
                                { grade: "11-C", teacher: "Mr. Manoj P.", issue: "Attendance Drop", detail: "-22% Morning", score: 62, status: "critical" },
                                { grade: "9-D", teacher: "Ms. Dhanya S.", issue: "Grade Decline", detail: "Average Drop", score: 76, status: "warning" },
                                { grade: "10-A", teacher: "Dr. Lakshmi K.", issue: "Absenteeism", detail: "Unusual spikes", score: 68, status: "warning" },
                            ].map((item, i) => (
                                <div key={i} className="group relative" onClick={() => handleClassMonitorClick()}>
                                    <div className="flex items-center gap-4 p-5 rounded-[18px] bg-white border border-slate-100 hover:border-primary/20 transition-all duration-500 cursor-pointer h-full">
                                        {/* Circular Gauge */}
                                        <div className="relative size-12 shrink-0">
                                            <svg className="size-full -rotate-90">
                                                <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3.5" stroke="#F0F0EC" />
                                                <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3.5"
                                                    strokeDasharray={2 * Math.PI * 20}
                                                    strokeDashoffset={2 * Math.PI * 20 * (1 - item.score / 100)}
                                                    stroke={item.status === "critical" ? "#E63535" : "#EF9800"}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-[10px] font-black text-foreground">{item.score}%</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[12.5px] font-black text-foreground tracking-tight">{item.grade}</span>
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-full text-[7px] font-black border capitalize",
                                                    item.status === "critical"
                                                        ? "bg-[#FEE2E2] text-[#E63535] border-[#FECACA]"
                                                        : "bg-[#FEF9C3] text-[#EF9800] border-[#FDE68A]"
                                                )}>
                                                    {item.status}
                                                </div>
                                            </div>
                                            <h5 className="text-[12.5px] font-bold text-foreground truncate">{item.issue}</h5>
                                            <p className="text-[10px] text-[#B0AFA8] font-medium leading-tight truncate">{item.detail}</p>
                                        </div>

                                        {/* Hover premium action */}
                                        <div className="size-8 shrink-0 rounded-[12px] bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 shadow-lg shadow-primary/20 scale-75 group-hover:scale-100 ring-4 ring-primary/5">
                                            <span className="material-symbols-outlined text-[18px] font-bold">arrow_forward_ios</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <StudentDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                student={selectedStudent}
            />
        </div>
    );
};
