import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { ClassCard } from "../../dashboard/components/ClassCard";
import { AppDropdown } from "../../../components/AppDropdown";
import { useState, useEffect, useMemo } from "react";
import { TablePagination } from "../../../components/TablePagination";
import { graphqlRequest } from "../../../lib/graphqlClient";

interface ClassData {
  id: string;
  grade: string;
  section: string;
  room: string;
  status: string;
  statusType: "normal" | "attention" | "risk";
  teacher: string;
  students: number;
  participation: number;
}

interface GraphQLClass {
  id: string;
  schoolId: string;
  name: string;
  category?: string;
  section?: string;
  classTeacherId?: string;
  roomNumber?: string;
  shift?: string;
  capacity?: number;
}

interface GraphQLUser {
  id: string;
  name: string;
  classId?: string;
}

export const ClassesPage = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      const schoolId = localStorage.getItem("school_id") || "";
      
      const classesQuery = `
        query GetClasses($schoolId: String) {
          classes(filter: { schoolId: $schoolId }, page: 1, pageSize: 100) {
            items {
              id
              schoolId
              name
              section
              classTeacherId
              roomNumber
              shift
              capacity
            }
          }
        }
      `;
      
      const teachersQuery = `
        query GetTeachers($schoolId: String) {
          users(filter: { role: "TEACHER", schoolId: $schoolId, page: 1, pageSize: 200 }) {
            items {
              id
              name
            }
          }
        }
      `;
      
      const studentsQuery = `
        query GetStudents($schoolId: String) {
          users(filter: { role: "STUDENT", schoolId: $schoolId, page: 1, pageSize: 2000 }) {
            items {
              id
              classId
            }
          }
        }
      `;
      
      try {
        const results = await Promise.allSettled([
          graphqlRequest<{ classes: { items: GraphQLClass[] } }>(classesQuery, { schoolId: schoolId || undefined }),
          graphqlRequest<{ users: { items: GraphQLUser[] } }>(teachersQuery, { schoolId: schoolId || undefined }),
          graphqlRequest<{ users: { items: GraphQLUser[] } }>(studentsQuery, { schoolId: schoolId || undefined })
        ]);
        
        let loadedClasses: GraphQLClass[] = [];
        let loadedTeachers: GraphQLUser[] = [];
        let loadedStudents: GraphQLUser[] = [];
        
        if (results[0].status === "fulfilled") {
          loadedClasses = results[0].value.classes?.items || [];
        } else {
          console.error("Classes load failed:", results[0].reason);
        }
        
        if (results[1].status === "fulfilled") {
          loadedTeachers = results[1].value.users?.items || [];
        } else {
          console.error("Teachers load failed:", results[1].reason);
        }
        
        if (results[2].status === "fulfilled") {
          loadedStudents = results[2].value.users?.items || [];
        } else {
          console.error("Students load failed:", results[2].reason);
        }
        
        const teacherMap = new Map(loadedTeachers.map(t => [t.id, t.name]));
        const studentCountMap = new Map<string, number>();
        loadedStudents.forEach(s => {
          if (s.classId) {
            studentCountMap.set(s.classId, (studentCountMap.get(s.classId) || 0) + 1);
          }
        });
        
        const mappedClasses = loadedClasses.map((c: GraphQLClass) => {
          const room = c.roomNumber || "Room TBD";
          const teacherName = c.classTeacherId ? (teacherMap.get(c.classTeacherId) || "No Teacher Assigned") : "No Teacher Assigned";
          const studentCount = studentCountMap.get(c.id) || 0;
          return {
            id: c.id,
            grade: c.name,
            section: c.section || "A",
            room: room,
            status: "Normal",
            statusType: "normal" as const,
            teacher: teacherName,
            students: studentCount,
            participation: 85 + ((c.name.codePointAt(0) || 0) % 15), // stable mock percentage
          };
        });
        
        setClasses(mappedClasses);
      } catch (err: unknown) {
        console.error("Error fetching class data:", err);
        const errMsg = err instanceof Error ? err.message : "Failed to fetch class data";
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchesSearch =
        cls.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.room.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGrade =
        selectedGrade === "" || cls.grade.toLowerCase().includes(selectedGrade.toLowerCase());
      
      const matchesSection =
        selectedSection === "" || cls.section.toLowerCase() === selectedSection.toLowerCase();
        
      return matchesSearch && matchesGrade && matchesSection;
    });
  }, [classes, searchTerm, selectedGrade, selectedSection]);

  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClasses.slice(start, start + itemsPerPage);
  }, [filteredClasses, currentPage, itemsPerPage]);

  let gridContent;
  if (isLoading) {
    gridContent = (
      <div className="flex flex-col items-center justify-center py-20 text-[#B0AFA8]">
        <span className="material-symbols-outlined text-5xl animate-spin">sync</span>
        <p className="mt-4 text-[14px] font-bold">Loading classes...</p>
      </div>
    );
  } else if (error) {
    gridContent = (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <span className="material-symbols-outlined text-5xl">error</span>
        <p className="mt-4 text-[14px] font-bold">{error}</p>
      </div>
    );
  } else if (filteredClasses.length === 0) {
    gridContent = (
      <div className="flex flex-col items-center justify-center py-20 text-[#B0AFA8]">
        <span className="material-symbols-outlined text-5xl">domain_disabled</span>
        <p className="mt-4 text-[14px] font-bold">No classes found</p>
      </div>
    );
  } else {
    gridContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedClasses.map((cls) => (
          <ClassCard
            key={cls.id}
            {...cls}
            onClick={() => navigate(`/classes/${cls.id}`)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <TopBar
        title="Classes"
        subtitle="Overview of all active grade levels and sections."
        actions={
          <button className="btn-outline h-10 px-6 rounded-[10px] text-[13px] font-bold flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined text-lg">file_download</span>
            Export List
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 space-y-8">
          {/* Flat Architectural Search and Filters */}
          <div className="flex flex-wrap gap-3 items-center py-2">
            <div className="flex-1 min-w-[350px]">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg">search</span>
                <input
                  className="w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] pl-11 pr-4 h-10 text-[14px] font-medium text-foreground placeholder-[#B0AFA8] placeholder:font-medium focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white focus:shadow-none outline-none transition-all"
                  placeholder="Search classes, teachers, or schedules..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AppDropdown
                options={["Grade 9", "Grade 10", "Grade 11", "Grade 12"]}
                value={selectedGrade}
                onChange={setSelectedGrade}
                width="w-44"
                placeholder="Grade Level"
              />

              <AppDropdown
                options={["A", "B", "C", "D"]}
                value={selectedSection}
                onChange={setSelectedSection}
                width="w-32"
                placeholder="Section"
              />

              <button className="h-10 w-10 bg-[#F7F8F4] border border-slate-100 rounded-[10px] flex items-center justify-center text-[#B0AFA8] hover:text-primary hover:bg-white hover:border-primary/30 transition-all outline-none shadow-none focus:shadow-none">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>

              <button
                onClick={() => navigate("/classes/create")}
                className="btn-primary h-10 px-6 rounded-[10px] text-[13px] font-bold flex items-center gap-2 transition-all shadow-sm shadow-slate-100/30 ml-auto"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                New Class
              </button>
            </div>
          </div>

          {/* Classes Grid */}
          {gridContent}

          <TablePagination
            totalItems={filteredClasses.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(count) => {
              setItemsPerPage(count);
              setCurrentPage(1);
            }}
            itemName="classes"
          />
        </div>
      </div>
    </div>
  );
};
