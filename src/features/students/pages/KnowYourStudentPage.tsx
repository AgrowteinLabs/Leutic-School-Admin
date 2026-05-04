import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { Search, Users, ShieldCheck, ChevronRight, GraduationCap } from "lucide-react";

export const KnowYourStudentPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("All Grades");
    const [selectedSection, setSelectedSection] = useState("All Sections");

    const students = [
        { id: "OA-2024-001", name: "Aavya S.", grade: "12", section: "A", aura: 98.4, attendance: 98, status: "Active", img: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=400&h=400&fit=crop" },
        { id: "OA-2024-042", name: "Ishaan K.", grade: "10", section: "B", aura: 64.2, attendance: 72, status: "At Risk", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
        { id: "OA-2024-118", name: "Meera V.", grade: "11", section: "C", aura: 91.5, attendance: 94, status: "Active", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
        { id: "OA-2024-156", name: "Arjun T.", grade: "11", section: "B", aura: 88.5, attendance: 91, status: "Active", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
        { id: "OA-2024-092", name: "Diya M.", grade: "10", section: "A", aura: 72.1, attendance: 85, status: "Active", img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100" },
        { id: "OA-2024-305", name: "Rohan P.", grade: "9", section: "D", aura: 61.8, attendance: 78, status: "At Risk", img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100" },
    ];

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 s.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGrade = selectedGrade === "All Grades" || s.grade === selectedGrade;
            const matchesSection = selectedSection === "All Sections" || s.section === selectedSection;
            return matchesSearch && matchesGrade && matchesSection;
        });
    }, [searchTerm, selectedGrade, selectedSection]);

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
                                <p className="text-lg font-bold text-foreground">1,280</p>
                            </div>
                            <div className="px-4 py-2 text-center">
                                <p className="text-[10px] font-medium text-[#B0AFA8] tracking-tighter">Verified Logs</p>
                                <p className="text-lg font-bold text-foreground text-[#2E7D32] font-mono">ALL ACCESS</p>
                            </div>
                        </div>
                    </div>

                    {/* Refined Search Layout - Matching User's Dashboard Edit */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-8 group/search relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within/search:text-primary transition-colors" size={18} strokeWidth={2} />
                            <input 
                                type="text"
                                placeholder="Know Your Student — Enter Name, Enrollment ID or Roll Number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-[12px] pl-14 pr-4 py-3.5 text-[14px] font-normal text-foreground placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                            />
                        </div>
                        
                        <div className="lg:col-span-4 flex gap-3">
                            <div className="flex-1 relative">
                                <select 
                                    value={selectedGrade}
                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-[12px] px-5 py-3.5 text-[13px] font-medium text-foreground focus:ring-1 focus:ring-primary cursor-pointer appearance-none shadow-sm"
                                >
                                    <option>All Grades</option>
                                    <option value="9">Grade 9</option>
                                    <option value="10">Grade 10</option>
                                    <option value="11">Grade 11</option>
                                    <option value="12">Grade 12</option>
                                </select>
                                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#B0AFA8] pointer-events-none" />
                            </div>

                            <div className="flex-1 relative">
                                <select 
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-[12px] px-5 py-3.5 text-[13px] font-medium text-foreground focus:ring-1 focus:ring-primary cursor-pointer appearance-none shadow-sm"
                                >
                                    <option>All Sections</option>
                                    <option value="A">Section A</option>
                                    <option value="B">Section B</option>
                                    <option value="C">Section C</option>
                                    <option value="D">Section D</option>
                                </select>
                                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#B0AFA8] pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Institutional Grid Results */}
                    <div className="space-y-6">
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
                            {filteredStudents.map((s) => (
                                <div 
                                    key={s.id}
                                    onClick={() => navigate(`/students/${s.id}`)}
                                    className="bg-white rounded-[16px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer group flex flex-col"
                                >
                                    <div className="p-6 flex-1 space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="relative">
                                                <img src={s.img} className="size-14 rounded-xl object-cover border border-slate-50 grayscale group-hover:grayscale-0 transition-all duration-500 shadow-sm" />
                                                <div className={cn(
                                                    "absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-white",
                                                    s.status === "Active" ? "bg-[#EAF2D7]0" : "bg-[#FEF3C7]0"
                                                )} />
                                            </div>
                                            <div className="bg-[#F7F8F4] px-2 py-1 rounded-lg border border-slate-100 text-[9px] font-bold text-[#B0AFA8] group-hover:text-primary transition-colors">
                                                {s.id}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h4 className="text-base font-bold text-foreground leading-tight tracking-tight">{s.name}</h4>
                                            <p className="text-[11px] font-medium text-[#B0AFA8] tracking-tight leading-none italic">Grade {s.grade} — Section {s.section}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-medium text-[#B0AFA8] mb-1 uppercase tracking-tighter">Aura Score</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1 flex-1 bg-[#F0F0EC] rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary" style={{ width: `${s.aura}%` }} />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-foreground">{s.aura}%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-medium text-[#B0AFA8] mb-1 uppercase tracking-tighter">Attendance</p>
                                                <p className="text-[11px] font-bold text-foreground">{s.attendance}%</p>
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
                            ))}
                        </div>

                        {filteredStudents.length === 0 && (
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
