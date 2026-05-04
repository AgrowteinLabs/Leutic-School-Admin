import { useState } from "react";
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

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title="Reports & Insights"
        subtitle="Comprehensive analytics across all school operations."
        actions={
          <>
            <button className="flex items-center justify-center rounded-xl h-10 px-5 bg-white border border-slate-100 text-foreground text-[13px] font-semibold shadow-sm shadow-slate-100/30 hover:bg-[#F7F8F4] transition-all">
              <span className="material-symbols-outlined text-lg mr-2">
                download
              </span>
              <span>Export Data</span>
            </button>
            <button className="flex items-center justify-center rounded-xl h-10 px-5 btn-primary text-[13px] font-semibold shadow-sm shadow-slate-100/30  transition-all">
              <span className="material-symbols-outlined text-lg mr-2">
                picture_as_pdf
              </span>
              <span>Generate Report</span>
            </button>
          </>
        }
      />

      {/* Tab Navigation */}
      <div className="border-b border-slate-100 bg-white px-6 lg:px-10 shrink-0">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap shrink-0",
                  activeTab === tab.id
                    ? "bg-secondary text-white shadow-secondary/20"
                    : "text-[#B0AFA8] hover:text-foreground hover:bg-[#F7F8F4]"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[18px]",
                    activeTab === tab.id ? "text-primary" : tab.color
                  )}
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-100 rounded-2xl p-3 flex justify-between items-center shadow-sm shadow-slate-100/30 mb-6">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F8F4]/50 rounded-xl border border-slate-100 text-[#444441] text-[12px] font-medium hover:bg-[#F7F8F4] transition-colors whitespace-nowrap shrink-0">
                <span className="material-symbols-outlined text-[16px]">
                  calendar_month
                </span>
                <span>This Term</span>
                <span className="material-symbols-outlined text-[16px]">
                  expand_more
                </span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F8F4]/50 rounded-xl border border-slate-100 text-[#444441] text-[12px] font-medium hover:bg-[#F7F8F4] transition-colors whitespace-nowrap shrink-0">
                <span className="material-symbols-outlined text-[16px]">
                  school
                </span>
                <span>All Classes</span>
                <span className="material-symbols-outlined text-[16px]">
                  expand_more
                </span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F8F4]/50 rounded-xl border border-slate-100 text-[#444441] text-[12px] font-medium hover:bg-[#F7F8F4] transition-colors whitespace-nowrap shrink-0">
                <span className="material-symbols-outlined text-[16px]">
                  filter_list
                </span>
                <span>More Filters</span>
              </button>
            </div>
            <div className="text-[#B0AFA8] text-[10px] font-bold capitalize italic pr-2 whitespace-nowrap shrink-0">
              Sample data • Not connected to API
            </div>
          </div>

          {/* Active Tab Content */}
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
};
