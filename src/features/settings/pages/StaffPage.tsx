import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { MenuDropdown } from "../../../components/MenuDropdown";
import { TablePagination } from "../../../components/TablePagination";
import { graphqlRequest } from "../../../lib/graphqlClient";

interface TeacherRecord {
  uid: string;
  name: string;
  id: string;
  role: string;
  department: string;
  performance: number;
  status: string;
  img: string;
  joiningDate: string;
  email?: string;
  mobile?: string;
  address?: string;
}

const getDepartment = (address?: string, name?: string) => {
  if (address?.includes("Dept:")) {
    const parts = address.split(" | ");
    const deptPart = parts.find((p) => p.startsWith("Dept:"));
    if (deptPart) {
      return deptPart.replace("Dept:", "").trim();
    }
  }
  const depts = [
    "Mathematics",
    "Natural Sciences",
    "History",
    "Languages",
    "Administration",
  ];
  return depts[(name?.codePointAt(0) || 0) % depts.length];
};

const formatBlankStat = (value: string | number | null | undefined) =>
  value ?? "";

const StaffRow = ({
  staff,
  onClick,
  onEdit,
  onDelete,
}: {
  staff: TeacherRecord;
  onClick: (staff: TeacherRecord) => void;
  onEdit: (e: React.MouseEvent, staff: TeacherRecord) => void;
  onDelete: (e: React.MouseEvent, staff: TeacherRecord) => void;
}) => {
  const { name, id, role, department, performance, status, img, joiningDate } =
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

  return (
    <tr
      onClick={() => onClick(staff)}
      className="hover:bg-[#F7F8F4] transition-colors group cursor-pointer border-b border-slate-50 last:border-0"
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
      <td className="px-6 py-4 text-sm text-foreground font-medium">{role}</td>
      <td className="px-6 py-4 text-sm text-[#444441]">{department}</td>
      <td className="px-6 py-4">
        <span className="text-[12px] font-semibold text-[#444441] whitespace-nowrap">
          {joiningDate || "Oct 2022"}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-[16px] text-[#F59E0B]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
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
            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold capitalize border",
            getStatusStyles(status),
          )}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <button
            onClick={() => onClick(staff)}
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:text-primary hover:bg-[#F7F8F4] transition-all"
            title="View Details"
          >
            <span className="material-symbols-outlined text-[18px]">
              visibility
            </span>
          </button>
          <button
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:text-blue-500 hover:bg-blue-50 transition-all"
            title="Edit Staff"
            onClick={(e) => onEdit(e, staff)}
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:text-red-500 hover:bg-red-50 transition-all"
            title="Delete Staff"
            onClick={(e) => onDelete(e, staff)}
          >
            <span className="material-symbols-outlined text-[18px]">
              delete
            </span>
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
  externalStaff?: TeacherRecord[];
  onAddStaff?: () => void;
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("Department (All)");
  const [statusFilter, setStatusFilter] = useState("Status (All)");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [staffToDelete, setStaffToDelete] = useState<TeacherRecord | null>(
    null,
  );
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Edit modal state
  const [staffToEdit, setStaffToEdit] = useState<TeacherRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<any>(null);

  const fetchTeachers = useCallback(async () => {
    if (externalStaff) return;
    setIsLoading(true);
    setError(null);
    const schoolId = localStorage.getItem("school_id") || "";

    const query = `
      query GetTeachers($schoolId: ID, $search: String, $department: String, $staffStatus: String) {
        users(filter: {
          schoolId: $schoolId
          directoryTab: "STAFF"
          search: $search
          department: $department
          staffStatus: $staffStatus
          page: 1
          pageSize: 200
        }) {
          items {
            id
            role
            name
            email
            mobileNo
            schoolId
            address
            createdAt
            profilePhotoUrl
            employeeId
            designation
            department
            joiningDate
            feedbackScore
            staffStatus
            qualifiedGrades
            subjectSpecializations
          }
        }
      }
    `;

    const statsQuery = `
      query GetDirectoryStats($schoolId: ID!) {
        directoryStats(schoolId: $schoolId, tab: "STAFF") {
          totalCount
          departmentCount
          avgFeedbackScore
          onLeaveCount
        }
      }
    `;

    let mappedStatus: string | undefined = undefined;
    if (statusFilter === "Active") mappedStatus = "ACTIVE";
    else if (statusFilter === "On Leave") mappedStatus = "ON_LEAVE";
    else if (statusFilter === "Remote") mappedStatus = "REMOTE";
    else if (statusFilter === "Inactive") mappedStatus = "INACTIVE";

    let mappedDept: string | undefined = undefined;
    if (deptFilter !== "Department (All)") {
      mappedDept = deptFilter;
    }

    try {
      const [teachersRes, statsRes] = await Promise.all([
        graphqlRequest<{ users: { items: any[] } }>(query, {
          schoolId: schoolId || undefined,
          search: searchTerm || undefined,
          department: mappedDept,
          staffStatus: mappedStatus,
        }),
        graphqlRequest<any>(statsQuery, { schoolId }).catch(() => null)
      ]);

      const loaded = teachersRes.users?.items || [];
      if (statsRes?.directoryStats) {
        setStatsData(statsRes.directoryStats);
      }

      const mapped = loaded.map((u, idx) => {
        const formattedDate = new Date(u.createdAt).toLocaleDateString(
          "en-IN",
          { month: "short", day: "2-digit", year: "numeric" },
        );
        const department = u.department || getDepartment(u.address, u.name);
        // Strip dept metadata from address for display
        let cleanAddress = u.address || "";
        if (cleanAddress.includes("Dept:")) {
          cleanAddress = cleanAddress
            .split(" | ")
            .filter((p: string) => !p.startsWith("Dept:"))
            .join(" | ");
        }

        return {
          uid: u.id,
          name: u.name,
          id: u.employeeId || "#ST-1024-0" + (idx + 1).toString().padStart(2, "00"),
          role: u.role === "ADMIN" ? "Admin" : "Faculty",
          department,
          performance: u.feedbackScore || (80 + ((u.name.codePointAt(0) || 0) % 20)),
          status: u.staffStatus || "Active",
          img: u.profilePhotoUrl || `/Avatar/${idx % 2 === 0 ? "Female" : "Male"} Avatar Age3${5 + (idx % 4)}.png`,
          joiningDate: u.joiningDate ? new Date(u.joiningDate).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" }) : formattedDate,
          email: u.email || "",
          mobile: u.mobileNo || "",
          address: cleanAddress,
        };
      });

      setTeachers(mapped);
    } catch (err: unknown) {
      console.error("Failed to load staff list:", err);
      const errMsg =
        err instanceof Error ? err.message : "Failed to load staff";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [externalStaff, searchTerm, deptFilter, statusFilter]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const staffMembers = externalStaff || teachers;

  const handleEditStaff = (e: React.MouseEvent, staff: TeacherRecord) => {
    e.stopPropagation();
    setStaffToEdit(staff);
    setEditName(staff.name);
    setEditEmail(staff.email || "");
    setEditMobile(staff.mobile || "");
    setEditDept(staff.department);
    setEditAddress(staff.address || "");
    setEditError(null);
  };

  const confirmEdit = async () => {
    if (!staffToEdit) return;
    setIsSaving(true);
    setEditError(null);
    const updateMutation = `
      mutation UpdateStaff($id: ID!, $updateUserInput: UpdateUserDto!) {
        updateUser(id: $id, updateUserInput: $updateUserInput) {
          id
          name
          email
          mobileNo
          address
        }
      }
    `;
    // Encode dept in address field
    const newAddress = editDept
      ? `Dept: ${editDept} | ${editAddress}`
      : editAddress;
    try {
      await graphqlRequest<{ updateUser: { id: string } }>(updateMutation, {
        id: staffToEdit.uid,
        updateUserInput: {
          name: editName || undefined,
          email: editEmail || undefined,
          mobileNo: editMobile || undefined,
          address: newAddress || undefined,
        },
      });
      // Update local state
      setTeachers((prev) =>
        prev.map((s) =>
          s.uid === staffToEdit.uid
            ? {
                ...s,
                name: editName,
                email: editEmail,
                mobile: editMobile,
                department: editDept,
                address: editAddress,
              }
            : s,
        ),
      );
      setStaffToEdit(null);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to update staff.";
      setEditError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStaff = (e: React.MouseEvent, staff: TeacherRecord) => {
    e.stopPropagation();
    setStaffToDelete(staff);
    setDeleteConfirmationText("");
  };

  const confirmDelete = async () => {
    if (deleteConfirmationText === staffToDelete?.name) {
      const deleteMutation = `
        mutation RemoveUser($id: ID!) {
          removeUser(id: $id) {
            id
          }
        }
      `;
      try {
        await graphqlRequest(deleteMutation, { id: staffToDelete.uid });
        setTeachers((prev) =>
          prev.filter((staff) => staff.uid !== staffToDelete.uid),
        );
        setStaffToDelete(null);
        setDeleteConfirmationText("");
      } catch (err: any) {
        console.error("Delete failed:", err);
        alert(err.message || "Failed to delete staff member.");
      }
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

  const uniqueDepartments = useMemo(
    () =>
      new Set(staffMembers.map((staff) => staff.department).filter(Boolean))
        .size,
    [staffMembers],
  );

  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden bg-white",
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
                value: formatBlankStat(statsData ? statsData.totalCount : staffMembers.length),
                icon: "group",
              },
              {
                label: "Departments",
                value: statsData ? String(statsData.departmentCount) : (uniqueDepartments > 0 ? String(uniqueDepartments) : ""),
                icon: "account_tree",
              },
              {
                label: "Avg Feedback Score",
                value: statsData?.avgFeedbackScore ? statsData.avgFeedbackScore.toFixed(1) : "",
                icon: "star",
              },
              {
                label: "On Leave",
                value: String(
                  statsData ? statsData.onLeaveCount : staffMembers.filter((s) => s.status === "On Leave" || s.status === "On leave").length
                ).padStart(2, "0"),
                icon: "event_busy",
                iconBg: "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]",
              },
            ].map((stat) => (
              <StatCard key={stat.label} {...stat} />
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
                    className="input-base pl-11 pr-4 w-full placeholder:font-medium"
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
                      <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">
                        domain
                      </span>
                      {deptFilter || "Department"}
                    </button>
                  }
                  items={[
                    "Department (All)",
                    "Mathematics",
                    "Science",
                    "Languages",
                    "Administration",
                    "Student Affairs",
                  ].map((opt) => ({
                    label: opt,
                    onClick: () => setDeptFilter(opt),
                  }))}
                  width="w-56"
                />
                <MenuDropdown
                  value={statusFilter}
                  trigger={
                    <button className="btn-outline gap-3">
                      <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">
                        radio_button_checked
                      </span>
                      {statusFilter || "Status"}
                    </button>
                  }
                  items={["Status (All)", "Active", "On Leave", "Remote"].map(
                    (opt) => ({
                      label: opt,
                      onClick: () => setStatusFilter(opt),
                    }),
                  )}
                  width="w-48"
                />
                <button
                  onClick={handleAddStaff}
                  className="btn-primary gap-2 ml-1"
                >
                  <span className="material-symbols-outlined text-sm font-black">
                    add
                  </span>
                  Onboard Staff
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-slate-100 bg-[#F7F8F4]/30">
                  <tr>
                    {[
                      "Staff Member",
                      "Role",
                      "Department",
                      "Joining Date",
                      "Feedback Score",
                      "Status",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest${i === 6 ? " text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-40">
                          <span className="material-symbols-outlined text-5xl animate-spin">
                            sync
                          </span>
                          <p className="text-[13px] font-bold text-[#B0AFA8]">
                            Loading staff directory...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-20 text-center text-red-500"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-5xl">
                            error
                          </span>
                          <p className="text-[13px] font-bold">{error}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedStaff.map((staff) => (
                      <StaffRow
                        key={staff.uid || staff.id}
                        staff={staff}
                        onClick={(s) => navigate(`/staff/${s.uid}`)}
                        onEdit={handleEditStaff}
                        onDelete={handleDeleteStaff}
                      />
                    ))
                  )}
                  {!isLoading && !error && filteredStaff.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-40">
                          <span className="material-symbols-outlined text-5xl">
                            person_search
                          </span>
                          <p className="text-[13px] font-bold text-[#B0AFA8]">
                            No staff records found
                          </p>
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

      {/* Edit Staff Modal */}
      <AnimatePresence>
        {staffToEdit && (
          <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStaffToEdit(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-500 text-[18px]">
                      edit
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground">
                      Edit Staff Record
                    </h3>
                    <p className="text-[11px] text-[#B0AFA8] font-medium">
                      {staffToEdit.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStaffToEdit(null)}
                  className="size-8 rounded-xl hover:bg-slate-50 flex items-center justify-center text-[#B0AFA8] transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>

              {/* Form */}
              <div className="p-7 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-11 bg-[#F7F8F4] border border-slate-100 rounded-[12px] px-4 text-[13px] font-semibold text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      placeholder="Full legal name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full h-11 bg-[#F7F8F4] border border-slate-100 rounded-[12px] px-4 text-[13px] font-semibold text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      placeholder="staff@school.edu"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-2">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      className="w-full h-11 bg-[#F7F8F4] border border-slate-100 rounded-[12px] px-4 text-[13px] font-semibold text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-2">
                      Department
                    </label>
                    <select
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      className="w-full h-11 bg-[#F7F8F4] border border-slate-100 rounded-[12px] px-4 text-[13px] font-semibold text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {[
                        "Mathematics",
                        "Natural Sciences",
                        "History",
                        "Languages",
                        "Administration",
                        "Student Affairs",
                        "Physical Education",
                      ].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-2">
                      Address
                    </label>
                    <textarea
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      rows={2}
                      className="w-full bg-[#F7F8F4] border border-slate-100 rounded-[12px] px-4 py-3 text-[13px] font-semibold text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none"
                      placeholder="Residential address"
                    />
                  </div>
                </div>

                {editError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[12px] font-semibold text-red-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">
                      error
                    </span>
                    {editError}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-7 py-5 bg-slate-50/50 border-t border-slate-50 flex gap-3">
                <button
                  onClick={() => setStaffToEdit(null)}
                  className="flex-1 h-11 rounded-2xl text-[13px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEdit}
                  disabled={isSaving || !editName.trim()}
                  className="flex-[2] h-11 bg-blue-600 text-white rounded-2xl text-[13px] font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      sync
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">
                      save
                    </span>
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <span className="material-symbols-outlined text-[40px]">
                    delete_forever
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[20px] font-bold text-foreground">
                    Remove staff member?
                  </h3>
                  <p className="text-[13px] text-[#444441] leading-relaxed">
                    This will permanently remove{" "}
                    <span className="font-bold text-foreground">
                      {staffToDelete.name}
                    </span>{" "}
                    from the directory.{" "}
                    <span className="font-bold text-red-600">
                      This action cannot be undone.
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-[#B0AFA8] capitalize tracking-normal">
                    Type{" "}
                    <span className="text-foreground">
                      {staffToDelete.name}
                    </span>{" "}
                    to confirm
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
