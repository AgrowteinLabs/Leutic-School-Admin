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

  const [staffMembers, setStaffMembers] = useState([
    {
      name: "Dr. Lakshmi K.",
      id: "#ST-1024-001",
      role: "Lead Teacher",
      department: "Mathematics",
      performance: 96,
      auraScore: 98.4,
      status: "Active",
      img: "/Avatar/Female Avatar Age35.png",
      joiningDate: "12 Oct 2022",
      uid: "ananya-i",
    },
    {
      name: "Rishi K.",
      id: "#ST-1024-042",
      role: "Senior Counselor",
      department: "Student Affairs",
      performance: 88,
      auraScore: 91.2,
      status: "Remote",
      img: "/Avatar/Male Avatar Age35.png",
      joiningDate: "05 Jan 2023",
      uid: "rishi-d",
    },
    {
      name: "Dhanya S.",
      id: "#ST-1024-118",
      role: "Science Head",
      department: "Natural Sciences",
      performance: 92,
      auraScore: 94.5,
      status: "Active",
      img: "/Avatar/Female Avatar Age38.png",
      joiningDate: "20 Mar 2021",
      uid: "pooja-t",
    },
    {
      name: "Arvind S.",
      id: "#ST-1024-085",
      role: "Department Lead",
      department: "History",
      performance: 79,
      auraScore: 82.2,
      status: "On Leave",
      img: "/Avatar/Male Avatar Age38.png",
      joiningDate: "15 Jul 2020",
      uid: "arvind-s",
    },
  ]);

  const [students, setStudents] = useState([
    {
      name: "Aavya S.",
      id: "OA-2024-001",
      grade: "12th Grade",
      participation: 92,
      auraScore: 98.4,
      attendanceRate: 98,
      gpa: 3.9,
      enrollmentDate: "Aug 15, 2021",
      bloodGroup: "O+",
      guardianName: "Ramesh S.",
      phone: "+91 98472-11002",
      section: "A",
      status: "Active",
      img: "/Avatar/Female Avatar Age17.png",
      uid: "aavya-s",
    },
    {
      name: "Ishaan K.",
      id: "OA-2024-042",
      grade: "10th Grade",
      participation: 45,
      auraScore: 64.2,
      attendanceRate: 72,
      gpa: 2.1,
      enrollmentDate: "Sept 12, 2023",
      bloodGroup: "AB+",
      guardianName: "Kishore K.",
      phone: "+91 98765-43211",
      section: "B",
      status: "At Risk",
      img: "/Avatar/Male Avatar Age16.png",
      uid: "ishaan-i",
    },
    {
      name: "Meera V.",
      id: "OA-2024-118",
      grade: "11th Grade",
      participation: 88,
      auraScore: 91.5,
      attendanceRate: 94,
      gpa: 3.7,
      enrollmentDate: "Jan 15, 2022",
      bloodGroup: "A-",
      guardianName: "Vinay V.",
      phone: "+91 99887-76655",
      section: "A",
      status: "Active",
      img: "/Avatar/Female Avatar Age16.png",
      uid: "mira-patel",
    },
    {
      name: "Vedant K.",
      id: "OA-2024-085",
      grade: "9th Grade",
      participation: 76,
      auraScore: 84.2,
      attendanceRate: 88,
      gpa: 3.2,
      enrollmentDate: "Aug 10, 2023",
      bloodGroup: "B-",
      guardianName: "Sunil K.",
      phone: "+91 91234-56788",
      section: "C",
      status: "Graduated",
      img: "/Avatar/Male Avatar Age15.png",
      uid: "vedant-kulkarni",
    },
    {
      name: "Sanya G.",
      id: "OA-2024-201",
      grade: "12th Grade",
      participation: 95,
      auraScore: 97.2,
      attendanceRate: 99,
      gpa: 4.0,
      enrollmentDate: "Aug 15, 2021",
      bloodGroup: "A+",
      guardianName: "Vikram G.",
      phone: "+91 99887-76644",
      section: "A",
      status: "Active",
      img: "/Avatar/Female Avatar Age18.png",
      uid: "sanya-g",
    },
    {
      name: "Arjun T.",
      id: "OA-2024-156",
      grade: "11th Grade",
      participation: 82,
      auraScore: 88.5,
      attendanceRate: 91,
      gpa: 3.5,
      enrollmentDate: "July 12, 2022",
      bloodGroup: "O+",
      guardianName: "Tara T.",
      phone: "+91 94455-66778",
      section: "B",
      status: "Active",
      img: "/Avatar/Male Avatar Age17.png",
      uid: "arjun-rao",
    },
    {
      name: "Diya M.",
      id: "OA-2024-092",
      grade: "10th Grade",
      participation: 68,
      auraScore: 72.1,
      attendanceRate: 85,
      gpa: 2.8,
      enrollmentDate: "Jan 05, 2023",
      bloodGroup: "B+",
      guardianName: "Manoj M.",
      phone: "+91 98888-77777",
      section: "C",
      status: "Active",
      img: "/Avatar/Female Avatar Age15.png",
      uid: "diya-m",
    },
    {
      name: "Rohan P.",
      id: "OA-2024-305",
      grade: "9th Grade",
      participation: 54,
      auraScore: 61.8,
      attendanceRate: 78,
      gpa: 2.4,
      enrollmentDate: "Aug 20, 2023",
      bloodGroup: "AB-",
      guardianName: "Prakash P.",
      phone: "+91 97777-66666",
      section: "B",
      status: "At Risk",
      img: "/Avatar/Male Avatar Age14.png",
      uid: "rohan-das",
    },
  ]);
  const [drivers, setDrivers] = useState([
    {
      name: "Rajesh G.",
      id: "#DR-2024-102",
      licenseNo: "KL01201000456",
      licenseExpiry: "Oct 22, 2026",
      phone: "+91 98472-11002",
      emergencyPhone: "+91 98472-11999",
      status: "On Route",
      performance: 98,
      bus: "Bus 01",
      regNo: "KL01PC4456",
      route: "North Corridor",
      experience: "8 Years",
      joiningDate: "Aug 15, 2016",
      img: "/Avatar/Male Avatar Age45.png",
      uid: "driver-1",
    },
    {
      name: "Sajeev K.",
      id: "#DR-2024-105",
      licenseNo: "KL01201500982",
      licenseExpiry: "Jan 15, 2025",
      phone: "+91 94460-22310",
      emergencyPhone: "+91 94460-22000",
      status: "Active",
      performance: 92,
      bus: "Bus 08",
      regNo: "KL07BB9982",
      route: "East Extension",
      experience: "5 Years",
      joiningDate: "July 20, 2019",
      img: "/Avatar/Male Avatar Age42.png",
      uid: "driver-2",
    },
    {
      name: "Vikram C.",
      id: "#DR-2024-110",
      licenseNo: "KL01201200334",
      licenseExpiry: "Sept 10, 2027",
      phone: "+91 98765-43210",
      emergencyPhone: "+91 98765-43000",
      status: "On Leave",
      performance: 85,
      bus: "Bus 12",
      regNo: "KA01ME3342",
      route: "West Hub",
      experience: "12 Years",
      joiningDate: "Aug 10, 2012",
      img: "/Avatar/Male Avatar Age47.png",
      uid: "driver-3",
    },
    {
      name: "Madan Pal",
      id: "#DR-2024-042",
      licenseNo: "KL01201800112",
      licenseExpiry: "Nov 12, 2028",
      phone: "+91 88888-77777",
      emergencyPhone: "+91 88888-77000",
      status: "On Route",
      performance: 98,
      bus: "Bus 05",
      regNo: "KL01TR0112",
      route: "Central Loop",
      experience: "4 Years",
      joiningDate: "Sept 12, 2020",
      img: "/Avatar/Male Avatar Age41.png",
      uid: "driver-4",
    },
    {
      name: "Dileep K.",
      id: "#DR-2024-115",
      licenseNo: "KL01201600554",
      licenseExpiry: "June 05, 2026",
      phone: "+91 91234-56789",
      emergencyPhone: "+91 91234-56000",
      status: "Maintenance",
      performance: 78,
      bus: "Bus 04",
      regNo: "MH12TS5541",
      route: "South Sector",
      experience: "3 Years",
      joiningDate: "June 05, 2021",
      img: "/Avatar/Male Avatar Age43.png",
      uid: "driver-5",
    },
    {
      name: "Arun Nair",
      id: "#DR-2024-202",
      licenseNo: "KL01201000887",
      licenseExpiry: "Jan 15, 2029",
      phone: "+91 99887-76655",
      emergencyPhone: "+91 99887-76000",
      status: "Active",
      performance: 95,
      bus: "Bus 15",
      regNo: "KL01MT8872",
      route: "Highland Route",
      experience: "10 Years",
      joiningDate: "Jan 15, 2014",
      img: "/Avatar/Male Avatar Age44.png",
      uid: "driver-6",
    },
    {
      name: "Suresh P.",
      id: "#DR-2024-305",
      licenseNo: "KL01201400221",
      licenseExpiry: "May 20, 2026",
      phone: "+91 97777-66666",
      emergencyPhone: "+91 97777-66000",
      status: "On Route",
      performance: 91,
      bus: "Bus 02",
      regNo: "TN01ES2210",
      route: "Coastal Road",
      experience: "7 Years",
      joiningDate: "May 20, 2017",
      img: "/Avatar/Male Avatar Age46.png",
      uid: "driver-7",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const handleAddMember = (memberData: any) => {
    const uid = `${activeTab}-${Date.now()}`;
    if (activeTab === "staff") setStaffMembers((prev) => [{ ...memberData, uid }, ...prev]);
    else if (activeTab === "students") setStudents((prev) => [{ ...memberData, uid }, ...prev]);
    else if (activeTab === "drivers") setDrivers((prev) => [{ ...memberData, uid }, ...prev]);
    setShowAddModal(false);
  };

  const handleCreateAction = () => {
    if (activeTab === "students") {
      navigate("/directory/students/add");
    } else if (activeTab === "staff") {
      navigate("/directory/staff/add");
    } else if (activeTab === "drivers") {
      navigate("/directory/drivers/add");
    } else {
      setShowAddModal(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
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
                <button onClick={() => setShowBulkModal(false)} className="size-10 rounded-full hover:bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-[#F7F8F4] group hover:border-primary transition-all cursor-pointer">
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

        {/* Add Individual Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-secondary/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-foreground text-2xl font-bold">Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                  <p className="text-sm text-[#B0AFA8] font-medium mt-1">Enter profile details to create a new institutional record.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="size-10 rounded-full hover:bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#B0AFA8]">Full Name</label>
                  <input className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-[13px] font-semibold text-foreground" placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#B0AFA8]">ID / Registration Number</label>
                  <input className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-[13px] font-semibold text-foreground" placeholder="#2024-XXX" />
                </div>

                {activeTab === "drivers" && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#B0AFA8]">Bus License Number</label>
                    <input className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-[13px] font-semibold text-foreground" placeholder="DL-XXX-XXX" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#B0AFA8]">
                    {activeTab === "staff" ? "Designation" : activeTab === "students" ? "Grade" : "Assigned Bus Route"}
                  </label>
                  <input className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-[13px] font-semibold text-foreground" placeholder="..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#B0AFA8]">Contact Email</label>
                  <input className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-[13px] font-semibold text-foreground" placeholder="email@institution.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#B0AFA8]">Mobile Number</label>
                  <input className="w-full bg-[#F7F8F4] border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-[13px] font-semibold text-foreground" placeholder="+91 XXXX" />
                </div>
              </div>

              <div className="bg-[#F7F8F4] rounded-2xl p-6 space-y-4 border border-slate-100">
                <h4 className="text-[11px] font-semibold text-foreground">Access Permissions</h4>
                <div className="flex gap-6">
                  <div className="flex items-center gap-3">
                    <div className="size-5 rounded bg-primary flex items-center justify-center text-foreground">
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                    <span className="text-[12px] font-bold text-[#444441]">Mobile App Access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-5 rounded border border-slate-300 bg-white" />
                    <span className="text-[12px] font-bold text-[#444441]">SMS Alerts</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddModal(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={() => handleAddMember({ name: "Rahul Sharma", id: "#REF-2024-00X", status: "Active" })} className="btn-primary flex-1">Complete Registration</button>
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
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigate(`/directory/${tab.id}`)}
                    className={cn(
                      "flex items-center gap-2.5 pb-4 pt-6 text-[14px] font-semibold tracking-tight transition-all relative shrink-0",
                      isActive ? "text-foreground" : "text-[#B0AFA8] hover:text-foreground/70"
                    )}
                  >
                    <span className={cn(
                      "material-symbols-outlined text-[20px] transition-all",
                      isActive ? "text-primary" : ""
                    )} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      {tab.icon}
                    </span>
                    {tab.label}
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
                  externalStaff={staffMembers}
                  onAddStaff={handleCreateAction}
                />
              </div>
            )}
            {activeTab === "students" && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <StudentsPage
                  isHubChild
                  externalStudents={students}
                  onAddStudent={handleCreateAction}
                />
              </div>
            )}
            {activeTab === "drivers" && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <DriversPage
                  isHubChild
                  externalDrivers={drivers}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
