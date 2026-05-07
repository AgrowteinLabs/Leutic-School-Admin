import { useEffect, useState } from "react";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { StatCard } from "../../../components/StatCard";
import { Send, X, Globe, Eye, ShieldCheck, Mail } from "lucide-react";

export const AnnouncementsPage = ({ isHubChild, forceCompose }: { isHubChild?: boolean, forceCompose?: number }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (forceCompose && forceCompose > 0) {
      setIsComposing(true);
    }
  }, [forceCompose]);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    visibility: "Parents",
    target: "All Grades"
  });

  const announcements = [
    {
      id: "ANN-2024-001",
      title: "Quarterly Parent-Teacher Meeting",
      content:
        "The quarterly PTM is scheduled for next Friday. All parents are requested to attend to discuss terminal results.",
      visibility: "Parents",
      target: "All Grades",
      date: "Oct 24, 2024",
      status: "Delivered",
      engagement: "84%",
    },
    {
      id: "ANN-2024-002",
      title: "New Science Lab Safety Protocols",
      content:
        "Important updates to lab safety procedures. Mandatory review for all science faculty and students.",
      visibility: "Teachers, Students",
      target: "Science Dept",
      date: "Oct 22, 2024",
      status: "Delivered",
      engagement: "92%",
    },
    {
      id: "ANN-2024-003",
      title: "Annual Sports Day Volunteer Signup",
      content:
        "Students interested in volunteering for the Annual Sports Day can now register via the portal.",
      visibility: "Students",
      target: "High School",
      date: "Oct 20, 2024",
      status: "Draft",
      engagement: "-",
    },
  ];

  const handlePost = () => {
    // Demonstrate success
    setIsComposing(false);
    setNewNotice({ title: "", content: "", visibility: "Parents", target: "All Grades" });
  };

  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden bg-white",
        !isHubChild && "h-screen",
      )}
    >
      {!isHubChild && (
        <TopBar
          title={isComposing ? "Draft Institutional Notice" : "School Notices"}
          subtitle={isComposing ? "Compose a new school-wide broadcast" : "Official school broadcasts and engagement tracking"}
          actions={
            !isComposing && (
              <button 
                onClick={() => setIsComposing(true)}
                className="btn-primary h-10 px-6 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/10"
              >
                <PlusIcon className="size-4" />
                Post Announcement
              </button>
            )
          }
        />
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar mx-auto px-6 lg:px-10 py-10 max-w-[1400px] space-y-10">
        
        {!isComposing ? (
          <>
            {/* Engagement Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                label="Avg. Engagement"
                value="72%"
                icon="visibility"
                tooltip="Average percentage of users who clicked or interaction with the notification content."
              />
              <StatCard 
                label="Delivery Success"
                value="99.9%"
                icon="check_circle"
                iconBg="bg-[#EAF2D7] text-[#2E7D32]"
                tooltip="Percentage of notifications successfully pushed via App Notification and SMS bridge."
              />
              <StatCard 
                label="Active Drafts"
                value="04"
                icon="edit_note"
                tooltip="Notices currently being composed or pending approval before institutional release."
              />
            </div>

            {/* Announcements List Container */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/30 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <div className="flex bg-[#F7F8F4] p-1 rounded-xl border border-slate-100">
                  {["all", "published", "drafts", "scheduled"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        "px-6 py-2 text-[12px] font-bold transition-all rounded-lg capitalize",
                        activeFilter === filter
                          ? "bg-white text-foreground shadow-sm border border-slate-100"
                          : "text-[#B0AFA8] hover:text-foreground",
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto px-2 pb-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-slate-50">
                      <th className="px-6 py-5 text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Notice Subject</th>
                      <th className="px-6 py-5 text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Audience</th>
                      <th className="px-6 py-5 text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Scope</th>
                      <th className="px-6 py-5 text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest">Engagement</th>
                      <th className="px-6 py-5 text-[11px] font-black text-[#B0AFA8] uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {announcements.map((ann) => (
                      <tr key={ann.id} className="hover:bg-[#F7F8F4] transition-colors group">
                        <td className="px-6 py-6 max-w-sm">
                          <p className="text-[14px] font-bold text-foreground mb-1.5">{ann.title}</p>
                          <p className="text-xs text-[#444441] line-clamp-1 leading-relaxed">{ann.content}</p>
                          <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-[#B0AFA8] italic tracking-tight">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {ann.date} • {ann.id}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-wrap gap-2">
                            {ann.visibility.split(", ").map((v, i) => (
                              <span key={i} className="text-[10px] font-bold px-3 py-1 rounded-lg bg-secondary/5 text-foreground/60 border border-secondary/10 uppercase tracking-tighter">
                                {v}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-6 text-xs font-bold text-[#444441] italic uppercase tracking-tighter">
                          {ann.target}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-[#F0F0EC] rounded-full overflow-hidden">
                              <div className="h-full bg-primary shadow-sm" style={{ width: ann.engagement === "-" ? "0%" : ann.engagement }} />
                            </div>
                            <span className="text-[11px] font-black text-foreground">{ann.engagement}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button className="size-9 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-[#B0AFA8] hover:text-primary hover:border-primary/20 transition-all shadow-sm">
                            <ArrowRightIcon className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Compose Mode: New Notice Form */
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-[#F7F8F4]/50">
                 <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h3 className="text-foreground font-bold text-base">New Announcement</h3>
                        <p className="text-[11px] font-medium text-[#B0AFA8]">Drafting institutional broadcast</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setIsComposing(false)}
                  className="size-10 rounded-2xl bg-[#F7F8F4] hover:bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] transition-colors"
                 >
                    <X size={18} />
                 </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#B0AFA8] uppercase tracking-widest ml-1">Notice Title / Subject</label>
                    <input 
                        type="text"
                        placeholder="e.g. Science Lab Maintenance Updates..."
                        className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-semibold text-foreground placeholder:text-[#B0AFA8] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={newNotice.title}
                        onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#B0AFA8] uppercase tracking-widest ml-1">Primary Audience</label>
                        <select 
                            className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-semibold text-foreground appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                            value={newNotice.visibility}
                            onChange={(e) => setNewNotice({...newNotice, visibility: e.target.value})}
                        >
                            <option>Parents</option>
                            <option>Students</option>
                            <option>Staff & Faculty</option>
                            <option>All Institutional</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#B0AFA8] uppercase tracking-widest ml-1">Scope / Grade</label>
                        <select 
                            className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-semibold text-foreground appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                            value={newNotice.target}
                            onChange={(e) => setNewNotice({...newNotice, target: e.target.value})}
                        >
                            <option>All Grades</option>
                            <option>High School Only</option>
                            <option>Grade 10 & 11</option>
                            <option>Specific Dept Only</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#B0AFA8] uppercase tracking-widest ml-1">Content / Message Body</label>
                    <textarea 
                        rows={6}
                        placeholder="Detail the announcement here. Parents will receive this via the mobile app portal..."
                        className="w-full bg-[#F7F8F4] border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium text-[#444441] placeholder:text-[#B0AFA8] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
                        value={newNotice.content}
                        onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                    ></textarea>
                </div>

                <div className="bg-[#FEF3C7]/50 p-5 rounded-2xl border border-[#FDE68A] flex items-start gap-4">
                    <ShieldCheck size={20} className="text-[#B45309] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#B45309] uppercase tracking-widest">Post Verification Notice</p>
                        <p className="text-[12px] text-[#B45309]/70 font-medium leading-relaxed italic">This notice will be logged under your digital signature (Principal) and distributed instantly to {newNotice.visibility}.</p>
                    </div>
                </div>
              </div>

              <div className="p-8 bg-[#F7F8F4] border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[#B0AFA8]">
                        <Mail size={16} />
                        <span className="text-[11px] font-bold">Email Copy</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                        <Eye size={16} />
                        <span className="text-[11px] font-bold">Visibility Check Active</span>
                    </div>
                </div>
                <button 
                  onClick={handlePost}
                  className="bg-secondary text-white px-8 py-4 rounded-2xl text-[14px] font-bold flex items-center gap-3 hover:bg-primary hover:text-foreground transition-all shadow-xl shadow-secondary/10 active:scale-[0.98]"
                >
                    <Send size={18} fill="currentColor" strokeWidth={0} />
                    Finalize & Post
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Internal Icons for clean UI
const PlusIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ArrowRightIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);
