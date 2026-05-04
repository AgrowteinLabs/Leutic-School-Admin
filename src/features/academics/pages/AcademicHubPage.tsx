import { useState } from "react";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { ExaminationsPage } from "../../examinations/pages/ExaminationsPage";
import { CurriculumPage } from "../../curriculum/pages/CurriculumPage";
import { ProgramsPage } from "../../programs/pages/ProgramsPage";

export const AcademicHubPage = () => {
  const [activeTab, setActiveTab] = useState<
    "exams" | "curriculum" | "programs"
  >("exams");

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <div className="shrink-0">
        <TopBar
          title="Academics"
          subtitle="Management of curriculum, programs and school examinations"
          actions={
            <div className="flex gap-3">
              <button className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2  transition-all shadow-sm shadow-slate-100/30">
                <span className="material-symbols-outlined text-sm">
                  add_circle
                </span>
                New Academic Entry
              </button>
            </div>
          }
        />

        <div className="px-8 border-b border-slate-100 bg-white">
          <div className="flex gap-8">
            {[
              { id: "exams", label: "Exams", icon: "description" },
              {
                id: "curriculum",
                label: "Curriculum",
                icon: "account_tree",
              },
              {
                id: "programs",
                label: "Programs",
                icon: "rocket_launch",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 pb-4 text-[13px] font-semibold tracking-tight transition-all relative mt-4",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-[#B0AFA8] hover:text-foreground",
                )}
              >
                <span className="material-symbols-outlined text-lg">
                  {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "exams" && (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <ExaminationsPage isHubChild />
          </div>
        )}
        {activeTab === "curriculum" && (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <CurriculumPage isHubChild />
          </div>
        )}
        {activeTab === "programs" && (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <ProgramsPage isHubChild />
          </div>
        )}
      </div>
    </div>
  );
};
