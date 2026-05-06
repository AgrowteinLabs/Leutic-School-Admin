import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { AppDropdown } from "../../../components/AppDropdown";
import { MenuDropdown } from "../../../components/MenuDropdown";
import { TablePagination } from "../../../components/TablePagination";

const StaffRow = ({
  staff,
  onClick,
  onDelete,
}: {
  staff: any;
  onClick: (staff: any) => void;
  onDelete: (e: React.MouseEvent, staff: any) => void;
}) => {
  const { name, id, role, department, performance, auraScore, status, img, joiningDate } =
    staff;

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-[#EAF2D7] text-[#2E7D32] border border-[#D9EA85]";
      case "on leave":
        return "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]";
      case "remote":
        return "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]";
      default:
        return "bg-[#F7F8F4] text-slate-700 border border-slate-500";
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent > 85) return "bg-primary";
    if (percent > 70) return "bg-secondary";
    return "bg-secondary/40";
  };

  return (
    <tr
      onClick={() => onClick(staff)}
      className="hover:bg-[#F7F8F4] transition-colors group cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="size-8 rounded-full bg-cover bg-center border border-slate-100 shadow-sm"
            style={{ backgroundImage: `url("${img}")` }}
          ></div>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">
              {name}
            </span>
            <span className="text-[11px] font-bold text-[#B0AFA8]">{id}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-foreground font-medium">
        {role}
      </td>
      <td className="px-6 py-4 text-sm text-[#444441]">{department}</td>
      <td className="px-6 py-4">
        <span className="text-[12px] font-semibold text-[#444441] whitespace-nowrap">{joiningDate || "Oct 2022"}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-[13px] font-bold text-foreground">
              {(performance / 20).toFixed(1)}
            </span>
            <span className="text-[11px] font-medium text-[#B0AFA8]">
              / 5.0
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold  capitalize border",
            getStatusStyles(status),
          )}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:text-primary hover:bg-[#F7F8F4] transition-all" title="View Details">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:text-blue-500 hover:bg-blue-50 transition-all" title="Edit Staff">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:text-red-500 hover:bg-red-50 transition-all"
            title="Delete Staff"
            onClick={(e) => onDelete(e, staff)}
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export const StaffPage = ({
  isHubChild,
  externalStaff,
  onAddStaff,
}: {
  isHubChild?: boolean;
  externalStaff?: any[];
  onAddStaff?: () => void;
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("Department (All)");
  const [statusFilter, setStatusFilter] = useState("Status (All)");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [staffToDelete, setStaffToDelete] = useState<any | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const [internalStaff, setInternalStaff] = useState([
    {
      name: "Dr. Lakshmi K.",
      id: "#ST-1024-001",
      role: "Lead Teacher",
      department: "Mathematics",
      performance: 96,
      auraScore: 98.4,
      status: "Active",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
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
      img: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop",
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
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
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
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      joiningDate: "15 Jul 2020",
      uid: "arvind-s",
    },
  ]);

  const staffMembers = externalStaff || internalStaff;

  const handleDeleteStaff = (e: React.MouseEvent, staff: any) => {
    e.stopPropagation();
    setStaffToDelete(staff);
    setDeleteConfirmationText("");
  };

  const confirmDelete = () => {
    if (staffToDelete && deleteConfirmationText === staffToDelete.name) {
      setInternalStaff((prev) => prev.filter((staff) => staff.id !== staffToDelete.id));
      setStaffToDelete(null);
      setDeleteConfirmationText("");
    }
  };

  const handleAddStaff = () => {
    if (onAddStaff) {
      onAddStaff();
      return;
    }
    navigate("/directory/staff/add");
  };

  const filteredStaff = useMemo(() => {
    return staffMembers.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        deptFilter === "Department (All)" ||
        staff.department.includes(deptFilter) ||
        (deptFilter === "Science" && staff.department === "Natural Sciences");

      const matchesStatus =
        statusFilter === "Status (All)" || staff.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [searchTerm, deptFilter, statusFilter, staffMembers]);

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(start, start + itemsPerPage);
  }, [filteredStaff, currentPage, itemsPerPage]);

  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden",
        !isHubChild && "h-screen",
      )}
    >
      {!isHubChild && (
        <TopBar
          title="Staff Directory"
          subtitle="Manage faculty profiles, performance and school departments"
          actions={
            <>
              <button className="bg-white border border-slate-100 text-foreground px-6 h-10 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 hover:bg-[#F7F8F4] shadow-sm shadow-slate-100/30 transition-all">
                <span className="material-symbols-outlined text-sm">
                  upload_file
                </span>
                Bulk CSV Import
              </button>
              <button
                onClick={handleAddStaff}
                className="btn-primary px-6 h-10 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all shadow-sm shadow-slate-100/30"
              >
                <span className="material-symbols-outlined text-sm">
                  person_add
                </span>
                Onboard Staff
              </button>
            </>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 no-scrollbar">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Staff",
                value: "148",
                icon: "group",
              },
              {
                label: "Departments",
                value: "12",
                icon: "account_tree",
              },
              {
                label: "Avg Feedback Score",
                value: "4.7 / 5.0",
                icon: "star",
              },
              { label: "On Leave", value: "05", icon: "event_busy", iconBg: "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]" },
            ].map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Unified Staff Registry Card */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/30 flex flex-col">

            {/* Integrated Search and Filters */}
            <div className="p-3 flex items-center gap-3 border-b border-slate-100/50 rounded-t-[24px] relative z-20">
              <div className="flex-1">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg z-20">
                    search
                  </span>
                  <input
                    className="input-base pl-11 pr-4 w-full"
                    placeholder="Search by name, department, or role..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <MenuDropdown
                  value={deptFilter}
                  trigger={
                    <button className="btn-outline gap-3">
                      <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">domain</span>
                      {deptFilter || "Department"}
                    </button>
                  }
                  items={[
                    "Department (All)", "Mathematics", "Science", "Languages", "Administration", "Student Affairs"
                  ].map(opt => ({ label: opt, onClick: () => setDeptFilter(opt) }))}
                  width="w-56"
                />
                <MenuDropdown
                  value={statusFilter}
                  trigger={
                    <button className="btn-outline gap-3">
                      <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">radio_button_checked</span>
                      {statusFilter || "Status"}
                    </button>
                  }
                  items={[
                    "Status (All)", "Active", "On Leave", "Remote"
                  ].map(opt => ({ label: opt, onClick: () => setStatusFilter(opt) }))}
                  width="w-48"
                />
                <button
                  onClick={handleAddStaff}
                  className="btn-primary gap-2 ml-1"
                >
                  <span className="material-symbols-outlined text-sm font-black">add</span>
                  Onboard Staff
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-slate-100 bg-[#F7F8F4]/30">
                  <tr>
                    {["Staff Member", "Role", "Department", "Joining Date", "Feedback Score", "Status", "Actions"].map((h, i) => (
                      <th key={h} className={`px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest${i === 6 ? " text-right" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedStaff.map((staff) => (
                    <StaffRow
                      key={staff.id}
                      staff={staff}
                      onClick={(s) => navigate(`/staff/${s.id.replace("#", "")}`)}
                      onDelete={handleDeleteStaff}
                    />
                  ))}
                  {filteredStaff.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-20 text-center"
                      >
                        <div className="flex flex-col items-center gap-3 opacity-40">
                          <span className="material-symbols-outlined text-5xl">person_search</span>
                          <p className="text-[13px] font-bold text-[#B0AFA8]">No staff records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              totalItems={filteredStaff.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(count) => {
                setItemsPerPage(count);
                setCurrentPage(1);
              }}
              itemName="staff members"
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {staffToDelete && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStaffToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-red-100 overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="size-20 rounded-[24px] bg-red-50 flex items-center justify-center text-red-600 mx-auto animate-pulse">
                  <span className="material-symbols-outlined text-[40px]">delete_forever</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[20px] font-bold text-foreground">Remove staff member?</h3>
                  <p className="text-[13px] text-[#444441] leading-relaxed">
                    This will permanently remove <span className="font-bold text-foreground">{staffToDelete.name}</span> from the directory. <span className="font-bold text-red-600">This action cannot be undone.</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-[#B0AFA8] capitalize tracking-normal">
                    Type <span className="text-foreground">{staffToDelete.name}</span> to confirm
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder={staffToDelete.name}
                    className="w-full h-12 bg-[#F7F8F4] border border-slate-100 rounded-[14px] px-6 text-center text-[14px] font-bold text-foreground focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-6 bg-red-50/30 border-t border-red-50 flex gap-3">
                <button
                  onClick={() => setStaffToDelete(null)}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteConfirmationText !== staffToDelete.name}
                  onClick={confirmDelete}
                  className="flex-[2] bg-red-600 text-white h-12 rounded-2xl text-[14px] font-bold shadow-xl shadow-red-500/20 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
