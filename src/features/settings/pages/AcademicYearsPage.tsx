import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDSPageHeader } from "../../../components/pds/PDSPageHeader";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { useApp } from "../../../lib/AppContext";
import type { AcademicYear } from "../../../lib/AppContext";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SAVE_DRAFT = `
  mutation SaveDraft($input: SaveAcademicYearInput!) {
    saveAcademicYearDraft(input: $input) {
      id
      status
      termsCount
    }
  }
`;

const DELETE_DRAFT = `
  mutation DeleteDraft($id: ID!) {
    deleteAcademicYearDraft(id: $id)
  }
`;

const RUN_ROLLOVER = `
  mutation RunRollover($id: ID!, $options: RolloverOptionsInput!) {
    initiateAcademicYearRollover(id: $id, options: $options)
  }
`;

export const AcademicYearsPage = () => {
  const navigate = useNavigate();
  const { academicYears, refetchAcademicYears, refetchAll } = useApp();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Wizard State variables
  const [editingYearId, setEditingYearId] = useState<string | null>(null);
  const [yearName, setYearName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [terms, setTerms] = useState<Array<{ name: string; startDate: string; endDate: string }>>([
    { name: "Term 1", startDate: "", endDate: "" }
  ]);

  // Rollover options
  const [rollStudents, setRollStudents] = useState(true);
  const [rollTeachers, setRollTeachers] = useState(true);
  const [rollSubjects, setRollSubjects] = useState(true);
  const [rollTimetable, setRollTimetable] = useState(true);
  const [rollAura, setRollAura] = useState(true);

  // Form helpers
  const handleAddTerm = () => {
    setTerms([...terms, { name: `Term ${terms.length + 1}`, startDate: "", endDate: "" }]);
  };

  const handleRemoveTerm = (index: number) => {
    if (terms.length > 1) {
      setTerms(terms.filter((_, i) => i !== index));
    }
  };

  const handleTermChange = (index: number, field: "name" | "startDate" | "endDate", value: string) => {
    const updated = [...terms];
    updated[index] = { ...updated[index], [field]: value };
    setTerms(updated);
  };

  const startNewCycle = () => {
    // Initialize defaults for next cycle
    setEditingYearId(null);
    setYearName("");
    setStartDate("");
    setEndDate("");
    setTerms([{ name: "Term 1", startDate: "", endDate: "" }]);
    setError(null);
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const openEditDraft = (draft: AcademicYear) => {
    setEditingYearId(draft.id);
    setYearName(draft.name || "");
    // Format dates to YYYY-MM-DD for HTML input
    setStartDate(draft.startDate ? draft.startDate.split("T")[0] : "");
    setEndDate(draft.endDate ? draft.endDate.split("T")[0] : "");
    if (draft.terms && draft.terms.length > 0) {
      setTerms(draft.terms.map(t => ({
        name: t.name,
        startDate: t.startDate ? t.startDate.split("T")[0] : "",
        endDate: t.endDate ? t.endDate.split("T")[0] : ""
      })));
    } else {
      setTerms([{ name: "Term 1", startDate: "", endDate: "" }]);
    }
    setError(null);
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm("Are you sure you want to discard this draft academic cycle?")) return;
    try {
      await graphqlRequest(DELETE_DRAFT, { id });
      await refetchAcademicYears();
    } catch (err) {
      console.error("Failed to delete draft:", err);
      alert("Failed to delete draft cycle: " + (err as Error).message);
    }
  };

  const handleSaveDraft = async () => {
    if (!startDate || !endDate) {
      setError("Please specify the Start and End dates for the Academic Year.");
      return;
    }
    // Validation: terms check
    for (const term of terms) {
      if (!term.name || !term.startDate || !term.endDate) {
        setError("Please fill in all Term names and dates.");
        return;
      }
      if (new Date(term.startDate) >= new Date(term.endDate)) {
        setError(`Term "${term.name}" start date must be before its end date.`);
        return;
      }
    }

    setIsSaving(true);
    setError(null);
    try {
      const schoolId = localStorage.getItem("school_id") || "";
      const payload = {
        id: editingYearId,
        schoolId,
        name: yearName || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        terms: terms.map(t => ({
          name: t.name,
          startDate: new Date(t.startDate).toISOString(),
          endDate: new Date(t.endDate).toISOString()
        }))
      };

      const res = await graphqlRequest<{ saveAcademicYearDraft: { id: string } }>(SAVE_DRAFT, { input: payload });
      if (res?.saveAcademicYearDraft?.id) {
        setEditingYearId(res.saveAcademicYearDraft.id);
      }
      await refetchAcademicYears();
      
      // If we clicked Save & Continue, move to step 3. Otherwise close.
      return res?.saveAcademicYearDraft?.id;
    } catch (err) {
      console.error("Failed to save draft cycle:", err);
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = async () => {
    if (wizardStep === 1) {
      // Basic checks
      if (!startDate || !endDate) {
        setError("Start and End dates are required.");
        return;
      }
      if (new Date(startDate) >= new Date(endDate)) {
        setError("Academic Year start date must be before its end date.");
        return;
      }
      setError(null);
      setWizardStep(2);
    } else if (wizardStep === 2) {
      const savedId = await handleSaveDraft();
      if (savedId) {
        setWizardStep(3);
      }
    }
  };

  const handleRunRollover = async () => {
    if (!editingYearId) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await graphqlRequest<{ initiateAcademicYearRollover: string }>(RUN_ROLLOVER, {
        id: editingYearId,
        options: {
          promoteStudents: rollStudents,
          archivePastGrades: true,
          copyCurriculumMaps: rollSubjects,
          transferActiveTeachers: rollTeachers
        }
      });
      setSuccessMsg(res?.initiateAcademicYearRollover || "Rollover initiated successfully!");
      setIsWizardOpen(false);
      await refetchAll();
    } catch (err) {
      console.error("Rollover failed:", err);
      setError(err instanceof Error ? err.message : "Rollover failed");
    } finally {
      setIsSaving(false);
    }
  };

  const draftExists = academicYears.some(y => y.status === "DRAFT");

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
      <PDSPageHeader
        title="Academic Cycles & Rollover"
        subtitle="Manage relational academic years, term configurations, and execute year rollovers."
        showBack
        onBack={() => navigate("/settings")}
        actions={
          <PDSButton
            variant="primary"
            icon="add_circle"
            disabled={draftExists}
            onClick={startNewCycle}
          >
            New Academic Year
          </PDSButton>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 space-y-8">
          
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-[13px] font-semibold flex items-center gap-3 animate-in fade-in duration-300">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <div>{successMsg}</div>
              <button onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Warning Banner if Draft exists */}
          {draftExists && (
            <div className="p-5 bg-amber-50/60 border border-amber-100/80 rounded-2xl flex gap-4 items-start max-w-4xl">
              <div className="size-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div className="space-y-1">
                <p className="text-[13.5px] font-bold text-foreground">Draft Cycle in Progress</p>
                <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                  A draft academic year is currently configured. To create another cycle, you must first complete the rollover for this draft or delete it.
                </p>
              </div>
            </div>
          )}

          {/* Cycles Grid */}
          <div className="space-y-6">
            <h3 className="text-[16px] font-bold text-foreground tracking-tight">Academic History & Setup</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {academicYears.map((year) => (
                <div 
                  key={year.id}
                  className={cn(
                    "bg-white border rounded-[24px] p-6 space-y-5 flex flex-col relative transition-all duration-300 hover:shadow-md",
                    year.status === "ACTIVE" ? "border-emerald-100/70 ring-4 ring-emerald-50/30" : "border-slate-100"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-[15px] font-bold text-foreground tracking-tight">
                        {year.name || "Academic Year"}
                      </h4>
                      <p className="text-[11px] text-[#B0AFA8] font-bold tracking-tight">
                        {new Date(year.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} - {new Date(year.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </p>
                    </div>

                    <span className={cn(
                      "text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full",
                      year.status === "ACTIVE" && "bg-emerald-50 text-emerald-700",
                      year.status === "DRAFT" && "bg-amber-50 text-amber-700",
                      year.status === "COMPLETED" && "bg-slate-100 text-slate-500"
                    )}>
                      {year.status}
                    </span>
                  </div>

                  {/* Terms summary */}
                  <div className="bg-[#F7F8F4]/40 border border-slate-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Terms Breakdown</span>
                      <span>{year.termsCount || year.terms?.length || 0} Terms</span>
                    </div>

                    {year.terms && year.terms.length > 0 ? (
                      <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                        {year.terms.map((t, idx) => (
                          <div key={idx} className="flex justify-between text-[12px] font-semibold text-slate-600">
                            <span>{t.name}</span>
                            <span className="text-[11px] text-[#B0AFA8]">
                              {new Date(t.startDate).toLocaleDateString("en-US", { month: "short" })} - {new Date(t.endDate).toLocaleDateString("en-US", { month: "short" })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-medium">No terms configured.</p>
                    )}
                  </div>

                  {/* Draft Actions */}
                  {year.status === "DRAFT" && (
                    <div className="pt-2 border-t border-slate-50 mt-auto flex gap-3 w-full">
                      <button 
                        onClick={() => handleDeleteDraft(year.id)}
                        className="flex-1 h-9 rounded-xl border border-rose-100 hover:bg-rose-50 text-[11.5px] font-bold text-rose-600 transition-colors"
                      >
                        Discard Draft
                      </button>
                      <button 
                        onClick={() => openEditDraft(year)}
                        className="flex-1 h-9 rounded-xl bg-[#152328] hover:bg-[#1E353D] text-[11.5px] font-bold text-[#D9EA85] transition-colors"
                      >
                        Edit / Rollover
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {academicYears.length === 0 && (
                <div className="col-span-full bg-white border border-slate-100 rounded-[24px] p-12 text-center flex flex-col items-center justify-center">
                  <div className="size-16 rounded-[24px] bg-[#F7F8F4] flex items-center justify-center text-slate-400 mb-4">
                    <span className="material-symbols-outlined text-[32px]">calendar_today</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-foreground">No Academic Cycles Found</h4>
                  <p className="text-[12px] text-[#B0AFA8] font-medium mt-1 max-w-sm">
                    This institution has no academic cycles configured. Initialize your first cycle to begin class scheduling and enrollment mapping.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Setup & Rollover Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-secondary/40 backdrop-grayscale animate-in fade-in duration-300">
            {/* Backdrop Click */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsWizardOpen(false)} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-100 bg-[#FDFCFB]">
                <div className="flex justify-between items-center">
                  <h3 className="text-[17px] font-bold text-foreground tracking-tight">
                    {editingYearId ? "Edit Cycle Draft" : "New Academic Cycle"}
                  </h3>
                  <button onClick={() => setIsWizardOpen(false)} className="p-2 hover:bg-[#F7F8F4] rounded-xl text-slate-400 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-2 mt-5">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex-1 flex items-center gap-2">
                      <div className={cn(
                        "h-1.5 rounded-full flex-1",
                        wizardStep >= step ? "bg-primary" : "bg-slate-100"
                      )} />
                      <span className={cn(
                        "text-[10px] font-bold",
                        wizardStep === step ? "text-primary" : "text-slate-400"
                      )}>
                        Step {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wizard Content Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold mb-6 flex gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    <div>{error}</div>
                  </div>
                )}

                {/* Step 1: Cycle Details */}
                {wizardStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h4 className="text-[14px] font-bold text-foreground">Cycle Identification & Bounds</h4>
                      <p className="text-[11.5px] text-[#B0AFA8] font-medium leading-relaxed">
                        Input start and end parameters for the new cycle. Name is optional and auto-generated (e.g. "Year 2026 - 2027").
                      </p>
                    </div>

                    <div className="space-y-5">
                      <PDSFormGroup 
                        label="Cycle Name (Optional)" 
                        placeholder="e.g. Year 2026 - 2027" 
                        value={yearName} 
                        onChange={setYearName} 
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <PDSFormGroup 
                          label="Start Date" 
                          type="date" 
                          value={startDate ? new Date(startDate) : null} 
                          onChange={(d) => setStartDate(d ? d.toISOString().split("T")[0] : "")} 
                        />
                        <PDSFormGroup 
                          label="End Date" 
                          type="date" 
                          value={endDate ? new Date(endDate) : null} 
                          onChange={(d) => setEndDate(d ? d.toISOString().split("T")[0] : "")} 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Terms Configuration */}
                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="text-[14px] font-bold text-foreground">Terms Division</h4>
                        <p className="text-[11.5px] text-[#B0AFA8] font-medium mt-0.5">Divide the cycle timeline into active semesters/terms.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={handleAddTerm}
                        className="text-[11px] font-bold text-primary px-3 py-1.5 bg-[#152328]/5 rounded-lg hover:bg-[#152328]/10 transition-colors"
                      >
                        + Add Term
                      </button>
                    </div>

                    <div className="space-y-5 pt-2">
                      {terms.map((term, index) => (
                        <div key={index} className="border border-slate-100 rounded-xl p-4 bg-[#FDFCFB] space-y-4 relative">
                          <div className="flex justify-between items-center">
                            <span className="text-[12px] font-bold text-foreground">Term {index + 1}</span>
                            {terms.length > 1 && (
                              <button 
                                type="button"
                                onClick={() => handleRemoveTerm(index)}
                                className="text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <PDSFormGroup 
                              label="Term Label" 
                              placeholder="e.g. Mid-Term 1" 
                              value={term.name} 
                              onChange={(val) => handleTermChange(index, "name", val)} 
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <PDSFormGroup 
                                label="Start Date" 
                                type="date" 
                                value={term.startDate ? new Date(term.startDate) : null} 
                                onChange={(d) => handleTermChange(index, "startDate", d ? d.toISOString().split("T")[0] : "")} 
                              />
                              <PDSFormGroup 
                                label="End Date" 
                                type="date" 
                                value={term.endDate ? new Date(term.endDate) : null} 
                                onChange={(d) => handleTermChange(index, "endDate", d ? d.toISOString().split("T")[0] : "")} 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Rollover Options & Execute */}
                {wizardStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h4 className="text-[14px] font-bold text-[#E29B12]">Rollover Migration Rules</h4>
                      <p className="text-[11.5px] text-[#B0AFA8] font-medium leading-relaxed">
                        Specify what data to migrate from the current active cycle to the new cycle draft. 
                      </p>
                    </div>

                    {/* Warning alert */}
                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-[12px] text-amber-800 leading-relaxed font-semibold">
                      This action will archive the current active academic cycle and promote this draft to ACTIVE. This is irreversible.
                    </div>

                    <div className="space-y-4 pt-2">
                      <label className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={rollStudents} 
                          onChange={(e) => setRollStudents(e.target.checked)} 
                          className="size-4 rounded accent-primary text-primary"
                        />
                        <div className="space-y-0.5">
                          <p className="text-[12.5px] font-bold text-foreground">Promote/Carry Over Students</p>
                          <p className="text-[10px] text-[#B0AFA8] font-semibold">Move active student enrollments to their next grade level.</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={rollTeachers} 
                          onChange={(e) => setRollTeachers(e.target.checked)} 
                          className="size-4 rounded accent-primary text-primary"
                        />
                        <div className="space-y-0.5">
                          <p className="text-[12.5px] font-bold text-foreground">Carry Over Faculty & Assignments</p>
                          <p className="text-[10px] text-[#B0AFA8] font-semibold">Retain staff rosters and portal permissions settings.</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={rollSubjects} 
                          onChange={(e) => setRollSubjects(e.target.checked)} 
                          className="size-4 rounded accent-primary text-primary"
                        />
                        <div className="space-y-0.5">
                          <p className="text-[12.5px] font-bold text-foreground">Carry Over Subject Master Library</p>
                          <p className="text-[10px] text-[#B0AFA8] font-semibold">Sync active course subjects library to the new cycle.</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={rollTimetable} 
                          onChange={(e) => setRollTimetable(e.target.checked)} 
                          className="size-4 rounded accent-primary text-primary"
                        />
                        <div className="space-y-0.5">
                          <p className="text-[12.5px] font-bold text-foreground">Carry Over Class Timetables</p>
                          <p className="text-[10px] text-[#B0AFA8] font-semibold">Copy weekly timetable structures and scheduling blocks.</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={rollAura} 
                          onChange={(e) => setRollAura(e.target.checked)} 
                          className="size-4 rounded accent-primary text-primary"
                        />
                        <div className="space-y-0.5">
                          <p className="text-[12.5px] font-bold text-foreground">Reset Aura Points to Zero</p>
                          <p className="text-[10px] text-[#B0AFA8] font-semibold">Clear active user Aura counts to start the new term fresh.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer */}
              <div className="p-8 border-t border-slate-100 flex justify-between bg-[#FDFCFB]">
                {wizardStep > 1 ? (
                  <PDSButton 
                    variant="text" 
                    onClick={() => setWizardStep(wizardStep - 1)} 
                    disabled={isSaving}
                  >
                    Back
                  </PDSButton>
                ) : (
                  <div />
                )}

                <div className="flex gap-3">
                  {wizardStep < 3 ? (
                    <>
                      <PDSButton 
                        variant="text" 
                        onClick={handleSaveDraft} 
                        disabled={isSaving}
                      >
                        Save Draft
                      </PDSButton>
                      <PDSButton 
                        variant="primary" 
                        onClick={handleNextStep} 
                        loading={isSaving}
                      >
                        {wizardStep === 2 ? "Save & Continue" : "Next"}
                      </PDSButton>
                    </>
                  ) : (
                    <PDSButton 
                      variant="primary" 
                      onClick={handleRunRollover} 
                      loading={isSaving}
                      className="bg-amber-500 hover:bg-amber-600 border-amber-500 text-white"
                    >
                      Execute & Rollover
                    </PDSButton>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
