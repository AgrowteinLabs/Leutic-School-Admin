import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";
import { graphqlRequest } from "../../../lib/graphqlClient";

const CREATE_EXAM = `
  mutation CreateExam($input: CreateExamDto!) {
    createExam(createExamInput: $input) {
      id
      name
    }
  }
`;

export const AddExaminationPage = () => {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [examTitle, setExamTitle] = useState("");
    const [examType, setExamType] = useState("");
    const [academicTerm, setAcademicTerm] = useState("");
    const [academicYear, setAcademicYear] = useState("Academic Year 2025 - 2026");
    const [targetGrades, setTargetGrades] = useState<string[]>([]);
    
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [publishDate, setPublishDate] = useState<Date | null>(null);

    const ALL_GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
    const EXAM_TYPES = ["Periodic Test (PT)", "Unit Test", "Quarterly", "Half Yearly", "Annual Exam", "Mock Test", "Practical / Internal", "Continuous Evaluation"];
    const TERMS = ["Term 1", "Term 2", "Annual", "Quarterly"];
    const ACADEMIC_YEARS = ["Academic Year 2025 - 2026", "Academic Year 2024 - 2025", "Academic Year 2023 - 2024"];

    const handleCreateExam = async () => {
        if (!examTitle) {
            alert("Please provide an examination title.");
            return;
        }

        setIsLoading(true);
        try {
            const schoolId = localStorage.getItem("school_id") || "";
            const startStr = startDate ? startDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
            const endStr = endDate ? endDate.toISOString().split("T")[0] : startStr;

            // Generate scheduled subjects based on standard subjects list or target grades
            const datesInput = [
                {
                    date: startStr,
                    subject: "General Assessment",
                    syllabus: `Exam conducted from ${startStr} to ${endStr}`,
                    time: "09:00 AM"
                }
            ];

            await graphqlRequest<any>(CREATE_EXAM, {
                input: {
                    schoolId,
                    name: examTitle,
                    type: examType || "Quarterly",
                    dates: datesInput
                }
            });
            setShowSuccess(true);
        } catch (err) {
            console.error("Error creating exam:", err);
            alert("Failed to create exam: " + (err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
            <TopBar 
                title="Create Exam"
                subtitle="Setup new exams and tests for the academic year"
                actions={
                    <div className="flex items-center gap-3">
                        <PDSButton variant="text" onClick={() => navigate("/academics/exams")} disabled={isLoading}>Cancel</PDSButton>
                        <PDSButton variant="primary" icon="check_circle" onClick={handleCreateExam} loading={isLoading}>Create Exam</PDSButton>
                    </div>
                }
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
                    
                    {/* Unified Form Container - Matured UI Standard */}
                    <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm shadow-slate-100/50 overflow-visible relative z-10">
                        
                        {/* Section 1: Examination Identity */}
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-[22px]">fingerprint</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-foreground font-bold text-[17px] tracking-tight">Exam Details</h3>
                                    <p className="text-[13px] font-medium text-[#B0AFA8]">Name and year for this exam</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <PDSFormGroup 
                                    label="Examination Title" 
                                    placeholder="e.g. Mid-Term Assessment 2024" 
                                    value={examTitle} 
                                    onChange={setExamTitle} 
                                />
                                <PDSFormGroup label="Exam Category" type="select" options={EXAM_TYPES} placeholder="Select category" value={examType} onChange={setExamType} />
                                <PDSFormGroup label="Academic Year" type="select" options={ACADEMIC_YEARS} placeholder="Select year" value={academicYear} onChange={setAcademicYear} />
                                <PDSFormGroup label="Academic Term" type="select" options={TERMS} placeholder="Select term" value={academicTerm} onChange={setAcademicTerm} />
                            </div>
                        </div>

                        {/* Section Divider */}
                        <div className="h-px bg-slate-50 mx-10" />

                        {/* Section 2: Target Selection */}
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <span className="material-symbols-outlined text-[22px]">groups</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-foreground font-bold text-[17px] tracking-tight">Classes</h3>
                                    <p className="text-[13px] font-medium text-[#B0AFA8]">Select classes for this exam</p>
                                </div>
                            </div>

                            <PDSFormGroup 
                                label="Eligible Grades" 
                                type="chips" 
                                options={ALL_GRADES} 
                                value={targetGrades} 
                                onChange={setTargetGrades} 
                            />
                        </div>

                        {/* Section Divider */}
                        <div className="h-px bg-slate-50 mx-10" />

                        {/* Section 3: Cycle Timeline */}
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-foreground font-bold text-[17px] tracking-tight">Exam Schedule</h3>
                                    <p className="text-[13px] font-medium text-[#B0AFA8]">When to conduct exams and publish results</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <PDSFormGroup label="Start Date" type="date" placeholder="Select date" value={startDate} onChange={setStartDate} />
                                <PDSFormGroup label="End Date" type="date" placeholder="Select date" value={endDate} onChange={setEndDate} />
                                <PDSFormGroup label="Result Publication" type="date" placeholder="Expected date" value={publishDate} onChange={setPublishDate} optional />
                            </div>
                        </div>

                        {/* Footer Action Bar */}
                        <div className="bg-slate-50/50 p-6 flex justify-end items-center gap-4 border-t border-slate-100 rounded-b-[32px]">
                             <PDSButton variant="text" onClick={() => navigate("/academics/exams")} disabled={isLoading}>Cancel</PDSButton>
                             <PDSButton variant="primary" className="px-10 h-10" onClick={handleCreateExam} loading={isLoading}>Create Exam</PDSButton>
                        </div>
                    </div>
                </div>
            </div>

            <PDSSuccessModal 
                show={showSuccess}
                title="Examination Created!"
                description={`The exam cycle "${examTitle}" has been successfully setup.`}
                buttonText="Go to Exam Hub"
                onClose={() => navigate("/academics/exams")}
            />
        </div>
    );
};
