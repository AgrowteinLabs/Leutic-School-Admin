import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { StatCard } from "../../../components/StatCard";
import { motion } from "framer-motion";

export const AnnouncementsPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  const announcements = [
    {
      id: "ANN-2024-001",
      title: "Quarterly Parent-Teacher Meeting",
      content: "The quarterly PTM is scheduled for next Friday. All parents are requested to attend to discuss terminal results.",
      visibility: "Parents",
      target: "All Grades",
      date: "Oct 24, 2024",
      status: "Published",
      engagement: "84%",
    },
    {
      id: "ANN-2024-002",
      title: "New Science Lab Safety Protocols",
      content: "Important updates to lab safety procedures. Mandatory review for all science faculty and students.",
      visibility: "Teachers, Students",
      target: "Science Dept",
      date: "Oct 22, 2024",
      status: "Published",
      engagement: "92%",
    },
    {
      id: "ANN-2024-003",
      title: "Annual Sports Day Volunteer Signup",
      content: "Students interested in volunteering for the Annual Sports Day can now register via the portal.",
      visibility: "Students",
      target: "High School",
      date: "Oct 20, 2024",
      status: "Draft",
      engagement: "-",
    },
    {
      id: "ANN-2024-004",
      title: "Inter-School Debate Championship",
      content: "Call for participants for the upcoming regional debate championship. Auditions on Monday.",
      visibility: "Students",
      target: "Grades 9-12",
      date: "Oct 18, 2024",
      status: "Scheduled",
      engagement: "-",
    },
  ];

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
                value="04"
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
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">Performance</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {announcements.map((ann) => (
                      <tr key={ann.id} className="hover:bg-[#F7F8F4]/50 transition-colors group">
                        <td className="px-6 py-4 min-w-[320px]">
                          <div className="space-y-1">
                            <p className="text-[13px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{ann.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{ann.content}</p>
                            <div className="flex items-center gap-3 pt-0.5">
                              <span className="text-[10px] font-bold text-slate-400 tracking-tight">{ann.id}</span>
                              <div className="size-1 rounded-full bg-slate-200" />
                              <span className="text-[10px] font-bold text-slate-400 tracking-tight">{ann.date}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {ann.visibility.split(", ").map((v, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-full bg-slate-50 text-[10px] font-bold text-slate-500 border border-slate-100 transition-all group-hover:bg-white group-hover:border-slate-200">
                                {v}
                              </span>
                            ))}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 text-[10px] font-bold text-primary border border-primary/10">
                              <span className="size-1 rounded-full bg-primary" />
                              {ann.target}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "size-1.5 rounded-full",
                              ann.status === "Published" ? "bg-green-500" : ann.status === "Scheduled" ? "bg-blue-400" : "bg-slate-300"
                            )} />
                            <span className="text-[12px] font-bold text-slate-600">{ann.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {ann.engagement !== "-" ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-600">{ann.engagement} read</span>
                              </div>
                              <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: ann.engagement }}
                                  className="h-full bg-primary"
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400 italic">Pending launch</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="size-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                          </button>
                        </td>
                      </tr>
                    ))}
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
