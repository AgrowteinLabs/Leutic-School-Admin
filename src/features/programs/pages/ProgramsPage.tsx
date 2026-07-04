import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { graphqlRequest } from "../../../lib/graphqlClient";

// Components
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { ProgramCard } from "../components/ProgramCard";
import { AppDropdown } from "../../../components/AppDropdown";
import { PDSButton } from "../../../components/pds/PDSButton";

export const ProgramsPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [programsList, setProgramsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const schoolId = localStorage.getItem("school_id") || "";
        const res = await graphqlRequest<any>(`
          query GetSpecialPrograms($schoolId: String) {
            specialPrograms(schoolId: $schoolId) {
              id
              name
              status
              description
              credits
              studentCount
            }
          }
        `, { schoolId });
        setProgramsList(res.specialPrograms || []);
      } catch (err) {
        console.error("Failed to load special programs:", err);
      }
    };
    fetchPrograms();
  }, []);

  const programs = useMemo(() => {
    if (programsList.length === 0) {
      return [
        {
          name: "Regional Science Fair 2024",
          category: "Academic",
          participants: 45,
          status: "Active" as const,
          leadTeacher: "Dr. Sunitha V.",
          startDate: "Oct 15",
          endDate: "Dec 10",
          location: "Main Auditorium",
          targetGrades: "Grades 9-12"
        },
        {
          name: "District Athletics League",
          category: "Sports",
          participants: 120,
          status: "Warning" as const,
          leadTeacher: "Coach Sreekumar",
          startDate: "Nov 01",
          endDate: "Feb 15",
          location: "School Ground",
          targetGrades: "All Grades"
        },
        {
          name: "Inter-High Arts Expo",
          category: "Creative Arts",
          participants: 58,
          status: "Planning" as const,
          leadTeacher: "Ms. Amrita S. Sher-Gil",
          startDate: "Jan 05",
          endDate: "Mar 20",
          location: "Arts Studio",
          targetGrades: "Grades 6-12"
        },
        {
          name: "National Coding Challenge",
          category: "Technology",
          participants: 32,
          status: "Active" as const,
          leadTeacher: "Mr. Satya Nadella",
          startDate: "Sep 20",
          endDate: "Nov 30",
          location: "Computer Lab 1",
          targetGrades: "Grade 12"
        },
        {
          name: "Annual Music Festival",
          category: "Arts & Culture",
          participants: 85,
          status: "Active" as const,
          leadTeacher: "Mrs. M.S. Subbulakshmi",
          startDate: "Nov 20",
          endDate: "Dec 22",
          location: "Open Theater",
          targetGrades: "All Grades"
        },
        {
          name: "Community Service Drive",
          category: "Social",
          participants: 200,
          status: "Completed" as const,
          leadTeacher: "Ms. Medha Patkar",
          startDate: "Aug 01",
          endDate: "Sep 30",
          location: "City Center",
          targetGrades: "Grades 10-12"
        }
      ];
    }
    return programsList.map((p) => ({
      name: p.name,
      category: p.description || "Academic Enrichment",
      participants: p.studentCount || 0,
      status: p.status === "ACTIVE" ? ("Active" as const) : ("Completed" as const),
      leadTeacher: `Credits: ${p.credits}`,
      startDate: "Oct 15",
      endDate: "Dec 10",
      location: "Main Campus",
      targetGrades: "Grades 9-12"
    }));
  }, [programsList]);

  const categories = ["All Categories", "Academic", "Sports", "Creative Arts", "Technology", "Arts & Culture", "Social"];

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === "All Categories" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden bg-[#FDFCFB] relative", !isHubChild && "h-screen")}>
      {!isHubChild && (
        <TopBar
          title="Programs"
          subtitle="Explore student enrichment and school initiatives"
          actions={
            <div className="flex gap-3">
              <PDSButton variant="secondary" icon="auto_graph">View Reports</PDSButton>
            </div>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-10 py-8">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 [&>*]:shadow-none">
            <StatCard label="Total Programs" value="12" icon="folder" iconBg="bg-blue-50" />
            <StatCard label="Active Now" value="08" icon="bolt" iconBg="bg-amber-50" />
            <StatCard label="Total Participants" value="540" icon="group" iconBg="bg-emerald-50" />
            <StatCard label="Next Milestone" value="In 2 Days" icon="event_upcoming" iconBg="bg-indigo-50" />
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-[350px]">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg">
                  search
                </span>
                <input
                  className="w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] pl-11 pr-4 h-10 text-[14px] font-medium text-foreground placeholder-[#B0AFA8] placeholder:font-medium focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white focus:shadow-none outline-none transition-all"
                  placeholder="Search programs by name or category..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <div className="w-full md:w-[240px]">
                <AppDropdown
                  icon="tune"
                  placeholder="Filter Category"
                  value={selectedCategory || "All Categories"}
                  onChange={setSelectedCategory}
                  options={categories}
                  height="h-10"
                />
              </div>
              <PDSButton
                variant="primary"
                size="md"
                className="hidden md:flex"
                icon="add_circle"
                onClick={() => navigate("/academics/programs/add")}
              >
                Create Program
              </PDSButton>
              <PDSButton
                variant="primary"
                size="md"
                className="md:hidden p-0 flex items-center justify-center shrink-0 w-10"
                icon="add_circle"
                onClick={() => navigate("/academics/programs/add")}
              />
            </div>
          </div>

          {/* Programs Grid */}
          <AnimatePresence mode="popLayout">
            {filteredPrograms.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {filteredPrograms.map((program, i) => (
                  <motion.div
                    key={program.name}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <ProgramCard {...program} index={i} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center"
              >
                <div className="size-20 rounded-[32px] bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] mb-6">
                  <span className="material-symbols-outlined text-[40px]">search_off</span>
                </div>
                <h4 className="text-[length:var(--font-size-h3)] font-bold text-foreground">No programs found</h4>
                <p className="text-[14px] font-medium text-[#B0AFA8] mt-1 max-w-xs">We couldn't find any programs matching your current search or filter criteria.</p>
                <PDSButton
                  variant="text"
                  className="mt-4"
                  onClick={() => { setSearchTerm(""); setSelectedCategory(null); }}
                >
                  Clear all filters
                </PDSButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
