import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { TransportationPage } from "./TransportationPage";
import { DriversPage } from "./DriversPage";

export const TransportationHubPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"tracking" | "drivers">(
    "tracking",
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <div className="shrink-0">
        <TopBar
          title="Bus Tracking"
          subtitle="Real-time bus locations and driver management"
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

        <div className="border-b border-slate-100 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="flex gap-8">
              {[
                { id: "tracking", label: "Bus Map", icon: "location_on" },
                {
                  id: "drivers",
                  label: "Drivers",
                  icon: "person_pin_circle",
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
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "tracking" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <TransportationPage isHubChild />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <DriversPage isHubChild />
          </div>
        )}
      </div>
    </div>
  );
};
