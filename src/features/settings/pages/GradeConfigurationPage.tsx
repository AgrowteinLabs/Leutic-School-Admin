import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PDSPageHeader } from "../../../components/pds/PDSPageHeader";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";
import { cn } from "../../../lib/utils";
import { motion } from "framer-motion";
import { useApp } from "../../../lib/AppContext";
import { graphqlRequest } from "../../../lib/graphqlClient";

const UPDATE_SCHOOL_GRADES = `
  mutation UpdateSchoolGrades($id: ID!, $input: UpdateSchoolDto!) {
    updateSchool(id: $id, updateSchoolInput: $input) {
      id
      activeGrades
    }
  }
`;

const ALL_POSSIBLE_GRADES = [
    "LKG",
    "UKG",
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
    "Grade 11",
    "Grade 12",
];

const PRESETS = [
  { label: "Pre-Primary", start: "LKG", end: "UKG" },
  { label: "Primary School", start: "Grade 1", end: "Grade 5" },
  { label: "Middle School", start: "Grade 6", end: "Grade 8" },
  { label: "Secondary School", start: "Grade 9", end: "Grade 10" },
  { label: "Senior Secondary School", start: "Grade 11", end: "Grade 12" },
  { label: "K-12 School", start: "LKG", end: "Grade 12" },
  { label: "Custom Range", start: "Grade 1", end: "Grade 12" }
];

const getGroupedGradesString = (grades: string[]) => {
    if (grades.length === 0) return "None";
    
    const sorted = [...grades].sort((a, b) => ALL_POSSIBLE_GRADES.indexOf(a) - ALL_POSSIBLE_GRADES.indexOf(b));
    
    const kgGrades = sorted.filter(g => g === "LKG" || g === "UKG");
    const numericGrades = sorted.filter(g => g.startsWith("Grade "));
    
    const groups: string[] = [];
    
    if (kgGrades.length > 0) {
        if (kgGrades.length === 2) {
            groups.push("Kindergarten (LKG - UKG)");
        } else {
            groups.push(`Kindergarten (${kgGrades.join(", ")})`);
        }
    }
    
    if (numericGrades.length > 0) {
        const parsed = numericGrades.map(g => ({
            name: g,
            num: parseInt(g.replace("Grade ", ""), 10)
        })).sort((a, b) => a.num - b.num);
        
        let rangeStart = parsed[0].num;
        let rangeEnd = parsed[0].num;
        
        for (let i = 1; i < parsed.length; i++) {
            if (parsed[i].num === rangeEnd + 1) {
                rangeEnd = parsed[i].num;
            } else {
                if (rangeStart === rangeEnd) {
                    groups.push(`Grade ${rangeStart}`);
                } else {
                    groups.push(`Grades ${rangeStart} - ${rangeEnd}`);
                }
                rangeStart = parsed[i].num;
                rangeEnd = parsed[i].num;
            }
        }
        if (rangeStart === rangeEnd) {
            groups.push(`Grade ${rangeStart}`);
        } else {
            groups.push(`Grades ${rangeStart} - ${rangeEnd}`);
        }
    }
    
    return groups.join(", ");
};

interface GradingBoundary {
    grade: string;
    minPercent: number;
    maxPercent: number;
    points: number;
    description: string;
}

const CBSE_PRESET: GradingBoundary[] = [
    { grade: "A1", minPercent: 91, maxPercent: 100, points: 10, description: "Top Outstanding" },
    { grade: "A2", minPercent: 81, maxPercent: 90, points: 9, description: "Excellent" },
    { grade: "B1", minPercent: 71, maxPercent: 80, points: 8, description: "Very Good" },
    { grade: "B2", minPercent: 61, maxPercent: 70, points: 7, description: "Good" },
    { grade: "C1", minPercent: 51, maxPercent: 60, points: 6, description: "Above Average" },
    { grade: "C2", minPercent: 41, maxPercent: 50, points: 5, description: "Average" },
    { grade: "D", minPercent: 33, maxPercent: 40, points: 4, description: "Passing Grade" },
    { grade: "E", minPercent: 0, maxPercent: 32, points: 0, description: "Needs Improvement" },
];

