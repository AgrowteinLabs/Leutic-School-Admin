import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { MenuDropdown } from "../../../components/MenuDropdown";
import { TablePagination } from "../../../components/TablePagination";
import { SideDrawer } from "../../../components/SideDrawer";
import { AppDropdown } from "../../../components/AppDropdown";
import { AppDatePicker } from "../../../components/AppDatePicker";

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
  qualification: string;
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
  const ACADEMIC_AREAS = ["Mathematics", "Science", "Humanities", "Languages", "Arts", "Technology", "Administration", "Sports"];

  // State Data

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "SUB-001", name: "Mathematics", code: "MAT101", category: "Core", department: "Mathematics" },
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
    { id: "TCH-001", name: "Mr. Marcus Roberts", dept: "Science", qualification: "M.Sc Mathematics", teachingScope: ["Grade 8", "Grade 9", "Grade 10"], specializations: ["SUB-001", "SUB-003"] },
    { id: "TCH-042", name: "Ms. Elena Rodriguez", dept: "Humanities", qualification: "M.A English Literature", teachingScope: ["Grade 8", "Grade 9", "Grade 10"], specializations: ["SUB-002", "SUB-005"] },
    { id: "TCH-088", name: "Dr. Sarah Jenkins", dept: "Arts", qualification: "Ph.D Performing Arts", teachingScope: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"], specializations: ["SUB-007"] },
    { id: "TCH-099", name: "Prof. Alan Turing", dept: "Technology", qualification: "M.Tech Computer Science", teachingScope: ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"], specializations: ["SUB-006"] },
    { id: "TCH-101", name: "Mr. Richard Feynman", dept: "Science", qualification: "M.Sc Physics", teachingScope: ["Grade 10", "Grade 11", "Grade 12"], specializations: ["SUB-001", "SUB-003", "SUB-004"] },
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
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingGrade, setEditingGrade] = useState<GradeConfig | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [gradeToDelete, setGradeToDelete] = useState<GradeConfig | null>(null);

  // Handlers
  // Derived subject areas (replaces hardcoded departments)
  // Derived subject areas for filtering (All distinct areas currently in use)
  const activeSubjectAreas = useMemo(() => [...new Set(subjects.map(s => s.department))].sort(), [subjects]);

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

  const handleEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setShowSubjectDrawer(true);
  };

  const handleEditGrade = (config: GradeConfig) => {
    setEditingGrade(config);
    setShowGradeDrawer(true);
  };

  const handleDeleteSubject = (sub: Subject) => {
    setSubjectToDelete(sub);
  };

  const onConfirmDeleteSubject = () => {
    if (subjectToDelete) {
      setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
      setSubjectToDelete(null);
    }
  };

  const handleDeleteGrade = (config: GradeConfig) => {
    setGradeToDelete(config);
  };

  const onConfirmDeleteGrade = () => {
    if (gradeToDelete) {
      setGradeConfigs(prev => prev.filter(g => g.grade !== gradeToDelete.grade));
      setGradeToDelete(null);
    }
  };

  const handleAddAdditionalSubject = () => {
    setIsAddingAdditional(true); // Flag for section override
    setShowMappingDrawer(true);
  };

  const onAddSubject = (subjectData: any) => {
    if (editingSubject) {
      setSubjects(prev => prev.map(s => s.id === editingSubject.id ? { ...s, ...subjectData } : s));
    } else {
      setSubjects([{ ...subjectData, id: `SUB-${Date.now()}` }, ...subjects]);
    }
    setShowSubjectDrawer(false);
    setEditingSubject(null);
  };

  const onAddGradeConfig = (newConfig: any) => {
    setGradeConfigs([newConfig, ...gradeConfigs.filter(g => g.grade !== newConfig.grade)]); // Update or add
    setShowGradeDrawer(false);
    setEditingGrade(null);
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
                { id: "grades", label: "Grade Templates", icon: "account_tree" },
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

          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/30 flex flex-col min-h-[500px] overflow-hidden">

            {/* Header / Search Area */}
            <div className="p-3 border-b border-slate-100/50 flex flex-wrap gap-4 items-center justify-between bg-white rounded-t-[24px]">
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
                    ...activeSubjectAreas.map((area: string) => ({
                      label: area,
                      onClick: () => setDeptFilter(area)
                    }))
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

                {activeTab === "grades" && (
                  <button
                    onClick={() => setShowTierDrawer(true)}
                    className="size-10 rounded-xl bg-slate-50 border border-slate-100 text-[#B0AFA8] hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center group relative"
                    title="Manage Academic Tiers"
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 group-hover:text-primary transition-all">settings</span>
                    <span className="material-symbols-outlined text-[12px] absolute translate-x-[9px] translate-y-[-9px] text-[#B0AFA8] group-hover:text-primary transition-all">account_tree</span>
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
                              "px-8 py-4 text-[11px] font-semibold text-[#B0AFA8]",
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
                                  <span className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">{sub.name}</span>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-[12px] font-medium text-slate-500">{sub.code}</td>
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
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleEditSubject(sub)}
                                    className="size-8 rounded-lg text-[#B0AFA8] hover:bg-white hover:text-primary hover:shadow-sm transition-all flex items-center justify-center"
                                    title="Edit Subject"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubject(sub)}
                                    className="size-8 rounded-lg text-[#B0AFA8] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                                    title="Delete Subject"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "grades" && (
                    <div className="flex flex-col">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                        {[...gradeConfigs]
                          .filter(g => g.grade.toLowerCase().includes(searchTerm.toLowerCase()))
                          .sort((a, b) => sortOrder === "asc" ? a.grade.localeCompare(b.grade) : b.grade.localeCompare(a.grade))
                          .map((config) => {
                            const group = gradeGroups.find(gg => gg.grades.includes(config.grade));
                            return (
                              <div
                                key={config.grade}
                                className="p-6 rounded-[32px] border border-slate-100 bg-white hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex flex-col h-full cursor-default"
                              >
                                <div className="flex justify-between items-start mb-6">
                                  <div>
                                    <h3 className="text-[18px] font-bold text-foreground mb-1">{config.grade}</h3>
                                    <p className="text-[11px] font-medium text-[#B0AFA8]">Default Grade Subjects</p>
                                  </div>
                                  {group && (
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[9px] font-bold text-[#B0AFA8]">
                                      {group.label}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 flex-1 items-start content-start">
                                  {config.subjects.map(sid => {
                                    const s = subjects.find(sub => sub.id === sid);
                                    if (!s) return null;
                                    return (
                                      <span key={sid} className={cn(
                                        "px-2.5 py-1 text-[10px] font-bold rounded-lg border",
                                        s.category === "Core" ? "bg-emerald-50/50 text-emerald-700 border-emerald-100/50" :
                                          s.category === "Elective" ? "bg-blue-50/50 text-blue-700 border-blue-100/50" :
                                            s.category === "Language" ? "bg-amber-50/50 text-amber-700 border-amber-100/50" :
                                              "bg-purple-50/50 text-purple-700 border-purple-100/50"
                                      )}>
                                        {s.name}
                                      </span>
                                    );
                                  })}
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-medium text-[#B0AFA8]">{config.subjects.length} Subjects</span>
                                    <span
                                      onClick={() => handleEditGrade(config)}
                                      className="text-[12px] font-bold text-[#444441] hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group/edit"
                                    >
                                      Edit Template
                                      <span className="material-symbols-outlined text-[16px] group-hover/edit:translate-x-0.5 transition-transform">arrow_forward</span>
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteGrade(config)}
                                    className="size-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                                    title="Delete Template"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
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
                                <h4 className="text-[32px] font-bold text-secondary leading-none">{s.id}</h4>
                                <div className="mt-6 flex items-center gap-1.5 text-secondary/40 group-hover:text-primary transition-colors">
                                  <span className="text-[12px] font-bold leading-none">{totalHours}h</span>
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
                                        {!mapping && <span className="text-[8px] font-bold text-red-400">Required</span>}
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
                                        {mapping && <span className="text-[11px] font-bold text-secondary/20 group-hover/item:text-secondary transition-colors">{mapping.hoursPerWeek}h</span>}
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
                              <span className="text-[10px] font-bold text-[#B0AFA8]">Selected Roster</span>
                              <span className="text-[14px] font-bold text-secondary">{selectedTimetableSection}</span>
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
                            <h3 className="text-[24px] font-bold text-secondary tracking-tight">Select a Section</h3>
                            <p className="text-[14px] font-medium text-[#B0AFA8] leading-relaxed">
                              Choose a class section from the list above to view or enter their weekly academic schedule.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 p-8 lg:p-12 overflow-auto">
                          <div className="grid grid-cols-6 gap-px bg-slate-100 rounded-[28px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20">
                            {/* Corner */}
                            <div className="bg-[#FBFBFA] p-4 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider flex items-end justify-center">
                              Periods
                            </div>
                            {/* Days Header */}
                            {days.map(day => (
                              <div key={day} className="bg-[#FBFBFA] p-6 text-center">
                                <span className="text-[14px] font-bold text-secondary tracking-tight">{day}</span>
                              </div>
                            ))}

                            {/* Grid Body */}
                            {periods.map(period => (
                              <div key={period} className="contents">
                                {/* Period Label */}
                                <div className="bg-white p-6 flex flex-col items-center justify-center border-r border-slate-50">
                                  <span className="text-[18px] font-bold text-secondary leading-none">{period}</span>
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
                                            <p className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-wide mt-1">{entry.teacherName}</p>
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
                                            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Assign Subject</span>
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

            <div className="bg-white rounded-b-[24px]">
              <TablePagination
                currentPage={currentPage}
                totalItems={activeTab === "master" ? subjects.length : activeTab === "grades" ? gradeConfigs.length : mappings.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemName={activeTab === "master" ? "subjects" : activeTab === "grades" ? "templates" : "mappings"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <SideDrawer
        isOpen={showSubjectDrawer}
        onClose={() => { setShowSubjectDrawer(false); setEditingSubject(null); }}
        title={editingSubject ? "Edit Subject" : "Add New Subject"}
        subtitle={editingSubject ? "Update the details for this academic subject." : "Add a new subject to your school library. Once added, you can assign it to grades and teachers."}
      >
        <SubjectForm
          initialData={editingSubject}
          onClose={() => { setShowSubjectDrawer(false); setEditingSubject(null); }}
          onSubmit={onAddSubject}
        />
      </SideDrawer>

      <SideDrawer
        isOpen={showGradeDrawer}
        onClose={() => { setShowGradeDrawer(false); setEditingGrade(null); }}
        title={editingGrade ? "Edit Grade Template" : "Set Grade Subjects"}
        subtitle="Choose which subjects are taught by default for this grade. These will be added to all sections automatically."
      >
        <GradeConfigForm
          subjects={subjects}
          initialData={editingGrade}
          onClose={() => { setShowGradeDrawer(false); setEditingGrade(null); }}
          onSubmit={onAddGradeConfig}
        />
      </SideDrawer>

      <SideDrawer
        isOpen={showMappingDrawer}
        onClose={() => { setShowMappingDrawer(false); setEditingMapping(null); }}
        title={editingMapping ? "Update Assignment" : isAddingAdditional ? "Assign Custom Subject" : "Assign Teacher"}
        subtitle="Assign a teacher to a specific subject and class. We will show a warning if the teacher’s profile doesn’t match."
      >
        <MappingForm subjects={subjects} teachers={teachers} mappings={mappings} initialData={editingMapping} isAdditional={isAddingAdditional} onClose={() => { setShowMappingDrawer(false); setEditingMapping(null); }} onSubmit={onAddMapping} />
      </SideDrawer>

      <SideDrawer
        isOpen={showTierDrawer}
        onClose={() => setShowTierDrawer(false)}
        title="Group Grades"
        subtitle="Organize your grades into groups like Primary, Secondary, or High School."
      >
        <TierManagementForm groups={gradeGroups} setGroups={setGradeGroups} gradeConfigs={gradeConfigs} onClose={() => setShowTierDrawer(false)} />
      </SideDrawer>

      <DeleteConfirmationModal
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        name={subjectToDelete?.name || ""}
        onConfirm={onConfirmDeleteSubject}
      />

      <DeleteConfirmationModal
        isOpen={!!gradeToDelete}
        onClose={() => setGradeToDelete(null)}
        name={gradeToDelete?.grade || ""}
        onConfirm={onConfirmDeleteGrade}
      />
    </div>
  );
};

// --- Functional Components (Drawers & Forms) ---

const SubjectForm = ({ onClose, onSubmit, initialData }: any) => {
  const ACADEMIC_AREAS = ["Mathematics", "Science", "Humanities", "Languages", "Arts", "Technology", "Administration", "Sports"];
  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [category, setCategory] = useState(initialData?.category || "Core");

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-8 flex-1">
        <FormGroup label="Subject Name" placeholder="e.g. Political Science" value={name} onChange={setName} />

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Subject Code" placeholder="e.g. POL-101" value={code} onChange={setCode} />
          <div className="space-y-2.5 group">
            <label className="text-[13px] font-bold text-[#B0AFA8] px-1 group-focus-within:text-foreground transition-colors">Subject Area</label>
            <AppDropdown
              options={ACADEMIC_AREAS}
              value={department}
              onChange={setDepartment}
              placeholder="e.g. Science"
              searchable
            />
            {department && (
              <div className="flex gap-2 mt-2 px-1 items-start">
                <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">info</span>
                <p className="text-[11px] text-[#B0AFA8] font-medium leading-relaxed">
                  <span className="text-primary font-bold">{department} includes:</span>{" "}
                  {department === "Mathematics" ? "Algebra, Geometry, Calculus, Statistics" :
                    department === "Science" ? "Physics, Chemistry, Biology, Environmental Science" :
                      department === "Humanities" ? "History, Geography, Political Science, Economics" :
                        department === "Languages" ? "English, Literature, Regional Languages, Foreign Languages" :
                          department === "Arts" ? "Music, Dance, Visual Arts, Drama, Photography" :
                            department === "Technology" ? "Computer Science, AI, Robotics, ICT, Web Design" :
                              department === "Administration" ? "Business Studies, Accountancy, Entrepreneurship, Ethics" :
                                department === "Sports" ? "Physical Education, Yoga, Athletics, Health & Fitness" : ""}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 group">
          <label className="text-[13px] font-bold text-[#B0AFA8] px-1 group-focus-within:text-foreground transition-colors">Category Type</label>
          <AppDropdown
            options={["Core (Mandatory)", "Elective (Optional)", "Language", "Co-Scholastic (Arts/Sports)"]}
            value={category === "Core" ? "Core (Mandatory)" : category === "Elective" ? "Elective (Optional)" : category}
            onChange={(val) => setCategory(val.split(" ")[0])}
            placeholder="Select category"
          />
        </div>
      </div>
      <div className="p-8 border-t border-slate-50 bg-[#FBFBFA] flex gap-3">
        <button onClick={onClose} className="flex-1 h-12 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors">Cancel</button>
        <button
          onClick={() => onSubmit({ name, code, department, category })}
          className="flex-[2] btn-primary h-12 rounded-xl text-[13px] font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {initialData ? "Update Subject" : "Create Subject"}
        </button>
      </div>
    </div>
  );
};



const DeleteConfirmationModal = ({ isOpen, onClose, name, onConfirm }: any) => {
  const [confirmText, setConfirmText] = useState("");
  const isMatched = confirmText.toLowerCase() === name.toLowerCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-red-100 overflow-hidden"
          >
            <div className="p-8 text-center space-y-6">
              <div className="size-20 rounded-[24px] bg-red-50 flex items-center justify-center text-red-600 mx-auto animate-pulse">
                <span className="material-symbols-outlined text-[40px]">delete_forever</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-[20px] font-bold text-foreground tracking-tight">Delete this subject?</h3>
                <p className="text-[13px] text-[#444441] leading-relaxed">
                  Permanently remove <span className="font-bold text-foreground">{name}</span> from the library. This will affect all grade templates.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold text-[#B0AFA8] capitalize tracking-normal">
                  Type <span className="text-foreground">{name}</span> to confirm
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={name}
                  className="w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-[14px] px-6 text-center text-[14px] font-bold text-foreground focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-6 bg-red-50/30 border-t border-red-50 flex gap-3">
              <button onClick={onClose} className="flex-1 h-12 rounded-2xl text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors">
                Cancel
              </button>
              <button
                disabled={!isMatched}
                onClick={onConfirm}
                className="flex-[2] btn-danger h-12 rounded-2xl transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const GradeConfigForm = ({ subjects, onClose, onSubmit, initialData }: any) => {
  const [grade, setGrade] = useState(initialData?.grade || "");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialData?.subjects || []);
  const [formSearch, setFormSearch] = useState("");

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
        <FormGroup
          label="Target Grade Level"
          type="select"
          options={["Grade 1", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"]}
          value={grade}
          onChange={setGrade}
        />

        <div className="space-y-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search subjects..."
              className="w-full h-11 pl-10 pr-4 bg-[#F7F8F4] border border-slate-200 rounded-xl text-[13px] outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
              value={formSearch}
              onChange={(e) => setFormSearch(e.target.value)}
            />
          </div>

          {["Core", "Elective", "Language", "Co-Scholastic"].map(cat => {
            const catSubjects = subjects
              .filter((s: any) => s.category === cat)
              .filter((s: any) =>
                s.name.toLowerCase().includes(formSearch.toLowerCase()) ||
                s.code.toLowerCase().includes(formSearch.toLowerCase())
              );

            if (catSubjects.length === 0) return null;

            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className={cn(
                    "size-1.5 rounded-full",
                    cat === "Core" ? "bg-emerald-400" :
                      cat === "Elective" ? "bg-blue-400" :
                        cat === "Language" ? "bg-amber-400" : "bg-purple-400"
                  )} />
                  <span className="text-[10px] font-medium text-[#B0AFA8]">{cat}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {catSubjects.map((s: any) => (
                    <label
                      key={s.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all duration-200 group/item relative overflow-hidden",
                        selectedSubjects.includes(s.id)
                          ? "bg-primary/5 border-primary/40"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50"
                      )}
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(s.id)}
                          onChange={() => toggleSubject(s.id)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "size-5 rounded-lg border flex items-center justify-center transition-all duration-200",
                          selectedSubjects.includes(s.id)
                            ? "bg-primary border-primary text-white scale-110"
                            : "bg-slate-100 border-slate-200 group-hover/item:border-slate-300"
                        )}>
                          {selectedSubjects.includes(s.id) && (
                            <span className="material-symbols-outlined text-[14px] font-bold animate-in zoom-in duration-200">check</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={cn(
                          "text-[13px] font-semibold truncate leading-tight transition-colors",
                          selectedSubjects.includes(s.id) ? "text-foreground" : "text-[#444441] group-hover/item:text-foreground"
                        )}>{s.name}</span>
                        <span className="text-[10px] text-[#B0AFA8] font-medium tracking-wide">{s.code}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-8 border-t border-slate-50 bg-[#FBFBFA] flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit({ grade, subjects: selectedSubjects })}
          disabled={selectedSubjects.length === 0}
          className="flex-[2] btn-primary h-12 rounded-xl text-[13px] font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          {initialData ? "Update Template" : "Save Template"}
        </button>
      </div>
    </div>
  );
};

const MappingForm = ({ subjects, teachers, mappings, initialData, isAdditional, onClose, onSubmit }: any) => {
  const [grade, setGrade] = useState(initialData?.grade || "Grade 8");
  const [section, setSection] = useState(initialData?.section || "A");
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || subjects[0]?.id || "");
  const [teacherId, setTeacherId] = useState(initialData?.teacherId || teachers[0]?.id || "");
  const [hoursPerWeek, setHoursPerWeek] = useState(initialData?.hoursPerWeek?.toString() || "4");

  // Derived warning intelligence
  const selectedTeacher = teachers.find((t: any) => t.id === teacherId);
  const selectedSubject = subjects.find((s: any) => s.id === subjectId);
  const scopeMismatch = selectedTeacher && !selectedTeacher.teachingScope.includes(grade);
  const specMismatch = selectedTeacher && !selectedTeacher.specializations.includes(subjectId);

  // Teacher workload calculation
  const teacherMappings = (mappings || []).filter((m: any) => m.teacherId === teacherId);
  const totalHours = teacherMappings.reduce((sum: number, m: any) => sum + (m.hoursPerWeek || 0), 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-6 flex-1 overflow-y-auto no-scrollbar">
        {isAdditional && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[20px]">stars</span>
            <p className="text-[12px] text-amber-900 leading-relaxed font-medium">
              You are adding a subject to this specific class that isn't in the regular list for this grade.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Grade" type="select" options={["Grade 8", "Grade 9", "Grade 10"]} value={grade} onChange={setGrade} />
          <FormGroup label="Section" placeholder="e.g. A" value={section} onChange={setSection} />
        </div>

        <FormGroup
          label="Select Subject" type="select"
          options={subjects.map((s: any) => ({ val: s.id, label: s.name }))}
          value={subjectId} onChange={setSubjectId}
          icon="subject"
        />

        <FormGroup
          label="Assign Teacher" type="select"
          options={teachers.map((t: any) => ({ val: t.id, label: t.name }))}
          value={teacherId} onChange={setTeacherId}
          icon="person"
        />

        {/* ── Soft Warning Engine ── */}
        {selectedTeacher && (
          <div className="space-y-3">
            {/* Scope Warning — Amber */}
            {scopeMismatch && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">warning</span>
                <div>
                  <p className="text-[12px] font-bold text-amber-800 mb-1">Grade Scope Mismatch</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    <span className="font-bold">{selectedTeacher.name}</span> is not currently assigned to teach <span className="font-bold">{grade}</span>.
                    Their approved scope is: {selectedTeacher.teachingScope.join(", ")}.
                    <span className="block mt-1 text-[10px] text-amber-600 italic">You may still proceed — this warning is advisory only.</span>
                  </p>
                </div>
              </div>
            )}

            {/* Specialization Warning — Blue */}
            {specMismatch && selectedSubject && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
                <span className="material-symbols-outlined text-blue-500 text-[20px] mt-0.5">info</span>
                <div>
                  <p className="text-[12px] font-bold text-blue-800 mb-1">Subject Specialization Advisory</p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    <span className="font-bold">{selectedSubject.name}</span> is not listed in <span className="font-bold">{selectedTeacher.name}</span>&apos;s specializations.
                    Their trained subjects: {selectedTeacher.specializations.map((sid: string) => subjects.find((s: any) => s.id === sid)?.name || sid).join(", ")}.
                    <span className="block mt-1 text-[10px] text-blue-600 italic">Cross-discipline assignments are allowed at admin discretion.</span>
                  </p>
                </div>
              </div>
            )}

            {/* Workload Panel */}
            <div className="bg-[#F7F8F4] border border-slate-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">badge</span>
                  <span className="text-[12px] font-bold text-foreground">{selectedTeacher.name}</span>
                </div>
                <span className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider">{selectedTeacher.qualification}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-white rounded-lg border border-slate-50 p-3 text-center">
                  <p className="text-[18px] font-bold text-foreground">{teacherMappings.length}</p>
                  <p className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-wide mt-0.5">Active Classes</p>
                </div>
                <div className="flex-1 bg-white rounded-lg border border-slate-50 p-3 text-center">
                  <p className="text-[18px] font-bold text-foreground">{totalHours}</p>
                  <p className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-wide mt-0.5">Hours / Week</p>
                </div>
                <div className="flex-1 bg-white rounded-lg border border-slate-50 p-3 text-center">
                  <p className="text-[18px] font-bold text-foreground">{selectedTeacher.teachingScope.length}</p>
                  <p className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-wide mt-0.5">Grade Scope</p>
                </div>
              </div>
              {teacherMappings.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider">Current Assignments</p>
                  {teacherMappings.map((m: any) => {
                    const sub = subjects.find((s: any) => s.id === m.subjectId);
                    return (
                      <div key={m.id} className="flex items-center justify-between text-[11px] py-1.5 px-2 rounded-lg hover:bg-white transition-colors">
                        <span className="font-semibold text-[#444441]">{sub?.name || m.subjectId}</span>
                        <span className="text-[#B0AFA8] font-medium">{m.grade} {m.section} · {m.hoursPerWeek}h/wk</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

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

const TierManagementForm = ({ groups, setGroups, gradeConfigs, onClose }: any) => {
  // Derive all possible grades from configs
  const allPossibleGrades = gradeConfigs.map((gc: any) => gc.grade);
  const assignedGrades = groups.flatMap((g: any) => g.grades);
  const unassignedGrades = allPossibleGrades.filter((g: string) => !assignedGrades.includes(g));

  const removeGrade = (groupId: string, grade: string) => {
    const newGroups = groups.map((g: any) => {
      if (g.id === groupId) {
        return { ...g, grades: g.grades.filter((gr: string) => gr !== grade) };
      }
      return g;
    });
    setGroups(newGroups);
  };

  const addGrade = (groupId: string, grade: string) => {
    const newGroups = groups.map((g: any) => {
      if (g.id === groupId) {
        return {
          ...g, grades: [...g.grades, grade].sort((a: string, b: string) => {
            const numA = parseInt(a.replace(/\D/g, ""));
            const numB = parseInt(b.replace(/\D/g, ""));
            return numA - numB;
          })
        };
      }
      return g;
    });
    setGroups(newGroups);
  };

  const addNewTier = () => {
    const newId = `tier-${Date.now()}`;
    setGroups([...groups, { id: newId, label: "New Academic Tier", grades: [] }]);
  };

  const removeTier = (groupId: string) => {
    setGroups(groups.filter((g: any) => g.id !== groupId));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">

        {/* Tier List */}
        <div className="space-y-8">
          {groups.map((group: any) => (
            <div key={group.id} className="p-6 rounded-[32px] border border-slate-100 bg-white hover:border-slate-200 transition-all group/tier relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="size-10 rounded-2xl bg-[#F7F8F4] flex items-center justify-center text-primary shrink-0 border border-slate-100">
                    <span className="material-symbols-outlined text-[20px]">layers</span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <input
                      className="bg-transparent border-none text-[14px] font-bold text-foreground outline-none focus:ring-0 p-0 w-full placeholder:text-slate-300"
                      value={group.label}
                      placeholder="Name this tier..."
                      onChange={(e) => {
                        const newGroups = groups.map((g: any) => g.id === group.id ? { ...g, label: e.target.value } : g);
                        setGroups(newGroups);
                      }}
                    />
                    <span className="text-[10px] font-medium text-[#B0AFA8] mt-1">Tier Name</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeTier(group.id)}
                    className="size-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center opacity-0 group-hover/tier:opacity-100"
                    title="Delete Tier"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>


              {/* Grade Chips */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2.5">
                  {group.grades.length === 0 ? (
                    <div className="w-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-50 rounded-2xl bg-slate-50/30">
                      <p className="text-[11px] text-[#B0AFA8] font-medium">No grades assigned to this tier yet</p>
                    </div>
                  ) : (
                    group.grades.map((grade: string) => (
                      <button
                        key={grade}
                        onClick={() => removeGrade(group.id, grade)}
                        className="px-4 py-2 bg-[#F7F8F4] border border-slate-100 rounded-xl text-[12px] font-semibold text-[#444441] hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all flex items-center gap-2 group/chip"
                      >
                        {grade}
                        <span className="material-symbols-outlined text-[14px] text-[#B0AFA8] group-hover/chip:text-red-500 transition-colors">close</span>
                      </button>
                    ))
                  )}
                </div>

                <div className="pt-2 space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <p className="text-[10px] font-medium text-[#B0AFA8]">Available Grades</p>
                  </div>
                  <div className="flex flex-wrap gap-2 px-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                      .map(n => `Grade ${n}`)
                      .filter(g => !groups.some((tg: any) => tg.grades.includes(g))) // ONLY unassigned
                      .length === 0 ? (
                      <div className="flex items-center gap-2 text-slate-400 py-2">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <p className="text-[10px] font-semibold italic">All institutional grades have been categorized.</p>
                      </div>
                    ) : (
                      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                        .map(n => `Grade ${n}`)
                        .filter(g => !groups.some((tg: any) => tg.grades.includes(g)))
                        .map(g => (
                          <button
                            key={g}
                            onClick={() => addGrade(group.id, g)}
                            className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[11px] font-bold text-[#444441] hover:bg-primary/5 hover:border-primary/40 transition-all active:scale-95 flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[14px] text-primary/60">add</span>
                            {g}
                          </button>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addNewTier}
            className="w-full h-12 rounded-xl text-[#B0AFA8] hover:text-primary transition-all flex items-center justify-center gap-2 group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">add</span>
            <span className="text-[13px] font-semibold">Define New Academic Tier</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const FormGroup = ({ label, type = "text", placeholder, options, value, onChange, icon }: any) => (
  <div className="space-y-2.5 group">
    <label className="text-[13px] font-bold text-[#B0AFA8] px-1 group-focus-within:text-foreground transition-colors">
      {label}
    </label>
    <div className="relative">
      {type === "select" ? (
        <AppDropdown
          options={options.map((o: any) => typeof o === 'string' ? o : o.label)}
          value={typeof value === 'string' ? value : options.find((o: any) => o.val === value)?.label || ""}
          onChange={(val: string) => {
            const selected = options.find((o: any) => (typeof o === 'string' ? o : o.label) === val);
            onChange && onChange(typeof selected === 'string' ? selected : selected.val);
          }}
          placeholder={placeholder}
          icon={icon}
        />
      ) : type === "date" ? (
        <AppDatePicker
          value={value ? new Date(value) : null}
          onChange={(d) => onChange && onChange(d.toISOString())}
          placeholder={placeholder}
          icon={icon}
        />
      ) : (
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px] group-focus-within:text-primary transition-colors z-10">
              {icon}
            </span>
          )}
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className={cn(
              "w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-[10px] outline-none text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white",
              icon ? "pl-12 pr-6" : "px-6"
            )}
          />
        </div>
      )}
    </div>
  </div>
);
