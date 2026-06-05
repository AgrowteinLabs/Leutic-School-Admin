import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { StatCard } from "../../../components/StatCard";
import { motion } from "framer-motion";
import { graphqlRequest } from "../../../lib/graphqlClient";

interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  targetRoles: string[];
  schoolId?: string;
  createdAt: string;
}

export const AnnouncementsPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        interface GetAnnouncementsResponse {
          announcements: AnnouncementRecord[];
        }
        const res = await graphqlRequest<GetAnnouncementsResponse>(`
          query GetAnnouncementsList {
            announcements {
              id
              title
              content
              targetRoles
              schoolId
              createdAt
            }
          }
        `);
        setAnnouncements(res.announcements || []);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === "published") {
      return matchesSearch;
    }
    if (activeFilter === "drafts" || activeFilter === "scheduled") {
      return false;
    }
    return matchesSearch;
  });

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden bg-white", !isHubChild && "h-screen")}>
      {!isHubChild && (
        <TopBar
          title="School Notices"
          subtitle="Official school broadcasts and engagement tracking"
          actions={
            <button
              onClick={() => navigate("/communications/announcements/add")}
              className="btn-primary h-10 px-6 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Post Announcement
            </button>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar py-8 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto space-y-10">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Engagement Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                label="Engagement rate"
                value="72%"
                icon="analytics"
                tooltip="Average percentage of users who clicked or interaction with the notification content."
              />
              <StatCard
                label="Delivery success"
                value="99.9%"
                icon="task_alt"
                iconBg="bg-green-50"
                tooltip="Percentage of notifications successfully pushed via App Notification and SMS bridge."
              />
              <StatCard
                label="Active drafts"
                value="0"
                icon="edit_document"
                tooltip="Notices currently being composed or pending approval before institutional release."
              />
            </div>

            {/* Filter & Table Container */}
            <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden">
              <div className="p-3 flex items-center gap-3 border-b border-slate-100/50 rounded-t-[24px] relative z-20">
                <div className="flex-1">
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg z-20">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search notices..."
                      className="input-base w-full pl-11 pr-4 placeholder:text-[#B0AFA8] placeholder:font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {["all", "published", "drafts", "scheduled"].map((filter) => {
                    const isActive = activeFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                          "px-5 py-2 text-[12px] font-bold transition-all rounded-xl capitalize border",
                          isActive
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white border-slate-100 text-[#B0AFA8] hover:text-foreground/70 hover:bg-slate-50",
                        )}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="border-b border-slate-100 bg-[#F7F8F4]/30">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Notice Detail</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Audience Scope</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-[12px] text-[#B0AFA8] font-bold">
                          Loading announcements...
                        </td>
                      </tr>
                    ) : filteredAnnouncements.length > 0 ? (
                      filteredAnnouncements.map((ann) => (
                        <tr key={ann.id} className="hover:bg-[#F7F8F4]/50 transition-colors group">
                          <td className="px-6 py-4 min-w-[320px]">
                            <div className="space-y-1">
                              <p className="text-[13px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{ann.title}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{ann.content}</p>
                              <div className="flex items-center gap-3 pt-0.5">
                                <span className="text-[10px] font-bold text-slate-400 tracking-tight">{ann.id.slice(0, 8)}</span>
                                <div className="size-1 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-bold text-slate-400 tracking-tight">
                                  {new Date(ann.createdAt).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" })}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {ann.targetRoles.map((v, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-full bg-slate-50 text-[10px] font-bold text-slate-500 border border-slate-100 transition-all group-hover:bg-white group-hover:border-slate-200 uppercase">
                                  {v}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="size-1.5 rounded-full bg-green-500" />
                              <span className="text-[12px] font-bold text-slate-600">Published</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="size-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
                              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-[12px] text-[#B0AFA8] font-bold">
                          No announcements found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
