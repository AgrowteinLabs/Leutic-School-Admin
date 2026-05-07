import { useState } from "react";
import { TopBar } from "../../../components/Header";
import { ProgramCard } from "../components/ProgramCard";
import { cn } from "../../../lib/utils";
import { StatCard } from "../../../components/StatCard";

export const ProgramsPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const programs = [
    {
      name: "Regional Science Fair 2024",
      category: "Academic",
      participants: 45,
      status: "Active" as const,
      progress: 75,
      leadTeacher: "Dr. Sunitha V.",
      startDate: "Oct 15",
      endDate: "Dec 10",
    },
    {
      name: "District Athletics League",
      category: "Sports",
      participants: 120,
      status: "Warning" as const,
      progress: 42,
      leadTeacher: "Coach Sreekumar",
      startDate: "Nov 01",
      endDate: "Feb 15",
    },
    {
      name: "Inter-High Arts Expo",
      category: "Creative Arts",
      participants: 58,
      status: "Planning" as const,
      progress: 15,
      leadTeacher: "Ms. Amrita S. Sher-Gil",
      startDate: "Jan 05",
      endDate: "Mar 20",
    },
    {
      name: "National Coding Challenge",
      category: "Technology",
      participants: 32,
      status: "Active" as const,
      progress: 88,
      leadTeacher: "Mr. Satya Nadella",
      startDate: "Sep 20",
      endDate: "Nov 30",
    },
    {
      name: "Annual Music Festival",
      category: "Arts & Culture",
      participants: 85,
      status: "Active" as const,
      progress: 60,
      leadTeacher: "Mrs. M.S. Subbulakshmi",
      startDate: "Nov 20",
      endDate: "Dec 22",
    },
    {
      name: "Community Service Drive",
      category: "Social",
      participants: 200,
      status: "Completed" as const,
      progress: 100,
      leadTeacher: "Ms. Medha Patkar",
      startDate: "Aug 01",
      endDate: "Sep 30",
    },
  ];

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden bg-[#FDFCFB] relative", !isHubChild && "h-screen")}>
      {!isHubChild && (
        <TopBar
          title="Programs"
          subtitle="Explore student enrichment and school initiatives"
          actions={
            <div className="flex gap-3">
              <button className="btn-secondary h-11 px-6 rounded-[14px] text-[13px] font-bold flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-[20px]">auto_graph</span>
                View Reports
              </button>
              <button className="btn-primary h-11 px-6 rounded-[14px] text-[13px] font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Create Program
              </button>
            </div>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-10 py-8">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Filters and Stats Summary */}
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 [&>*]:shadow-none">
              <StatCard label="Total Programs" value="12" icon="folder" iconBg="bg-blue-50" />
              <StatCard label="Active Now" value="8" icon="bolt" iconBg="bg-amber-50" />
              <StatCard label="Total Participants" value="540" icon="group" iconBg="bg-emerald-50" />
              <StatCard label="Next Milestone" value="In 2 Days" icon="event_upcoming" iconBg="bg-indigo-50" />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md group">
                <div className="absolute inset-0 bg-white border border-slate-100 rounded-[14px] transition-all group-focus-within:border-primary/50 group-focus-within:ring-4 group-focus-within:ring-primary/5" />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-[20px] z-10">search</span>
                <input
                  type="text"
                  placeholder="Search programs or categories..."
                  className="w-full h-11 bg-transparent pl-12 pr-4 text-[13px] font-semibold text-foreground outline-none relative z-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="h-11 px-5 rounded-[14px] bg-white border border-slate-100 text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  Categories
                </button>
              </div>
            </div>
          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {programs
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((program, i) => (
                <ProgramCard key={i} {...program} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
