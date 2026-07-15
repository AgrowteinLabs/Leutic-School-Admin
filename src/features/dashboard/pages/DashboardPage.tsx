import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../../../components/StatCard";
import { ParticipationOverview } from "../components/ParticipationOverview";
import { ProgramsTable } from "../components/ProgramsTable";
import { AlertsSection } from "../components/Alerts";
import { TopBar } from "../../../components/Header";
import { StudentDrawer } from "../../students/components/StudentDrawer";
import { cn } from "../../../lib/utils";
import { graphqlRequest } from "../../../lib/graphqlClient";
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
    // HelpCircle
} from "lucide-react";

interface DashboardStudent {
    uid: string;
    name: string;
    id: string;
    grade: string;
    section: string;
    auraScore: number;
    attendanceRate: number | null;
    gpa: number | null;
    img: string;
    status: string;
    participation: number | null;
    phone: string;
    behavioralAuditLog: { lastAuditDate: string; auditedBy: string } | null;
}

interface DashboardClass {
    id: string;
    grade: string;
    section?: string;
}

export const DashboardPage = () => {
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState<DashboardStudent | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [studentsCount, setStudentsCount] = useState<number | null>(null);
    const [teachersCount, setTeachersCount] = useState<number | null>(null);
    const [classesList, setClassesList] = useState<DashboardClass[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [attendanceStats, setAttendanceStats] = useState<{
        totalStudents: number;
        presentCount: number;
        absentCount: number;
        lateCount: number;
        attendancePercentage: number;
    } | null>(null);
    const [attendanceStatsError, setAttendanceStatsError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const schoolId = localStorage.getItem("school_id") || "";
            if (!schoolId) return;
            const query = `
                query GetDashboardData($schoolIdForClasses: String!, $schoolIdForUsers: ID!) {
                    students: users(filter: { role: "STUDENT", schoolId: $schoolIdForUsers, page: 1, pageSize: 1 }) {
                        total
                    }
                    teachers: users(filter: { role: "TEACHER", schoolId: $schoolIdForUsers, page: 1, pageSize: 1 }) {
                        total
                    }
                    classes(filter: { schoolId: $schoolIdForClasses }, page: 1, pageSize: 100) {
                        items {
                            id
                            grade
                            section
                        }
                    }
                    dashboardStatSummary(schoolId: $schoolIdForClasses) {
                        todayAttendanceRate
                        pendingActionsCount
                        urgentActionsCount
                    }
                    todayAttendanceStats(schoolId: $schoolIdForClasses) {
                        totalStudents
                        presentCount
                        absentCount
                        lateCount
                        attendancePercentage
                    }
                    classMonitorAlerts(schoolId: $schoolIdForClasses) {
                        items {
                            classId
                            grade
                            section
                            classTeacherName
                            issueType
                            issueDetails
                            scorePercentage
                            severityStatus
                        }
                    }
                }
            `;
            try {                    interface DashboardDataResponse {
                        students: { total: number };
                        teachers: { total: number };
                        classes: { items: DashboardClass[] };
                        dashboardStatSummary: {
                            todayAttendanceRate: number;
                            pendingActionsCount: number;
                            urgentActionsCount: number;
                        };
                        todayAttendanceStats: {
                            totalStudents: number;
                            presentCount: number;
                            absentCount: number;
                            lateCount: number;
                            attendancePercentage: number;
                        };
                        classMonitorAlerts: {
                            items: Array<{
                                classId: string;
                                grade: string;
                                section: string;
                                classTeacherName: string;
                                issueType: string;
                                issueDetails: string;
                                scorePercentage: number;
                                severityStatus: string;
                            }>;
                        };
                    }
                const res = await graphqlRequest<DashboardDataResponse>(query, { 
                    schoolIdForClasses: schoolId,
                    schoolIdForUsers: schoolId
                });
                setStudentsCount(res.students?.total ?? 0);
                setTeachersCount(res.teachers?.total ?? 0);
                setClassesList(res.classes?.items ?? []);
                setSummary(res.dashboardStatSummary || null);
                if (res.todayAttendanceStats) {
                    setAttendanceStats(res.todayAttendanceStats);
                    setAttendanceStatsError(null);
                } else {
                    setAttendanceStats(null);
                    setAttendanceStatsError("No attendance data returned from backend.");
                }
                setAlerts(res.classMonitorAlerts?.items || []);
            } catch (err) {
                console.error("Error loading dashboard counts:", err);
                setAttendanceStatsError("Failed to load attendance data.");
            }
        };
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            const schoolId = localStorage.getItem("school_id") || undefined;
            const query = `
                query SearchDashboardStudent($schoolId: ID, $name: String!) {
                    users(filter: { role: "STUDENT", schoolId: $schoolId, name: $name, page: 1, pageSize: 5 }) {
                        items {
                            id
                            name
                            admissionNumber
                            classId
                            isActive
                            mobileNo
                        }
                    }
                }
            `;
            try {
                const res = await graphqlRequest<any>(query, { schoolId, name: searchQuery });
                setSuggestions(res.users?.items || []);
            } catch (err) {
                console.error("Error fetching suggestions:", err);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectStudent = async (foundUser: any) => {
        const classMap = new Map(classesList.map(c => [c.id, c]));
        const matchedClass = foundUser.classId ? classMap.get(foundUser.classId) : null;
        
        let overviewData: any = null;
        let auraPoints: number | null = null;
        let attendancePct: number | null = null;
        let behavioralAuditLog: { lastAuditDate: string; auditedBy: string } | null = null;
        
        try {
            const [overviewRes, auraRes, attRes, profileRes] = await Promise.all([
                graphqlRequest<any>(`
                    query GetStudentOverview($id: ID!) {
                        studentOverview(id: $id) {
                            participationRate
                            attendanceRate
                            gpa
                            statusAlert
                        }
                    }
                `, { id: foundUser.id }).catch(() => null),
                graphqlRequest<any>(`
                    query GetStudentAura($studentId: String!) {
                        studentAuraPoints(studentId: $studentId) {
                            totalPoints
                        }
                    }
                `, { studentId: foundUser.id }).catch(() => null),
                graphqlRequest<any>(`
                    query GetStudentAttendance($studentId: String!) {
                        studentAttendanceSummary(studentId: $studentId) {
                            percentage
                        }
                    }
                `, { studentId: foundUser.id }).catch(() => null),
                graphqlRequest<any>(`
                    query GetStudentAuditLog($studentId: ID!) {
                        studentProfile(studentId: $studentId) {
                            behavioralAuditLog {
                                lastAuditDate
                                auditedBy
                            }
                        }
                    }
                `, { studentId: foundUser.id }).catch(() => null)
            ]);

            if (overviewRes?.studentOverview) {
                overviewData = overviewRes.studentOverview;
            }
            if (auraRes?.studentAuraPoints?.totalPoints !== undefined) {
                auraPoints = auraRes.studentAuraPoints.totalPoints;
            }
            if (attRes?.studentAttendanceSummary?.percentage !== undefined) {
                attendancePct = attRes.studentAttendanceSummary.percentage;
            }
            if (profileRes?.studentProfile?.behavioralAuditLog) {
                behavioralAuditLog = profileRes.studentProfile.behavioralAuditLog;
            }
        } catch (e: unknown) {
            console.error("Failed to fetch student data:", e);
        }

        // Pick a deterministic avatar based on student ID
        const avatarIndex = foundUser.id.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 6;
        const avatars = [
            '/Avatar/Female Avatar Age17.png',
            '/Avatar/Male Avatar Age16.png',
            '/Avatar/Female Avatar Age16.png',
            '/Avatar/Male Avatar Age17.png',
            '/Avatar/Female Avatar Age15.png',
            '/Avatar/Male Avatar Age14.png'
        ];

        setSelectedStudent({
            uid: foundUser.id,
            name: foundUser.name,
            id: foundUser.admissionNumber || foundUser.id.slice(0, 8),
            grade: matchedClass ? matchedClass.grade : "Unassigned",
            section: matchedClass ? (matchedClass.section || "") : "",
            participation: overviewData?.participationRate ?? null,
            auraScore: auraPoints ?? 0,
            attendanceRate: attendancePct,
            gpa: overviewData?.gpa ?? null,
            status: overviewData?.statusAlert || (foundUser.isActive ? "Active" : "Inactive"),
            img: avatars[avatarIndex],
            phone: foundUser.mobileNo || "N/A",
            behavioralAuditLog
        });
        setIsDrawerOpen(true);
    };

    const handleSearch = async (term: string) => {
        if (!term.trim()) return;
        const schoolId = localStorage.getItem("school_id") || undefined;
        const query = `
            query SearchDashboardStudent($schoolId: ID, $name: String!) {
                users(filter: { role: "STUDENT", schoolId: $schoolId, name: $name, page: 1, pageSize: 5 }) {
                    items {
                        id
                        name
                        role
                        email
                        mobileNo
                        admissionNumber
                        classId
                        isActive
                    }
                }
            }
        `;
        try {
            interface SearchStudentResponse {
                users: {
                    items: Array<{
                        id: string;
                        name: string;
                        role: string;
                        email?: string;
                        mobileNo?: string;
                        admissionNumber?: string;
                        classId?: string;
                        isActive: boolean;
                    }>;
                };
            }
            const res = await graphqlRequest<SearchStudentResponse>(query, { schoolId, name: term });
            const foundUser = res.users?.items?.[0];
            if (foundUser) {
                handleSelectStudent(foundUser);
            } else {
                alert("No student found with that name.");
            }
        } catch (err) {
            console.error("Error searching student:", err);
        }
    };

    const handleClassMonitorClick = async (gradeCode: string) => {
        const matchedClass = classesList.find(c => c.grade.toLowerCase().includes(gradeCode.toLowerCase()) || (c.section && `${c.grade}-${c.section}`.toLowerCase().includes(gradeCode.toLowerCase())));
        if (matchedClass) {
            const query = `
                query GetClassStudents($classId: String!) {
                    users(filter: { role: "STUDENT", classId: $classId, page: 1, pageSize: 1 }) {
                        items {
                            id
                            name
                            role
                            email
                            mobileNo
                            admissionNumber
                            classId
                            isActive
                        }
                    }
                }
            `;
            try {
                interface GetClassStudentsResponse {
                    users: {
                        items: Array<{
                            id: string;
                            name: string;
                            role: string;
                            email?: string;
                            mobileNo?: string;
                            admissionNumber?: string;
                            classId?: string;
                            isActive: boolean;
                        }>;
                    };
                }
                const res = await graphqlRequest<GetClassStudentsResponse>(query, { classId: matchedClass.id });
                const foundUser = res.users?.items?.[0];
                if (foundUser) {
                    let overviewData: any = null;
                    let auraPoints: number | null = null;
                    let attendancePct: number | null = null;
                    let behavioralAuditLog: { lastAuditDate: string; auditedBy: string } | null = null;
                    try {
                        const [overviewRes, auraRes, attRes, profileRes] = await Promise.all([
                            graphqlRequest<any>(`
                                query GetStudentOverview($id: ID!) {
                                    studentOverview(id: $id) {
                                        participationRate
                                        attendanceRate
                                        gpa
                                        statusAlert
                                    }
                                }
                            `, { id: foundUser.id }).catch(() => null),
                            graphqlRequest<any>(`
                                query GetStudentAura($studentId: String!) {
                                    studentAuraPoints(studentId: $studentId) {
                                        totalPoints
                                    }
                                }
                            `, { studentId: foundUser.id }).catch(() => null),
                            graphqlRequest<any>(`
                                query GetStudentAttendance($studentId: String!) {
                                    studentAttendanceSummary(studentId: $studentId) {
                                        percentage
                                    }
                                }
                            `, { studentId: foundUser.id }).catch(() => null),
                            graphqlRequest<any>(`
                                query GetStudentAuditLog($studentId: ID!) {
                                    studentProfile(studentId: $studentId) {
                                        behavioralAuditLog {
                                            lastAuditDate
                                            auditedBy
                                        }
                                    }
                                }
                            `, { studentId: foundUser.id }).catch(() => null)
                        ]);
                        if (overviewRes?.studentOverview) {
                            overviewData = overviewRes.studentOverview;
                        }
                        if (auraRes?.studentAuraPoints?.totalPoints !== undefined) {
                            auraPoints = auraRes.studentAuraPoints.totalPoints;
                        }
                        if (attRes?.studentAttendanceSummary?.percentage !== undefined) {
                            attendancePct = attRes.studentAttendanceSummary.percentage;
                        }
                        if (profileRes?.studentProfile?.behavioralAuditLog) {
                            behavioralAuditLog = profileRes.studentProfile.behavioralAuditLog;
                        }
                    } catch (e: unknown) {}
                    
                    const avatarIndex = foundUser.id.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 6;
                    const avatars = [
                        '/Avatar/Female Avatar Age17.png',
                        '/Avatar/Male Avatar Age16.png',
                        '/Avatar/Female Avatar Age16.png',
                        '/Avatar/Male Avatar Age17.png',
                        '/Avatar/Female Avatar Age15.png',
                        '/Avatar/Male Avatar Age14.png'
                    ];

                    setSelectedStudent({
                        uid: foundUser.id,
                        name: foundUser.name,
                        id: foundUser.admissionNumber || foundUser.id.slice(0, 8),
                        grade: matchedClass.grade,
                        section: matchedClass.section || "",
                        participation: overviewData?.participationRate ?? null,
                        auraScore: auraPoints ?? 0,
                        attendanceRate: attendancePct,
                        gpa: overviewData?.gpa ?? null,
                        status: overviewData?.statusAlert || (foundUser.isActive ? "Active" : "Inactive"),
                        img: avatars[avatarIndex],
                        phone: foundUser.mobileNo || "N/A",
                        behavioralAuditLog
                    });
                    setIsDrawerOpen(true);
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        }
        alert(`No student records are currently registered under class section "${gradeCode}".`);
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
                            value={studentsCount !== null ? studentsCount.toLocaleString() : "..."}
                            trend="+2.1%"
                            trendType="up"
                            icon="group"
                        />
                        <StatCard
                            label="Teachers"
                            value={teachersCount !== null ? teachersCount.toLocaleString() : "..."}
                            trend="Full Staff"
                            trendType="stable"
                            icon="person"
                        />
                        <StatCard
                            label="Attendance Today"
                            value={
                                attendanceStats
                                    ? `${attendanceStats.attendancePercentage}%`
                                    : "..."
                            }
                            trend={`${attendanceStats ? attendanceStats.presentCount.toLocaleString() : "..."} present`}
                            trendType="up"
                            icon="fact_check"
                        />
                        <StatCard
                            label="Pending Actions"
                            value={summary ? String(summary.pendingActionsCount).padStart(2, "0") : "..."}
                            trend={summary ? `${summary.urgentActionsCount} urgent` : "..."}
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
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                                                    onFocus={() => setShowSuggestions(true)}
                                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                />
                                                <button
                                                    onClick={() => handleSearch(searchQuery)}
                                                    className="btn-primary h-10 px-6 rounded-xl text-[12px] font-bold whitespace-nowrap shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300"
                                                >
                                                    Get Profile
                                                </button>
                                            </div>
                                        </div>

                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50 max-h-64 overflow-y-auto custom-scrollbar">
                                                {suggestions.map((student) => {
                                                    const matchedClass = classesList.find(c => c.id === student.classId);
                                                    return (
                                                        <button
                                                            key={student.id}
                                                            onClick={() => {
                                                                handleSelectStudent(student);
                                                                setShowSuggestions(false);
                                                                setSearchQuery("");
                                                            }}
                                                            className="w-full px-5 py-3 hover:bg-[#F7F8F4] transition-all flex items-center justify-between text-left group"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">
                                                                    {student.name}
                                                                </span>
                                                                <span className="text-[10.5px] font-bold text-[#B0AFA8] uppercase tracking-wider">
                                                                    {matchedClass ? `${matchedClass.grade}${matchedClass.section ? `-${matchedClass.section}` : ""}` : "Unassigned"} • {student.admissionNumber || student.id.slice(0, 8)}
                                                                </span>
                                                            </div>
                                                            <span className="material-symbols-outlined text-[18px] text-[#B0AFA8] group-hover:text-primary transition-colors">
                                                                arrow_forward_ios
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
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
                                            // { label: "Quiz Lab", icon: HelpCircle, color: "text-primary", path: "/academics/quizzes" },
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
                                <ParticipationOverview
                                    stats={attendanceStats}
                                    isLoading={!attendanceStats && !attendanceStatsError}
                                    error={attendanceStatsError}
                                />

                                <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-foreground text-[15px] font-semibold">Upcoming This Week</h3>
                                        <button 
                                            onClick={() => navigate("/calendar")}
                                            className="text-[11px] font-medium text-[#3D6B2C] hover:underline underline-offset-2"
                                        >
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
                            {alerts.length > 0 ? (
                                alerts.map((item, i) => (
                                    <div key={i} className="group relative" onClick={() => handleClassMonitorClick(item.grade)}>
                                        <div className="flex items-center gap-4 p-5 rounded-[18px] bg-white border border-slate-100 hover:border-primary/20 transition-all duration-500 cursor-pointer h-full">
                                            {/* Circular Gauge */}
                                            <div className="relative size-12 shrink-0">
                                                <svg className="size-full -rotate-90">
                                                    <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3.5" stroke="#F0F0EC" />
                                                    <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3.5"
                                                        strokeDasharray={2 * Math.PI * 20}
                                                        strokeDashoffset={2 * Math.PI * 20 * (1 - item.scorePercentage / 100)}
                                                        stroke={item.severityStatus === "critical" ? "#E63535" : "#EF9800"}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-[10px] font-black text-foreground">{item.scorePercentage}%</span>
                                                </div>
                                            </div>
     
                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[12.5px] font-black text-foreground tracking-tight">{item.grade}{item.section ? `-${item.section}` : ""}</span>
                                                    <div className={cn(
                                                        "px-2 py-0.5 rounded-full text-[7px] font-black border capitalize",
                                                        item.severityStatus === "critical"
                                                            ? "bg-[#FEE2E2] text-[#E63535] border-[#FECACA]"
                                                            : "bg-[#FEF9C3] text-[#EF9800] border-[#FDE68A]"
                                                    )}>
                                                        {item.severityStatus}
                                                    </div>
                                                </div>
                                                <h5 className="text-[12.5px] font-bold text-foreground truncate">
                                                  {item.issueType === "ATTENDANCE_DROP" ? "Attendance Drop" : item.issueType === "ABSENTEEISM" ? "Absenteeism" : "Grade Decline"}
                                                </h5>
                                                <p className="text-[10px] text-[#B0AFA8] font-medium leading-tight truncate">{item.issueDetails}</p>
                                            </div>
     
                                            {/* Hover premium action */}
                                            <div className="size-8 shrink-0 rounded-[12px] bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 shadow-lg shadow-primary/20 scale-75 group-hover:scale-100 ring-4 ring-primary/5">
                                                <span className="material-symbols-outlined text-[18px] font-bold">arrow_forward_ios</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-6 text-[12px] text-muted-gray/70 italic bg-white rounded-[18px] border border-slate-100 w-full">
                                    No active alerts in monitor.
                                </div>
                            )}
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
