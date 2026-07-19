import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn, formatDisplayId } from "../../../lib/utils";
import { Search, Users, ShieldCheck, ChevronRight, GraduationCap } from "lucide-react";
import { graphqlRequest } from "../../../lib/graphqlClient";

const GET_CLASSES = `
  query GetClasses($schoolId: String) {
    classes(filter: { schoolId: $schoolId }, page: 1, pageSize: 100) {
      items {
        id
        grade
        section
      }
    }
  }
`;

const GET_STUDENTS = `
  query GetStudents($filter: UsersFilterDto!) {
    users(filter: $filter) {
      total
      items {
        id
        name
        role
        classId
        admissionNumber
      }
    }
  }
`;

export const KnowYourStudentPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("All Grades");
    const [selectedSection, setSelectedSection] = useState("All Sections");
    const [students, setStudents] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [metricsMap, setMetricsMap] = useState<Record<string, { aura: number; attendance: number }>>({});

    // Load classes and students on mount
    useEffect(() => {
        const fetchStudentsAndClasses = async () => {
            setIsLoading(true);
            try {
                const schoolId = localStorage.getItem("school_id");
                
                // Fetch classes
                const classesRes = await graphqlRequest<any>(GET_CLASSES, { schoolId });
                const classesList = classesRes.classes?.items || [];
                setClasses(classesList);

                // Fetch students
                const studentsRes = await graphqlRequest<any>(GET_STUDENTS, {
                    filter: {
                        role: "STUDENT",
                        schoolId,
                        page: 1,
                        pageSize: 200
                    }
                });
                const studentsList = studentsRes.users?.items || [];
                setStudents(studentsList);
            } catch (err) {
                console.error("Error loading intelligence hub:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentsAndClasses();
    }, []);

    // Load student aura points and attendance summaries in parallel when student list loads
    useEffect(() => {
        if (students.length === 0) return;

        const fetchMetricsForStudents = async () => {
            const idsToFetch = students.map(s => s.id).filter(id => !metricsMap[id]);
            if (idsToFetch.length === 0) return;

            const promises = idsToFetch.map(async (studentId) => {
                try {
                    const auraQuery = `
                        query GetStudentAura($studentId: String!) {
                            studentAuraPoints(studentId: $studentId) {
                                totalPoints
                            }
                        }
                    `;
                    const attQuery = `
                        query GetStudentAttendance($studentId: String!) {
                            studentAttendanceSummary(studentId: $studentId) {
                                percentage
                            }
                        }
                    `;

                    const [auraRes, attRes] = await Promise.all([
                        graphqlRequest<any>(auraQuery, { studentId }).catch(() => null),
                        graphqlRequest<any>(attQuery, { studentId }).catch(() => null)
                    ]);

                    const totalPoints = auraRes?.studentAuraPoints?.totalPoints ?? -1;
                    const attendancePct = attRes?.studentAttendanceSummary?.percentage ?? -1;
                    const auraScore = Math.min(Math.max(totalPoints, 0), 100);

                    return {
                        studentId,
                        aura: auraScore,
                        attendance: Math.round(attendancePct)
                    };
                } catch (e) {
                    return {
                        studentId,
                        aura: -1,
                        attendance: -1
                    };
                }
            });

            const results = await Promise.all(promises);
            setMetricsMap(prev => {
                const next = { ...prev };
                results.forEach(res => {
                    if (res) {
                        next[res.studentId] = { aura: res.aura, attendance: res.attendance };
                    }
                });
                return next;
            });
        };

        fetchMetricsForStudents();
    }, [students]);

    const classesMap = useMemo(() => {
        const m: Record<string, { grade: string; section?: string }> = {};
        classes.forEach(c => {
            m[c.id] = { grade: c.grade, section: c.section };
        });
        return m;
    }, [classes]);

    const uniqueGrades = useMemo(() => {
        const grades = new Set<string>();
        classes.forEach(c => {
            if (c.grade) grades.add(c.grade);
        });
        return Array.from(grades).sort();
    }, [classes]);

    const uniqueSections = useMemo(() => {
        const sections = new Set<string>();
        classes.forEach(c => {
            if (c.section) sections.add(c.section);
        });
        return Array.from(sections).sort();
    }, [classes]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const studentClass = classesMap[s.classId || ""];
            
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 (s.admissionNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 s.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesGrade = selectedGrade === "All Grades" || (studentClass && studentClass.grade === selectedGrade);
            const matchesSection = selectedSection === "All Sections" || (studentClass && studentClass.section === selectedSection);
            
            return matchesSearch && matchesGrade && matchesSection;
        });
    }, [students, classesMap, searchTerm, selectedGrade, selectedSection]);

    const getStudentAvatar = (studentId: string, index: number) => {
        const avatars = [
            "/Avatar/Female Avatar Age17.png",
            "/Avatar/Male Avatar Age16.png",
            "/Avatar/Female Avatar Age16.png",
            "/Avatar/Male Avatar Age17.png",
            "/Avatar/Female Avatar Age15.png",
            "/Avatar/Male Avatar Age14.png"
        ];
        let hash = 0;
        for (let i = 0; i < studentId.length; i++) {
            hash += studentId.charCodeAt(i);
        }
        return avatars[(hash + index) % avatars.length];
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
            <TopBar 
                title="Know Your Student" 
                subtitle="Institutional Database Access | Advanced Profile Analytics"
            />

            <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 space-y-10">
                    
                    {/* Professional Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-widest uppercase">
                                <ShieldCheck size={14} />
                                Secure Principal Access
                            </div>
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">Student Intelligence Hub</h2>
                            <p className="text-[#444441] text-[13px] font-normal max-w-xl leading-relaxed">Search through institutional records using student name, ID, or roll number. Access comprehensive academic and behavioral analytics instantly.</p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                            <div className="px-4 py-2 border-r border-slate-100 text-center">
                                <p className="text-[10px] font-medium text-[#B0AFA8] tracking-tighter">Total Students</p>
                                <p className="text-lg font-bold text-foreground">{students.length}</p>
                            </div>
                            <div className="px-4 py-2 text-center">
                                <p className="text-[10px] font-medium text-[#B0AFA8] tracking-tighter">Verified Logs</p>
                                <p className="text-lg font-bold text-foreground text-[#2E7D32] font-mono">ALL ACCESS</p>
                            </div>
                        </div>
                    </div>

                    {/* Refined Search Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-8 group/search relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within/search:text-primary transition-colors" size={18} strokeWidth={2} />
                            <input 
                                type="text"
                                placeholder="Know Your Student — Enter Name, Enrollment ID or Roll Number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-[12px] pl-14 pr-4 py-3.5 text-[14px] font-medium text-foreground placeholder-slate-400 placeholder:font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                            />
                        </div>
                        
                        <div className="lg:col-span-4 flex gap-3">
                            <div className="flex-1 relative">
                                <select 
                                    value={selectedGrade}
                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-[12px] px-5 py-3.5 text-[13px] text-[#444441] focus:ring-1 focus:ring-primary cursor-pointer appearance-none shadow-sm font-semibold"
                                >
                                    <option value="All Grades">All Grades</option>
                                    {uniqueGrades.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#B0AFA8] pointer-events-none" />
                            </div>

                            <div className="flex-1 relative">
                                <select 
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-[12px] px-5 py-3.5 text-[13px] text-[#444441] focus:ring-1 focus:ring-primary cursor-pointer appearance-none shadow-sm font-semibold"
                                >
                                    <option value="All Sections">All Sections</option>
                                    {uniqueSections.map(s => (
                                        <option key={s} value={s}>Section {s}</option>
                                    ))}
                                </select>
                                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#B0AFA8] pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Institutional Grid Results */}
                    <div className="space-y-6 relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-foreground text-[13px] font-semibold tracking-tight flex items-center gap-3">
                                <Users size={16} className="text-primary" />
                                Database Match Results ({filteredStudents.length})
                            </h3>
                            <button className="text-[#B0AFA8] text-[10px] font-bold flex items-center gap-1 hover:text-foreground transition-colors uppercase tracking-widest">
                                Export Repository
                                <ChevronRight size={12} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredStudents.map((s, idx) => {
                                const metrics = metricsMap[s.id] || { aura: -1, attendance: -1 };
                                const sClass = classesMap[s.classId || ""];
                                const gradeText = sClass ? sClass.grade : "Unassigned";
                                const sectionText = sClass?.section ? `Section ${sClass.section}` : "";
                                const isAtRisk = metrics.attendance !== -1 && metrics.attendance < 85;
                                const imgUrl = getStudentAvatar(s.id, idx);

                                return (
                                    <div 
                                        key={s.id}
                                        onClick={() => navigate(`/students/${s.id}`)}
                                        className="bg-white rounded-[16px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer group flex flex-col"
                                    >
                                        <div className="p-6 flex-1 space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div className="relative">
                                                    <img src={imgUrl} className="size-14 rounded-xl object-cover border border-slate-50 grayscale group-hover:grayscale-0 transition-all duration-500 shadow-sm" />
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-white",
                                                        isAtRisk ? "bg-amber-500" : "bg-emerald-500"
                                                    )} />
                                                </div>
                                                <div className="bg-[#F7F8F4] px-2 py-1 rounded-lg border border-slate-100 text-[9px] font-bold text-[#B0AFA8] group-hover:text-primary transition-colors">
                                                    {formatDisplayId(s.admissionNumber || s.id, 'STU')}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-base font-bold text-foreground leading-tight tracking-tight">{s.name}</h4>
                                                <p className="text-[11px] font-medium text-[#B0AFA8] tracking-tight leading-none italic">{gradeText} {sectionText ? `— ${sectionText}` : ""}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[9px] font-medium text-[#B0AFA8] mb-1 uppercase tracking-tighter">Aura Score</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1 flex-1 bg-[#F0F0EC] rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary" style={{ width: metrics.aura !== -1 ? `${metrics.aura}%` : "0%" }} />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-foreground">{metrics.aura !== -1 ? `${metrics.aura}%` : "—"}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-medium text-[#B0AFA8] mb-1 uppercase tracking-tighter">Attendance</p>
                                                    <p className="text-[11px] font-bold text-foreground">{metrics.attendance !== -1 ? `${metrics.attendance}%` : "—"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 py-4 bg-[#F7F8F4] border-t border-slate-100 flex items-center justify-between group-hover:bg-primary/5 transition-colors rounded-b-[16px]">
                                            <div className="flex items-center gap-2 text-[10px] font-semibold text-[#B0AFA8]">
                                                <GraduationCap size={14} className="text-[#B0AFA8]" />
                                                A-Z Intelligence Profile
                                            </div>
                                            <ChevronRight size={14} className="text-[#B0AFA8] group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {!isLoading && filteredStudents.length === 0 && (
                            <div className="py-24 text-center space-y-6">
                                <div className="bg-white border border-slate-100 size-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <Search className="text-slate-200" size={32} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-foreground text-lg font-bold tracking-tight">No match found in repository</p>
                                    <p className="text-[#B0AFA8] text-sm font-normal">Please refine your search parameters or check the enrollment ID.</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
