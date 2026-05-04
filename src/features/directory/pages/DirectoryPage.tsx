import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { StaffPage } from "../../settings/pages/StaffPage";
import { StudentsPage } from "../../students/pages/StudentsPage";
import { AttendancePage } from "../../classes/pages/AttendancePage";

export const DirectoryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "staff" | "students" | "drivers" | "attendance"
  >("staff");

  const [staffMembers, setStaffMembers] = useState([
    {
      name: "Dr. Lakshmi K.",
      id: "#ST-1024-001",
      role: "Lead Teacher",
      department: "Mathematics",
      performance: 96,
      auraScore: 98.4,
      status: "Active",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
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
      img: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop",
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
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
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
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
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
      enrollmentDate: "Aug 2021",
      status: "Active",
      img: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=400&h=400&fit=crop",
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
      enrollmentDate: "Aug 2022",
      status: "At Risk",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
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
      enrollmentDate: "Jan 2022",
      status: "Active",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
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
      enrollmentDate: "Aug 2023",
      status: "Graduated",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
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
      enrollmentDate: "Aug 2021",
      status: "Active",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
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
      enrollmentDate: "Aug 2022",
      status: "Active",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
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
      enrollmentDate: "Jan 2023",
      status: "Active",
      img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop",
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
      enrollmentDate: "Aug 2023",
      status: "At Risk",
      img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop",
      uid: "rohan-das",
    },
  ]);
  const [drivers, setDrivers] = useState([
    {
      name: "Madan Pal",
      id: "#DR-2024-042",
      licenseNo: "DL-14-201000456",
      phone: "+91 88888 77777",
      status: "On Route",
      performance: 98,
      img: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop",
      uid: "driver-1",
    }
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
      navigate("/directory/enroll-student");
    } else if (activeTab === "staff") {
      navigate("/directory/add-staff");
    } else if (activeTab === "drivers") {
      navigate("/directory/add-driver");
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
                className="btn-outline h-10 px-6 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                Import List
              </button>
              <button
                onClick={handleCreateAction}
                className="btn-primary h-10 px-6 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm shadow-slate-100/30"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                {activeTab === "staff" ? "Add Staff" : activeTab === "students" ? "Enroll Student" : "Add Driver"}
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
                        <button onClick={() => setShowBulkModal(false)} className="flex-1 py-3.5 rounded-2xl border border-slate-100 text-[13px] font-bold text-[#B0AFA8] hover:bg-[#F7F8F4] transition-all">Cancel</button>
                        <button disabled className="flex-1 py-3.5 rounded-2xl bg-secondary text-white text-[13px] font-bold opacity-50 cursor-not-allowed">Start Validation</button>
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
                        <button onClick={() => setShowAddModal(false)} className="flex-1 py-3.5 rounded-2xl border border-slate-100 text-[13px] font-bold text-[#B0AFA8] hover:bg-[#F7F8F4] transition-all">Cancel</button>
                        <button onClick={() => handleAddMember({ name: "Rahul Sharma", id: "#REF-2024-00X", status: "Active" })} className="flex-1 py-3.5 rounded-2xl bg-secondary text-white text-[13px] font-bold shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5 ">Complete Registration</button>
                    </div>
                </div>
            </div>
        )}

        <div className="px-8 border-b border-slate-100 bg-white">
          <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: "staff", label: "Staff", icon: "badge" },
              { id: "students", label: "Students", icon: "group" },
              { id: "drivers", label: "Drivers", icon: "local_shipping" },
              { id: "attendance", label: "Attendance", icon: "event_available" },
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
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "staff" && (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <StaffPage
              isHubChild
              externalStaff={staffMembers}
              onAddStaff={() => setShowAddModal(true)}
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
          <div className="flex-1 overflow-y-auto no-scrollbar p-8">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map((d) => (
                    <div key={d.uid} className="bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-100/50 transition-all group">
                         <div className="flex items-center justify-between mb-6">
                            <img src={d.img} alt={d.name} className="size-14 rounded-2xl object-cover" />
                            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">
                                {d.status}
                            </div>
                        </div>
                        <h4 className="text-foreground font-bold text-lg">{d.name}</h4>
                        <p className="text-[12px] text-[#B0AFA8] font-medium mb-4">{d.id}</p>

                        <div className="space-y-3 pt-4 border-t border-slate-50">
                            <div className="flex justify-between items-center text-[12px]">
                                <span className="font-bold text-[#B0AFA8]">License</span>
                                <span className="font-bold text-foreground">{d.licenseNo}</span>
                            </div>
                            <div className="flex justify-between items-center text-[12px]">
                                <span className="font-bold text-[#B0AFA8]">Performance</span>
                                <span className="font-bold text-primary">{d.performance}%</span>
                            </div>
                             <button className="w-full py-3 rounded-xl bg-secondary text-white text-[12px] font-bold hover:shadow-lg  transition-all">Live Tracking</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
        {activeTab === "attendance" && (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <AttendancePage isHubChild />
          </div>
        )}
      </div>
    </div>
  );
};
