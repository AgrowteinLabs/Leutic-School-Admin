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
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white font-sans">
      <TopBar
        title="Faculty Profile"
        subtitle="Manage professional records, performance metrics and schedule"
        onBack={() => navigate(-1)}
        actions={
          <div className="flex items-center gap-3">
            <button className="h-10 px-5 rounded-[10px] bg-white border border-slate-100 text-[#444441] text-[13px] font-bold flex items-center gap-2 hover:bg-[#F7F8F4] transition-all shadow-sm shadow-slate-100/20">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </button>
            <button className="h-10 px-5 rounded-[10px] bg-primary text-foreground text-[13px] font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Send Message
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 no-scrollbar">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Hero Profile Section */}
          <div className="bg-[#F7F8F4] rounded-[32px] p-8 border border-slate-100 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest",
                getStatusStyles(staff.status)
              )}>
                {staff.status}
              </span>
            </div>
            
            <div
              className="size-32 rounded-[24px] bg-cover bg-center border-[4px] border-white shadow-xl shadow-slate-200/50 shrink-0"
              style={{ backgroundImage: `url("${staff.img}")` }}
            ></div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">{staff.name}</h1>
                <p className="text-[14px] font-bold text-[#B0AFA8] flex items-center gap-2">
                  {staff.role} • {staff.department} 
                  <span className="size-1 bg-[#B0AFA8] rounded-full"></span>
                  ID: {staff.id}
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-white/50">
                <div>
                  <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-1.5">Official Email</p>
                  <p className="text-[13px] font-bold text-foreground truncate">{staff.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-1.5">Phone Number</p>
                  <p className="text-[13px] font-bold text-foreground">+91 98765 43210</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-1.5">Join Date</p>
                  <p className="text-[13px] font-bold text-foreground">{staff.joinDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-1.5">Contract Type</p>
                  <p className="text-[13px] font-bold text-foreground">Full-time Regular</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-100 rounded-[28px] p-6 space-y-4 hover:shadow-xl hover:shadow-slate-100/50 transition-all group">
              <div className="flex justify-between items-center">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">star</span>
                </div>
                <span className="text-[11px] font-bold text-[#2E7D32] bg-[#EAF2D7] px-2 py-1 rounded-lg">Top 5% Faculty</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest">Student Feedback</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <h4 className="text-3xl font-black text-foreground">{(staff.performance / 20).toFixed(1)}</h4>
                  <span className="text-sm font-bold text-[#B0AFA8]">/ 5.0</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[28px] p-6 space-y-4 hover:shadow-xl hover:shadow-slate-100/50 transition-all">
              <div className="flex justify-between items-center">
                <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest">Weekly Workload</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <h4 className="text-3xl font-black text-foreground">24</h4>
                  <span className="text-sm font-bold text-[#B0AFA8]">Hours / week</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[28px] p-6 space-y-4 hover:shadow-xl hover:shadow-slate-100/50 transition-all">
              <div className="flex justify-between items-center">
                <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest">Classes Assigned</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <h4 className="text-3xl font-black text-foreground">12</h4>
                  <span className="text-sm font-bold text-[#B0AFA8]">Total Sections</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Performance Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm shadow-slate-100/30">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#F7F8F4]/30">
                  <h3 className="text-[15px] font-bold text-foreground">Weekly Instructional Schedule</h3>
                  <button className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider">View Full Calendar</button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-5 gap-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                      <div key={day} className="space-y-4">
                        <div className="py-2 text-center border-b border-slate-50">
                          <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest">{day}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="h-[70px] rounded-2xl bg-primary/5 border border-primary/10 p-2 relative overflow-hidden group cursor-pointer hover:bg-primary/10 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                            <p className="text-[10px] font-bold text-foreground leading-tight">Grade 10-A</p>
                            <p className="text-[9px] font-medium text-[#B0AFA8] mt-0.5">09:00 - 10:00</p>
                          </div>
                          <div className="h-[70px] rounded-2xl bg-slate-50/50 border border-slate-100 border-dashed"></div>
                          <div className="h-[70px] rounded-2xl bg-secondary/5 border border-secondary/10 p-2 relative overflow-hidden group cursor-pointer hover:bg-secondary/10 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                            <p className="text-[10px] font-bold text-foreground leading-tight">Grade 12-C</p>
                            <p className="text-[9px] font-medium text-[#B0AFA8] mt-0.5">11:30 - 12:30</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-6 shadow-sm shadow-slate-100/30">
                <h3 className="text-[15px] font-bold text-foreground">Faculty Insights</h3>
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                    <p className="text-[13px] text-[#444441] leading-relaxed">
                      Maintains an exceptional <strong>98% attendance</strong> rate for all assigned laboratory sessions.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="size-1.5 rounded-full bg-secondary mt-1.5 shrink-0"></div>
                    <p className="text-[13px] text-[#444441] leading-relaxed">
                      Successfully pioneered the new <strong>Interactive Geometry</strong> module for Grade 10 students.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="size-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                    <p className="text-[13px] text-[#444441] leading-relaxed">
                      Peer feedback highlights strong <strong>collaborative leadership</strong> in the Mathematics department.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
