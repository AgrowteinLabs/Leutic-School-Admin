import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";

export const StaffProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const staffMembers = [
    {
      name: "Dr. Lakshmi K.",
      id: "ST-1024-001",
      role: "Lead Teacher",
      department: "Mathematics",
      performance: 96,
      auraScore: 98.4,
      status: "Active",
      img: "/Avatar/Female Avatar Age35.png",
      email: "l.k@letuic.edu",
      joinDate: "July 2018",
    },
    {
      name: "Rishi K.",
      id: "ST-1024-042",
      role: "Senior Counselor",
      department: "Student Affairs",
      performance: 88,
      auraScore: 91.2,
      status: "Remote",
      img: "/Avatar/Male Avatar Age35.png",
      email: "r.k@letuic.edu",
      joinDate: "Aug 2020",
    },
    {
      name: "Dhanya S.",
      id: "ST-1024-118",
      role: "Science Head",
      department: "Natural Sciences",
      performance: 92,
      auraScore: 94.5,
      status: "Active",
      img: "/Avatar/Female Avatar Age38.png",
      email: "d.s@letuic.edu",
      joinDate: "June 2019",
    },
    {
      name: "Arvind S.",
      id: "ST-1024-085",
      role: "Department Lead",
      department: "History",
      performance: 79,
      auraScore: 82.2,
      status: "On Leave",
      img: "/Avatar/Male Avatar Age38.png",
      email: "a.s@letuic.edu",
      joinDate: "Jan 2017",
    },
  ];

  const staff =
    staffMembers.find((s) => s.id === id) ||
    staffMembers.find((s) => s.id === "ST-1024-001")!;

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-[#EAF2D7] text-[#2E7D32] border border-[#D9EA85]";
      case "on leave":
        return "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]";
      default:
        return "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FBFBFA] font-sans">
      <TopBar
        title="Faculty Profile"
        subtitle={`${staff.id} • ${staff.department}`}
        onBack={() => navigate(-1)}
        actions={
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 rounded-xl bg-white border border-slate-200 text-[#444441] text-[12px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit
            </button>
            <button className="h-9 px-4 rounded-xl bg-primary text-foreground text-[12px] font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Message
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
          
          {/* Compact Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group shrink-0">
              <div className="size-28 rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-slate-200/50">
                <img src={staff.img} className="size-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className={cn(
                "absolute -bottom-2 -right-2 size-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm",
                staff.status === "Active" ? "bg-green-500" : "bg-amber-500"
              )}>
                <span className="material-symbols-outlined text-white text-[12px] font-black">check</span>
              </div>
            </div>

            <div className="flex-1 py-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-brand-navy tracking-tight">{staff.name}</h1>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                  getStatusStyles(staff.status)
                )}>
                  {staff.status}
                </span>
              </div>
              <p className="text-[13px] font-bold text-muted-gray mb-6 flex items-center gap-2">
                {staff.role} <span className="size-1 rounded-full bg-slate-300" /> {staff.department}
              </p>

              <div className="flex flex-wrap gap-x-12 gap-y-4">
                {[
                  { label: "Performance", value: `${staff.performance}%`, icon: "trending_up", color: "text-green-600" },
                  { label: "Aura Score", value: staff.auraScore, icon: "verified", color: "text-primary" },
                  { label: "Workload", value: "24h / wk", icon: "schedule", color: "text-blue-600" },
                  { label: "Join Date", value: staff.joinDate, icon: "calendar_today", color: "text-slate-400" }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <span className={cn("material-symbols-outlined text-[18px]", stat.color)}>{stat.icon}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-gray/50 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                      <p className="text-[13px] font-black text-brand-navy leading-none">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Schedule & Details */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-[24px] border border-slate-100/60 overflow-hidden shadow-sm shadow-slate-100/20">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-brand-navy text-[20px]">calendar_view_week</span>
                    <h3 className="text-[14px] font-bold text-brand-navy">Instructional Schedule</h3>
                  </div>
                  <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline transition-all">Full View</button>
                </div>
                <div className="p-4 grid grid-cols-5 gap-3">
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, idx) => (
                    <div key={day} className="space-y-3">
                      <div className="text-center pb-2">
                        <span className="text-[9px] font-black text-muted-gray uppercase tracking-[0.2em]">{day}</span>
                      </div>
                      <div className="space-y-2">
                        {[1, 2].map(slot => (
                          <div key={slot} className={cn(
                            "group p-2.5 rounded-xl border transition-all cursor-pointer relative",
                            idx % 2 === 0 && slot === 1 
                              ? "bg-primary/5 border-primary/20 hover:bg-primary/10" 
                              : "bg-slate-50/50 border-slate-100 border-dashed hover:border-slate-200"
                          )}>
                            {idx % 2 === 0 && slot === 1 ? (
                              <>
                                <p className="text-[10px] font-black text-brand-navy leading-tight">GR-{10+idx}-A</p>
                                <p className="text-[8px] font-bold text-muted-gray mt-0.5">09:00 AM</p>
                              </>
                            ) : (
                              <div className="h-6 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[14px] text-slate-200 group-hover:text-slate-300 transition-colors">add</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Management Section */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-[24px] border border-slate-100/60 p-5 shadow-sm shadow-slate-100/20">
                  <h4 className="text-[12px] font-black text-brand-navy uppercase tracking-widest mb-4">Assigned Subjects</h4>
                  <div className="space-y-3">
                    {["Advanced Mathematics", "Quantum Mechanics", "Linear Algebra"].map((sub, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                        <span className="text-[12px] font-bold text-brand-navy">{sub}</span>
                        <span className="material-symbols-outlined text-[16px] text-slate-300">chevron_right</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-[24px] border border-slate-100/60 p-5 shadow-sm shadow-slate-100/20">
                  <h4 className="text-[12px] font-black text-brand-navy uppercase tracking-widest mb-4">Achievements</h4>
                  <div className="space-y-3">
                    {["Gold Star Educator '24", "Curriculum Innovator", "Perfect Attendance"].map((ach, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="size-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] filled">military_tech</span>
                        </div>
                        <span className="text-[12px] font-bold text-brand-navy">{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact & Insights */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#F7F8F4] rounded-[24px] border border-slate-100 p-6 space-y-6">
                <h3 className="text-[12px] font-black text-brand-navy uppercase tracking-widest">Personal Records</h3>
                <div className="space-y-4">
                  {[
                    { label: "Email Address", value: staff.email, icon: "alternate_email" },
                    { label: "Contact Primary", value: "+91 98765 43210", icon: "phone_iphone" },
                    { label: "Staff Identifier", value: staff.id, icon: "fingerprint" },
                    { label: "Employment Type", value: "Permanent Regular", icon: "badge" }
                  ].map((info, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[18px] text-muted-gray/40 mt-0.5">{info.icon}</span>
                      <div>
                        <p className="text-[9px] font-black text-muted-gray/40 uppercase tracking-[0.1em] mb-0.5">{info.label}</p>
                        <p className="text-[12px] font-bold text-brand-navy break-all">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100/60 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[12px] font-black text-brand-navy uppercase tracking-widest">Faculty Insights</h3>
                  <span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
                </div>
                <div className="space-y-4">
                  {[
                    "Maintains 98% laboratory session attendance.",
                    "Pioneered 'Interactive Geometry' for Grade 10.",
                    "High peer-rating in collaborative leadership."
                  ].map((insight, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="size-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p className="text-[12px] font-medium text-brand-navy/70 leading-relaxed italic">"{insight}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
