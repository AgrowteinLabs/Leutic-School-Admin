import { useState, useEffect, useMemo } from "react";
import { cn } from "../../../lib/utils";
import { AppDropdown } from "../../../components/AppDropdown";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";
import { graphqlRequest } from "../../../lib/graphqlClient";

const subjects = [
  "Mathematics", "Physics", "Chemistry", "English", 
  "Biology", "History", "Geography", "Computer Science"
];

const GET_EXAMS = `
  query GetExams {
    exams(page: 1, pageSize: 100) {
      items {
        id
        name
        type
        dates {
          id
          subject
          syllabus
          date
          time
        }
      }
    }
  }
`;

const GET_CLASSES = `
  query GetClasses($schoolId: String) {
    classes(filter: { schoolId: $schoolId }, page: 1, pageSize: 100) {
      items {
        id
        grade
        section
      }
    }
  }
`;

const GET_STUDENTS = `
  query GetClassStudents($classId: String, $schoolId: ID) {
    users(filter: { role: "STUDENT", classId: $classId, schoolId: $schoolId, page: 1, pageSize: 200 }) {
      items {
        id
        name
        admissionNumber
        classId
      }
    }
  }
`;

const GET_MARKS = `
  query GetMarks {
    marks(page: 1, pageSize: 1000) {
      items {
        id
        studentId
        examId
        subject
        marksObtained
        totalMarks
      }
    }
  }
`;

const BULK_SAVE_MARKS = `
  mutation BulkSaveMarks($inputs: [BulkMarkInput!]!) {
    bulkSaveMarks(inputs: $inputs) {
      id
      studentId
      examId
      subject
      marksObtained
      totalMarks
    }
  }
`;

interface MarksEntryPageProps {
  isHubChild?: boolean;
  triggerBulkUpload?: number;
  onUploadComplete?: () => void;
}

