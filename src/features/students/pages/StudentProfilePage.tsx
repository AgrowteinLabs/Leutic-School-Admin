import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn, formatDisplayId } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { useApp } from "../../../lib/AppContext";
import {
  GraduationCap,
  Users,
  Phone,
  Calendar,
  Trophy,
  AlertCircle,
  Lock,
  ChevronRight,
  ArrowUpRight,
  Activity,
  History
} from "lucide-react";

// interface ManagedUser {
//   id: string;
//   role: string;
//   name: string;
//   email?: string;
//   mobileNo?: string;
//   schoolId?: string;
//   isActive: boolean;
//   admissionNumber?: string;
//   address?: string;
//   classId?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface ParentContact {
//   id: string;
//   mobileNo: string;
//   childrenIds: string[];
// }

interface StudentProfile {
  name: string;
  id: string;
  grade: string;
  section: string;
  participation: number;
  auraScore: number;
  attendanceRate: number;
  gpa: string | null;
  enrollmentDate: string;
  bloodGroup: string;
  guardianName: string;
  phone: string;
  status: string;
  img: string;
  profileImageUrl?: string;
  parents: Array<{ role: string; name: string; ph: string; occupation: string }>;
  participationIntelligence: {
    attendanceConsistency: number;
    assignmentHygiene: number;
    classEngagement: number;
    activityDensity: number;
  };
  highlights: Array<{
    id: string;
    label: string;
    detail: string;
    icon: string;
    status: string;
  }>;
  termPerformances: Array<{
    termName: string;
    letterGrade: string;
    percentageScore: string;
  }>;
  subjectMasteries: Array<{
    subjectName: string;
    masteryPercentage: number;
  }>;
  behavioralRecords: Array<{
    id: string;
    date: string;
    title: string;
    comment: string;
    staffName: string;
    createdAt?: string;
  }>;
  behavioralAuditLog: {
    lastAuditDate: string;
    auditedBy: string;
  } | null;
  parentMeetings: Array<{
    title: string;
    dateString: string;
    summaryText: string;
  }>;
  quizSummary?: {
    attemptedCount: number;
    totalCount: number;
    percentage: number;
  };
  assignmentSummary?: {
    submittedCount: number;
    totalCount: number;
    percentage: number;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    questionsCount?: number;
    points?: number;
    durationMinutes?: number;
    submittedOn: string;
    status: string;
  }>;
  examinations: Array<{
    id: string;
    title: string;
    subjectCount: number;
    updatedAt: string;
    status: string;
  }>;
}

