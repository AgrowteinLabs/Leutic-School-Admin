import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { graphqlRequest } from "../../../lib/graphqlClient";

interface StaffDetails {
  uid: string;
  name: string;
  id: string;
  role: string;
  department: string;
  performance: number;
  auraScore: number;
  status: string;
  img: string;
  email: string;
  mobile: string;
  address: string;
  joinDate: string;
  assignedClasses: string[];
  scheduleSlots: Array<{
    id: string;
    dayOfWeek: string;
    slotIndex: number;
    classLabel: string;
    startTime: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    badgeIcon?: string;
  }>;
  facultyInsights: string[];
}

interface GraphQLUser {
  id: string;
  role: string;
  name: string;
  email?: string;
  mobileNo?: string;
  schoolId?: string;
  address?: string;
  staffStatus?: string;
  classIds?: string[];
  createdAt: string;
  employeeId?: string;
  designation?: string;
  department?: string;
  performance?: number;
  auraScore?: number;
  feedbackScore?: number;
  timetableSlots?: Array<{
    id: string;
    classId: string;
    day: string;
    period: number;
    subjectName: string;
    startTime?: string;
    endTime?: string;
  }>;
  achievements?: Array<{
    id: string;
    title: string;
    badgeIcon?: string;
  }>;
  facultyInsights?: string[];
}

interface ClassItem {
  id: string;
  grade: string;
  section: string;
}

