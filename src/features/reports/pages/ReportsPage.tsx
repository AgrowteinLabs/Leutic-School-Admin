import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { AcademicTab } from "../components/AcademicTab";
import { AttendanceTab } from "../components/AttendanceTab";
import { FinanceTab } from "../components/FinanceTab";
import { AssessmentTab } from "../components/AssessmentTab";
import { EngagementTab } from "../components/EngagementTab";
import { NotificationTab } from "../components/NotificationTab";
import { TransportTab } from "../components/TransportTab";
import { AuraTab } from "../components/AuraTab";
import { PDSButton } from "../../../components/pds/PDSButton";
import { AppDropdown } from "../../../components/AppDropdown";

const tabs = [
  { id: "academic", label: "Academic", icon: "school", color: "text-[#1565C0]" },
  { id: "attendance", label: "Attendance", icon: "event_available", color: "text-[#2E7D32]" },
  { id: "finance", label: "Finance", icon: "payments", color: "text-green-600" },
  { id: "assessment", label: "Assessments", icon: "quiz", color: "text-[#B45309]" },
  { id: "engagement", label: "Community", icon: "hub", color: "text-[#1565C0]" },
  { id: "notification", label: "Notifications", icon: "notifications", color: "text-[#3D6B2C]" },
  { id: "transport", label: "Transport", icon: "directions_bus", color: "text-[#1565C0]" },
  { id: "aura", label: "Aura Points", icon: "auto_awesome", color: "text-[#B45309]" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabContent: Record<TabId, React.ReactNode> = {
  academic: <AcademicTab />,
  attendance: <AttendanceTab />,
  finance: <FinanceTab />,
  assessment: <AssessmentTab />,
  engagement: <EngagementTab />,
  notification: <NotificationTab />,
  transport: <TransportTab />,
  aura: <AuraTab />,
};

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("academic");
  const [selectedPeriod, setSelectedPeriod] = useState("Current Term");
  const [selectedClass, setSelectedClass] = useState("All Classes");

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title="Reports & Insights"
        subtitle="Comprehensive analytics across all school operations."
        actions={
          <div className="flex items-center gap-3">
            <PDSButton variant="outline" size="md" icon="file_download">Export Data</PDSButton>
            <PDSButton variant="primary" size="md" icon="picture_as_pdf">Generate Report</PDSButton>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="border-b border-slate-100 bg-white sticky top-0 z-30 shrink-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
                      layoutId="reportsTab"
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

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-100 rounded-[20px] p-2 flex justify-between items-center mb-6 relative z-20">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <AppDropdown
                options={["Current Term", "Previous Term", "Academic Year 2024", "Custom Range"]}
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                width="w-[180px]"
                icon="calendar_month"
              />
              <AppDropdown
                options={["All Classes", "Grade 9", "Grade 10", "Grade 11", "Grade 12"]}
                value={selectedClass}
                onChange={setSelectedClass}
                width="w-[160px]"
                icon="school"
              />
              <AppDropdown
                options={["More Filters", "By Subject", "By Teacher", "By Status"]}
                value="More Filters"
                onChange={() => {}}
                width="w-[160px]"
                icon="filter_list"
              />
            </div>
            <div className="text-[#B0AFA8] text-[10px] font-bold capitalize italic pr-4 whitespace-nowrap shrink-0">
              Sample data • Not connected to API
            </div>
          </div>

          {/* Active Tab Content with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
