import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";

export const ClassDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data fetching based on ID
  const classData = {
    grade: "Grade 10",
    section: id?.split("-")[1] || "B",
    room: "Room 304",
    teacher: "Mr. Marcus Roberts",
    avgParticipation: 94.2,
    attendanceRate: 98.5,
    activePrograms: 4,
    behaviorFlags: 2,
    students: [
      {
        name: "Alex Bennett",
        initials: "AB",
        participation: 95,
        auraScore: 842,
        status: "Good Standing",
        statusType: "normal" as const,
      },
      {
        name: "Chloe Hughes",
        initials: "CH",
        participation: 72,
        auraScore: 615,
        status: "Behavior Flag",
        statusType: "risk" as const,
      },
      {
        name: "Daniel Moore",
        initials: "DM",
        participation: 88,
        auraScore: 720,
        status: "Good Standing",
        statusType: "normal" as const,
      },
      {
        name: "Emily Stone",
        initials: "ES",
        participation: 45,
        auraScore: 340,
        status: "High Risk",
        statusType: "risk" as const,
      },
    ],
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title={`${classData.grade} - Section ${classData.section}`}
        subtitle={`Lead Teacher: ${classData.teacher} | ${classData.room}`}
        actions={
          <>
            <button className="btn-outline px-6 h-10 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined text-lg">edit</span>
              Manage Class
            </button>
            <button className="px-6 h-10 btn-primary rounded-[10px] text-[13px] font-semibold transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">mail</span>
              Message Parents
            </button>
          </>
        }
      />

      <div className="px-8 pt-6 pb-4 shrink-0 border-b border-slate-100">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-xs font-medium text-[#B0AFA8] capitalize tracking-wide">
              <button
                onClick={() => navigate("/classes")}
                className="hover:text-primary transition-colors"
              >
                Classes
              </button>
              <span className="material-symbols-outlined text-[10px]">
                chevron_right
              </span>
              <span className="text-[#444441]">
                {classData.grade}-{classData.section}
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mx-auto px-6 lg:px-10 py-6 max-w-[1400px] ">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Avg Participation",
              value: `${classData.avgParticipation}%`,
              icon: "equalizer",
              trend: "+1.2% this week",
              trendType: "up" as const,
            },
            {
              label: "Attendance Rate",
              value: `${classData.attendanceRate}%`,
              icon: "calendar_check",
            },
            {
              label: "Active Programs",
              value: String(classData.activePrograms).padStart(2, "0"),
              icon: "assignment",
            },
            {
              label: "Behavior Flags",
              value: String(classData.behaviorFlags).padStart(2, "0"),
              icon: "flag",
              trend: "Action required for 1",
              trendType: "down" as const,
              iconBg: "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]",
            },
          ].map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <h2 className="text-foreground text-[16px] font-bold tracking-tight">
                    Students in Class
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#F7F8F4] border border-slate-100 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider">
                    {classData.students.length} Total
                  </span>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-sm">
                    search
                  </span>
                  <input
                    className="pl-9 pr-4 h-9 text-xs border border-slate-100 rounded-[10px] bg-[#F7F8F4]/50 focus:ring-2 focus:ring-primary/20 w-64 outline-none transition-all focus:bg-white"
                    placeholder="Search students..."
                    type="text"
                  />
                </div>
              </div>
              {/* Column Headers */}
              <div className="flex items-center gap-8 px-8 py-3 text-[10px] font-extrabold text-[#B0AFA8] uppercase tracking-[0.15em]">
                <div className="flex-1">Student Profile</div>
                <div className="w-[180px] px-6">Participation</div>
                <div className="w-24 text-center">Aura</div>
                <div className="w-32">Standing</div>
                <div className="w-10"></div>
              </div>

              <div className="px-4 pb-4 pt-1 space-y-3">
                {classData.students.map((student, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-8 p-5 rounded-[22px] bg-white border border-slate-100 hover:border-primary/30 hover:bg-[#F7F8F4]/20 transition-all duration-500 cursor-pointer group"
                  >
                    {/* Student Identity */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative size-12 shrink-0">
                        <div className="absolute inset-0 rounded-2xl bg-primary/10 group-hover:scale-110 transition-transform duration-500" />
                        <div 
                          className="absolute inset-0 rounded-2xl bg-cover bg-center border-2 border-white shadow-sm z-10"
                          style={{ backgroundImage: `url("https://images.unsplash.com/photo-${i % 2 === 0 ? '1531123897727-8f129e16fd3c' : '1507003211169-0a1dd7228f2d'}?w=200&h=200&fit=crop")` }}
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                          {student.name}
                        </span>
                        <span className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest leading-none">ST-2024-0{i+1}</span>
                      </div>
                    </div>

                    {/* Participation Gauge */}
                    <div className="flex items-center gap-4 w-[180px] px-6 border-x border-slate-50/50">
                        <div className="relative size-10 shrink-0">
                            <svg className="size-full -rotate-90">
                                <circle cx="20" cy="20" r="17" fill="none" strokeWidth="2.5" stroke="#F7F8F4" />
                                <circle cx="20" cy="20" r="17" fill="none" strokeWidth="2.5"
                                    strokeDasharray={2 * Math.PI * 17}
                                    strokeDashoffset={2 * Math.PI * 17 * (1 - student.participation / 100)}
                                    stroke={student.participation > 80 ? "#2E7D32" : student.participation > 60 ? "#EF9800" : "#E63535"}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[9px] font-black text-foreground">{student.participation}%</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wide">
                          {student.participation > 85 ? "Exceptional" : student.participation > 70 ? "Consistent" : "Developing"}
                        </span>
                    </div>

                    {/* Aura Score */}
                    <div className="flex flex-col items-center w-24">
                        <span className="text-[14px] font-semibold text-foreground">
                          {student.auraScore}
                        </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center w-32">
                        <span
                          className={cn(
                            "inline-flex items-center px-4 py-1 rounded-full text-[9px] font-black capitalize border tracking-tight",
                            student.statusType === "normal"
                              ? "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]"
                              : "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]",
                          )}
                        >
                          {student.status}
                        </span>
                    </div>

                    {/* Action */}
                    <button className="size-9 rounded-xl bg-[#F7F8F4] border border-slate-100 text-[#B0AFA8] hover:text-foreground hover:bg-white transition-all flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-[#F7F8F4]/50 border-t border-slate-50 flex justify-center">
                <button className="text-xs font-medium text-[#3D6B2C] hover:text-foreground capitalize  transition-colors">
                  Load More Students
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <h2 className="text-foreground text-[15px] font-bold tracking-tight mb-6 pl-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">history</span>
              Class Activity
            </h2>
            <div className="relative pl-4 space-y-8">
              {/* Vertical Timeline Line */}
              <div className="absolute left-[27px] top-2 bottom-2 w-[1px] bg-slate-100" />

              {[
                {
                  type: "Curriculum",
                  title: "Assignment Published",
                  msg: "Unit 4: Modern History essays assigned to all students.",
                  time: "1h ago",
                  icon: "inventory",
                  color: "bg-[#EAF2D7] text-[#2E7D32]",
                },
                {
                  type: "Programs",
                  title: "Science Fair Entries",
                  msg: "12 students from 10-B registered for the Regional Science Fair.",
                  time: "4h ago",
                  icon: "groups",
                  color: "bg-[#F7F8F4] text-[#444441]",
                },
                {
                  type: "Alert",
                  title: "Absence Threshold",
                  msg: "Emily Stone has reached 5 consecutive absences.",
                  time: "Yesterday",
                  icon: "notification_important",
                  color: "bg-red-50 text-red-600",
                  action: "Contact Guardian",
                },
                {
                  type: "Staff Note",
                  title: "Substitute Scheduled",
                  msg: "Ms. Vance will cover the afternoon session on Oct 26.",
                  time: "2d ago",
                  icon: "forum",
                  color: "bg-[#F7F8F4] text-[#444441]",
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="relative flex items-start gap-6 group cursor-pointer"
                >
                  {/* Timeline Dot/Icon */}
                  <div
                    className={cn(
                      "size-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm transition-transform group-hover:scale-110",
                      activity.color
                    )}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {activity.icon}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0 -mt-0.5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#B0AFA8]">
                        {activity.type}
                      </span>
                      <span className="text-[10px] font-medium text-[#B0AFA8]">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-[13px] font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-[12px] text-[#444441] leading-relaxed opacity-80 mb-2">
                      {activity.msg}
                    </p>
                    {activity.action && (
                      <button className="text-[11px] font-bold text-primary uppercase tracking-wider hover:underline text-left">
                        {activity.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
