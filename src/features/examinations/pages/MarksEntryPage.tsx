import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { AppDropdown } from "../../../components/AppDropdown";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";

const subjects = [
  "Mathematics", "Physics", "Chemistry", "English", 
  "Biology", "History", "Geography", "Computer Science"
];

const mockStudents = [
  { id: "STU-001", name: "Aavya Sharma", rollNo: "12", marks: { Mathematics: "88", Physics: "", Chemistry: "76", English: "", Biology: "85", History: "", Geography: "70", "Computer Science": "92" } },
  { id: "STU-002", name: "Ishan Verma", rollNo: "15", marks: { Mathematics: "85", Physics: "90", Chemistry: "", English: "82", Biology: "", History: "88", Geography: "", "Computer Science": "85" } },
  { id: "STU-003", name: "Kavya Nair", rollNo: "18", marks: { Mathematics: "", Physics: "", Chemistry: "", English: "", Biology: "", History: "", Geography: "", "Computer Science": "" } },
  { id: "STU-004", name: "Rohan Das", rollNo: "22", marks: { Mathematics: "92", Physics: "88", Chemistry: "94", English: "90", Biology: "95", History: "92", Geography: "88", "Computer Science": "98" } },
  { id: "STU-005", name: "Sanya Gupta", rollNo: "25", marks: { Mathematics: "", Physics: "78", Chemistry: "", English: "", Biology: "82", History: "", Geography: "75", "Computer Science": "" } },
];

interface MarksEntryPageProps {
  isHubChild?: boolean;
  triggerBulkUpload?: number;
  onUploadComplete?: () => void;
}

export const MarksEntryPage = ({ isHubChild, triggerBulkUpload, onUploadComplete }: MarksEntryPageProps) => {
  const [examCategory, setExamCategory] = useState("Mid-Term Examination");
  const [grade, setGrade] = useState("Grade 10");
  const [section, setSection] = useState("Section A");
  const [subject, setSubject] = useState("All Subjects");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [studentMarks, setStudentMarks] = useState(mockStudents);

  const handleMarkChange = (id: string, sub: string, value: string) => {
    setStudentMarks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, marks: { ...s.marks, [sub]: value } } : s))
    );
  };

  useEffect(() => {
    if (triggerBulkUpload && triggerBulkUpload > 0) {
      // Handle bulk upload trigger from parent TopBar
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
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
              <AppDropdown
                icon="quiz"
                value={examCategory}
                onChange={setExamCategory}
                options={["Mid-Term Examination", "Annual Examination", "Quarterly Assessment"]}
                placeholder="Select Exam"
              />
              <AppDropdown
                icon="school"
                value={grade}
                onChange={setGrade}
                options={["Grade 10", "Grade 11", "Grade 12"]}
                placeholder="Select Grade"
              />
              <AppDropdown
                icon="layers"
                value={section}
                onChange={setSection}
                options={["Section A", "Section B", "Section C"]}
                placeholder="Select Section"
              />
              <AppDropdown
                icon="menu_book"
                value={subject}
                onChange={setSubject}
                options={["All Subjects", ...subjects]}
                placeholder="Select Subject"
              />
            </div>
            <PDSButton variant="primary" className="h-10 px-8 rounded-xl font-bold shrink-0">
              Fetch Registry
            </PDSButton>
          </div>

          {/* Marks Entry Registry */}
          <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden flex flex-col min-h-0">
            <div className="overflow-x-auto no-scrollbar">
              <table className={cn(
                "text-left border-separate border-spacing-0",
                isAllSubjects ? "min-w-[1600px]" : "w-full"
              )}>
                <thead className="relative z-40">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest w-[100px] bg-[#F7F8F4] sticky left-0 top-0 z-50 border-b border-slate-100">Roll No</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest min-w-[280px] bg-[#F7F8F4] sticky left-[100px] top-0 z-50 border-b border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Full Name & ID</th>
                    
                    {isAllSubjects ? (
                      subjects.map(sub => (
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
                          <div className="flex flex-col">
                             <span className="text-[13px] font-bold text-brand-navy">{student.name}</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{student.id}</span>
                          </div>
                        </td>

                        {isAllSubjects ? (
                          subjects.map(sub => (
                            <td key={sub} className="px-4 py-4">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={marksMap[sub] || ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9]/g, '');
                                  if (val === '' || (parseInt(val) <= 100)) {
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
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                if (val === '' || (parseInt(val) <= 100)) {
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
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="shrink-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 flex justify-end gap-4 relative z-20">
          <PDSButton variant="outline" className="px-10">Discard Changes</PDSButton>
          <PDSButton variant="primary" className="px-10 shadow-lg shadow-primary/10" onClick={() => setIsSuccessModalOpen(true)}>Save Final Marks</PDSButton>
      </div>

      <PDSSuccessModal
        show={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Marks Recorded Successfully"
        description={`Student performance for ${subject} — ${examCategory} has been updated in the master registry.`}
        buttonText="Back to Academics"
        onAction={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
};
