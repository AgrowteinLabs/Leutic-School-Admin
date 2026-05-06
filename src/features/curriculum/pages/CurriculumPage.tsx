import { useState, useMemo, useEffect } from "react";
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
  const [selectedTimetableSection, setSelectedTimetableSection] = useState("");
  const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
  const [assigningSlot, setAssigningSlot] = useState<{ day: string, period: number } | null>(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges) {
      setPendingTab(newTab);
      setShowConfirmModal(true);
    } else {
      navigate(`/curriculum/${newTab}`);
    }
  };

  const confirmNavigation = () => {
    if (pendingTab) {
      setHasUnsavedChanges(false);
      navigate(`/curriculum/${pendingTab}`);
      setShowConfirmModal(false);
      setPendingTab(null);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Browser-level navigation guard for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);
  const [periods] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [periodConfig, setPeriodConfig] = useState<{ [key: number]: { start: string, end: string } }>({
    1: { start: "08:30", end: "09:30" },
    2: { start: "09:30", end: "10:30" },
    3: { start: "10:30", end: "11:30" },
    4: { start: "11:30", end: "12:30" },
    5: { start: "13:30", end: "14:30" },
    6: { start: "14:30", end: "15:30" },
    7: { start: "15:30", end: "16:30" },
    8: { start: "16:30", end: "17:30" },
  });
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
  const [subjectSearch, setSubjectSearch] = useState("");
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
    { grade: "Grade 5", subjects: ["SUB-001", "SUB-002", "SUB-005"] },
    { grade: "Grade 6", subjects: ["SUB-001", "SUB-002", "SUB-005"] },
    { grade: "Grade 7", subjects: ["SUB-001", "SUB-002", "SUB-005"] },
    { grade: "Grade 8", subjects: ["SUB-001", "SUB-002", "SUB-005", "SUB-008", "SUB-009"] },
    { grade: "Grade 9", subjects: ["SUB-001", "SUB-002", "SUB-003", "SUB-004", "SUB-005", "SUB-006"] },
    { grade: "Grade 10", subjects: ["SUB-001", "SUB-002", "SUB-003", "SUB-004", "SUB-005", "SUB-006"] },
    { grade: "Grade 11", subjects: ["SUB-001", "SUB-002", "SUB-003", "SUB-006"] },
    { grade: "Grade 12", subjects: ["SUB-001", "SUB-002", "SUB-003", "SUB-006"] },
  ]);

  const [selectedTimetableGrade, setSelectedTimetableGrade] = useState(gradeConfigs[0]?.grade || "");

  const [gradeGroups, setGradeGroups] = useState<GradeGroup[]>([
    { id: "middle", label: "Middle School", grades: ["Grade 5", "Grade 6", "Grade 7", "Grade 8"] },
    { id: "high", label: "High School", grades: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"] },
  ]);

  const [sections] = useState([
    ...["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"].map(id => ({
      grade: "Grade 10", id, groupId: "high"
    })),
    { grade: "Grade 8", id: "A", groupId: "middle" },
    { grade: "Grade 8", id: "B", groupId: "middle" },
    { grade: "Grade 12", id: "A", groupId: "high" },
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

  const handleQuickAssign = (grade: string, section: string, subjectId: string, teacherId: string, isFromTemplate: boolean) => {
    const existingIndex = mappings.findIndex(m => m.grade === grade && m.section === section && m.subjectId === subjectId);

    if (existingIndex > -1) {
      const newMappings = [...mappings];
      newMappings[existingIndex] = { ...newMappings[existingIndex], teacherId };
      setMappings(newMappings);
    } else {
      const newMapping = {
        id: `m-${Date.now()}`,
        grade,
        section,
        subjectId,
        teacherId,
        isAdditional: !isFromTemplate,
        hoursPerWeek: 4 // Default
      };
      setMappings([...mappings, newMapping]);
    }
    setHasUnsavedChanges(true);
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
    if (editingMapping && editingMapping.id) {
      setMappings(prev => prev.map(m => m.id === editingMapping.id ? { ...m, ...newMapping } : m));
    } else {
      setMappings(prev => [{ ...newMapping, id: `MAP-${Date.now()}` }, ...prev]);
    }
    setShowMappingDrawer(false);
    setEditingMapping(null);
  };

  const handleDeleteMapping = (id: string) => {
    setMappings(prev => prev.filter(m => m.id !== id));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB]">
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#444 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
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
                    onClick={() => handleTabChange(t.id)}
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

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-10 pt-4 pb-10">
        <div className="max-w-[1400px] mx-auto space-y-6">

          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/30 flex flex-col min-h-[500px] overflow-hidden">

            {/* Header / Search Area (Hidden for Timetable to maximize space) */}
            {activeTab !== "timetable" && (
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

                  {activeTab !== "mapping" && (
                    <button
                      onClick={handleAddAction}
                      className="btn-primary h-10 px-6 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span>
                      {activeTab === "master" ? "New Subject" : "Configure Grade"}
                    </button>
                  )}
                </div>
              </div>
            )}

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
                        .filter(s => {
                          const fullSearch = `${s.grade} ${s.id}`.toLowerCase();
                          const shortSearch = `${s.grade.replace("Grade ", "")} ${s.id}`.toLowerCase();
                          const normalizedTerm = searchTerm.toLowerCase();
                          return fullSearch.includes(normalizedTerm) || shortSearch.includes(normalizedTerm);
                        }).map(s => {
                          const gradeConfig = gradeConfigs.find(gc => gc.grade === s.grade);
                          const sectionMappings = mappings.filter(m => m.grade === s.grade && m.section === s.id);

                          // Merge template subjects and additional subjects
                          const templateSubjectIds = gradeConfig?.subjects || [];
                          const additionalSubjectIds = sectionMappings.filter(m => m.isAdditional).map(m => m.subjectId);
                          const allSubjectIds = Array.from(new Set([...templateSubjectIds, ...additionalSubjectIds]));

                          return (
                            <div key={`${s.grade}-${s.id}`} className="group px-8 py-10 border-b border-slate-100 hover:bg-[#F9F9F8]/40 transition-all flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                              <div className="w-24 shrink-0 flex flex-col pt-1">
                                <span className="text-[12px] font-bold text-[#B0AFA8] mb-2">Grade</span>
                                <h4 className="text-[28px] font-bold text-secondary leading-none">
                                  {s.grade.replace("Grade ", "")} {s.id}
                                </h4>
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
                                      className="flex flex-col gap-1 relative group/item"
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
                                      {!isFromTemplate && mapping && (
                                        <button
                                          onClick={() => handleDeleteMapping(mapping.id)}
                                          className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all z-10"
                                          title="Remove Custom Subject"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                      )}
                                      <div className="flex flex-col pr-4">
                                        <select
                                          className="bg-transparent border-none p-0 text-[11px] font-medium text-secondary focus:ring-0 cursor-pointer outline-none w-full"
                                          value={mapping?.teacherId || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (val) {
                                              handleQuickAssign(s.grade, s.id, sid, val, isFromTemplate);
                                            }
                                          }}
                                        >
                                          <option value="" disabled className="text-slate-400">Assign Teacher</option>
                                          {teachers
                                            .filter(t => t.specializations.includes(sid))
                                            .map(t => (
                                              <option key={t.id} value={t.id} className="text-[#444441]">{t.name}</option>
                                            ))}
                                        </select>
                                      </div>
                                    </div>
                                  );
                                })}
                                {/* Add Custom Subject Trigger (Ultra-Minimal Link) */}
                                <div className="flex items-center pt-1">
                                  <button
                                    onClick={() => {
                                      setEditingMapping({ grade: s.grade, section: s.id, isAdditional: true } as any);
                                      setIsAddingAdditional(true);
                                      setShowMappingDrawer(true);
                                    }}
                                    className="flex items-center gap-1.5 text-[#B0AFA8] hover:text-primary transition-all group/plus active:scale-95"
                                  >
                                    <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform duration-300">add</span>
                                    <span className="text-[11px] font-bold tracking-tight">Add Custom</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}


                  {activeTab === "timetable" && (
                    <div className="flex flex-col h-full bg-[#FDFCFB]/50 backdrop-blur-sm">
                      {/* Hierarchical Section Selector (Sleek Typographic Index) */}
                      <div className="px-10 py-8 bg-white border-b border-slate-100 flex flex-col gap-10 sticky top-0 z-10">
                        <div className="flex flex-col gap-12">
                          {/* 1. Academic Index (Grades) */}
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-[13px] font-semibold text-slate-400 tracking-tight">Academic index</span>
                              <div className="h-px flex-1 bg-slate-50" />
                            </div>
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                              {gradeConfigs.map(config => (
                                <button
                                  key={config.grade}
                                  onClick={() => {
                                    setSelectedTimetableGrade(config.grade);
                                    setSelectedTimetableSection("");
                                  }}
                                  className={cn(
                                    "text-[15px] transition-all relative py-1",
                                    selectedTimetableGrade === config.grade
                                      ? "font-semibold text-secondary"
                                      : "font-normal text-slate-400 hover:text-secondary"
                                  )}
                                >
                                  {config.grade}
                                  {selectedTimetableGrade === config.grade && (
                                    <motion.div layoutId="grade-underline" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 2. Class Roster (Sections) */}
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-[13px] font-semibold text-slate-400 tracking-tight">Section roster</span>
                              <div className="h-px flex-1 bg-slate-50" />
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                              {sections
                                .filter(s => s.grade === selectedTimetableGrade)
                                .map(s => (
                                  <button
                                    key={`${s.grade}-${s.id}`}
                                    onClick={() => setSelectedTimetableSection(`${s.grade}-${s.id}`)}
                                    className={cn(
                                      "size-8 rounded-full text-[13px] transition-all flex items-center justify-center",
                                      selectedTimetableSection === `${s.grade}-${s.id}`
                                        ? "font-semibold text-white bg-primary shadow-lg shadow-primary/20"
                                        : "font-medium text-slate-400 hover:text-secondary hover:bg-slate-50"
                                    )}
                                  >
                                    {s.id}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* 3. Selection Summary Overlay */}
                        {selectedTimetableSection && (
                          <div className="flex items-center justify-between pt-6 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-[#B0AFA8] tracking-tight">Active View</span>
                                <span className="text-[14px] font-bold text-secondary">
                                  {selectedTimetableGrade} — Section {selectedTimetableSection.split("-")[1]}
                                </span>
                              </div>
                            </div>
                            <button className="h-10 px-6 rounded-xl bg-primary text-white text-[12px] font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                              <span className="material-symbols-outlined text-[18px]">save</span>
                              <span>Save Schedule</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {!selectedTimetableSection ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden">
                          {/* Editorial Background Element */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[400px] font-black text-slate-50/50 select-none pointer-events-none">
                            Schedule
                          </div>
                          <div className="relative z-10 space-y-8 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="size-24 rounded-[40px] bg-white shadow-2xl shadow-slate-200/50 flex items-center justify-center text-primary mx-auto">
                              <span className="material-symbols-outlined text-[48px] animate-pulse">calendar_view_day</span>
                            </div>
                            <div className="space-y-3">
                              <h3 className="text-[32px] font-semibold text-secondary tracking-tight">Academic rhythm</h3>
                              <p className="text-[15px] font-medium text-slate-400 leading-relaxed">
                                Select an institutional roster above to visualize and manage the weekly academic flow for your students.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 p-8 lg:p-12 overflow-auto bg-transparent relative">
                          <div className="max-w-[1200px] mx-auto">
                            <div className="grid grid-cols-[100px_repeat(5,1fr)]">
                              {/* Headers */}
                              <div className="border-b border-r border-[#EBE8E0]" /> {/* Time Corner Spacer */}
                              {days.map(day => (
                                <div key={day} className="pb-8 px-6 border-b border-r last:border-r-0 border-[#EBE8E0] bg-[#FDFCFB]/80">
                                  <span className="text-[14px] font-semibold text-secondary tracking-tight block">{day}</span>
                                  <span className="text-[10px] font-medium text-slate-400 tracking-tight">Class day</span>
                                </div>
                              ))}

                              {/* Body */}
                              {periods.map(period => (
                                <div key={period} className="contents group/row">
                                  {/* Time Sidebar (Editable - Larger Typography) */}
                                  <div className="flex flex-col items-center justify-start pt-6 gap-2 border-r border-[#EBE8E0] pr-8 relative min-w-[100px]">
                                    <span className="text-[24px] font-bold text-secondary/80 leading-none group-hover/row:text-primary transition-colors">{period}</span>
                                    {editingPeriod === period ? (
                                      <div className="flex flex-col gap-1 mt-1">
                                        <input
                                          autoFocus
                                          type="text"
                                          value={periodConfig[period].start}
                                          onChange={(e) => setPeriodConfig(prev => ({ ...prev, [period]: { ...prev[period], start: e.target.value } }))}
                                          onBlur={() => setEditingPeriod(null)}
                                          className="w-14 text-[11px] font-semibold bg-white border border-[#EBE8E0] rounded-lg px-2 py-1 outline-none focus:border-primary shadow-sm"
                                        />
                                        <input
                                          type="text"
                                          value={periodConfig[period].end}
                                          onChange={(e) => setPeriodConfig(prev => ({ ...prev, [period]: { ...prev[period], end: e.target.value } }))}
                                          onBlur={() => setEditingPeriod(null)}
                                          className="w-14 text-[11px] font-semibold bg-white border border-[#EBE8E0] rounded-lg px-2 py-1 outline-none focus:border-primary shadow-sm"
                                        />
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setEditingPeriod(period)}
                                        className="text-[11px] font-semibold text-slate-400 tracking-tight hover:text-primary transition-colors"
                                      >
                                        {periodConfig[period].start} — {periodConfig[period].end}
                                      </button>
                                    )}
                                  </div>

                                  {/* Day Slots (Cream & Pattern Cinematic) */}
                                  {days.map((day, dIdx) => {
                                    const entry = timetableEntries.find(e => e.section === selectedTimetableSection && e.day === day && e.period === period);
                                    return (
                                      <motion.div
                                        key={`${day}-${period}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (period * 5 + dIdx) * 0.015 }}
                                        className={cn(
                                          "group relative min-h-[140px] transition-all duration-500 py-8 px-6 border-b border-r last:border-r-0 border-[#EBE8E0]",
                                          !entry && "cursor-pointer hover:bg-white/80 hover:shadow-[0_20px_50px_rgba(230,220,200,0.3)] hover:z-10"
                                        )}
                                        onClick={() => !entry && setAssigningSlot({ day, period })}
                                      >
                                        {/* Subtle Grain Pattern on hover */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] pointer-events-none transition-opacity"
                                          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/felt.png")' }} />

                                        {entry ? (
                                          <>
                                            <div className="flex flex-col items-start text-left gap-0.5 animate-in fade-in slide-in-from-left-2 duration-500 h-full justify-center">
                                              <h4 className="text-[14px] font-semibold text-secondary leading-tight group-hover:text-primary transition-colors">{entry.subjectName}</h4>
                                              <p className="text-[11px] font-medium text-slate-400 tracking-tight">{entry.teacherName}</p>
                                            </div>

                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setTimetableEntries(prev => prev.filter(ent => ent !== entry));
                                              }}
                                              className="absolute top-3 right-3 size-7 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center text-slate-300 shadow-sm bg-white z-10"
                                            >
                                              <span className="material-symbols-outlined text-[15px]">close</span>
                                            </button>
                                          </>
                                        ) : (
                                          <div className="h-full flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 duration-300">
                                            <div className="size-6 rounded-full text-secondary/30 flex items-center justify-center">
                                              <span className="material-symbols-outlined text-[18px]">add</span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-secondary/30">Assign</span>
                                          </div>
                                        )}

                                        {/* Assignment Popover Refined (Compact Search Card) */}
                                        {assigningSlot?.day === day && assigningSlot?.period === period && (
                                          <div className="absolute inset-2 z-20 bg-[#FDFCFB] shadow-[0_20px_60px_rgba(200,180,150,0.3)] rounded-xl border border-[#EBE8E0] p-4 animate-in fade-in zoom-in-95 duration-200">
                                            {/* Pattern in Popover */}
                                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                              style={{ backgroundImage: 'radial-gradient(#444 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }} />

                                            <div className="relative z-10 flex flex-col h-full">
                                              <div className="flex justify-between items-center mb-4">
                                                <span className="text-[11px] font-semibold text-slate-400 tracking-tight">Assign subject</span>
                                                <button onClick={(e) => { e.stopPropagation(); setAssigningSlot(null); setSubjectSearch(""); }} className="text-slate-300 hover:text-secondary transition-colors">
                                                  <span className="material-symbols-outlined text-[14px]">close</span>
                                                </button>
                                              </div>

                                              {/* Surgical Search Bar */}
                                              <div className="relative group/search z-50">
                                                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-primary/40 group-focus-within/search:text-primary transition-colors">search</span>
                                                <input
                                                  autoFocus
                                                  type="text"
                                                  placeholder="Subject name..."
                                                  value={subjectSearch}
                                                  onChange={(e) => setSubjectSearch(e.target.value)}
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="w-full h-9 bg-white/80 border border-[#EBE8E0] rounded-lg pl-9 pr-3 text-[12px] font-medium placeholder-slate-300 outline-none focus:border-primary/20 focus:bg-white transition-all "
                                                />

                                                {/* Floating Suggestions List (Shifted for Compactness) */}
                                                {subjectSearch.length > 0 && (
                                                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#EBE8E0] rounded-lg shadow-[0_20px_50px_rgba(200,180,150,0.35)] z-[100] max-h-[220px] overflow-y-auto no-scrollbar py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    {mappings
                                                      .filter(m => `${m.grade}-${m.section}` === selectedTimetableSection)
                                                      .filter(m => {
                                                        const sub = subjects.find(s => s.id === m.subjectId);
                                                        return sub?.name.toLowerCase().includes(subjectSearch.toLowerCase());
                                                      })
                                                      .map(m => {
                                                        const sub = subjects.find(s => s.id === m.subjectId);
                                                        const teacher = teachers.find(t => t.id === m.teacherId);
                                                        return (
                                                          <button
                                                            key={m.id}
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              const newEntry = {
                                                                section: selectedTimetableSection,
                                                                day,
                                                                period,
                                                                subjectId: m.subjectId,
                                                                subjectName: sub?.name || "",
                                                                teacherId: m.teacherId,
                                                                teacherName: teacher?.name || m.teacherId
                                                              };
                                                              setTimetableEntries(prev => [...prev, newEntry]);
                                                              setAssigningSlot(null);
                                                              setSubjectSearch("");
                                                            }}
                                                            className="w-full px-5 py-4 hover:bg-primary/5 text-left transition-colors flex items-center justify-between group/opt"
                                                          >
                                                            <div className="space-y-0.5">
                                                              <p className="text-[13px] font-semibold text-secondary group-hover/opt:text-primary transition-colors">{sub?.name}</p>
                                                              <p className="text-[10px] font-medium text-slate-400">{teacher?.name || m.teacherId}</p>
                                                            </div>
                                                            <span className="material-symbols-outlined text-[18px] text-primary opacity-0 group-hover/opt:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">add_circle</span>
                                                          </button>
                                                        );
                                                      })}
                                                    {mappings.filter(m => {
                                                      const sub = subjects.find(s => s.id === m.subjectId);
                                                      return sub?.name.toLowerCase().includes(subjectSearch.toLowerCase()) && `${m.grade}-${m.section}` === selectedTimetableSection;
                                                    }).length === 0 && (
                                                        <div className="px-3 py-6 text-center space-y-1">
                                                          <p className="text-[11px] text-slate-400 font-medium">No results found</p>
                                                        </div>
                                                      )}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
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

      {/* ── Global Action Bar (Quiet Luxury Save Mechanism) ── */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-2 pl-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-2 rounded-full bg-primary animate-pulse" />
                <div className="flex flex-col">
                  <p className="text-[13px] font-bold text-secondary">Save Changes?</p>
                  <p className="text-[10px] text-[#B0AFA8] font-medium">You have changes that need to be saved.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHasUnsavedChanges(false)}
                  className="h-11 px-6 rounded-xl text-[12px] font-bold text-[#B0AFA8] hover:text-secondary hover:bg-slate-50 transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={() => {
                    // Simulating API sync
                    setTimeout(() => setHasUnsavedChanges(false), 800);
                  }}
                  className="h-11 px-8 bg-secondary text-white rounded-xl text-[12px] font-bold shadow-lg shadow-secondary/10 hover:bg-secondary/90 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">sync</span>
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirmation Modal (Quiet Luxury Navigation Guard) ── */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl p-8 max-w-md w-full relative z-10 border border-slate-100"
            >
              <div className="size-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 border border-amber-100">
                <span className="material-symbols-outlined text-[28px]">warning</span>
              </div>
              <h3 className="text-[20px] font-bold text-secondary mb-2">Unsaved Changes</h3>
              <p className="text-[14px] text-[#B0AFA8] leading-relaxed mb-8">
                You have pending teacher assignments. Moving to another tab will discard these modifications. Are you sure you want to proceed?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 h-12 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:bg-slate-50 transition-all"
                >
                  Stay Here
                </button>
                <button
                  onClick={confirmNavigation}
                  className="flex-1 h-12 rounded-xl bg-red-50 text-red-600 text-[13px] font-bold hover:bg-red-100 transition-all"
                >
                  Discard & Move
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <MappingForm
          subjects={subjects}
          teachers={teachers}
          mappings={mappings}
          gradeConfigs={gradeConfigs}
          initialData={editingMapping}
          isAdditional={isAddingAdditional}
          onClose={() => { setShowMappingDrawer(false); setEditingMapping(null); }}
          onSubmit={onAddMapping}
        />
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

const MappingForm = ({ subjects, teachers, mappings, initialData, isAdditional, onClose, onSubmit, gradeConfigs }: any) => {
  const [grade, setGrade] = useState(initialData?.grade || "");
  const [section, setSection] = useState(initialData?.section || "");
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || "");
  const [teacherId, setTeacherId] = useState(initialData?.teacherId || "");

  // Update when initialData changes (for contextual + button)
  useEffect(() => {
    if (initialData) {
      if (initialData.grade) setGrade(initialData.grade);
      if (initialData.section) setSection(initialData.section);
      if (initialData.subjectId) setSubjectId(initialData.subjectId);
      if (initialData.teacherId) setTeacherId(initialData.teacherId);
    }
  }, [initialData]);

  const isFormValid = grade && section && subjectId && teacherId;

  // Derived warning intelligence
  const selectedTeacher = teachers.find((t: any) => t.id === teacherId);
  const selectedSubject = subjects.find((s: any) => s.id === subjectId);
  const scopeMismatch = selectedTeacher && !selectedTeacher.teachingScope.includes(grade);
  const specMismatch = selectedTeacher && !selectedTeacher.specializations.includes(subjectId);

  // Teacher workload calculation
  const teacherMappings = (mappings || []).filter((m: any) => m.teacherId === teacherId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 space-y-6 flex-1 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <FormGroup
            label="Grade" type="select"
            options={gradeConfigs.map((g: any) => g.grade)}
            value={grade} onChange={setGrade}
          />
          <FormGroup label="Section" placeholder="e.g. A" value={section} onChange={setSection} />
        </div>

        <FormGroup
          label="Select Subject" type="select"
          options={[
            { val: "", label: "Choose a Subject", disabled: true },
            ...subjects.map((s: any) => ({ val: s.id, label: s.name }))
          ]}
          value={subjectId} onChange={setSubjectId}
          icon="subject"
        />

        <FormGroup
          label="Assign Teacher" type="select"
          options={[
            { val: "", label: "Choose a Teacher", disabled: true },
            ...teachers.map((t: any) => ({ val: t.id, label: t.name }))
          ]}
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
                <span className="text-[10px] font-semibold text-[#B0AFA8]">{selectedTeacher.qualification}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-white rounded-lg border border-slate-50 p-3 text-center">
                  <p className="text-[18px] font-bold text-foreground">{teacherMappings.length}</p>
                  <p className="text-[9px] font-medium text-[#B0AFA8] mt-0.5">Active Classes</p>
                </div>
                <div className="flex-1 bg-white rounded-lg border border-slate-50 p-3 text-center">
                  <p className="text-[18px] font-bold text-foreground">{selectedTeacher.teachingScope.length}</p>
                  <p className="text-[9px] font-medium text-[#B0AFA8] mt-0.5">Grade Scope</p>
                </div>
              </div>
              {teacherMappings.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-medium text-[#B0AFA8]">Current Assignments</p>
                  {teacherMappings.map((m: any) => {
                    const sub = subjects.find((s: any) => s.id === m.subjectId);
                    return (
                      <div key={m.id} className="flex items-center justify-between text-[11px] py-1.5 px-2 rounded-lg hover:bg-white transition-colors">
                        <span className="font-semibold text-[#444441]">{sub?.name || m.subjectId}</span>
                        <span className="text-[#B0AFA8] font-medium">{m.grade} {m.section}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      <div className="p-8 border-t border-slate-50 bg-[#FBFBFA] flex gap-3">
        <button onClick={onClose} className="flex-1 h-12 rounded-xl text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors">Cancel</button>
        <button
          onClick={() => isFormValid && onSubmit({ grade, section, subjectId, teacherId, isAdditional })}
          disabled={!isFormValid}
          className="flex-[2] btn-primary h-12 rounded-xl text-[13px] font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
        >
          {initialData?.id ? "Update Mapping" : "Confirm Assignment"}
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
