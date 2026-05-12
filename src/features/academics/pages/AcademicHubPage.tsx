import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { ExaminationsPage } from "../../examinations/pages/ExaminationsPage";
import { ProgramsPage } from "../../programs/pages/ProgramsPage";
import { AcademicSetupPage } from "../../academic-setup/pages/AcademicSetupPage";
import { MarksEntryPage } from "../../examinations/pages/MarksEntryPage";
import { QuizzesPage } from "../../quizzes/pages/QuizzesPage";
import { PDSButton } from "../../../components/pds/PDSButton";

export const AcademicHubPage = () => {
  const navigate = useNavigate();
  const { tab, sub } = useParams();
  const activeTab = tab || "exams";
  const [isUploading, setIsUploading] = useState(false);
  const [triggerBulkUpload, setTriggerBulkUpload] = useState(0);

  const tabs = [
    { id: "exams", label: "Examinations", icon: "description" },
    { id: "quizzes", label: "Quiz Lab", icon: "quiz" },
    { id: "marks", label: "Mark Entry", icon: "edit_note" },
    { id: "programs", label: "Special Programs", icon: "rocket_launch" },
    { id: "setup", label: "Academic Year Setup", icon: "settings_suggest" },
  ];

  const handleBulkUploadClick = () => {
    setIsUploading(true);
    setTriggerBulkUpload(prev => prev + 1);
  };

  const headerActions = (
    <AnimatePresence>
      {activeTab === "marks" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <PDSButton
            variant="ghost"
            className="gap-2 h-10 px-6"
            onClick={handleBulkUploadClick}
            loading={isUploading}
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Bulk CSV Upload
          </PDSButton>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] relative">
      {/* Background Aesthetic */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#444 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      <div className="shrink-0 relative z-10">
        <TopBar
          title="Academics"
          subtitle="Manage examinations, marks, programs and academic years"
          actions={headerActions}
        />

        {/* Improved Tabs Navigation (Curriculum Style) */}
        <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              {tabs.map((tabItem) => {
                const isActive = activeTab === tabItem.id;
                return (
                  <button
                    key={tabItem.id}
                    onClick={() => navigate(`/academics/${tabItem.id}`)}
                    className={cn(
                      "flex items-center gap-2.5 pb-4 pt-6 text-[14px] font-semibold tracking-tight transition-all relative shrink-0",
                      isActive ? "text-foreground" : "text-[#B0AFA8] hover:text-foreground/70"
                    )}
                  >
                    <span className={cn("material-symbols-outlined text-[20px] transition-all", isActive ? "text-primary" : "")} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      {tabItem.icon}
                    </span>
                    {tabItem.label}
                    {isActive && (
                      <motion.div
                        layoutId="academicHubTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative z-0 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col overflow-hidden min-h-0"
          >
            {activeTab === "exams" && <ExaminationsPage isHubChild />}
            {activeTab === "quizzes" && <QuizzesPage isHubChild />}
            {activeTab === "marks" && (
              <MarksEntryPage 
                isHubChild 
                triggerBulkUpload={triggerBulkUpload} 
                onUploadComplete={() => setIsUploading(false)} 
              />
            )}
            {activeTab === "programs" && <ProgramsPage isHubChild />}
            {activeTab === "setup" && <AcademicSetupPage isHubChild routeSub={sub} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
