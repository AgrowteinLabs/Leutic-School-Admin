import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { CommunicationsPage } from "./CommunicationsPage";
import { AnnouncementsPage } from "./AnnouncementsPage";

export const CommunicationsHubPage = () => {
  const { tab } = useParams();
  const navigate = useNavigate();

  const activeTab = (tab as "messages" | "announcements") || "messages";
  
  const handleComposeClick = () => {
    if (activeTab === "announcements") {
      navigate("/communications/announcements/add");
    }
    // Messages tab — coordination feature not yet implemented
  };

  const setActiveTab = (tabId: string) => {
    navigate(`/communications/${tabId}`);
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
                title={activeTab === "messages" ? "Staff coordination coming soon" : "Create a new notice"}
                className={cn(
                  "h-10 px-6 rounded-[10px] text-[13px] font-bold flex items-center gap-2 transition-all shadow-sm shadow-slate-100/30",
                  activeTab === "messages"
                    ? "bg-[#F7F8F4] text-[#B0AFA8] cursor-not-allowed"
                    : "btn-primary"
                )}
              >
                <span className="material-symbols-outlined text-sm">
                  {activeTab === "messages" ? "edit_square" : "campaign"}
                </span>
                {activeTab === "messages" ? "Start Coordination" : "Post Notice"}
                {activeTab === "messages" && (
                  <span className="px-1.5 py-0.5 rounded bg-white/50 text-[9px] font-bold uppercase tracking-wider">
                    Soon
                  </span>
                )}
              </button>
            </div>
          }
        />

        {/* Global Hub Design Pattern for Tabbar (Matching Directory/Academics) */}
        <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              {[
                { id: "messages", label: "Messages", icon: "forum" },
                {
                  id: "announcements",
                  label: "Institutional Notices",
                  icon: "campaign",
                },
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
                    <span 
                      className={cn("material-symbols-outlined text-[20px] transition-all", isActive ? "text-primary" : "")}
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {tab.icon}
                    </span>
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="commHubTabIndicator"
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

      <div className="flex-1 overflow-hidden flex flex-col bg-white">
        {activeTab === "messages" ? (
          <div className="flex-1 overflow-hidden">
            <CommunicationsPage isHubChild />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <AnnouncementsPage isHubChild />
          </div>
        )}
      </div>
    </div>
  );
};
