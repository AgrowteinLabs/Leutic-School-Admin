import { useState } from "react";
import { useLocation } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { CommunicationsPage } from "./CommunicationsPage";
import { AnnouncementsPage } from "./AnnouncementsPage";

export const CommunicationsHubPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const shouldCompose = searchParams.get("compose") === "true";

  const [activeTab, setActiveTab] = useState<"messages" | "announcements">(
    shouldCompose ? "announcements" : "messages"
  );
  
  // State to trigger composition in child components
  const [triggerCompose, setTriggerCompose] = useState(shouldCompose ? 1 : 0);

  const handleComposeClick = () => {
    setTriggerCompose(prev => prev + 1);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white font-sans">
      <div className="shrink-0 bg-white">
        <TopBar
          title={activeTab === "messages" ? "Institutional Messages" : "School Notices"}
          subtitle="Internal school coordination and official broadcasts"
          actions={
            <div className="flex gap-3">
              <button 
                onClick={handleComposeClick}
                className="btn-primary px-6 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2   transition-all shadow-sm "
              >
                <span className="material-symbols-outlined text-sm">
                  {activeTab === "messages" ? "edit_square" : "campaign"}
                </span>
                {activeTab === "messages" ? "Start Coordination" : "Post Notice"}
              </button>
            </div>
          }
        />

        {/* Global Hub Design Pattern for Tabbar (Matching Directory/Academics) */}
        <div className="px-6 lg:px-10 border-b border-slate-100 bg-white">
          <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: "messages", label: "Messages", icon: "forum" },
              {
                id: "announcements",
                label: "Institutional Notices",
                icon: "campaign",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 pb-4 text-[13px] font-semibold tracking-tight transition-all relative mt-4 shrink-0",
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
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full animate-in zoom-in-x duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-white">
        {activeTab === "messages" ? (
          <div className="flex-1 overflow-hidden">
            <CommunicationsPage isHubChild />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <AnnouncementsPage isHubChild forceCompose={triggerCompose} />
          </div>
        )}
      </div>
    </div>
  );
};