const KERALA_SSLC_PRESET: GradingBoundary[] = [
    { grade: "A+", minPercent: 90, maxPercent: 100, points: 9, description: "Outstanding" },
    { grade: "A", minPercent: 80, maxPercent: 89, points: 8, description: "Excellent" },
    { grade: "B+", minPercent: 70, maxPercent: 79, points: 7, description: "Very Good" },
    { grade: "B", minPercent: 60, maxPercent: 69, points: 6, description: "Good" },
    { grade: "C+", minPercent: 50, maxPercent: 59, points: 5, description: "Above Average" },
    { grade: "C", minPercent: 40, maxPercent: 49, points: 4, description: "Average" },
    { grade: "D+", minPercent: 30, maxPercent: 39, points: 3, description: "Marginal" },
    { grade: "D", minPercent: 20, maxPercent: 29, points: 2, description: "Need Improvement" },
    { grade: "E", minPercent: 0, maxPercent: 19, points: 1, description: "Failed" },
];

export const GradeConfigurationPage = () => {
    const navigate = useNavigate();
    const { schoolProfile, refetchSchoolProfile } = useApp();
    const [activeTab, setActiveTab] = useState<"grades" | "scales">("grades");
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState<string | null>(null);

    // --- Tab 1: Grade Level States ---
    const [selectedPreset, setSelectedPreset] = useState("K-12 School (LKG - 12)");
    const [startGrade, setStartGrade] = useState("LKG");
    const [endGrade, setEndGrade] = useState("Grade 12");
    const [enabledGrades, setEnabledGrades] = useState<string[]>([]);

    useEffect(() => {
        if (schoolProfile && schoolProfile.activeGrades && schoolProfile.activeGrades.length > 0) {
            setEnabledGrades(schoolProfile.activeGrades);
            // Set lowest and highest based on what's active
            const active = [...schoolProfile.activeGrades].sort(
                (a, b) => ALL_POSSIBLE_GRADES.indexOf(a) - ALL_POSSIBLE_GRADES.indexOf(b)
            );
            if (active.length > 0) {
                setStartGrade(active[0]);
                setEndGrade(active[active.length - 1]);
                setSelectedPreset("Custom Range");
            }
            return;
        }

        const savedGrades = localStorage.getItem("leutic-enabled-grades");
        const savedStart = localStorage.getItem("leutic-start-grade");
        const savedEnd = localStorage.getItem("leutic-end-grade");
        const savedPreset = localStorage.getItem("leutic-grade-preset");

        if (savedGrades) {
            setEnabledGrades(JSON.parse(savedGrades));
        } else {
            setEnabledGrades([...ALL_POSSIBLE_GRADES]);
        }

        if (savedStart) setStartGrade(savedStart);
        if (savedEnd) setEndGrade(savedEnd);
        if (savedPreset) setSelectedPreset(savedPreset);
    }, []);

    // Sync custom range when preset changes
    const handlePresetChange = (presetLabel: string) => {
        setSelectedPreset(presetLabel);
        const preset = PRESETS.find((p) => p.label === presetLabel);
        if (preset && presetLabel !== "Custom Range") {
            setStartGrade(preset.start);
            setEndGrade(preset.end);
            applyRange(preset.start, preset.end);
        }
    };

    const applyRange = (start: string, end: string) => {
        const startIndex = ALL_POSSIBLE_GRADES.indexOf(start);
        const endIndex = ALL_POSSIBLE_GRADES.indexOf(end);

        if (startIndex !== -1 && endIndex !== -1) {
            const minIdx = Math.min(startIndex, endIndex);
            const maxIdx = Math.max(startIndex, endIndex);
            const newRange = ALL_POSSIBLE_GRADES.slice(minIdx, maxIdx + 1);
            setEnabledGrades(newRange);
        }
    };

    const handleStartSelect = (val: string) => {
        setStartGrade(val);
        setSelectedPreset("Custom Range");
        applyRange(val, endGrade);
    };

    const handleEndSelect = (val: string) => {
        setEndGrade(val);
        setSelectedPreset("Custom Range");
        applyRange(startGrade, val);
    };

    const toggleGradeCheckbox = (grade: string) => {
        setSelectedPreset("Custom Range");
        if (enabledGrades.includes(grade)) {
            setEnabledGrades(enabledGrades.filter((g) => g !== grade));
        } else {
            setEnabledGrades([...enabledGrades, grade].sort(
                (a, b) => ALL_POSSIBLE_GRADES.indexOf(a) - ALL_POSSIBLE_GRADES.indexOf(b)
            ));
        }
    };

    // --- Tab 2: Grading Scale States ---
    const [gradingScaleType, setGradingScaleType] = useState<"CBSE" | "Kerala SSLC" | "Custom">("CBSE");
    const [gradingRules, setGradingRules] = useState<GradingBoundary[]>(CBSE_PRESET);

    useEffect(() => {
        const savedScaleType = localStorage.getItem("leutic-scale-type") as any;
        const savedScaleRules = localStorage.getItem("leutic-scale-rules");

        if (savedScaleType) setGradingScaleType(savedScaleType);
        if (savedScaleRules) {
            setGradingRules(JSON.parse(savedScaleRules));
        } else {
            setGradingRules(CBSE_PRESET);
        }
    }, []);

    const handleScaleTypeChange = (type: string) => {
        setGradingScaleType(type as any);
        if (type === "CBSE") {
            setGradingRules(CBSE_PRESET);
        } else if (type === "Kerala SSLC") {
            setGradingRules(KERALA_SSLC_PRESET);
        } else {
            setGradingScaleType("Custom");
        }
    };

    const handleRuleUpdate = (index: number, field: keyof GradingBoundary, value: any) => {
        setGradingScaleType("Custom");
        const updated = [...gradingRules];
        updated[index] = { ...updated[index], [field]: value };
        setGradingRules(updated);
    };

    const removeRuleRow = (index: number) => {
        setGradingScaleType("Custom");
        setGradingRules(gradingRules.filter((_, i) => i !== index));
    };

    const addRuleRow = () => {
        setGradingScaleType("Custom");
        const newRule: GradingBoundary = {
            grade: "New",
            minPercent: 0,
            maxPercent: 0,
            points: 0,
            description: "Custom boundary",
        };
        setGradingRules([...gradingRules, newRule].sort((a, b) => b.minPercent - a.minPercent));
    };

    // --- Save Actions ---
    const handleSave = async () => {
        setError(null);
        if (activeTab === "grades") {
            const schoolId = localStorage.getItem("school_id") || "";
            try {
                await graphqlRequest(UPDATE_SCHOOL_GRADES, {
                    id: schoolId,
                    input: {
                        activeGrades: enabledGrades
                    }
                });
                await refetchSchoolProfile();

                localStorage.setItem("leutic-start-grade", startGrade);
                localStorage.setItem("leutic-end-grade", endGrade);
                localStorage.setItem("leutic-enabled-grades", JSON.stringify(enabledGrades));
                localStorage.setItem("leutic-grade-preset", selectedPreset);
                setSuccessMessage(`Academic grade structure updated.\nActive levels: ${getGroupedGradesString(enabledGrades)}.`);
                setShowSuccess(true);
            } catch (err) {
                console.error("Failed to update active grades:", err);
                setError(err instanceof Error ? err.message : "Failed to save active grades");
            }
        } else {
            localStorage.setItem("leutic-scale-type", gradingScaleType);
            localStorage.setItem("leutic-scale-rules", JSON.stringify(gradingRules));
            setSuccessMessage(`Grading scale scheme boundaries saved successfully.`);
            setShowSuccess(true);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
            <PDSPageHeader
                title="Grade & Grading Setup"
                subtitle="Configure class streams, active class ranges, and mark evaluation scales."
                showBack={false}
                actions={
                    <div className="flex items-center gap-3">
                        <PDSButton variant="text" onClick={() => navigate("/settings")}>
                            Cancel
                        </PDSButton>
                        <PDSButton variant="primary" icon="check_circle" onClick={handleSave}>
                            Save Changes
                        </PDSButton>
                    </div>
                }
            />

            {/* Clean Tab Bar */}
            <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab("grades")}
                            className={cn(
                                "flex items-center gap-2.5 pb-4 pt-6 text-[14px] font-semibold tracking-tight transition-all relative shrink-0",
                                activeTab === "grades" ? "text-foreground" : "text-[#B0AFA8] hover:text-foreground/70"
                            )}
                        >
                            <span 
                                className={cn("material-symbols-outlined text-[20px] transition-all", activeTab === "grades" ? "text-primary" : "")}
                                style={{ fontVariationSettings: activeTab === "grades" ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                school
                            </span>
                            Grade Levels Range
                            {activeTab === "grades" && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab("scales")}
                            className={cn(
                                "flex items-center gap-2.5 pb-4 pt-6 text-[14px] font-semibold tracking-tight transition-all relative shrink-0",
                                activeTab === "scales" ? "text-foreground" : "text-[#B0AFA8] hover:text-foreground/70"
                            )}
                        >
                            <span 
                                className={cn("material-symbols-outlined text-[20px] transition-all", activeTab === "scales" ? "text-primary" : "")}
                                style={{ fontVariationSettings: activeTab === "scales" ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                grade
                            </span>
                            Grading Scales
                            {activeTab === "scales" && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-[13px] font-semibold flex items-center gap-3">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}
                    {activeTab === "grades" ? (
                        <div className="space-y-8">
                            {/* Card 1: Range Definition */}
                            <div className="bg-white border border-slate-100 rounded-[20px] p-8 space-y-6">
                                <h3 className="text-[15px] font-bold text-foreground tracking-tight">Range Configuration</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <PDSFormGroup
                                        label="Institutional Structure Preset"
                                        type="select"
                                        options={PRESETS.map((p) => p.label)}
                                        value={selectedPreset}
                                        onChange={handlePresetChange}
                                    />

                                    <PDSFormGroup
                                        label="Lowest Grade / Class"
                                        type="select"
                                        options={ALL_POSSIBLE_GRADES}
                                        value={startGrade}
                                        onChange={handleStartSelect}
                                    />

                                    <PDSFormGroup
                                        label="Highest Grade / Class"
                                        type="select"
                                        options={ALL_POSSIBLE_GRADES}
                                        value={endGrade}
                                        onChange={handleEndSelect}
                                    />
                                </div>
                            </div>

                            {/* Card 2: Individual Checklist */}
                            <div className="bg-white border border-slate-100 rounded-[20px] p-8 space-y-6">
                                <div>
                                    <h3 className="text-[15px] font-bold text-foreground tracking-tight">Active Grades Checklist</h3>
                                    <p className="text-[11px] text-[#B0AFA8] font-medium mt-1">Specify exactly which grade levels are active in your school.</p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    {ALL_POSSIBLE_GRADES.map((grade) => {
                                        const isChecked = enabledGrades.includes(grade);
                                        return (
                                            <button
                                                key={grade}
                                                type="button"
                                                onClick={() => toggleGradeCheckbox(grade)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-4 h-9 rounded-xl border text-[13px] font-bold transition-all active:scale-95 cursor-pointer",
                                                    isChecked
                                                        ? "bg-[#152328] border-[#152328] text-[#D9EA85] hover:bg-[#1E353D] hover:border-[#D9EA85] hover:text-white"
                                                        : "bg-white border-slate-200 text-[#444441] hover:bg-[#F7F8F4] hover:border-slate-300 hover:text-[#152328]"
                                                )}
                                            >
                                                {isChecked && (
                                                    <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                                                )}
                                                <span>{grade}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Card: Evaluation Boundaries Table */}
                            <div className="bg-white border border-slate-100 rounded-[20px] p-8 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-[15px] font-bold text-foreground tracking-tight font-sans">Evaluation Scales</h3>
                                        <p className="text-[11px] text-[#B0AFA8] font-medium mt-1">Define boundary limits and values for score evaluations.</p>
                                    </div>

                                    <div className="w-64">
                                        <PDSFormGroup
                                            label="Select Grading Preset"
                                            type="select"
                                            options={["CBSE", "Kerala SSLC", "Custom"]}
                                            value={gradingScaleType}
                                            onChange={handleScaleTypeChange}
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto pt-2">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-[#B0AFA8] w-24">Grade</th>
                                                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-[#B0AFA8] w-28">Min Score (%)</th>
                                                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-[#B0AFA8] w-28">Max Score (%)</th>
                                                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-[#B0AFA8] w-24">Points</th>
                                                <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-[#B0AFA8]">Description</th>
                                                <th className="pb-3 w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {gradingRules.map((rule, index) => (
                                                <tr key={index} className="border-b border-slate-50 last:border-0 hover:bg-[#F7F8F4]/10 transition-colors">
                                                    <td className="py-3">
                                                        <input
                                                            value={rule.grade}
                                                            onChange={(e) => handleRuleUpdate(index, "grade", e.target.value)}
                                                            className="w-16 bg-[#F7F8F4] border border-transparent rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold text-foreground outline-none focus:bg-white focus:border-slate-200 text-center"
                                                        />
                                                    </td>
                                                    <td className="py-3">
                                                        <input
                                                            type="number"
                                                            value={rule.minPercent}
                                                            onChange={(e) => handleRuleUpdate(index, "minPercent", parseInt(e.target.value) || 0)}
                                                            className="w-20 bg-[#F7F8F4] border border-transparent rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-foreground outline-none focus:bg-white focus:border-slate-200"
                                                        />
                                                    </td>
                                                    <td className="py-3">
                                                        <input
                                                            type="number"
                                                            value={rule.maxPercent}
                                                            onChange={(e) => handleRuleUpdate(index, "maxPercent", parseInt(e.target.value) || 0)}
                                                            className="w-20 bg-[#F7F8F4] border border-transparent rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-foreground outline-none focus:bg-white focus:border-slate-200"
                                                        />
                                                    </td>
                                                    <td className="py-3">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            value={rule.points}
                                                            onChange={(e) => handleRuleUpdate(index, "points", parseFloat(e.target.value) || 0)}
                                                            className="w-16 bg-[#F7F8F4] border border-transparent rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-foreground outline-none focus:bg-white focus:border-slate-200 text-center"
                                                        />
                                                    </td>
                                                    <td className="py-3">
                                                        <input
                                                            value={rule.description}
                                                            onChange={(e) => handleRuleUpdate(index, "description", e.target.value)}
                                                            placeholder="e.g. Excellent"
                                                            className="w-full bg-[#F7F8F4] border border-transparent rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-foreground outline-none focus:bg-white focus:border-slate-200"
                                                        />
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRuleRow(index)}
                                                            className="size-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-start">
                                    <button
                                        type="button"
                                        onClick={addRuleRow}
                                        className="btn-outline h-9 px-4 text-[12px] font-bold flex items-center gap-2 rounded-lg"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">add</span>
                                        Add Rule Row
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <PDSSuccessModal
                show={showSuccess}
                title="Settings Saved"
                description={successMessage}
                buttonText="Return"
                onAction={() => setShowSuccess(false)}
                onClose={() => setShowSuccess(false)}
            />
        </div>
    );
};