export const StudentProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const { schoolProfile } = useApp();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSecureEntryModal, setShowSecureEntryModal] = useState(false);
  const [secureEntryTitle, setSecureEntryTitle] = useState("");
  const [secureEntryComment, setSecureEntryComment] = useState("");
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds the 5MB limit.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("jwt_token");
      const identityUrl = import.meta.env.VITE_IDENTITY_SERVICE_URL || "";
      const uploadUrl = identityUrl 
        ? `${identityUrl}/users/${id}/profile-image` 
        : `/users/${id}/profile-image`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success) {
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert("Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Profile image upload error:", err);
      alert("An error occurred while uploading the image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateBehavioralRecord = async () => {
    if (!secureEntryTitle.trim() || !secureEntryComment.trim()) return;
    setIsSubmittingEntry(true);
    try {
      const mutation = `
        mutation CreateBehavioralRecord($input: CreateBehavioralRecordInput!) {
          createBehavioralRecord(input: $input) {
            id
          }
        }
      `;
      await graphqlRequest(mutation, {
        input: {
          studentId: id,
          title: secureEntryTitle.trim(),
          comment: secureEntryComment.trim()
        }
      });
      setShowSecureEntryModal(false);
      setSecureEntryTitle("");
      setSecureEntryComment("");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to create behavioral record:", err);
      alert("Failed to save secure entry. Please try again.");
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const profileQuery = `
          query StudentProfileBundle($studentIdID: ID!, $studentIdStr: String!) {
            studentProfile(studentId: $studentIdID) {
              id
              name
              admissionNumber
              classId
              bloodGroup
              studentStatus
              guardians {
                id
                relationship
                fullName
                mobileNo
                email
                occupation
              }
              overview {
                auraPoints
                participationIntelligence {
                  attendanceConsistency
                  assignmentHygiene
                  classEngagement
                  activityDensity
                }
                highlights {
                  id
                  label
                  detail
                  icon
                  status
                }
              }
              academicHistory {
                termPerformances {
                  termName
                  letterGrade
                  percentageScore
                }
                subjectMasteries {
                  subjectName
                  masteryPercentage
                }
              }
              behavioralRecords {
                id
                date
                title
                comment
                staffName
                createdAt
              }
              behavioralAuditLog {
                lastAuditDate
                auditedBy
              }
              parentMeetings {
                title
                dateString
                summaryText
              }
            }
            user(id: $studentIdID) {
              createdAt
            }
            studentProgress(studentId: $studentIdStr) {
              studentId
              overallAverage
            }
            studentAttendanceSummary(studentId: $studentIdStr) {
              percentage
            }
            studentQuizSummary(studentId: $studentIdStr) {
              attemptedCount
              totalCount
              percentage
            }
            studentAssignmentSummary(studentId: $studentIdStr) {
              submittedCount
              totalCount
              percentage
            }
            studentRecentActivities(studentId: $studentIdStr, limit: 5) {
              id
              type
              title
              questionsCount
              points
              durationMinutes
              submittedOn
              status
            }
            studentExaminations(studentId: $studentIdStr) {
              id
              title
              subjectCount
              updatedAt
              status
            }
          }
        `;

        const res = await graphqlRequest<any>(profileQuery, { 
          studentIdID: id, 
          studentIdStr: id 
        });
        const profileObj = res?.studentProfile;
        if (!profileObj) {
          throw new Error("Student profile record not found.");
        }

        const classRes = profileObj.classId
          ? await graphqlRequest<{ class: { grade: string; section: string } }>(`
              query GetClass($classId: ID!) {
                class(id: $classId) {
                  grade
                  section
                }
              }
            `, { classId: profileObj.classId }).catch(() => null)
          : null;

        const classDetail = classRes?.class;
        const attendanceDetail = res?.studentAttendanceSummary;
        const progressDetail = res?.studentProgress;
        const quizSummary = res?.studentQuizSummary;
        const assignmentSummary = res?.studentAssignmentSummary;
        const recentActivities = res?.studentRecentActivities || [];
        const examinations = res?.studentExaminations || [];

        const parentsWithNames = (profileObj.guardians || []).map((g: any, idx: number) => ({
          role: g.relationship || (idx === 0 ? "Father" : idx === 1 ? "Mother" : "Guardian"),
          name: g.fullName,
          ph: g.mobileNo || "N/A",
          occupation: g.occupation || "Not Specified"
        }));

        setStudent({
          name: profileObj.name,
          id: formatDisplayId(profileObj.admissionNumber || profileObj.id, 'STU'),
          grade: classDetail?.grade || "—",
          section: classDetail?.section || "—",
          participation: progressDetail?.overallAverage ?? -1,
          auraScore: profileObj.overview?.auraPoints ?? 0,
          attendanceRate: attendanceDetail?.percentage ?? -1,
          gpa: progressDetail?.overallAverage ? (progressDetail.overallAverage / 25).toFixed(1) : null,
          enrollmentDate: res?.user?.createdAt ? new Date(res.user.createdAt).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" }) : "—",
          bloodGroup: profileObj.bloodGroup || "—",
          guardianName: parentsWithNames[0]?.name || "Guardian of " + profileObj.name,
          phone: parentsWithNames[0]?.ph || "—",
          status: profileObj.studentStatus || "Active",
          img: "/Avatar/Male Avatar Age16.png",
          profileImageUrl: profileObj.profileImageUrl,
          parents: parentsWithNames.length > 0 ? parentsWithNames : [
            { role: "Guardian", name: "Guardian of " + profileObj.name, ph: "—", occupation: "Not Specified" }
          ],
          participationIntelligence: profileObj.overview?.participationIntelligence || {
            attendanceConsistency: -1,
            assignmentHygiene: -1,
            classEngagement: -1,
            activityDensity: -1
          },
          highlights: profileObj.overview?.highlights || [],
          termPerformances: profileObj.academicHistory?.termPerformances || [],
          subjectMasteries: profileObj.academicHistory?.subjectMasteries || [],
          behavioralRecords: profileObj.behavioralRecords || [],
          behavioralAuditLog: profileObj.behavioralAuditLog || null,
          parentMeetings: profileObj.parentMeetings || [],
          quizSummary: quizSummary || { attemptedCount: 0, totalCount: 0, percentage: 0 },
          assignmentSummary: assignmentSummary || { submittedCount: 0, totalCount: 0, percentage: 0 },
          recentActivities: recentActivities,
          examinations: examinations
        });

      } catch (err: unknown) {
        console.error("Error loading student profile:", err);
        const errMsg = err instanceof Error ? err.message : "Failed to load student details";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, refreshTrigger]);

  const renderTabContent = () => {
    if (!student) return null;
    // Standardized spacing schema to match Dashboard aesthetic
    const colSpacing = "space-y-8";
    const cardPadding = "p-8";

    switch (activeTab) {
      case "Academic History":
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className={cn("md:col-span-8", colSpacing)}>
                <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm", cardPadding)}>
                    <div className="flex items-center justify-between mb-8 text-center md:text-left">
                        <h3 className="text-foreground font-semibold text-base w-full md:w-auto">Longitudinal Performance</h3>
                        <div className="hidden md:flex gap-2">
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-lg text-primary text-[10px] font-bold uppercase">
                                <ArrowUpRight size={12} />
                                Trending Up
                             </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {student.termPerformances.length > 0 ? (
                          student.termPerformances.map((stat, i) => (
                              <div key={i} className="p-5 rounded-xl bg-[#F7F8F4] border border-slate-100/50 text-center sm:text-left">
                                  <p className="text-[10px] font-bold text-[#B0AFA8] mb-2 uppercase tracking-tighter">{stat.termName}</p>
                                  <div className="flex items-baseline justify-center sm:justify-start gap-2">
                                      <span className="text-2xl font-bold text-foreground tracking-tight">{stat.letterGrade}</span>
                                      <span className="text-[12px] font-medium text-[#444441]">{stat.percentageScore}</span>
                                  </div>
                              </div>
                          ))
                        ) : (
                          <div className="col-span-3 text-center py-6 text-[12px] text-muted-gray/70 italic">No academic history records found</div>
                        )}
                    </div>
                </div>

                <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm", cardPadding)}>
                    <h3 className="text-foreground font-semibold text-base mb-6 text-center md:text-left">Course Material Masteries</h3>
                    <div className="space-y-6">
                        {student.subjectMasteries.length > 0 ? (
                          student.subjectMasteries.map((sub, i) => (
                              <div key={i} className="flex items-center gap-6">
                                  <div className="flex-1">
                                      <p className="text-[13px] font-semibold text-foreground mb-2">{sub.subjectName}</p>
                                      <div className="h-1 bg-[#F0F0EC] rounded-full overflow-hidden">
                                          <div className="h-full bg-primary" style={{ width: `${sub.masteryPercentage}%` }} />
                                      </div>
                                  </div>
                                  <span className="text-[14px] font-bold text-foreground w-10 text-right">{sub.masteryPercentage}%</span>
                              </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-[12px] text-muted-gray/70 italic">No subject masteries recorded</div>
                        )}
                    </div>
                </div>
            </div>

            <div className={cn("md:col-span-4", colSpacing)}>
                {/* Term Examinations Card */}
                <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm", cardPadding)}>
                    <h3 className="text-foreground font-semibold text-base mb-6 flex items-center gap-2">
                        <ArrowUpRight size={18} className="text-primary animate-pulse" />
                        Term Examinations
                    </h3>
                    <div className="space-y-4">
                        {student.examinations && student.examinations.length > 0 ? (
                          student.examinations.map((exam, i) => (
                            <div key={exam.id || i} className="p-4 bg-[#F7F8F4] border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-[13px] font-bold text-foreground leading-none">{exam.title}</p>
                                    <p className="text-[10px] text-[#B0AFA8] font-medium leading-none mt-1">
                                        {exam.subjectCount} Subjects • Updated {new Date(exam.updatedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                    </p>
                                </div>
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[9px] font-bold border uppercase tracking-wider",
                                    exam.status?.toLowerCase() === "published" || exam.status?.toLowerCase() === "completed" 
                                        ? "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]" 
                                        : "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"
                                )}>
                                    {exam.status}
                                </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-[12px] text-[#B0AFA8] italic">No term examinations recorded.</div>
                        )}
                    </div>
                </div>

                <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm text-center md:text-left", cardPadding)}>
                    <h3 className="text-foreground font-semibold text-base mb-4">Verification</h3>
                    <p className="text-[12px] text-[#B0AFA8] font-medium leading-relaxed mb-6">Institutional transcript is digitally verified for current semester status.</p>
                    <button className="w-full py-3.5 bg-secondary text-white rounded-xl text-[12px] font-semibold hover:bg-primary hover:text-foreground transition-all">Download Repository</button>
                </div>
            </div>
          </div>
        );
      case "Behavioral Records":
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className={cn("md:col-span-8", colSpacing)}>
                <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm", cardPadding)}>
                    <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4 text-center md:text-left">
                        <div className="space-y-1">
                            <h3 className="text-foreground font-semibold text-lg">Conduct Repository</h3>
                            <p className="text-[12px] text-[#B0AFA8] font-medium">Logged institutional behavioral entries</p>
                        </div>
                        <div className="px-5 py-2.5 bg-[#EAF2D7] text-[#2E7D32] rounded-xl text-[11px] font-bold border border-[#D9EA85] uppercase tracking-widest whitespace-nowrap">Exemplary Registry</div>
                    </div>

                    <div className="space-y-12">
                        {student.behavioralRecords.length > 0 ? (
                          student.behavioralRecords.map((rec, i) => (
                              <div key={i} className="flex gap-6 sm:gap-10 relative group">
                                  {i !== student.behavioralRecords.length - 1 && <div className="absolute left-[5px] top-6 bottom-[-32px] w-[1px] bg-[#F0F0EC]" />}
                                  <div className="size-2.5 rounded-full bg-slate-200 group-hover:bg-primary transition-colors shrink-0 mt-2 z-10" />
                                  <div className="flex-1 space-y-2 pb-8">
                                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                                          <p className="text-[13px] font-bold text-foreground">{rec.title}</p>
                                          <p className="text-[11px] font-medium text-[#B0AFA8]">
                                            {new Date(rec.createdAt || rec.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} • {rec.staffName}
                                          </p>
                                      </div>
                                      <p className="text-[13px] text-[#444441] font-medium leading-relaxed italic pr-4 md:pr-10">"{rec.comment}"</p>
                                  </div>
                              </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-[13px] text-[#B0AFA8] italic">No behavioral records found.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className={cn("md:col-span-4", colSpacing)}>
                <div className={cn("bg-[#F7F8F4] border border-slate-100 rounded-2xl shadow-sm text-center md:text-left", cardPadding)}>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-foreground mb-4">
                        <History size={18} className="text-[#B0AFA8]" />
                        <h3 className="font-semibold text-sm">Security Log</h3>
                    </div>
                    {student.behavioralAuditLog ? (
                      <p className="text-[11px] text-[#B0AFA8] font-medium mb-6 leading-relaxed">
                        Last behavioral audit was performed by {student.behavioralAuditLog.auditedBy} on {new Date(student.behavioralAuditLog.lastAuditDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}.
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#B0AFA8] font-medium mb-6 leading-relaxed">No behavioral audits performed yet.</p>
                    )}
                    <button className="text-[11px] font-bold text-primary hover:underline">View Verification History</button>
                </div>
            </div>
          </div>
        );
      case "Parental Contact":
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className={cn("md:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm text-center md:text-left", cardPadding)}>
                <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
                    <div className="size-14 rounded-2xl bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] border border-slate-100">
                        <Users size={28} />
                    </div>
                    <div>
                        <h3 className="text-foreground font-semibold text-lg">Guardian Contact Center</h3>
                        <p className="text-[12px] font-medium text-[#B0AFA8] italic">Primary family engagement records</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {student.parents.map((g, i) => (
                        <div key={i} className="p-6 bg-[#F7F8F4] rounded-2xl border border-slate-100 transition-all hover:border-primary/20">
                            <p className="text-[10px] font-bold text-[#B0AFA8] mb-2 uppercase tracking-widest leading-none">{g.role} Information</p>
                            <p className="text-[15px] font-semibold text-foreground mb-1 mt-2">{g.name}</p>
                            <p className="text-[11px] font-medium text-muted-gray mb-3">Occupation: {g.occupation}</p>
                            <span className="flex items-center justify-center md:justify-start gap-2 text-[12px] font-bold text-primary">
                                <Phone size={14} strokeWidth={3} fill="currentColor" className="opacity-20" />
                                {g.ph}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={cn("md:col-span-4 bg-secondary rounded-2xl text-white relative shadow-2xl shadow-secondary/10 flex flex-col justify-between", cardPadding)}>
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold tracking-tight">Access Link</h3>
                        <Lock size={18} className="text-primary" />
                    </div>
                    <div className="space-y-8 relative before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[1px] before:bg-white/10 pl-6">
                        {student.parentMeetings.length > 0 ? (
                          student.parentMeetings.map((m, idx) => (
                            <div key={idx} className="border-l-2 border-primary/40 pl-4">
                                <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-widest italic leading-none">{m.title} • {m.dateString}</p>
                                <p className="text-[13px] font-normal text-white/80 leading-relaxed italic">"{m.summaryText}"</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[12px] text-white/40 italic">No parent meetings recorded</p>
                        )}
                    </div>
                </div>
                <div className="relative z-10 pt-10">
                    <a
                        href={`tel:${student.parents[0]?.ph || student.phone}`}
                        className="w-full py-2.5 btn-primary rounded-2xl text-[12px] font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/10"
                    >
                        <Phone size={16} fill="currentColor" strokeWidth={0} />
                        Call Now
                    </a>
                </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Left Main Content */}
            <div className={cn("md:col-span-8", colSpacing)}>
                {/* Master Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-white border border-primary/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center sm:text-left">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[#B0AFA8] text-[10px] font-bold uppercase tracking-widest leading-none">Aura Score</p>
                            <Trophy size={16} className="text-primary hidden sm:block" />
                        </div>
                        <div className="flex items-baseline justify-center sm:justify-start gap-2">
                            <span className="text-3xl font-bold text-foreground tracking-tight">{student.auraScore}</span>
                        </div>
                        <div className="h-1 bg-[#F7F8F4] rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${Math.min(student.auraScore, 100)}%` }} />
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center sm:text-left flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[#B0AFA8] text-[10px] font-bold uppercase tracking-widest leading-none">Attendance</p>
                                <Calendar size={16} className="text-[#B0AFA8] hidden sm:block" />
                            </div>
                            <span className="text-3xl font-bold text-foreground tracking-tight">
                                {student.attendanceRate !== -1 ? `${student.attendanceRate}%` : "—"}
                            </span>
                        </div>
                        {student.attendanceRate !== -1 && (
                            <p className="text-[10px] text-[#2E7D32] font-bold mt-2 uppercase tracking-widest leading-none">
                                {student.attendanceRate > 85 ? "Consistent High" : student.attendanceRate > 70 ? "Moderate" : "Needs Improvement"}
                            </p>
                        )}
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center sm:text-left flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[#B0AFA8] text-[10px] font-bold uppercase tracking-widest leading-none">GPA Index</p>
                                <GraduationCap size={16} className="text-[#B0AFA8] hidden sm:block" />
                            </div>
                            <span className="text-3xl font-bold text-foreground tracking-tight">
                                {student.gpa ?? "—"}
                            </span>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center sm:text-left flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[#B0AFA8] text-[10px] font-bold uppercase tracking-widest leading-none">Quizzes</p>
                                <Trophy size={16} className="text-indigo-500 hidden sm:block" />
                            </div>
                            <span className="text-3xl font-bold text-foreground tracking-tight">
                                {student.quizSummary ? `${student.quizSummary.percentage}%` : "0%"}
                            </span>
                        </div>
                        <p className="text-[10px] text-[#B0AFA8] font-bold mt-2 uppercase tracking-widest italic leading-none">
                            {student.quizSummary ? `${student.quizSummary.attemptedCount}/${student.quizSummary.totalCount} Attempted` : "0 Attempted"}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center sm:text-left flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[#B0AFA8] text-[10px] font-bold uppercase tracking-widest leading-none">Assignments</p>
                                <Calendar size={16} className="text-emerald-500 hidden sm:block" />
                            </div>
                            <span className="text-3xl font-bold text-foreground tracking-tight">
                                {student.assignmentSummary ? `${student.assignmentSummary.percentage}%` : "0%"}
                            </span>
                        </div>
                        <p className="text-[10px] text-[#B0AFA8] font-bold mt-2 uppercase tracking-widest italic leading-none">
                            {student.assignmentSummary ? `${student.assignmentSummary.submittedCount}/${student.assignmentSummary.totalCount} Submitted` : "0 Submitted"}
                        </p>
                    </div>
                </div>

              {/* Participation Intelligence Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-foreground font-semibold text-base flex items-center gap-2">
                      <Activity size={18} className="text-primary" />
                      Participation Intelligence
                    </h3>
                    <p className="text-[12px] text-[#B0AFA8] font-medium">Weighted analysis of holistic student engagement</p>
                  </div>
                  <div className="px-4 py-2 bg-[#F7F8F4] rounded-xl border border-slate-100">                      <span className="text-xl font-black text-foreground">
                        {student.participation !== -1 ? `${Number(student.participation).toFixed(2)}%` : "—"}
                      </span>
                    <span className="text-[10px] font-bold text-[#B0AFA8] ml-2 uppercase">Composite</span>
                  </div>
                </div>
 
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                  {[
                    { label: "Attendance Consistency", val: student.participationIntelligence.attendanceConsistency, color: "bg-primary" },
                    { label: "Assignment Hygiene", val: student.participationIntelligence.assignmentHygiene, color: "bg-secondary" },
                    { label: "Class Engagement", val: student.participationIntelligence.classEngagement, color: "bg-orange-400" },
                    { label: "Activity Density", val: student.participationIntelligence.activityDensity, color: "bg-emerald-500" },
                  ].map((p, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <p className="text-[11px] font-bold text-[#444441] uppercase tracking-tight">{p.label}</p>
                        <p className="text-[13px] font-black text-foreground">
                          {p.val !== -1 ? `${Number(p.val).toFixed(2)}%` : "—"}
                        </p>
                      </div>
                      <div className="h-1.5 bg-[#F7F8F4] rounded-full overflow-hidden">
                        <div 
                           className={cn("h-full transition-all duration-1000 delay-300", p.color)} 
                           style={{ width: p.val !== -1 ? `${p.val}%` : "0%" }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combined Activity & History Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-[#F7F8F4]/50">
                        <h3 className="text-foreground font-semibold text-base flex items-center gap-2">
                             <Activity size={18} className="text-primary" />
                             Intelligence Highlights
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-50 pb-2">
                        {student.highlights.length > 0 ? (
                          student.highlights.map((m, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-8 hover:bg-[#F7F8F4] transition-all group cursor-pointer">
                                <div className="size-10 rounded-xl bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0">
                                    <span className="material-symbols-outlined text-xl">{m.icon || "star"}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[14px] font-bold text-foreground leading-none mb-1.5">{m.label}</h4>
                                    <p className="text-[12px] text-[#B0AFA8] font-medium italic mb-2 sm:mb-0">{m.detail}</p>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-5">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap",
                                        m.status.includes("Active") ? "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]" : "bg-[#F7F8F4] text-[#B0AFA8] border-slate-100"
                                    )}>
                                        {m.status}
                                    </span>
                                    <ChevronRight size={14} className="text-slate-200 group-hover:text-primary transition-all translate-x-2 group-hover:translate-x-0" />
                                </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-[13px] text-[#B0AFA8] italic">No highlights recorded yet.</div>
                        )}
                </div>
            </div>

                {/* Recent Activities Log */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-8">
                    <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-[#F7F8F4]/50">
                        <h3 className="text-foreground font-semibold text-base flex items-center gap-2">
                             <Activity size={18} className="text-primary" />
                             Recent Academic Activities
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-50 pb-2">
                        {student.recentActivities && student.recentActivities.length > 0 ? (
                          student.recentActivities.map((act, i) => (
                            <div key={act.id || i} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-6 hover:bg-[#F7F8F4] transition-all group">
                                <div className={cn(
                                    "size-10 rounded-xl flex items-center justify-center shrink-0",
                                    act.type?.toLowerCase() === "quiz" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                    <span className="material-symbols-outlined text-xl">
                                        {act.type?.toLowerCase() === "quiz" ? "quiz" : "assignment"}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[14px] font-bold text-foreground leading-none mb-1.5">{act.title}</h4>
                                    <p className="text-[11px] text-[#B0AFA8] font-medium leading-none">
                                        {act.questionsCount ? `${act.questionsCount} Questions • ` : ""}
                                        {act.points ? `${act.points} Points • ` : ""}
                                        {act.durationMinutes ? `${act.durationMinutes} mins • ` : ""}
                                        {new Date(act.submittedOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-5">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap uppercase tracking-wider",
                                        act.status === "COMPLETED" || act.status === "SUBMITTED" 
                                            ? "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]" 
                                            : "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"
                                    )}>
                                        {act.status}
                                    </span>
                                </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-[13px] text-[#B0AFA8] italic">No recent activities found.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Secure Column */}
            <div className={cn("md:col-span-4", colSpacing)}>
                <div className="bg-white rounded-2xl border border-[#FECACA] shadow-sm overflow-hidden text-center md:text-left">
                    <div className="bg-red-600 px-6 py-4 flex justify-between items-center text-white">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                             <AlertCircle size={16} strokeWidth={3} />
                             Critical Flags
                        </h3>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold border border-white/20">
                          {student.behavioralRecords.filter((r: any) => r.title.toLowerCase().includes("conflict") || r.title.toLowerCase().includes("critical") || r.title.toLowerCase().includes("incident")).length.toString().padStart(2, "0")}
                        </span>
                    </div>
                    <div className="p-6">
                        {student.behavioralRecords.filter((r: any) => r.title.toLowerCase().includes("conflict") || r.title.toLowerCase().includes("critical") || r.title.toLowerCase().includes("incident")).length > 0 ? (
                          student.behavioralRecords.filter((r: any) => r.title.toLowerCase().includes("conflict") || r.title.toLowerCase().includes("critical") || r.title.toLowerCase().includes("incident")).map((rec: any, idx: number) => (
                            <div key={idx} className="p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-xl space-y-3 mb-3 text-left">
                                <p className="text-[#B91C1C] font-bold text-[13px]">{rec.title}</p>
                                <p className="text-[11px] text-[#B91C1C]/80 font-medium italic leading-relaxed">"{rec.comment}"</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[12px] text-muted-gray/70 italic py-2">No critical flags noted.</p>
                        )}
                    </div>
                </div>

                <div className="bg-secondary rounded-2xl p-8 text-white relative shadow-2xl shadow-secondary/10 overflow-hidden group">
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold tracking-tight">Secure Log</h3>
                            <Lock size={16} className="text-primary" />
                        </div>
                        <div className="space-y-6 relative border-l border-white/10 pl-6">
                            {student.behavioralRecords.length > 0 ? (
                              student.behavioralRecords.slice(0, 3).map((rec, idx) => (
                                <div key={idx} className="relative pb-2 text-left">
                                    <div className="absolute -left-[27px] top-1.5 size-1.5 rounded-full bg-primary" />
                                    <p className="text-[9px] font-bold text-primary mb-2 uppercase tracking-widest leading-none">
                                      {new Date(rec.createdAt || rec.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} • {rec.staffName}
                                    </p>
                                    <p className="text-[12px] text-white/50 leading-relaxed italic group-/80 transition-colors">"{rec.comment.slice(0, 50)}..."</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-[11px] text-white/40 italic">No behavioral log entries.</p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowSecureEntryModal(true)}
                            className="w-full mt-10 py-3.5 bg-white/5 border border-dashed border-white/10 rounded-xl text-[10px] font-bold text-white/30 hover:bg-white/10 hover:text-white/60 hover:border-white/20 transition-all uppercase tracking-widest"
                        >
                            + Write Secure Entry
                        </button>
                    </div>
                    <div className="absolute -right-20 -top-20 size-80 bg-primary/5 rounded-full blur-3xl opacity-30 group-hover:scale-125 transition-transform duration-700" />
                </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white font-sans">
        <TopBar title="Loading Profile..." subtitle="Fetching student details" onBack={() => navigate(-1)} />
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-12">
            {/* Profile Identity Card Skeleton */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 border-b border-slate-200 pb-12 pt-6 px-6 lg:px-10">
              <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                {/* Avatar skeleton */}
                <div className="size-24 sm:size-28 rounded-[32px] bg-slate-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-5 w-full">
                  {/* ID badge + name */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="h-5 w-24 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-4 w-40 bg-slate-100 rounded-lg animate-pulse" />
                  </div>
                  <div className="h-9 w-64 bg-slate-100 rounded-xl animate-pulse" />
                  {/* Info grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-5 border-t border-slate-100/50">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                        <div className="h-4 w-24 bg-slate-100 rounded-lg animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* School name skeleton */}
              <div className="hidden md:flex flex-col items-end gap-1.5">
                <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                <div className="h-6 w-40 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-6 sm:gap-12 border-b border-slate-200 px-6 lg:px-10">
              {["Overview", "Academic History", "Behavioral Records", "Parental Contact"].map((tab) => (
                <div key={tab} className="pb-6">
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Main content skeleton */}
            <div className="pb-32 px-6 lg:px-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8 space-y-8">
                  {/* Stats cards row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                        <div className="flex justify-between items-start">
                          <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                          <div className="size-4 bg-slate-100 rounded animate-pulse" />
                        </div>
                        <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                        <div className="h-2 w-full bg-slate-100 rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>

                  {/* Participation Intelligence skeleton */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-5 w-48 bg-slate-100 rounded-lg animate-pulse" />
                        <div className="h-3 w-64 bg-slate-100 rounded animate-pulse" />
                      </div>
                      <div className="h-8 w-28 bg-slate-100 rounded-xl animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-3">
                          <div className="flex justify-between">
                            <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                            <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights skeleton */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-100">
                      <div className="h-5 w-36 bg-slate-100 rounded-lg animate-pulse" />
                    </div>
                    <div className="divide-y divide-slate-100">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4 p-6">
                          <div className="size-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                            <div className="h-3 w-64 bg-slate-100 rounded animate-pulse" />
                          </div>
                          <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activities skeleton */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-100">
                      <div className="h-5 w-40 bg-slate-100 rounded-lg animate-pulse" />
                    </div>
                    <div className="divide-y divide-slate-100">
                      {[1, 2].map(i => (
                        <div key={i} className="flex items-center gap-4 p-6">
                          <div className="size-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-52 bg-slate-100 rounded animate-pulse" />
                            <div className="h-3 w-36 bg-slate-100 rounded animate-pulse" />
                          </div>
                          <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right sidebar skeleton */}
                <div className="md:col-span-4 space-y-8">
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="bg-slate-100 h-12 px-6 flex items-center justify-between animate-pulse">
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="h-5 w-8 bg-slate-200 rounded-full animate-pulse" />
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                      <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="bg-slate-100 rounded-2xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                      <div className="size-4 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-1.5">
                          <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
                          <div className="h-3 w-full bg-slate-200/50 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white font-sans">
        <TopBar title="Error Loading Profile" subtitle="Student profile fetch failed" onBack={() => navigate(-1)} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-red-500">
          <span className="material-symbols-outlined text-5xl">error</span>
          <p className="text-[13px] font-bold">{error || "Student not found"}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-foreground rounded-lg text-sm font-semibold transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white font-sans">
      <TopBar
        title={student.name}
        subtitle={`${student.grade} ${student.section} — Institutional Profile Intelligence`}
        onBack={() => navigate(-1)}
        actions={
          <div className="flex items-center gap-3 px-6 lg:px-10">
            <button className="bg-secondary text-white px-5 py-2.5 rounded-xl text-[12px] font-bold hover:bg-primary hover:text-foreground transition-all shadow-sm ">
              Refine Record
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto space-y-12">
          {/* Profile Identity Card */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 border-b border-slate-200 pb-12 pt-6 px-6 lg:px-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group cursor-pointer">
                  <div
                      className="size-24 sm:size-28 rounded-[32px] bg-cover bg-center border-4 border-white shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 transform group-hover:rotate-1 group-hover:scale-105"
                      style={{ backgroundImage: `url("${student.profileImageUrl || student.img}")` }}
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[32px] border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                      <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                      <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                      />
                  </label>
                  {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[32px] border-4 border-white z-20">
                          <span className="material-symbols-outlined text-white text-2xl animate-spin">sync</span>
                      </div>
                  )}
                  <div className={cn(
                      "absolute -bottom-1 -right-1 size-5 rounded-full border-4 border-[#F9FAFB]",
                      student.status === "Active" ? "bg-[#EAF2D7]0" : "bg-[#FEF3C7]0"
                  )} />
              </div>
              <div className="text-center md:text-left space-y-4 flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-foreground border border-slate-100 shadow-sm uppercase tracking-widest">
                        {student.id}
                    </span>
                    <span className="text-[#B0AFA8] text-[13px] font-medium italic opacity-60">Verified Institutional User</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{student.name}</h2>
                
                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-100/50">
                  <div>
                    <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-1">First Joining</p>
                    <p className="text-[13px] font-bold text-foreground">{student.enrollmentDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-1">Blood Group</p>
                    <p className="text-[13px] font-bold text-foreground">{student.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-1">Guardian</p>
                    <p className="text-[13px] font-bold text-foreground">{student.guardianName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-[13px] font-bold text-foreground">{student.phone}</p>
                  </div>
                </div>
            </div>
          </div>

            <div className="flex flex-col items-center md:items-end gap-1.5 opacity-60 transition-all hover:opacity-100 cursor-default group">
              <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest leading-none group-hover:text-primary transition-colors">Digital Registry</p>
              <p className="text-lg sm:text-xl font-bold text-foreground italic tracking-tight underline decoration-primary/30 decoration-4 underline-offset-8">{schoolProfile?.name || "Adarsha Vidya Bhavan"}</p>
            </div>
          </div>

          {/* Global Navigation Tabs */}
          <div className="flex gap-6 sm:gap-12 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-xl z-20 pt-2 transition-all px-6 lg:px-10">
            {["Overview", "Academic History", "Behavioral Records", "Parental Contact"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-6 text-[13px] sm:text-[14px] font-bold transition-all relative group tracking-tight",
                  activeTab === tab
                    ? "text-foreground"
                    : "text-[#B0AFA8] hover:text-foreground whitespace-nowrap"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-secondary rounded-full animate-in zoom-in-y duration-300" />
                )}
              </button>
            ))}
          </div>

          {/* Master Content Renderer */}
          <div className="pb-32 px-6 lg:px-10">
              {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Secure Entry Modal */}
      {showSecureEntryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setShowSecureEntryModal(false)}
            role="presentation"
          />
          <div className="relative w-full max-w-lg bg-white rounded-[28px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-500">
            <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-[14px] bg-[#F7F8F4] flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl">lock</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-foreground tracking-tight">Write Secure Entry</h3>
                  <p className="text-[11px] font-medium text-[#8A8A85] mt-0.5">Add a behavioral record for {student.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSecureEntryModal(false)}
                className="size-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-[#B0AFA8] transition-all hover:rotate-90"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8A8A85] px-1">Title</label>
                <input
                  type="text"
                  value={secureEntryTitle}
                  onChange={(e) => setSecureEntryTitle(e.target.value)}
                  placeholder="e.g. Classroom Observation, Positive Note, Incident Report"
                  className="w-full h-11 bg-[#F9FAFB] border border-slate-100 rounded-[14px] px-6 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8A8A85] px-1 flex items-center justify-between">
                  Comment
                  <span className="text-[10px] text-[#B0AFA8] font-medium">{secureEntryComment.length}/500 chars</span>
                </label>
                <textarea
                  value={secureEntryComment}
                  onChange={(e) => setSecureEntryComment(e.target.value.slice(0, 500))}
                  placeholder="Describe the observation or incident in detail..."
                  className="w-full h-32 bg-[#F9FAFB] border border-slate-100 rounded-[18px] p-6 text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="px-8 py-6 bg-white border-t border-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setShowSecureEntryModal(false);
                  setSecureEntryTitle("");
                  setSecureEntryComment("");
                }}
                className="px-6 h-11 rounded-[14px] text-[14px] font-bold text-[#8A8A85] hover:bg-slate-50 transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleCreateBehavioralRecord}
                disabled={isSubmittingEntry || !secureEntryTitle.trim() || !secureEntryComment.trim()}
                className="btn-primary px-8 h-11 rounded-[14px] text-[14px] font-bold flex items-center gap-2.5 transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-primary/10 active:scale-95"
              >
                {isSubmittingEntry ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">lock</span>
                    Save Secure Entry
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
