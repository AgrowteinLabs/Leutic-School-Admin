import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { TransportationPage } from "./TransportationPage";
import { VehiclesPage } from "./VehiclesPage";

export const TransportationHubPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"tracking" | "fleet">(
    "tracking",
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <div className="shrink-0">
        <TopBar
          title="Fleet Intelligence"
          subtitle="Real-time tracking and fleet inventory management"
          actions={
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/transportation/add-vehicle")}
                className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2  transition-all shadow-sm shadow-slate-100/30"
              >
                <span className="material-symbols-outlined text-sm">
                  directions_bus
                </span>
                Add New Vehicle
              </button>
            </div>
          }
        />

        <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              {[
                { id: "tracking", label: "Live Tracking", icon: "location_on" },
                { id: "fleet", label: "Fleet List", icon: "directions_bus" },
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
                        layoutId="activeTabIndicator"
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

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col"
          >
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {activeTab === "tracking" && <TransportationPage isHubChild />}
              {activeTab === "fleet" && <VehiclesPage isHubChild />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