export const StaffProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [staffDetails, setStaffDetails] = useState<StaffDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      const schoolId = localStorage.getItem("school_id") || "";

      const userQuery = `
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            role
            name
            email
            mobileNo
            schoolId
            address
            staffStatus
            classIds
            createdAt
            employeeId
            designation
            department
            performance
            auraScore
            feedbackScore
            timetableSlots {
              id
              classId
              day
              period
              subjectName
              startTime
              endTime
            }
            achievements {
              id
              title
              badgeIcon
            }
            facultyInsights
          }
        }
      `;

      const classesQuery = `
        query GetClassesForStaff($schoolId: String!) {
          classes(filter: { schoolId: $schoolId }, page: 1, pageSize: 100) {
            items {
              id
              grade
              section
            }
          }
        }
      `;

      try {
        const [userRes, classesRes] = await Promise.all([
          graphqlRequest<{ user: GraphQLUser }>(userQuery, { id }),
          graphqlRequest<{ classes: { items: ClassItem[] } }>(classesQuery, { schoolId })
        ]);

        const user = userRes.user;
        const classes = classesRes.classes.items;

        if (!user) {
          setError("User not found");
          setIsLoading(false);
          return;
        }

        let cleanAddress = "";
        let department = "";

        if (user.address) {
          const parts = user.address.split("|");
          const deptPart = parts.find((p) => p.startsWith("Dept:"));
          if (deptPart) {
            department = deptPart.replace("Dept:", "").trim();
          }
          cleanAddress = parts.filter((p) => !p.startsWith("Dept:")).join(" | ");
        } else {
          const depts = ["Mathematics", "Natural Sciences", "History", "Languages", "Administration"];
          department = depts[(user.name.codePointAt(0) || 0) % depts.length];
        }

        const assignedClassIds = user.classIds || [];
        const assignedClassNames = classes
          .filter(c => assignedClassIds.includes(c.id))
          .map(c => `${c.grade}-${c.section}`);

        const classMap = new Map(classes.map(c => [c.id, `${c.grade}-${c.section}`]));
        const scheduleSlots = (user.timetableSlots || []).map((slot: any) => {
          const classLabel = classMap.get(slot.classId) || "Class Section";
          return {
            id: slot.id,
            dayOfWeek: slot.day,
            slotIndex: slot.period,
            classLabel: `${classLabel} (${slot.subjectName})`,
            startTime: slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : `Period ${slot.period}`,
          };
        });

        const formattedDate = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        const pCode = user.name.codePointAt(0) || 0;

        setStaffDetails({
          uid: user.id,
          name: user.name,
          id: user.employeeId || "ST-1024-0" + (pCode % 100),
          role: user.role === "TEACHER" ? "Faculty" : user.role,
          department: user.department || department,
          performance: user.performance ?? (80 + (pCode % 20)),
          auraScore: user.auraScore ?? (85 + (pCode % 15)),
          status: user.staffStatus === "ACTIVE" ? "Active" : user.staffStatus === "ON_LEAVE" ? "On Leave" : user.staffStatus === "REMOTE" ? "Remote" : user.staffStatus === "INACTIVE" ? "Inactive" : (user.staffStatus || "Active"),
          img: `/Avatar/${pCode % 2 === 0 ? "Female" : "Male"} Avatar Age3${5 + (pCode % 4)}.png`,
          email: user.email || `${user.name.toLowerCase().replace(/\s+/g, ".")}@letuic.edu`,
          mobile: user.mobileNo || "+91 98765 43210",
          address: cleanAddress || "Not Provided",
          joinDate: formattedDate,
          assignedClasses: assignedClassNames,
          scheduleSlots: scheduleSlots,
          achievements: user.achievements || [],
          facultyInsights: user.facultyInsights || []
        });

      } catch (err: unknown) {
        console.error("Failed to load staff profile:", err);
        const errMsg = err instanceof Error ? err.message : "An error occurred";
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProfile();
    }
  }, [id]);

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

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-white">
        <TopBar title="Loading profile..." subtitle="Retrieving live staff details" />
        <div className="flex-1 flex flex-col items-center justify-center text-[#B0AFA8]">
          <span className="material-symbols-outlined text-5xl animate-spin">sync</span>
          <p className="mt-4 text-[14px] font-bold">Loading staff profile...</p>
        </div>
      </div>
    );
  }

  if (error || !staffDetails) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-white">
        <TopBar title="Error loading profile" subtitle="Something went wrong" />
        <div className="flex-1 flex flex-col items-center justify-center text-red-500">
          <span className="material-symbols-outlined text-5xl">error</span>
          <p className="mt-4 text-[14px] font-bold">{error || "Staff member not found"}</p>
          <button onClick={() => navigate("/directory/staff")} className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-foreground font-bold text-[12px] rounded-xl transition-all">
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
      <TopBar
        title="Faculty Profile"
        subtitle={`${staffDetails.id} • ${staffDetails.department}`}
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
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group shrink-0">
              <div className="size-28 rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-slate-200/50">
                <img src={staffDetails.img} className="size-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`${staffDetails.name} profile`} />
              </div>
              <div className={cn(
                "absolute -bottom-2 -right-2 size-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm",
                staffDetails.status === "Active" ? "bg-green-500" : "bg-amber-500"
              )}>
                <span className="material-symbols-outlined text-white text-[12px] font-black">check</span>
              </div>
            </div>

            <div className="flex-1 py-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-brand-navy tracking-tight">{staffDetails.name}</h1>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                  getStatusStyles(staffDetails.status)
                )}>
                  {staffDetails.status}
                </span>
              </div>
              <p className="text-[13px] font-bold text-muted-gray mb-6 flex items-center gap-2">
                {staffDetails.role} <span className="size-1 rounded-full bg-slate-300" /> {staffDetails.department}
              </p>

              <div className="flex flex-wrap gap-x-12 gap-y-4">
                {[
                  { label: "Performance", value: `${staffDetails.performance}%`, icon: "trending_up", color: "text-green-600" },
                  { label: "Aura Score", value: staffDetails.auraScore, icon: "verified", color: "text-primary" },
                  { label: "Workload", value: "24h / wk", icon: "schedule", color: "text-blue-600" },
                  { label: "Join Date", value: staffDetails.joinDate, icon: "calendar_today", color: "text-slate-400" }
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
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                    <div key={day} className="space-y-3">
                      <div className="text-center pb-2">
                        <span className="text-[9px] font-black text-muted-gray uppercase tracking-[0.2em]">{day}</span>
                      </div>
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(slot => {
                          const slotData = staffDetails.scheduleSlots.find(
                            s => s.dayOfWeek.toLowerCase().startsWith(day.toLowerCase()) && s.slotIndex === slot
                          );
                          return (
                            <div key={slot} className={cn(
                              "group p-2.5 rounded-xl border transition-all cursor-pointer relative",
                              slotData 
                                ? "bg-primary/5 border-primary/20 hover:bg-primary/10" 
                                : "bg-slate-50/50 border-slate-100 border-dashed hover:border-slate-200"
                            )}>
                              {slotData ? (
                                <>
                                  <p className="text-[10px] font-black text-brand-navy leading-tight">{slotData.classLabel}</p>
                                  <p className="text-[8px] font-bold text-muted-gray mt-0.5">{slotData.startTime}</p>
                                </>
                              ) : (
                                <div className="h-6 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[14px] text-slate-200 group-hover:text-slate-300 transition-colors">add</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-[24px] border border-slate-100/60 p-5 shadow-sm shadow-slate-100/20">
                  <h4 className="text-[12px] font-black text-brand-navy uppercase tracking-widest mb-4">Assigned Subjects / Classes</h4>
                  <div className="space-y-3">
                    {staffDetails.assignedClasses.length > 0 ? (
                      staffDetails.assignedClasses.map((cls, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                          <span className="text-[12px] font-bold text-brand-navy">Class Teacher: {cls}</span>
                          <span className="material-symbols-outlined text-[16px] text-slate-300">chevron_right</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-[12px] text-muted-gray/70 text-center italic">No active class teacher assignments</div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-[24px] border border-slate-100/60 p-5 shadow-sm shadow-slate-100/20">
                  <h4 className="text-[12px] font-black text-brand-navy uppercase tracking-widest mb-4">Achievements</h4>
                  <div className="space-y-3">
                    {staffDetails.achievements.length > 0 ? (
                      staffDetails.achievements.map((ach) => (
                        <div key={ach.id || ach.title} className="flex items-center gap-3">
                          <div className="size-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[14px] filled">{ach.badgeIcon || "military_tech"}</span>
                          </div>
                          <span className="text-[12px] font-bold text-brand-navy">{ach.title}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[12px] text-muted-gray/70 italic text-center py-2">No achievements recorded</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#F7F8F4] rounded-[24px] border border-slate-100 p-6 space-y-6">
                <h3 className="text-[12px] font-black text-brand-navy uppercase tracking-widest">Personal Records</h3>
                <div className="space-y-4">
                  {[
                    { label: "Email Address", value: staffDetails.email, icon: "alternate_email" },
                    { label: "Contact Primary", value: staffDetails.mobile, icon: "phone_iphone" },
                    { label: "Staff Identifier", value: staffDetails.id, icon: "fingerprint" },
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
                  {staffDetails.facultyInsights.length > 0 ? (
                    staffDetails.facultyInsights.map((insight, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="size-1 rounded-full bg-primary mt-1.5 shrink-0" />
                        <p className="text-[12px] font-medium text-brand-navy/70 leading-relaxed italic">"{insight}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-[12px] text-muted-gray/70 italic">No insights available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