export const MarksEntryPage = ({ isHubChild, triggerBulkUpload, onUploadComplete }: MarksEntryPageProps) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");

  const [subject, setSubject] = useState("All Subjects");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [studentMarks, setStudentMarks] = useState<any[]>([]);
  const [originalStudentMarks, setOriginalStudentMarks] = useState<any[]>([]);

  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [dbMappings, setDbMappings] = useState<any[]>([]);

  // Load classes and exams on mount
  useEffect(() => {
    const initPage = async () => {
      setIsLoading(true);
      try {
        const schoolId = localStorage.getItem("school_id") || "";
        const [classesRes, examsRes, subjectsRes, mappingsRes] = await Promise.all([
          graphqlRequest<any>(GET_CLASSES, { schoolId }),
          graphqlRequest<any>(GET_EXAMS),
          graphqlRequest<any>(`
            query GetSubjects($schoolId: String!) {
              subjects(schoolId: $schoolId) {
                id
                name
              }
            }
          `, { schoolId }),
          graphqlRequest<any>(`
            query GetMappings {
              curriculumMappings(page: 1, pageSize: 1000) {
                items {
                  classId
                  subjectId
                }
              }
            }
          `)
        ]);

        const classesList = classesRes.classes?.items || [];
        setClasses(classesList);
        if (classesList.length > 0) {
          const firstClass = classesList[0];
          setSelectedClass(firstClass.section ? `${firstClass.grade}-${firstClass.section}` : firstClass.grade);
        }

        const examsList = examsRes.exams?.items || [];
        setExams(examsList);
        if (examsList.length > 0) {
          setSelectedExam(examsList[0].name);
        }

        setDbSubjects(subjectsRes?.subjects || []);
        setDbMappings(mappingsRes?.curriculumMappings?.items || []);
      } catch (err) {
        console.error("Error loading exams and classes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initPage();
  }, []);

  const classOptions = useMemo(() => {
    return classes.map(c => c.section ? `${c.grade}-${c.section}` : c.grade);
  }, [classes]);

  const activeClass = useMemo(() => {
    return classes.find(c => {
      const label = c.section ? `${c.grade}-${c.section}` : c.grade;
      return label === selectedClass;
    });
  }, [classes, selectedClass]);

  const examOptions = useMemo(() => {
    return exams.map(e => e.name);
  }, [exams]);

  const activeExam = useMemo(() => {
    return exams.find(e => e.name === selectedExam);
  }, [exams, selectedExam]);

  const activeSubjects = useMemo(() => {
    if (activeClass?.id && dbMappings.length > 0 && dbSubjects.length > 0) {
      const mappedSubjectIds = dbMappings
        .filter((m: any) => m.classId === activeClass.id)
        .map((m: any) => m.subjectId);
      
      const mappedSubjects = dbSubjects
        .filter((s: any) => mappedSubjectIds.includes(s.id))
        .map((s: any) => s.name);
        
      if (mappedSubjects.length > 0) {
        return mappedSubjects;
      }
    }
    if (activeExam?.dates && activeExam.dates.length > 0) {
      const subs = activeExam.dates.map((d: any) => d.subject);
      return Array.from(new Set(subs)) as string[];
    }
    return subjects;
  }, [activeClass?.id, dbMappings, dbSubjects, activeExam]);

  const subjectOptions = useMemo(() => {
    return ["All Subjects", ...activeSubjects];
  }, [activeSubjects]);

  const fetchRegistry = async () => {
    if (!activeClass?.id || !activeExam?.id) return;
    setIsLoading(true);
    try {
      const schoolId = localStorage.getItem("school_id");
      const [studentsRes, marksRes] = await Promise.all([
        graphqlRequest<any>(GET_STUDENTS, { classId: activeClass.id, schoolId }),
        graphqlRequest<any>(GET_MARKS)
      ]);

      const studentsList = studentsRes.users?.items || [];
      const marksList = marksRes.marks?.items || [];

      const marksMap: Record<string, Record<string, { id: string; marksObtained: number }>> = {};
      marksList.forEach((m: any) => {
        if (m.examId === activeExam.id) {
          if (!marksMap[m.studentId]) {
            marksMap[m.studentId] = {};
          }
          marksMap[m.studentId][m.subject] = {
            id: m.id,
            marksObtained: m.marksObtained
          };
        }
      });

      const mappedStudents = studentsList.map((student: any) => {
        const studentMarksObj: Record<string, string> = {};
        const studentMarkIdsObj: Record<string, string> = {};

        activeSubjects.forEach((sub: string) => {
          const recorded = marksMap[student.id]?.[sub];
          studentMarksObj[sub] = recorded ? String(recorded.marksObtained) : "";
          studentMarkIdsObj[sub] = recorded ? recorded.id : "";
        });

        return {
          id: student.id,
          name: student.name,
          rollNo: student.admissionNumber || student.id.slice(0, 8),
          marks: studentMarksObj,
          markIds: studentMarkIdsObj
        };
      });

      setStudentMarks(mappedStudents);
      setOriginalStudentMarks(JSON.parse(JSON.stringify(mappedStudents)));
    } catch (err) {
      console.error("Error fetching registry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistry();
  }, [activeClass?.id, activeExam?.id, activeExam?.dates]);

  const handleMarkChange = (id: string, sub: string, value: string) => {
    setStudentMarks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, marks: { ...s.marks, [sub]: value } } : s))
    );
  };

  const handleSaveMarks = async () => {
    if (!activeExam?.id) return;
    setIsSaving(true);
    try {
      const inputs = [];
      for (const student of studentMarks) {
        for (const sub of activeSubjects) {
          const valStr = student.marks[sub];
          const originalValStr = originalStudentMarks.find(s => s.id === student.id)?.marks[sub] || "";
          
          if (valStr !== originalValStr) {
            const marksVal = valStr === "" ? 0 : parseFloat(valStr);
            inputs.push({
              studentId: student.id,
              examId: activeExam.id,
              subject: sub,
              marks: marksVal,
              totalMarks: 100
            });
          }
        }
      }

      if (inputs.length === 0) {
        alert("No changes detected to save.");
        return;
      }

      await graphqlRequest(BULK_SAVE_MARKS, { inputs });
      await fetchRegistry();
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Error saving marks:", err);
      alert("Failed to save some marks. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setStudentMarks(JSON.parse(JSON.stringify(originalStudentMarks)));
  };

  useEffect(() => {
    if (triggerBulkUpload && triggerBulkUpload > 0) {
      setTimeout(() => {
        onUploadComplete?.();
        setIsSuccessModalOpen(true);
      }, 1500);
    }
  }, [triggerBulkUpload]);

  const isAllSubjects = subject === "All Subjects";

  return (
    <div className={cn("flex-1 flex flex-col bg-white min-h-0", !isHubChild && "h-screen")}>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 min-h-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 space-y-8">
          
          {/* Refinement Engine - Zero Box Aesthetic */}
          <div className="flex items-center gap-3">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <AppDropdown
                icon="quiz"
                value={selectedExam}
                onChange={setSelectedExam}
                options={examOptions}
                placeholder="Select Exam"
              />
              <AppDropdown
                icon="school"
                value={selectedClass}
                onChange={setSelectedClass}
                options={classOptions}
                placeholder="Select Class"
                searchable={true}
              />
              <AppDropdown
                icon="menu_book"
                value={subject}
                onChange={setSubject}
                options={subjectOptions}
                placeholder="Select Subject"
              />
            </div>
            <PDSButton 
              variant="primary" 
              className="h-10 px-8 rounded-xl font-bold shrink-0"
              onClick={fetchRegistry}
              loading={isLoading}
            >
              Fetch Registry
            </PDSButton>
          </div>

          {/* Marks Entry Registry */}
          <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden flex flex-col min-h-0 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <div className="overflow-x-auto no-scrollbar">
              {studentMarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <span className="material-symbols-outlined text-[48px] mb-3 text-slate-300">
                    sentiment_dissatisfied
                  </span>
                  <p className="text-[14px] font-semibold">No students found in this class</p>
                  <p className="text-[12px]">Please verify class enrollment under the students tab.</p>
                </div>
              ) : (
                <table className={cn(
                  "text-left border-separate border-spacing-0",
                  isAllSubjects ? "min-w-[1600px]" : "w-full"
                )}>
                  <thead className="relative z-40">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest w-[100px] bg-[#F7F8F4] sticky left-0 top-0 z-50 border-b border-slate-100">Roll No</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest min-w-[280px] bg-[#F7F8F4] sticky left-[100px] top-0 z-50 border-b border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Full Name & ID</th>
                      
                      {isAllSubjects ? (
                        activeSubjects.map(sub => (
                          <th key={sub} className="px-4 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-center w-[160px] bg-[#F7F8F4] sticky top-0 z-40 border-b border-slate-100">{sub}</th>
                        ))
                      ) : (
                        <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest w-[200px] text-center bg-[#F7F8F4] sticky top-0 z-40 border-b border-slate-100">{subject} (Max 100)</th>
                      )}
                      
                      <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest text-right bg-[#F7F8F4] sticky top-0 z-40 border-b border-slate-100">Status</th>
                    </tr>
                  </thead>
                  <tbody className="relative z-0">
                    {studentMarks.map((student) => {
                      const marksMap = student.marks as Record<string, string>;
                      const isRecorded = isAllSubjects 
                        ? Object.values(marksMap).some(v => v !== "")
                        : marksMap[subject] !== "";

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 bg-white sticky left-0 z-30 group-hover:bg-slate-50 transition-colors border-b border-slate-50">
                            <span className="text-[13px] font-bold text-brand-navy">{student.rollNo}</span>
                          </td>
                          <td className="px-6 py-4 bg-white sticky left-[100px] z-30 group-hover:bg-slate-50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-b border-slate-50">
                            <span className="text-[13px] font-bold text-brand-navy">{student.name}</span>
                          </td>

                          {isAllSubjects ? (
                            activeSubjects.map(sub => (
                              <td key={sub} className="px-4 py-4">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={marksMap[sub] || ""}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                    if (val === '' || (parseFloat(val) <= 100)) {
                                      handleMarkChange(student.id, sub, val);
                                    }
                                  }}
                                  placeholder="--"
                                  className="w-full h-11 text-center bg-white border border-slate-100 rounded-xl text-[14px] font-bold text-brand-navy focus:border-primary transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </td>
                            ))
                          ) : (
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={marksMap[subject] || ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, '');
                                  if (val === '' || (parseFloat(val) <= 100)) {
                                    handleMarkChange(student.id, subject, val);
                                  }
                                }}
                                placeholder="--"
                                className="w-full h-11 text-center bg-[#F7F8F4] border border-transparent rounded-xl text-[14px] font-bold text-brand-navy focus:border-primary focus:bg-white transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </td>
                          )}

                          <td className="px-6 py-4 text-right">
                            <span className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap",
                              isRecorded ? "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]" : "bg-slate-50 text-slate-400 border-slate-200"
                            )}>
                              {isRecorded ? "Recorded" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="shrink-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 flex justify-end gap-4 relative z-20">
          <PDSButton 
            variant="outline" 
            className="px-10"
            onClick={handleDiscardChanges}
            disabled={isLoading || isSaving}
          >
            Discard Changes
          </PDSButton>
          <PDSButton 
            variant="primary" 
            className="px-10 shadow-lg shadow-primary/10" 
            onClick={handleSaveMarks}
            loading={isSaving}
            disabled={isLoading || isSaving || studentMarks.length === 0}
          >
            Save Final Marks
          </PDSButton>
      </div>

      <PDSSuccessModal
        show={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Marks Recorded Successfully"
        description={`Student performance for ${subject} — ${selectedExam} has been updated in the master registry.`}
        buttonText="Back to Academics"
        onAction={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
};
