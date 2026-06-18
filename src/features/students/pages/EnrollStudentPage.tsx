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

export const EnrollStudentPage = () => {
  const navigate = useNavigate();
  const { activeAcademicYear, academicYears } = useApp();
  const [activeStep, setActiveStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1 State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("");
  const [adhaar, setAdhaar] = useState("");

  // Step 2 State
  const [fatherName, setFatherName] = useState("");
  const [fatherMobile, setFatherMobile] = useState("");
  const [fatherEmail, setFatherEmail] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");

  const [motherName, setMotherName] = useState("");
  const [motherMobile, setMotherMobile] = useState("");
  const [motherEmail, setMotherEmail] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");

  const [guardianName, setGuardianName] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("");
  const [specifyRelation, setSpecifyRelation] = useState("");
  const [guardianContact, setGuardianContact] = useState("");

  // Step 3 State
  const [admissionGrade, setAdmissionGrade] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [busRoute, setBusRoute] = useState("Not Required");
  const [admissionNo, setAdmissionNo] = useState("");
  const [address, setAddress] = useState("");

  // Database Classes State
  const [dbClasses, setDbClasses] = useState<
    Array<{ id: string; grade: string; section: string }>
  >([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);

  // Submitting State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (activeAcademicYear && !academicYearId) {
      setAcademicYearId(activeAcademicYear.id);
    }
  }, [activeAcademicYear, academicYearId]);

  useEffect(() => {
    const fetchClassesAndSchool = async () => {
      try {
        const schoolId = localStorage.getItem("school_id");
        if (!schoolId) return;

        // 1. Fetch classes
        try {
          const classesData = await graphqlRequest<{
            classes: {
              items: Array<{ id: string; grade: string; section: string }>;
            };
          }>(
            `
                        query GetClassesForEnroll($schoolId: String, $academicYearId: String) {
                            classes(filter: { schoolId: $schoolId, academicYearId: $academicYearId }, page: 1, pageSize: 100) {
                                items {
                                    id
                                    grade
                                    section
                                }
                            }
                        }
                    `,
            { schoolId, academicYearId: academicYearId || undefined },
          );

          if (
            classesData.classes?.items
          ) {
            setDbClasses(classesData.classes.items);
            const options = classesData.classes.items.map(
              (c) => `${c.grade} - ${c.section}`,
            );
            setClassOptions(options);
            if (options.length > 0) {
              setAdmissionGrade(options[0]);
            } else {
              setAdmissionGrade("");
            }
          }
        } catch (classErr) {
          console.error("Failed to load classes from supergraph:", classErr);
        }
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    };
    fetchClassesAndSchool();
  }, [academicYearId]);

  const handleFinalize = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // 1. Student onboarding
      const studentName = `${firstName} ${lastName}`.trim() || "New Student";
      const studentUsername = username.trim();
      if (!studentUsername) {
        setSubmitError("Username is required.");
        setIsSubmitting(false);
        return;
      }
      const selectedClass = dbClasses.find(
        (c) => `${c.grade} - ${c.section}` === admissionGrade,
      );
      const resolvedClassId = selectedClass ? selectedClass.id : undefined;
      const finalAdmissionNo =
        rollNo || `OA-2026-${Math.floor(100 + Math.random() * 900)}`;

      const studentPassword = `Student${Math.random().toString(36).substring(2, 10)}!`;

      // Construct guardians array
      const guardiansList = [];
      if (fatherName) {
        guardiansList.push({
          relationship: "Father",
          fullName: fatherName,
          mobileNo: fatherMobile,
          email: fatherEmail || undefined,
          occupation: fatherOccupation || undefined,
        });
      }
      if (motherName) {
        guardiansList.push({
          relationship: "Mother",
          fullName: motherName,
          mobileNo: motherMobile,
          email: motherEmail || undefined,
          occupation: motherOccupation || undefined,
        });
      }
      if (guardianName) {
        guardiansList.push({
          relationship: guardianRelation || specifyRelation || "Guardian",
          fullName: guardianName,
          mobileNo: guardianContact,
          specifyRelationship: specifyRelation || undefined,
        });
      }

      const studentMutation = `
        mutation CreateStudent($input: CreateUserDto!) {
          createUser(createUserInput: $input) {
            id
            name
          }
        }
      `;

      await graphqlRequest(studentMutation, {
        input: {
          role: "STUDENT",
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          name: studentName,
          username: studentUsername,
          admissionNumber: finalAdmissionNo,
          rollNumber: rollNo || undefined,
          dateOfBirth: dob ? dob.toISOString().split("T")[0] : undefined,
          gender,
          bloodGroup: bloodGroup || undefined,
          nationalId: adhaar || undefined,
          classId: resolvedClassId,
          guardians: guardiansList,
          enrollmentGrade: selectedClass ? selectedClass.grade : undefined,
          academicYearId: academicYearId || activeAcademicYear?.id || "",
          busRouteLabel: busRoute,
          address: address || undefined,
          studentStatus: "ACTIVE",
          password: studentPassword,
          schoolId: localStorage.getItem("school_id") || undefined,
        }
      });

      setShowSuccess(true);
    } catch (err: unknown) {
      console.error("Student registration failed:", err);
      const errMsg =
        err instanceof Error
          ? err.message
          : "Failed to enroll student. Please check inputs.";
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Student Identity",
      subtitle: "Personal details and identification",
      icon: "face",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      id: 2,
      title: "Family & Guardians",
      subtitle: "Parental info and emergency contacts",
      icon: "family_restroom",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: 3,
      title: "Academic & Logistics",
      subtitle: "Mapping to grades and transportation",
      icon: "school",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
      <TopBar
        title="Enroll Student"
        subtitle="Complete institutional registration for new admissions"
        actions={
          <div className="flex items-center gap-3">
            <PDSButton variant="text" onClick={() => navigate(-1)}>
              Cancel
            </PDSButton>
            <PDSButton
              variant="primary"
              icon="how_to_reg"
              onClick={handleFinalize}
              disabled={activeStep < 3 || isSubmitting}
              loading={isSubmitting}
            >
              Complete Enrollment
            </PDSButton>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
          {/* Unified Matured UI Container with Accordion Stepper */}
          <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm shadow-slate-100/50 overflow-visible relative z-10 flex flex-col">
            {steps.map((step, index) => {
              const isExpanded = activeStep === step.id;
              const isCompleted = activeStep > step.id;

              return (
                <div key={step.id} className="flex flex-col">
                  {/* Section Header - Interactive */}
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

                  {/* Section Content - Expandable */}
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
                          {/* Step 1: Student Identity */}
                          {step.id === 1 && (
                            <div className="flex flex-col lg:flex-row gap-16">
                              <div className="shrink-0">
                                <div className="size-40 rounded-[40px] bg-[#F7F8F4] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-[#B0AFA8] hover:border-primary hover:text-primary transition-all cursor-pointer group">
                                  <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                                    add_a_photo
                                  </span>
                                  <span className="text-[11px] font-bold uppercase tracking-wider">
                                    Student Photo
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <PDSFormGroup
                                  label="First Name"
                                  placeholder="e.g. Rahul"
                                  value={firstName}
                                  onChange={setFirstName}
                                />
                                <PDSFormGroup
                                  label="Last Name"
                                  placeholder="e.g. Sharma"
                                  value={lastName}
                                  onChange={setLastName}
                                />
                                <PDSFormGroup
                                  label="Username"
                                  placeholder="e.g. rahul.sharma"
                                  value={username}
                                  onChange={setUsername}
                                />
                                <PDSFormGroup
                                  label="Roll Number"
                                  placeholder="e.g. 1024"
                                  value={rollNo}
                                  onChange={setRollNo}
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
                                  label="Adhaar / National ID"
                                  placeholder="XXXX-XXXX-XXXX"
                                  value={adhaar}
                                  onChange={setAdhaar}
                                  className="md:col-span-2"
                                />
                              </div>
                            </div>
                          )}

                          {/* Step 2: Family & Guardians */}
                          {step.id === 2 && (
                            <div className="space-y-16">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                                {/* Father Info */}
                                <div className="space-y-10">
                                  <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">
                                      person
                                    </span>
                                    <h5 className="text-[15px] font-bold text-foreground tracking-tight">
                                      Father's Information
                                    </h5>
                                  </div>
                                  <div className="grid grid-cols-1 gap-y-8">
                                    <PDSFormGroup
                                      label="Full Name"
                                      placeholder="Legal Name"
                                      value={fatherName}
                                      onChange={setFatherName}
                                    />
                                    <div className="grid grid-cols-2 gap-8">
                                      <PDSFormGroup
                                        label="Mobile"
                                        placeholder="+91 XXXX"
                                        icon="call"
                                        value={fatherMobile}
                                        onChange={setFatherMobile}
                                      />
                                      <PDSFormGroup
                                        label="Email"
                                        placeholder="suresh.s@example.com"
                                        icon="mail"
                                        value={fatherEmail}
                                        onChange={setFatherEmail}
                                      />
                                    </div>
                                    <PDSFormGroup
                                      label="Occupation"
                                      placeholder="e.g. Senior Architect"
                                      value={fatherOccupation}
                                      onChange={setFatherOccupation}
                                    />
                                  </div>
                                </div>

                                {/* Mother Info */}
                                <div className="space-y-10">
                                  <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">
                                      person_3
                                    </span>
                                    <h5 className="text-[15px] font-bold text-foreground tracking-tight">
                                      Mother's Information
                                    </h5>
                                  </div>
                                  <div className="grid grid-cols-1 gap-y-8">
                                    <PDSFormGroup
                                      label="Full Name"
                                      placeholder="Legal Name"
                                      value={motherName}
                                      onChange={setMotherName}
                                    />
                                    <div className="grid grid-cols-2 gap-8">
                                      <PDSFormGroup
                                        label="Mobile"
                                        placeholder="+91 XXXX"
                                        icon="call"
                                        value={motherMobile}
                                        onChange={setMotherMobile}
                                      />
                                      <PDSFormGroup
                                        label="Email"
                                        placeholder="priya.s@example.com"
                                        icon="mail"
                                        value={motherEmail}
                                        onChange={setMotherEmail}
                                      />
                                    </div>
                                    <PDSFormGroup
                                      label="Occupation"
                                      placeholder="e.g. Content Lead"
                                      value={motherOccupation}
                                      onChange={setMotherOccupation}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Emergency Guardian */}
                              <div className="space-y-10 pt-10 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                  <div className="size-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">
                                      family_restroom
                                    </span>
                                  </div>
                                  <h5 className="text-[15px] font-bold text-foreground">
                                    Emergency Guardian / Contact
                                  </h5>
                                </div>
                                <div
                                  className={cn(
                                    "grid grid-cols-1 gap-10 transition-all duration-300",
                                    guardianRelation === "Other"
                                      ? "md:grid-cols-4"
                                      : "md:grid-cols-3",
                                  )}
                                >
                                  <PDSFormGroup
                                    label="Guardian Name"
                                    placeholder="Full Name"
                                    value={guardianName}
                                    onChange={setGuardianName}
                                  />
                                  <PDSFormGroup
                                    label="Relationship"
                                    type="select"
                                    options={[
                                      "Father",
                                      "Mother",
                                      "Grandparent",
                                      "Sibling",
                                      "Aunt",
                                      "Uncle",
                                      "Legal Guardian",
                                      "Other",
                                    ]}
                                    value={guardianRelation}
                                    onChange={setGuardianRelation}
                                    searchable
                                  />
                                  {guardianRelation === "Other" && (
                                    <PDSFormGroup
                                      label="Specify Relation"
                                      placeholder="e.g. Cousin"
                                      value={specifyRelation}
                                      onChange={setSpecifyRelation}
                                    />
                                  )}
                                  <PDSFormGroup
                                    label="Guardian Contact"
                                    placeholder="+91 XXXX"
                                    icon="call"
                                    value={guardianContact}
                                    onChange={setGuardianContact}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 3: Academic Logistics */}
                          {step.id === 3 && (
                            <div className="space-y-12">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <PDSFormGroup
                                  label="Admission Grade"
                                  type="select"
                                  options={classOptions}
                                  value={admissionGrade}
                                  onChange={setAdmissionGrade}
                                  searchable
                                />
                                <PDSFormGroup
                                  label="Academic Year"
                                  type="select"
                                  options={academicYears.map((y) => y.name || "")}
                                  value={academicYears.find((y) => y.id === academicYearId)?.name || ""}
                                  onChange={(name) => {
                                    const year = academicYears.find((y) => y.name === name);
                                    if (year) setAcademicYearId(year.id);
                                  }}
                                />
                                <PDSFormGroup
                                  label="Admission Number"
                                  placeholder="Auto-generated: OA-2024-XXX"
                                  value={admissionNo}
                                  onChange={setAdmissionNo}
                                  disabled
                                />
                                <PDSFormGroup
                                  label="Bus Transportation"
                                  type="select"
                                  options={[
                                    "Not Required",
                                    "Route A",
                                    "Route B",
                                    "Route C",
                                  ]}
                                  value={busRoute}
                                  onChange={setBusRoute}
                                  searchable
                                />
                              </div>
                              <PDSFormGroup
                                label="Residential Address"
                                type="textarea"
                                placeholder="Enter full residential address..."
                                value={address}
                                onChange={setAddress}
                                rows={3}
                              />
                            </div>
                          )}

                          {/* Section Actions */}
                          <div className="flex flex-col gap-4 pt-8 border-t border-slate-100">
                            {submitError && (
                              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-[13px] font-semibold">
                                <span className="material-symbols-outlined text-[20px]">
                                  error
                                </span>
                                <span>{submitError}</span>
                              </div>
                            )}
                            <div className="flex justify-end">
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
                                  disabled={isSubmitting}
                                  loading={isSubmitting}
                                >
                                  Finalize Enrollment
                                </PDSButton>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Silhouette Maintainer */}
            <div className="h-10 bg-white rounded-b-[32px] pointer-events-none" />
          </div>
        </div>
      </div>

      <PDSSuccessModal
        show={showSuccess}
        title="Student Enrolled!"
        description="Registration for the new academic session has been completed successfully."
        buttonText="View Student Records"
        onClose={() => navigate("/directory/students")}
      />
    </div>
  );
};
