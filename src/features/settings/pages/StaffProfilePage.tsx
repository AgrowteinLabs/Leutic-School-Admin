import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../../../components/Header";

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
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
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
      img: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop",
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
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
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
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      email: "a.s@letuic.edu",
      joinDate: "Jan 2017",
    },
  ];

  const staff =
    staffMembers.find((s) => s.id === id) ||
    staffMembers.find((s) => s.id === "ST-1024-001")!;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title={staff.name}
        subtitle={`${staff.role} • ${staff.department} | Staff ID: ${staff.id}`}
        onBack={() => navigate(-1)}
        actions={
          <div className="flex items-center gap-3">
            <button className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2  transition-all shadow-sm shadow-slate-100/30">
              <span className="material-symbols-outlined text-sm">mail</span>
              Message
            </button>
            <button className="bg-secondary text-white px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2  transition-all shadow-sm shadow-slate-100/30">
              <span className="material-symbols-outlined text-sm">
                settings
              </span>
              Manage
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto mx-auto px-6 lg:px-10 py-6 max-w-[1400px] space-y-8">
        {/* Profile Card */}
        <div className="flex flex-col md:flex-row gap-8 items-center border-b border-slate-100 pb-8">
          <div
            className="size-24 rounded-2xl bg-cover bg-center border border-slate-100 shrink-0 shadow-sm shadow-slate-100/30"
            style={{ backgroundImage: `url("${staff.img}")` }}
          ></div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 bg-secondary/10 text-foreground border border-secondary text-xs font-medium rounded capitalize border border-white/10">
                {staff.status}
              </span>
              <p className="text-[#444441] text-[13px] font-medium">
                Joined: {staff.joinDate}
              </p>
            </div>
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-[11px] font-bold text-[#444441] uppercase tracking-wider mb-1">
                  Email Address
                </p>
                <p className="text-[13px] font-semibold text-foreground">
                  {staff.email}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#444441] uppercase tracking-wider mb-1">
                  Phone
                </p>
                <p className="text-[13px] font-semibold text-foreground">
                  +91 98765 43210
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 shadow-sm shadow-slate-100/30">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[#444441] text-xs font-medium capitalize">
                Performance
              </p>
              <span className="material-symbols-outlined text-[#B0AFA8]">
                trending_up
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-foreground tracking-tighter">
                {staff.performance}%
              </p>
              <p className="text-xs font-medium btn-primary px-3 py-1 rounded-full border border-slate-50 capitalize">
                Top 5%
              </p>
            </div>
          </div>

          <div className="bg-[#F7F8F4] border border-slate-100 rounded-2xl p-6 shadow-sm shadow-slate-100/30">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[#444441] text-xs font-medium capitalize">
                Aura Score
              </p>
              <span className="material-symbols-outlined text-[#B0AFA8]">
                auto_awesome
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-foreground tracking-tighter">
                {staff.auraScore}
              </p>
            </div>
          </div>

          <div className="bg-[#F7F8F4] border border-slate-100 rounded-2xl p-6 shadow-sm shadow-slate-100/30">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[#444441] text-xs font-medium capitalize">
                Classes Handled
              </p>
              <span className="material-symbols-outlined text-[#B0AFA8]">
                groups
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-foreground tracking-tighter">
                12
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Placeholder */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/30 overflow-hidden p-6">
          <h3 className="text-foreground text-[16px] font-semibold tracking-tight mb-6">
            Weekly Schedule
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
              <div key={day} className="space-y-3">
                <p className="text-[11px] font-bold text-[#444441] uppercase tracking-wider text-center">
                  {day}
                </p>
                <div className="p-3 rounded-xl bg-[#F7F8F4] space-y-2">
                  <div className="h-8 bg-primary/20 rounded border border-primary/30"></div>
                  <div className="h-8 bg-[#F7F8F4] rounded"></div>
                  <div className="h-8 bg-primary/20 rounded border border-primary/30"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
