import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { MenuDropdown } from "../../../components/MenuDropdown";
import { TablePagination } from "../../../components/TablePagination";

// Types
interface Subject {
  id: string;
  name: string;
  code: string;
  category: "Core" | "Elective" | "Language" | "Co-Scholastic";
  department: string;
}

interface GradeConfig {
  grade: string;
  subjects: string[]; // Subject IDs (These are the defaults for all sections)
}

interface Mapping {
  id: string;
  grade: string;
  section: string;
  subjectId: string;
  teacherId: string;
  hoursPerWeek: number;
  isAdditional?: boolean; // True if subject is not from the grade template
}

interface GradeGroup {
  id: string;
  label: string;
  grades: string[];
}

interface Teacher {
  id: string;
  name: string;
  dept: string;
  teachingScope: string[]; // Grade names this teacher can teach
  specializations: string[]; // Subject IDs this teacher specializes in
}

export const CurriculumPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = (tab as "master" | "grades" | "mapping" | "timetable") || "master";
  const [selectedTimetableSection, setSelectedTimetableSection] = useState<string | null>(null);
  const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
  const [assigningSlot, setAssigningSlot] = useState<{ day: string, period: number } | null>(null);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  // State Data
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "SUB-001", name: "Mathematics", code: "MAT101", category: "Core", department: "Science" },
    { id: "SUB-002", name: "English Language", code: "ENG101", category: "Core", department: "Humanities" },
    { id: "SUB-003", name: "Physics", code: "PHY101", category: "Core", department: "Science" },
    { id: "SUB-004", name: "Chemistry", code: "CHE101", category: "Core", department: "Science" },
    { id: "SUB-005", name: "Modern History", code: "HIS101", category: "Core", department: "Humanities" },
    { id: "SUB-006", name: "Computer Science", code: "CS101", category: "Elective", department: "Technology" },
    { id: "SUB-007", name: "Classical Dance", code: "DAN101", category: "Co-Scholastic", department: "Arts" },
    { id: "SUB-008", name: "Urdu", code: "URD101", category: "Language", department: "Languages" },
    { id: "SUB-009", name: "Hindi", code: "HIN101", category: "Language", department: "Languages" },
  ]);

  const [gradeConfigs, setGradeConfigs] = useState<GradeConfig[]>([
    { grade: "Grade 10", subjects: ["SUB-001", "SUB-002", "SUB-003", "SUB-004", "SUB-005", "SUB-006"] },
    { grade: "Grade 8", subjects: ["SUB-001", "SUB-002", "SUB-005", "SUB-008", "SUB-009"] },
  ]);

  const [gradeGroups, setGradeGroups] = useState<GradeGroup[]>([
    { id: "tier-1", label: "Academic Tier 1", grades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"] },
    { id: "tier-2", label: "Academic Tier 2", grades: ["Grade 5", "Grade 6", "Grade 7"] },
    { id: "tier-3", label: "Academic Tier 3", grades: ["Grade 8", "Grade 9", "Grade 10"] },
    { id: "tier-4", label: "Academic Tier 4", grades: ["Grade 11", "Grade 12"] },
  ]);

  const [sections] = useState([
    { grade: "Grade 10", id: "A", groupId: "tier-3" },
    { grade: "Grade 10", id: "B", groupId: "tier-3" },
    { grade: "Grade 8", id: "A", groupId: "tier-3" },
  ]);

  const [mappings, setMappings] = useState<Mapping[]>([
    { id: "MAP-001", grade: "Grade 10", section: "A", subjectId: "SUB-001", teacherId: "TCH-001", hoursPerWeek: 5 },
    { id: "MAP-002", grade: "Grade 10", section: "A", subjectId: "SUB-002", teacherId: "TCH-042", hoursPerWeek: 4 },
    { id: "MAP-003", grade: "Grade 8", section: "A", subjectId: "SUB-008", teacherId: "TCH-088", hoursPerWeek: 4, isAdditional: true },
    { id: "MAP-004", grade: "Grade 8", section: "B", subjectId: "SUB-009", teacherId: "TCH-099", hoursPerWeek: 4, isAdditional: true },
  ]);

  const [teachers] = useState<Teacher[]>([
    { id: "TCH-001", name: "Mr. Marcus Roberts", dept: "Science", teachingScope: ["Grade 8", "Grade 9", "Grade 10"], specializations: ["SUB-001", "SUB-003"] },
    { id: "TCH-042", name: "Ms. Elena Rodriguez", dept: "Humanities", teachingScope: ["Grade 8", "Grade 9", "Grade 10"], specializations: ["SUB-002", "SUB-005"] },
    { id: "TCH-088", name: "Dr. Sarah Jenkins", dept: "Arts", teachingScope: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"], specializations: ["SUB-007"] },
    { id: "TCH-099", name: "Prof. Alan Turing", dept: "Technology", teachingScope: ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"], specializations: ["SUB-006"] },
    { id: "TCH-101", name: "Mr. Richard Feynman", dept: "Science", teachingScope: ["Grade 10", "Grade 11", "Grade 12"], specializations: ["SUB-001", "SUB-003", "SUB-004"] },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [showSubjectDrawer, setShowSubjectDrawer] = useState(false);
  const [showGradeDrawer, setShowGradeDrawer] = useState(false);
  const [showMappingDrawer, setShowMappingDrawer] = useState(false);
  const [showTierDrawer, setShowTierDrawer] = useState(false);
  const [isAddingAdditional, setIsAddingAdditional] = useState(false);
  const [editingMapping, setEditingMapping] = useState<Mapping | null>(null);

  // Handlers
  const handleAddAction = () => {
    if (activeTab === "master") setShowSubjectDrawer(true);
    else if (activeTab === "grades") setShowGradeDrawer(true);
    else if (activeTab === "mapping") {
      setIsAddingAdditional(false);
      setEditingMapping(null);
      setShowMappingDrawer(true);
    }
  };

  const handleEditMapping = (mapping: Mapping) => {
    setEditingMapping(mapping);
    setIsAddingAdditional(!!mapping.isAdditional);
    setShowMappingDrawer(true);
  };

  const handleAddAdditionalSubject = () => {
    setIsAddingAdditional(true); // Flag for section override
    setShowMappingDrawer(true);
  };

  const onAddSubject = (newSubject: any) => {
    setSubjects([{ ...newSubject, id: `SUB-${Date.now()}` }, ...subjects]);
    setShowSubjectDrawer(false);
  };

  const onAddGradeConfig = (newConfig: any) => {
    setGradeConfigs([newConfig, ...gradeConfigs.filter(g => g.grade !== newConfig.grade)]); // Update or add
    setShowGradeDrawer(false);
  };

  const onAddMapping = (newMapping: any) => {
    if (editingMapping) {
      setMappings(prev => prev.map(m => m.id === editingMapping.id ? { ...m, ...newMapping } : m));
    } else {
      setMappings([{ ...newMapping, id: `MAP-${Date.now()}` }, ...mappings]);
    }
    setShowMappingDrawer(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      {!isHubChild && (
        <>
          <TopBar
            title="Curriculum & Subject Mapping"
            subtitle="Design academic structures, manage subjects, and assign faculty"
            actions={
              <div className="flex gap-3">
                <button className="btn-outline h-10 px-5 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all">
                  <span className="material-symbols-outlined text-lg">download</span>
                  Export Schema
                </button>
              </div>
            }
          />

          {/* Tabs Navigation */}
          <div className="px-8 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              {[
                { id: "master", label: "Subject Master", icon: "book_4" },
                { id: "grades", label: "Grade Configuration", icon: "account_tree" },
                { id: "mapping", label: "Teacher Mapping", icon: "assignment_ind" },
                { id: "timetable", label: "Weekly Timetable", icon: "calendar_view_week" },
              ].map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/curriculum/${t.id}`)}
                    className={cn(
                      "flex items-center gap-2.5 pb-4 pt-6 text-[14px] font-semibold tracking-tight transition-all relative shrink-0",
                      isActive ? "text-foreground" : "text-[#B0AFA8] hover:text-foreground/70"
                    )}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-[20px] transition-all",
                        isActive ? "text-primary" : ""
                      )}
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {t.icon}
                    </span>
                    {t.label}
                    {isActive && (
                      <motion.div
                        layoutId="curriculumTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(217,234,133,0.4)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-10 pt-8 pb-10">
        <div className="max-w-[1400px] mx-auto space-y-6">

          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/30 flex flex-col min-h-[500px]">

            {/* Header / Search Area */}
            <div className="p-4 border-b border-slate-100/50 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex-1">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[20px]">search</span>
                  <input
                    type="text"
                    placeholder={`Search in ${activeTab === 'master' ? 'Subjects' : activeTab === 'grades' ? 'Grade Templates' : 'Teacher Assignments'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-base pl-11 pr-4 w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MenuDropdown
                  value={sortOrder === "asc" ? "Ascending" : "Descending"}
                  trigger={
                    <button className="btn-outline px-4 gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">
                        {sortOrder === "asc" ? "sort_by_alpha" : "filter_list_off"}
                      </span>
                      {sortOrder === "asc" ? "Ascending" : "Descending"}
                    </button>
                  }
                  items={[
                    { label: "Ascending", onClick: () => setSortOrder("asc") },
                    { label: "Descending", onClick: () => setSortOrder("desc") }
                  ]}
                />
                <MenuDropdown
                  value={deptFilter}
                  trigger={
                    <button className="btn-outline px-4 gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">filter_list</span>
                      {deptFilter}
                    </button>
                  }
                  items={[
                    { label: "All Departments", onClick: () => setDeptFilter("All Departments") },
                    { label: "Science", onClick: () => setDeptFilter("Science") },
                    { label: "Humanities", onClick: () => setDeptFilter("Humanities") },
                    { label: "Technology", onClick: () => setDeptFilter("Technology") },
                    { label: "Languages", onClick: () => setDeptFilter("Languages") },
                    { label: "Arts", onClick: () => setDeptFilter("Arts") }
                  ]}
                />

                <div className="h-8 w-px bg-slate-100 mx-1" />

                {activeTab === "mapping" && (
                  <button
                    onClick={handleAddAdditionalSubject}
                    className="btn-secondary h-10 px-4 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_task</span>
                    Custom Mapping
                  </button>
                )}

                <button
                  onClick={handleAddAction}
                  className="btn-primary h-10 px-6 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  {activeTab === "master" ? "New Subject" : activeTab === "grades" ? "Configure Grade" : "New Mapping"}
                </button>
              </div>
            </div>

            {/* Content Table Area */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === "master" && (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#F7F8F4]/50 border-b border-slate-50">
                          {["Subject Name", "Code", "Category", "Department", "Actions"].map((h, i) => (
                            <th key={h} className={cn(
                              "px-8 py-4 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest",
                              i === 4 ? "text-right" : ""
                            )}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[...subjects]
                          .sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
                          .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .filter(s => deptFilter === "All Departments" || s.department === deptFilter)
                          .map((sub) => (
                            <tr key={sub.id} className="hover:bg-[#F7F8F4]/30 transition-colors group">
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="size-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-bold text-[10px] border border-primary/10">
                                    {sub.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <span className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">{sub.name}</span>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-[12px] font-bold text-slate-500 uppercase tracking-wider">{sub.code}</td>
                              <td className="px-8 py-5">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-bold border capitalize",
                                  sub.category === "Core" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                    sub.category === "Elective" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                      sub.category === "Language" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-purple-50 text-purple-700 border-purple-100"
                                )}>
                                  {sub.category}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-[13px] font-medium text-[#444441]">{sub.department}</td>
                              <td className="px-8 py-5 text-right">
                                <button className="size-8 rounded-lg text-[#B0AFA8] hover:bg-white hover:text-primary hover:shadow-sm transition-all">
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "grades" && (
                    <div className="flex flex-col">
                      <div className="px-8 pt-6 pb-2 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#B0AFA8]">{gradeConfigs.length} grade templates configured</span>
                        <button
                          onClick={() => setShowTierDrawer(true)}
                          className="btn-secondary h-9 px-4 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">tune</span>
                          Manage Academic Tiers
                        </button>
                      </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                      {[...gradeConfigs]
                        .filter(g => g.grade.toLowerCase().includes(searchTerm.toLowerCase()))
                        .sort((a, b) => sortOrder === "asc" ? a.grade.localeCompare(b.grade) : b.grade.localeCompare(a.grade))
                        .map((config) => {
                        const group = gradeGroups.find(gg => gg.grades.includes(config.grade));
                        return (
                        <div key={config.grade} className="p-6 rounded-[24px] border border-slate-100 bg-white hover:border-primary/30 transition-all group shadow-sm flex flex-col h-full">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-[18px] font-black text-foreground tracking-tight">{config.grade}</h3>
                                {group && (
                                  <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-black text-[#B0AFA8] tracking-wider">
                                    {group.label}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider">Core Curriculum Template</p>
                            </div>
                            <button className="size-10 rounded-xl bg-[#F7F8F4] text-[#B0AFA8] hover:text-primary transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-[20px]">settings</span>
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 flex-1 items-start content-start">
                            {config.subjects.map(sid => {
                              const s = subjects.find(sub => sub.id === sid);
                              if (!s) return null;
                              return (
                                <span key={sid} className={cn(
                                  "px-3 py-1.5 text-[11px] font-bold rounded-lg border",
                                  s.category === "Core" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-[#F7F8F4] text-[#444441] border-slate-100"
                                )}>
                                  {s.name}
                                </span>
                              );
                            })}
                          </div>
                          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-[#B0AFA8]">
                            <span>{config.subjects.length} Default Subjects</span>
                            <span className="text-primary hover:underline cursor-pointer">Edit Template</span>
                          </div>
                        </div>
                        );
                      })}
                      <button
                        onClick={() => setShowGradeDrawer(true)}
                        className="rounded-[24px] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center gap-3 text-[#B0AFA8] hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group min-h-[220px]"
                      >
                        <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_circle</span>
                        <span className="text-[13px] font-bold">Add Grade Template</span>
                        <span className="text-[11px] font-medium text-center opacity-80 px-4">Create a new default subject package for a specific grade level.</span>
                      </button>
                    </div>
                    </div>
                  )}

                  {activeTab === "mapping" && (
                    <div className="flex flex-col bg-white">
                      {[...sections]
                        .sort((a, b) => {
                          const keyA = `${a.grade}-${a.id}`;
                          const keyB = `${b.grade}-${b.id}`;
                          return sortOrder === "asc" ? keyA.localeCompare(keyB) : keyB.localeCompare(keyA);
                        })
                        .filter(s => `${s.grade}-${s.id}`.toLowerCase().includes(searchTerm.toLowerCase())).map(s => {
                          const gradeConfig = gradeConfigs.find(gc => gc.grade === s.grade);
                          const sectionMappings = mappings.filter(m => m.grade === s.grade && m.section === s.id);

                          // Merge template subjects and additional subjects
                          const templateSubjectIds = gradeConfig?.subjects || [];
                          const additionalSubjectIds = sectionMappings.filter(m => m.isAdditional).map(m => m.subjectId);
                          const allSubjectIds = Array.from(new Set([...templateSubjectIds, ...additionalSubjectIds]));

                          const totalHours = sectionMappings.reduce((acc, curr) => acc + curr.hoursPerWeek, 0);

                          return (
                            <div key={`${s.grade}-${s.id}`} className="group px-8 py-10 border-b border-slate-50 hover:bg-[#F9F9F8]/40 transition-all flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                              <div className="w-20 shrink-0">
                                <span className="text-[10px] font-bold text-[#B0AFA8] block mb-1">{s.grade}</span>
                                <h4 className="text-[32px] font-black text-secondary leading-none tracking-tighter">{s.id}</h4>
                                <div className="mt-6 flex items-center gap-1.5 text-secondary/40 group-hover:text-primary transition-colors">
                                  <span className="text-[12px] font-black leading-none">{totalHours}h</span>
                                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                                </div>
                              </div>

                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
                                {allSubjectIds.map(sid => {
                                  const sub = subjects.find(sub => sub.id === sid);
                                  const mapping = sectionMappings.find(m => m.subjectId === sid);
                                  const isFromTemplate = templateSubjectIds.includes(sid);

                                  // Skip if department filter is active and doesn't match
                                  if (deptFilter !== "All Departments" && sub?.department !== deptFilter) return null;

                                  return (
                                    <div
                                      key={sid}
                                      onClick={() => {
                                        if (mapping) handleEditMapping(mapping);
                                        else {
                                          setIsAddingAdditional(!isFromTemplate);
                                          setEditingMapping(null);
                                          setShowMappingDrawer(true);
                                        }
                                      }}
                                      className="flex flex-col gap-1 relative group/item cursor-pointer"
                                    >
                                      <div className={cn(
                                        "absolute -left-6 top-0 bottom-0 w-[1px] transition-colors",
                                        mapping ? "bg-slate-100 group-hover/item:bg-primary" : "bg-red-100/50 group-hover/item:bg-red-400"
                                      )} />
                                      <div className="flex items-center gap-2">
                                        <span className={cn(
                                          "text-[14px] font-bold leading-tight",
                                          mapping ? "text-[#444441]" : "text-[#B0AFA8]"
                                        )}>{sub?.name}</span>
                                        {!isFromTemplate && <div className="size-1 rounded-full bg-primary" />}
                                        {!mapping && <span className="text-[8px] font-black text-red-400 tracking-tighter">Required</span>}
                                      </div>
                                      <div className="flex justify-between items-center pr-4">
                                        <span className={cn(
                                          "text-[11px] font-semibold",
                                          mapping ? "text-secondary" : "text-[#B0AFA8]"
                                        )}>
                                          {mapping
                                            ? (teachers.find(t => t.id === mapping.teacherId)?.name || mapping.teacherId)
                                            : "Assign Teacher"}
                                        </span>
                                        {mapping && <span className="text-[11px] font-black text-secondary/20 group-hover/item:text-secondary transition-colors">{mapping.hoursPerWeek}h</span>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-all pt-1">
                                <button className="h-9 px-4 rounded-full border border-slate-100 text-[10px] font-bold text-[#B0AFA8] hover:text-primary hover:border-primary transition-all">
                                  Section Audit
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {activeTab === "timetable" && (
                    <div className="flex flex-col h-full bg-[#FBFBFA]">
                      {/* Section Selector */}
                      <div className="px-10 py-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                          {Array.from(new Set(mappings.map(m => `${m.grade}-${m.section}`))).map(section => (
                            <button
                              key={section}
                              onClick={() => setSelectedTimetableSection(section)}
                              className={cn(
                                "px-5 py-2 rounded-xl text-[12px] font-bold transition-all shrink-0 border",
                                selectedTimetableSection === section
                                  ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/10"
                                  : "bg-white text-[#B0AFA8] border-slate-100 hover:border-primary/30"
                              )}
                            >
                              {section}
                            </button>
                          ))}
                        </div>
                        {selectedTimetableSection && (
                          <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
                            <div className="flex flex-col text-right">
                              <span className="text-[10px] font-black text-[#B0AFA8] uppercase tracking-widest">Selected Roster</span>
                              <span className="text-[14px] font-black text-secondary">{selectedTimetableSection}</span>
                            </div>
                            <button className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                              <span className="material-symbols-outlined">save</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {!selectedTimetableSection ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                          <div className="size-20 rounded-[32px] bg-[#F7F8F4] flex items-center justify-center text-secondary shadow-sm mb-4">
                            <span className="material-symbols-outlined text-[40px]">calendar_view_day</span>
                          </div>
                          <div className="max-w-md space-y-2">
                            <h3 className="text-[24px] font-black text-secondary tracking-tight">Select a Section</h3>
                            <p className="text-[14px] font-medium text-[#B0AFA8] leading-relaxed">
                              Choose a class section from the list above to view or enter their weekly academic schedule.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 p-8 lg:p-12 overflow-auto">
                          <div className="grid grid-cols-6 gap-px bg-slate-100 rounded-[28px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20">
                            {/* Corner */}
                            <div className="bg-[#FBFBFA] p-4 text-[10px] font-black text-[#B0AFA8] uppercase tracking-[0.2em] flex items-end justify-center">
                              Periods
                            </div>
                            {/* Days Header */}
                            {days.map(day => (
                              <div key={day} className="bg-[#FBFBFA] p-6 text-center">
                                <span className="text-[14px] font-black text-secondary tracking-tight">{day}</span>
                              </div>
                            ))}

                            {/* Grid Body */}
                            {periods.map(period => (
                              <div key={period} className="contents">
                                {/* Period Label */}
                                <div className="bg-white p-6 flex flex-col items-center justify-center border-r border-slate-50">
                                  <span className="text-[18px] font-black text-secondary leading-none">{period}</span>
                                  <span className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-tighter mt-1">Slot</span>
                                </div>
                                {/* Day Slots */}
                                {days.map(day => {
                                  const entry = timetableEntries.find(e => e.section === selectedTimetableSection && e.day === day && e.period === period);
                                  return (
                                    <div
                                      key={`${day}-${period}`}
                                      className="bg-white p-4 min-h-[120px] hover:bg-[#F7F8F4]/50 transition-colors group cursor-pointer relative"
                                    >
                                      {entry ? (
                                        <div className="h-full flex flex-col justify-between">
                                          <div>
                                            <p className="text-[13px] font-bold text-foreground leading-tight">{entry.subjectName}</p>
                                            <p className="text-[9px] font-black text-[#B0AFA8] uppercase tracking-wider mt-1">{entry.teacherName}</p>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setTimetableEntries(prev => prev.filter(ent => ent !== entry));
                                            }}
                                            className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 size-6 rounded-md hover:bg-red-50 hover:text-red-500 transition-all text-[#B0AFA8]"
                                          >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => setAssigningSlot({ day, period })}
                                            className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-[#B0AFA8] hover:bg-primary hover:text-white transition-all"
                                          >
                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                          </button>
                                        </div>
                                      )}

                                      {/* Smart Assignment Popover */}
                                      {assigningSlot?.day === day && assigningSlot?.period === period && (
                                        <div className="absolute inset-0 z-20 bg-white shadow-2xl rounded-xl border border-slate-100 p-4 animate-in fade-in zoom-in duration-200">
                                          <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Assign Subject</span>
                                            <button onClick={() => setAssigningSlot(null)} className="text-[#B0AFA8] hover:text-secondary">
                                              <span className="material-symbols-outlined text-[16px]">close</span>
                                            </button>
                                          </div>
                                          <div className="space-y-2 max-h-[150px] overflow-y-auto no-scrollbar">
                                            {mappings
                                              .filter(m => `${m.grade}-${m.section}` === selectedTimetableSection)
                                              .map(m => {
                                                const sub = subjects.find(s => s.id === m.subjectId);
                                                return (
                                                  <button
                                                    key={m.id}
                                                    onClick={() => {
                                                      const newEntry = {
                                                        section: selectedTimetableSection,
                                                        day,
                                                        period,
                                                        subjectId: m.subjectId,
                                                        subjectName: sub?.name,
                                                        teacherId: m.teacherId,
                                                        teacherName: m.teacherId // Simplification for now
                                                      };
                                                      setTimetableEntries(prev => [...prev, newEntry]);
                                                      setAssigningSlot(null);
                                                    }}
                                                    className="w-full p-2 rounded-lg bg-slate-50 hover:bg-primary hover:text-white transition-all text-left group/btn"
                                                  >
                                                    <p className="text-[12px] font-bold truncate">{sub?.name}</p>
                                                    <p className="text-[9px] font-medium opacity-60 group-hover/btn:opacity-100">{m.teacherId}</p>
                                                  </button>
                                                );
                                              })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-slate-100 p-4 px-8">
              <TablePagination
                currentPage={currentPage}
                totalPages={1}
                totalResults={activeTab === "master" ? subjects.length : activeTab === "grades" ? gradeConfigs.length : mappings.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onLimitChange={setItemsPerPage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <SideDrawer isOpen={showSubjectDrawer} onClose={() => setShowSubjectDrawer(false)} title="Add Subject to Global Library">
        <SubjectForm onClose={() => setShowSubjectDrawer(false)} onSubmit={onAddSubject} />
      </SideDrawer>

      <SideDrawer isOpen={showGradeDrawer} onClose={() => setShowGradeDrawer(false)} title="Configure Grade Curriculum">
        <GradeConfigForm subjects={subjects} onClose={() => setShowGradeDrawer(false)} onSubmit={onAddGradeConfig} />
      </SideDrawer>

      <SideDrawer isOpen={showMappingDrawer} onClose={() => { setShowMappingDrawer(false); setEditingMapping(null); }} title={editingMapping ? "Update Assignment" : isAddingAdditional ? "Assign Custom Subject" : "New Teacher Assignment"}>
        <MappingForm subjects={subjects} teachers={teachers} initialData={editingMapping} isAdditional={isAddingAdditional} onClose={() => { setShowMappingDrawer(false); setEditingMapping(null); }} onSubmit={onAddMapping} />
      </SideDrawer>
    </div>
  );
};

// --- Functional Components (Drawers & Forms) ---

const SideDrawer = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex justify-end">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
        />
        <motion.div
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[440px] bg-white h-full shadow-2xl flex flex-col"
        >
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-[#FBFBFA]">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <button onClick={onClose} className="size-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#B0AFA8]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const SubjectForm = ({ onClose, onSubmit }: any) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [department, setDepartment] = useState("Science");
  const [category, setCategory] = useState("Core");

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-6 flex-1">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <p className="text-[12px] text-[#444441] leading-relaxed">
            This subject will be added to the global library. Once added, you can include it in grade templates or assign it directly to sections.
          </p>
        </div>
        <FormGroup label="Subject Name" placeholder="e.g. Political Science" value={name} onChange={setName} />
        <FormGroup label="Subject Code" placeholder="e.g. POL-101" value={code} onChange={setCode} />
        <FormGroup label="Academic Department" type="select" options={["Science", "Humanities", "Languages", "Arts", "Technology"]} value={department} onChange={setDepartment} />

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider pl-1">Category Type</label>
          <select
            value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 text-[13px] font-semibold text-foreground outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all appearance-none"
          >
            <option value="Core">Core (Mandatory)</option>
            <option value="Elective">Elective (Optional)</option>
            <option value="Language">Language</option>
            <option value="Co-Scholastic">Co-Scholastic (Arts/Sports)</option>
          </select>
          <span className="material-symbols-outlined absolute right-12 top-[410px] -translate-y-1/2 text-[#B0AFA8] pointer-events-none">expand_more</span>
          <p className="text-[11px] text-[#B0AFA8] font-medium pl-1 mt-1">Core subjects are highlighted green in curriculum views.</p>
        </div>
      </div>
      <div className="p-8 border-t border-slate-50 bg-[#FBFBFA] flex gap-3">
        <button onClick={onClose} className="flex-1 h-12 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors">Cancel</button>
        <button
          onClick={() => onSubmit({ name, code, department, category })}
          className="flex-[2] btn-primary h-12 rounded-xl text-[13px] font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          Create Subject
        </button>
      </div>
    </div>
  );
};

const GradeConfigForm = ({ subjects, onClose, onSubmit }: any) => {
  const [grade, setGrade] = useState("Grade 9");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-8 flex-1">
        <div className="bg-[#F7F8F4] border border-slate-200 rounded-xl p-4 flex gap-3">
          <span className="material-symbols-outlined text-[#B0AFA8] text-[20px]">account_tree</span>
          <p className="text-[12px] text-[#444441] leading-relaxed">
            Create a standard blueprint. Any new section created for <span className="font-bold">{grade}</span> will automatically inherit these selected subjects.
          </p>
        </div>
        <FormGroup label="Target Grade Level" type="select" options={["Grade 1", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"]} value={grade} onChange={setGrade} />

        <div className="space-y-3">
          <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider pl-1 flex justify-between">
            <span>Select Default Subjects</span>
            <span className="text-primary">{selectedSubjects.length} selected</span>
          </label>
          <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {subjects.map((s: any) => (
              <label key={s.id} className={cn(
                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                selectedSubjects.includes(s.id) ? "bg-primary/5 border-primary/30" : "border-slate-100 hover:bg-[#F7F8F4]"
              )}>
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(s.id)}
                  onChange={() => toggleSubject(s.id)}
                  className="size-4 accent-primary rounded border-slate-300"
                />
                <div className="flex flex-col">
                  <span className={cn("text-[13px] font-semibold", selectedSubjects.includes(s.id) ? "text-primary" : "text-[#444441]")}>{s.name}</span>
                  <span className="text-[10px] text-[#B0AFA8] font-medium">{s.category}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="p-8 border-t border-slate-50 bg-[#FBFBFA] flex gap-3">
        <button onClick={onClose} className="flex-1 h-12 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors">Cancel</button>
        <button
          onClick={() => onSubmit({ grade, subjects: selectedSubjects })}
          disabled={selectedSubjects.length === 0}
          className="flex-[2] btn-primary h-12 rounded-xl text-[13px] font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          Save Blueprint
        </button>
      </div>
    </div>
  );
};

const MappingForm = ({ subjects, teachers, initialData, isAdditional, onClose, onSubmit }: any) => {
  const [grade, setGrade] = useState(initialData?.grade || "Grade 8");
  const [section, setSection] = useState(initialData?.section || "A");
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || subjects[0]?.id || "");
  const [teacherId, setTeacherId] = useState(initialData?.teacherId || teachers[0]?.id || "");
  const [hoursPerWeek, setHoursPerWeek] = useState(initialData?.hoursPerWeek?.toString() || "4");

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-6 flex-1">
        {isAdditional ? (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[20px]">stars</span>
            <p className="text-[12px] text-amber-900 leading-relaxed">
              <span className="font-bold">Custom Override:</span> You are adding a subject specifically to this section that is NOT part of the standard grade template.
            </p>
          </div>
        ) : (
          <div className="bg-[#F7F8F4] border border-slate-200 rounded-xl p-4 flex gap-3">
            <span className="material-symbols-outlined text-[#B0AFA8] text-[20px]">assignment_ind</span>
            <p className="text-[12px] text-[#444441] leading-relaxed">
              Assign a faculty member to teach a standard curriculum subject for a specific class section.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Grade" type="select" options={["Grade 8", "Grade 9", "Grade 10"]} value={grade} onChange={setGrade} />
          <FormGroup label="Section" placeholder="e.g. A" value={section} onChange={setSection} />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider pl-1">Select Subject</label>
          <div className="relative">
            <select
              value={subjectId} onChange={(e) => setSubjectId(e.target.value)}
              className="w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 text-[13px] font-semibold text-foreground outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all appearance-none"
            >
              {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] pointer-events-none">expand_more</span>
          </div>
        </div>

        <FormGroup
          label="Assign Teacher" type="select"
          options={teachers.map((t: any) => ({ val: t.id, label: `${t.name} (${t.dept})` }))}
          value={teacherId} onChange={setTeacherId}
        />

        <div className="w-1/2">
          <FormGroup label="Weekly Hours" type="number" placeholder="e.g. 4" value={hoursPerWeek} onChange={setHoursPerWeek} />
          <p className="text-[10px] text-[#B0AFA8] font-medium pl-1 mt-1">Number of periods per week.</p>
        </div>
      </div>
      <div className="p-8 border-t border-slate-50 bg-[#FBFBFA] flex gap-3">
        <button onClick={onClose} className="flex-1 h-12 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors">Cancel</button>
        <button
          onClick={() => onSubmit({ grade, section, subjectId, teacherId, hoursPerWeek: Number(hoursPerWeek), isAdditional })}
          className="flex-[2] btn-primary h-12 rounded-xl text-[13px] font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {initialData ? "Update Mapping" : "Confirm Assignment"}
        </button>
      </div>
    </div>
  );
};

const FormGroup = ({ label, type = "text", placeholder, options, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider pl-1">{label}</label>
    <div className="relative">
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 text-[13px] font-semibold text-foreground outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all appearance-none"
        >
          {options.map((o: any) => (
            <option key={typeof o === 'string' ? o : o.val} value={typeof o === 'string' ? o : o.val}>
              {typeof o === 'string' ? o : o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 text-[13px] font-semibold text-foreground outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all"
        />
      )}
      {type === "select" && <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] pointer-events-none">expand_more</span>}
    </div>
  </div>
);
