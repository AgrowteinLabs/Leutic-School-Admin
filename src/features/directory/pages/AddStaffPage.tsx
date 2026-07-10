import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { useApp } from "../../../lib/AppContext";

interface SubjectItem {
  id: string;
  name: string;
}

export const AddStaffPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // Step 1 State
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");

  // Step 2 State
  const [empId, setEmpId] = useState("");
  const [joiningDate, setJoiningDate] = useState<Date | null>(null);
  const [dept, setDept] = useState("");
  const [designation, setDesignation] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [exp, setExp] = useState("");
  const [instEmail, setInstEmail] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const { schoolProfile } = useApp();
  const activeGrades = schoolProfile?.activeGrades && schoolProfile.activeGrades.length > 0
    ? schoolProfile.activeGrades
    : [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
        "Grade 7",
        "Grade 8",
        "Grade 9",
        "Grade 10",
      ];

  const [qualifiedGrades, setQualifiedGrades] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);

  // Step 3 State
  const [password, setPassword] = useState("");
  const [portalRole, setPortalRole] = useState("Standard Teacher");
  const [shift, setShift] = useState("Morning (8:00 - 15:00)");
  const [busAvailed, setBusAvailed] = useState("No");

  // Live Data & Loading
  const [subjectsList, setSubjectsList] = useState<SubjectItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const specializationOptions = subjectsList.length > 0
    ? Array.from(new Set(subjectsList.map((s) => s.name)))
    : [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "English",
        "Social Science",
        "Information Technology",
        "Physical Education",
        "Fine Arts",
      ];

  useEffect(() => {
    const loadOnboardingData = async () => {
      const schoolId = localStorage.getItem("school_id") || "";
      if (!schoolId) return;

      const subjectsQuery = `
        query GetSubjects($schoolId: String!) {
          subjects(schoolId: $schoolId) {
            id
            name
          }
        }
      `;

      try {
        const subjectsData = await graphqlRequest<{ subjects: SubjectItem[] }>(subjectsQuery, {
          schoolId,
        });
        setSubjectsList(subjectsData.subjects || []);
      } catch (err) {
        console.error("Failed to fetch onboarding data:", err);
      }
    };
    loadOnboardingData();
  }, []);

  const handleFinalize = async () => {
    if (!fullName) {
      setError("Please fill in the required fields: Full Name.");
      setActiveStep(1);
      return;
    }

    setIsSaving(true);
    setError(null);

    const schoolId = localStorage.getItem("school_id") || "";
    const role = portalRole === "Admin" ? "ADMIN" : "TEACHER";

    // No class IDs assigned directly on staff onboarding
    const mappedClassIds: string[] = [];

    // Serialize department inside address field
    const serializedAddress = `Dept: ${dept || "General"} | ${address}`;

    const createUserMutation = `
            mutation CreateTeacher($input: CreateUserDto!) {
              createUser(createUserInput: $input) {
                id
                role
                name
                email
                mobileNo
                schoolId
                classIds
                qualifiedGrades
                subjectSpecializations
                isActive
                createdAt
                updatedAt
                tempPassword
              }
            }
        `;

    try {
      const response = await graphqlRequest<{ createUser: { id: string; tempPassword?: string } }>(
        createUserMutation,
        {
          input: {
            role,
            name: fullName,
            email:
              instEmail ||
              personalEmail ||
              `${fullName.toLowerCase().replace(/\s+/g, ".")}@letuic.edu`,
            mobileNo: mobile,
            password: password || undefined,
            schoolId,
            classIds: mappedClassIds,
            address: serializedAddress,
            qualifiedGrades,
            subjectSpecializations: specializations.map((name) => {
              const found = subjectsList.find((s) => s.name.toLowerCase() === name.toLowerCase());
              return found ? found.id : name;
            }),
            designation: designation || undefined,
            qualifications: qualifications || undefined,
            yearsExperience: exp || undefined,
            portalAccessRole: portalRole || undefined,
            workShift: shift || undefined,
            busRouteLabel: busAvailed && busAvailed !== "No" ? busAvailed : undefined,
          },
        },
      );

      if (response.createUser.tempPassword) {
        setTempPassword(response.createUser.tempPassword);
      } else {
        setTempPassword(null);
      }
      setShowSuccess(true);
    } catch (err: any) {
      console.error("Failed to onboard staff member:", err);
      setError(err.message || "Failed to onboard staff member.");
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Personal Identity",
      subtitle: "Basic information and contact details",
      icon: "badge",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      id: 2,
      title: "Employment Details",
      subtitle: "Role, department and qualifications",
      icon: "work",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: 3,
      title: "Access & Logistics",
      subtitle: "System roles and work schedule",
      icon: "key",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
      <TopBar
        title="Onboard Staff"
        subtitle="Add a new faculty or administrative member"
        actions={
          <div className="flex items-center gap-3">
            <PDSButton
              variant="text"
              onClick={() => navigate(-1)}
              disabled={isSaving}
            >
              Cancel
            </PDSButton>
            <PDSButton
              variant="primary"
              icon={isSaving ? "sync" : "person_add"}
              onClick={handleFinalize}
              disabled={activeStep < 3 || isSaving}
            >
              {isSaving ? "Saving..." : "Complete Onboarding"}
            </PDSButton>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-[13px] font-semibold flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm shadow-slate-100/50 overflow-visible relative z-10 flex flex-col">
            {steps.map((step, index) => {
              const isExpanded = activeStep === step.id;
              const isCompleted = activeStep > step.id;

              return (
                <div key={step.id} className="flex flex-col">
                  <button
                    onClick={() => setActiveStep(step.id)}
                    className={cn(
                      "w-full text-left p-10 flex items-center justify-between transition-all outline-none group",
                      isExpanded ? "bg-slate-50/40" : "hover:bg-slate-50/50",
                      index === 0 && "rounded-t-[31px]",
                      index !== 0 && "border-t border-slate-50",
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className={cn(
                          "size-12 rounded-[20px] flex items-center justify-center transition-all duration-500",
                          isExpanded ? step.bg : "bg-slate-100",
                          isExpanded ? step.color : "text-slate-400",
                        )}
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {isCompleted ? "check_circle" : step.icon}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <h3
                          className={cn(
                            "font-bold text-[length:var(--font-size-h3)] tracking-tight transition-colors",
                            isExpanded ? "text-foreground" : "text-slate-500",
                          )}
                        >
                          {step.title}
                        </h3>
                        <p className="text-[length:var(--font-size-input)] font-medium text-[var(--text-color-body-muted)] mt-0.5">
                          {step.subtitle}
                        </p>
                      </div>
                    </div>

                    {!isExpanded && (
                      <div className="flex items-center gap-4">
                        {isCompleted && (
                          <span className="text-[11px] font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-full tracking-wider uppercase">
                            Completed
                          </span>
                        )}
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-400 transition-colors">
                          expand_more
                        </span>
                      </div>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.5,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        }}
                        style={{ overflow: isExpanded ? "visible" : "hidden" }}
                      >
                        <div className="p-10 pt-4 space-y-12">
                          {step.id === 1 && (
                            <div className="flex flex-col lg:flex-row gap-16">
                              <div className="shrink-0">
                                <div className="size-40 rounded-[40px] bg-[#F7F8F4] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-[#B0AFA8] hover:border-primary hover:text-primary transition-all cursor-pointer group">
                                  <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                                    add_a_photo
                                  </span>
                                  <span className="text-[11px] font-bold uppercase tracking-wider">
                                    Profile Photo
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <PDSFormGroup
                                  label="Full Name"
                                  placeholder="Enter staff name"
                                  value={fullName}
                                  onChange={setFullName}
                                />
                                <PDSFormGroup
                                  label="Date of Birth"
                                  type="date"
                                  placeholder="DD / MM / YYYY"
                                  value={dob}
                                  onChange={setDob}
                                  maxDate={new Date()}
                                />
                                <PDSFormGroup
                                  label="Gender"
                                  type="chips"
                                  options={["Male", "Female", "Other"]}
                                  value={gender}
                                  onChange={setGender}
                                />
                                <PDSFormGroup
                                  label="Blood Group"
                                  type="select"
                                  options={[
                                    "A+",
                                    "A-",
                                    "B+",
                                    "B-",
                                    "O+",
                                    "O-",
                                    "AB+",
                                    "AB-",
                                  ]}
                                  optional
                                  searchable
                                  value={bloodGroup}
                                  onChange={setBloodGroup}
                                />
                                <PDSFormGroup
                                  label="Personal Email"
                                  placeholder="personal@example.com"
                                  icon="mail"
                                  value={personalEmail}
                                  onChange={setPersonalEmail}
                                />
                                <PDSFormGroup
                                  label="Mobile Number"
                                  placeholder="+91 XXXX"
                                  icon="call"
                                  value={mobile}
                                  onChange={setMobile}
                                />
                                <PDSFormGroup
                                  label="Residential Address"
                                  type="textarea"
                                  placeholder="Enter permanent address..."
                                  className="md:col-span-2"
                                  value={address}
                                  onChange={setAddress}
                                  rows={2}
                                />
                              </div>
                            </div>
                          )}

                          {step.id === 2 && (
                            <div className="space-y-16">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-10">
                                <PDSFormGroup
                                  label="Employee ID"
                                  placeholder="e.g. STAFF-2024-001"
                                  value={empId}
                                  onChange={setEmpId}
                                />
                                <PDSFormGroup
                                  label="Joining Date"
                                  type="date"
                                  value={joiningDate}
                                  onChange={setJoiningDate}
                                />
                                <PDSFormGroup
                                  label="Subject Area"
                                  type="select"
                                  options={[
                                    "Mathematics",
                                    "English",
                                    "Science",
                                    "Social Studies",
                                    "Hindi",
                                    "Physical Education",
                                    "Arts & Crafts",
                                    "Computer Science",
                                    "Administration",
                                  ]}
                                  searchable
                                  value={dept}
                                  onChange={setDept}
                                />
                                <PDSFormGroup
                                  label="Designation"
                                  placeholder="e.g. Senior Faculty"
                                  value={designation}
                                  onChange={setDesignation}
                                />
                                <PDSFormGroup
                                  label="Qualifications"
                                  placeholder="e.g. PhD, M.Ed"
                                  value={qualifications}
                                  onChange={setQualifications}
                                />
                                <PDSFormGroup
                                  label="Years of Experience"
                                  placeholder="e.g. 8 Years"
                                  value={exp}
                                  onChange={setExp}
                                />
                                <PDSFormGroup
                                  label="Institutional Email"
                                  placeholder="faculty@institution.com"
                                  icon="workspace_premium"
                                  value={instEmail}
                                  onChange={setInstEmail}
                                />
                                <PDSFormGroup
                                  label="Emergency Contact"
                                  placeholder="+91 XXXX"
                                  icon="call"
                                  value={emergencyContact}
                                  onChange={setEmergencyContact}
                                />
                              </div>

                              <div className="border-t border-slate-100 pt-10 space-y-10">
                                <div className="flex flex-col gap-1 border-b border-slate-50 pb-4">
                                  <h5 className="text-[15px] font-bold text-foreground">
                                    Teaching Profile
                                  </h5>
                                  <p className="text-[12px] text-[#B0AFA8] font-medium">
                                    Qualified grades and subjects
                                  </p>
                                </div>
                                <div className="grid grid-cols-1 gap-10">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                      <span className="text-[12px] font-bold text-[#B0AFA8] tracking-tight">
                                        Qualified Grades
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            qualifiedGrades.length ===
                                            activeGrades.length
                                          )
                                            setQualifiedGrades([]);
                                          else setQualifiedGrades(activeGrades);
                                        }}
                                        className="text-[11px] font-bold text-primary hover:text-secondary transition-colors underline underline-offset-4"
                                      >
                                        {qualifiedGrades.length === activeGrades.length
                                          ? "Deselect All"
                                          : "Select All"}
                                      </button>
                                    </div>
                                    <PDSFormGroup
                                      label=""
                                      type="chips"
                                      options={activeGrades}
                                      value={qualifiedGrades}
                                      onChange={setQualifiedGrades}
                                    />
                                  </div>
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                      <span className="text-[12px] font-bold text-[#B0AFA8] tracking-tight">
                                        Subject Specializations
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            specializations.length ===
                                            specializationOptions.length
                                          )
                                            setSpecializations([]);
                                          else setSpecializations(specializationOptions);
                                        }}
                                        className="text-[11px] font-bold text-primary hover:text-secondary transition-colors underline underline-offset-4"
                                      >
                                        {specializations.length === specializationOptions.length
                                          ? "Deselect All"
                                          : "Select All"}
                                      </button>
                                    </div>
                                    <PDSFormGroup
                                      label=""
                                      type="chips"
                                      options={specializationOptions}
                                      value={specializations}
                                      onChange={setSpecializations}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {step.id === 3 && (
                            <div className="space-y-12">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <PDSFormGroup
                                  label="Portal Access Role"
                                  type="select"
                                  options={[
                                    "Standard Teacher",
                                    "Dept. Head",
                                    "Admin",
                                  ]}
                                  value={portalRole}
                                  onChange={setPortalRole}
                                />
                                <PDSFormGroup
                                  label="System Password (Optional)"
                                  placeholder="Leave blank to auto-generate"
                                  value={password}
                                  onChange={setPassword}
                                />
                                <PDSFormGroup
                                  label="Work Shift"
                                  type="select"
                                  options={[
                                    "Morning (8:00 - 15:00)",
                                    "Noon (11:00 - 18:00)",
                                  ]}
                                  value={shift}
                                  onChange={setShift}
                                />
                                <PDSFormGroup
                                  label="Bus Availed"
                                  type="select"
                                  options={[
                                    "No",
                                    "Yes - Route A",
                                    "Yes - Route B",
                                  ]}
                                  value={busAvailed}
                                  onChange={setBusAvailed}
                                />
                              </div>

                              <div className="space-y-4">
                                 <span className="text-[12px] font-bold text-[#B0AFA8] tracking-tight">
                                   Class Assignments
                                 </span>
                                 {/* Class assignments are handled elsewhere */}
                              </div>

                              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                  <div className="size-14 rounded-2xl bg-white flex items-center justify-center text-foreground shadow-sm">
                                    <span className="material-symbols-outlined text-[28px]">
                                      fingerprint
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-[15px] font-bold text-foreground">
                                      Biometric Enrollment
                                    </p>
                                    <p className="text-[13px] text-[#B0AFA8] font-medium">
                                      Link staff RFID or Fingerprint device for
                                      automated attendance
                                    </p>
                                  </div>
                                </div>
                                <PDSButton
                                  variant="text"
                                  icon="link"
                                  className="px-6 h-10 bg-white"
                                >
                                  Link Device
                                </PDSButton>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end pt-8 border-t border-slate-100">
                            {step.id < 3 ? (
                              <PDSButton
                                variant="primary"
                                className="px-12 h-10"
                                onClick={() => setActiveStep(step.id + 1)}
                              >
                                Save & Continue
                              </PDSButton>
                            ) : (
                              <PDSButton
                                variant="primary"
                                className="px-12 h-10"
                                onClick={handleFinalize}
                                disabled={isSaving}
                              >
                                {isSaving
                                  ? "Saving..."
                                  : "Complete Staff Onboarding"}
                              </PDSButton>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <div className="h-10 bg-white rounded-b-[32px]" />
          </div>
        </div>
      </div>

      <PDSSuccessModal
        show={showSuccess}
        title="Staff Onboarded!"
        description={
          tempPassword
            ? `The new staff member has been registered.\n\nTemporary Password:\n${tempPassword}`
            : "The new staff member has been registered and credentials have been generated."
        }
        buttonText="Go to Directory"
        onClose={() => navigate("/directory/staff")}
      />
    </div>
  );
};
