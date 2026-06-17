import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StaffPage } from "../../settings/pages/StaffPage";
import { StudentsPage } from "../../students/pages/StudentsPage";
import { DriversPage } from "../../transportation/pages/DriversPage";

export const DirectoryPage = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = (tab as "staff" | "students" | "drivers") || "staff";

  const [showBulkModal, setShowBulkModal] = useState(false);

  const handleCreateAction = () => {
    if (activeTab === "students") {
      navigate("/directory/students/add");
    } else if (activeTab === "staff") {
      navigate("/directory/staff/add");
    } else if (activeTab === "drivers") {
      navigate("/directory/drivers/add");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB]">
      <div className="shrink-0">
        <TopBar
          title="Student & Staff"
          subtitle="Manage students, teachers and institutional profiles"
          actions={
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkModal(true)}
                className="btn-outline gap-2"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                Import List
              </button>
            </div>
          }
        />

        {/* Bulk Import Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-secondary/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-foreground text-2xl font-bold">Import {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List</h3>
                  <p className="text-sm text-[#B0AFA8] font-medium mt-1">Upload CSV or Excel files to enroll multiple {activeTab} at once.</p>
                </div>
                <button onClick={() => setShowBulkModal(false)} className="size-10 rounded-full hover:bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] transition-all" aria-label="Close modal">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-[#F7F8F4] group hover:border-primary transition-all cursor-pointer" role="presentation">
                <div className="size-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-[#B0AFA8] mb-4 group-hover:bg-primary group-hover:text-foreground transition-all">
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                </div>
                <p className="text-[15px] font-bold text-foreground">Drop your file here</p>
                <p className="text-[12px] text-[#B0AFA8] font-medium mt-1">Supports .csv, .xls, .xlsx (Max 10MB)</p>
              </div>

              <div className="bg-[#F7F8F4] rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">download</span>
                  <div className="text-left">
                    <p className="text-[12px] font-bold text-foreground">Download Template</p>
                    <p className="text-[10px] text-[#B0AFA8] font-medium">Pre-formatted sheet</p>
                  </div>
                </div>
                <button className="text-[11px] font-bold text-primary hover:underline">Download CSV</button>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button onClick={() => setShowBulkModal(false)} className="btn-outline flex-1">Cancel</button>
                <button disabled className="btn-primary flex-1 opacity-50 cursor-not-allowed">Start Validation</button>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              {[
                { id: "staff", label: "Staff", icon: "badge" },
                { id: "students", label: "Students", icon: "group" },
                { id: "drivers", label: "Drivers", icon: "local_shipping" },
              ].map((tabItem) => {
                const isActive = activeTab === tabItem.id;
                return (
                  <button
                    key={tabItem.id}
                    onClick={() => navigate(`/directory/${tabItem.id}`)}
                    className={cn(
                      "flex items-center gap-2.5 pb-4 pt-6 text-[14px] font-semibold tracking-tight transition-all relative shrink-0",
                      isActive ? "text-foreground" : "text-[#B0AFA8] hover:text-foreground/70"
                    )}
                  >
                    <span className={cn(
                      "material-symbols-outlined text-[20px] transition-all",
                      isActive ? "text-primary" : ""
                    )} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      {tabItem.icon}
                    </span>
                    {tabItem.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
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

      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {activeTab === "staff" && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <StaffPage
                  isHubChild
                  onAddStaff={handleCreateAction}
                />
              </div>
            )}
            {activeTab === "students" && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <StudentsPage
                  isHubChild
                  onAddStudent={handleCreateAction}
                />
              </div>
            )}
            {activeTab === "drivers" && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <DriversPage
                  isHubChild
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
