import { TopBar } from "../../../components/Header";
import { ProgramCard } from "../components/ProgramCard";
import { cn } from "../../../lib/utils";
import { StatCard } from "../../../components/StatCard";

export const ProgramsPage = ({ isHubChild }: { isHubChild?: boolean }) => {
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
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden bg-white",
        !isHubChild && "h-screen",
      )}
    >
      {!isHubChild && (
        <TopBar
          title="Programs"
          subtitle="Explore student enrichment and school initiatives"
          actions={
            <>
              <button className="px-4 py-2 bg-white border border-slate-100 rounded-xl flex items-center gap-2 text-[13px] font-semibold text-[#444441] hover:bg-[#F7F8F4] transition-colors">
                <span className="material-symbols-outlined text-lg">
                  auto_graph
                </span>
                View Reports
              </button>
              <button className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2  transition-all shadow-sm shadow-slate-100/30">
                <span className="material-symbols-outlined text-sm">
                  add_circle
                </span>
                Create Program
              </button>
            </>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto mx-auto px-6 lg:px-10 py-6 max-w-[1400px] space-y-8">
        {/* Filters and Stats Summary */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Programs"
              value="12"
              icon="folder"
            />
            <StatCard
              label="Active Now"
              value="8"
              icon="bolt"
            />
            <StatCard
              label="Total Participants"
              value="540"
              icon="group"
            />
            <StatCard
              label="Avg. Completion"
              value="64%"
              icon="donut_large"
            />
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/30 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px]">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-foreground transition-colors">
                  search
                </span>
                <input
                  className="w-full bg-[#F7F8F4] border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary text-foreground placeholder-[#B0AFA8]"
                  placeholder="Search programs..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-white border border-slate-100 rounded-xl text-sm px-3 py-2 text-foreground font-bold focus:ring-primary outline-none">
                <option>All Categories</option>
                <option>Academic</option>
                <option>Sports</option>
                <option>Creative Arts</option>
                <option>Technology</option>
              </select>
              <select className="bg-white border border-slate-100 rounded-xl text-sm px-3 py-2 text-foreground font-bold focus:ring-primary outline-none">
                <option>Status</option>
                <option>Active</option>
                <option>Planning</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {programs.map((program, i) => (
            <ProgramCard key={i} {...program} onClick={() => { }} />
          ))}
        </div>
      </div>
    </div>
  );
};
