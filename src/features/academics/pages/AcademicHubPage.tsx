import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { ExaminationsPage } from "../../examinations/pages/ExaminationsPage";
import { ProgramsPage } from "../../programs/pages/ProgramsPage";

export const AcademicHubPage = () => {
  const [activeTab, setActiveTab] = useState<"exams" | "programs">("exams");

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] relative">
      {/* Background Aesthetic */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#444 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      <div className="shrink-0 relative z-10">
        <TopBar
          title="Academics"
          subtitle="Management of school examinations and student enrichment programs"
          actions={
            <div className="flex gap-3">
              <button className="btn-primary px-6 h-11 rounded-[14px] text-[13px] font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/10 active:scale-95">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                New Academic Entry
              </button>
            </div>
          }
        />

        {/* Tabs Navigation */}
        <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              {[
                { id: "exams", label: "Examinations", icon: "description" },
                { id: "programs", label: "Special Programs", icon: "rocket_launch" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2.5 pb-4 pt-6 text-[14px] font-semibold tracking-tight transition-all relative shrink-0",
                      isActive ? "text-foreground" : "text-[#B0AFA8] hover:text-foreground/70"
                    )}
                  >
                    <span className={cn("material-symbols-outlined text-[20px] transition-all", isActive ? "text-primary" : "")} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      {tab.icon}
                    </span>
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="academicTab"
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

      <div className="flex-1 overflow-hidden flex flex-col relative z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {activeTab === "exams" && <ExaminationsPage isHubChild />}
            {activeTab === "programs" && <ProgramsPage isHubChild />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
