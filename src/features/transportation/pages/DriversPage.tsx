import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { MenuDropdown } from "../../../components/MenuDropdown";
import { TablePagination } from "../../../components/TablePagination";
import { graphqlRequest } from "../../../lib/graphqlClient";

const GET_DRIVERS = `
  query GetDrivers($schoolId: String, $search: String, $driverStatus: String) {
    users(filter: {
      schoolId: $schoolId
      directoryTab: "DRIVERS"
      search: $search
      driverStatus: $driverStatus
      page: 1
      pageSize: 500
    }) {
      items {
        id
        name
        role
        mobileNo
        driverLicenseNo
        address
        isActive
        createdAt
      }
    }
  }
`;

const GET_DRIVER_STATS = `
  query GetDriverStats($schoolId: ID!) {
    directoryStats(schoolId: $schoolId, tab: "DRIVERS") {
      totalCount
      onLeaveCount
      activeVehiclesCount
      routeCoveragePercent
    }
  }
`;

const DELETE_DRIVER = `
  mutation RemoveDriver($id: ID!) {
    removeUser(id: $id)
  }
`;

const parseDriverAddress = (addressStr: string) => {
  const meta = {
    licExp: "Oct 22, 2026",
    experience: "5 Years",
    bus: "Unassigned",
    route: "Unassigned",
    shift: "Morning & Evening",
    joiningDate: "Jan 12, 2022",
  };

  if (!addressStr) return meta;

  const parts = addressStr.split("|");
  parts.forEach((part) => {
    const splitIdx = part.indexOf(":");
    if (splitIdx > 0) {
      const key = part.slice(0, splitIdx);
      const val = part.slice(splitIdx + 1);
      if (key === "LicExp") meta.licExp = val;
      else if (key === "Exp") meta.experience = val;
      else if (key === "Bus") meta.bus = val;
      else if (key === "Route") meta.route = val;
      else if (key === "Shift") meta.shift = val;
      else if (key === "Join") meta.joiningDate = val;
    }
  });

  return meta;
};

const DriverRow = ({
  driver,
  onClick,
  onDelete,
}: {
  driver: any;
  onClick: (driver: any) => void;
  onDelete: (driver: any) => void;
}) => {
  const { name, id, bus, regNo, licenseNo, licenseExpiry, status, img, phone, route, experience, joiningDate } = driver;

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-[#EAF2D7] text-[#2E7D32] border border-[#D9EA85]";
      case "on route":
        return "bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]";
      case "on leave":
        return "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]";
      case "maintenance":
        return "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]";
      default:
        return "bg-[#F0F0EC] text-[#444441] border border-slate-200";
    }
  };

  const isExpiringThisYear = licenseExpiry?.includes("2026");

  return (
    <tr
      onClick={() => onClick(driver)}
      className="hover:bg-[#F7F8F4] transition-colors group cursor-pointer border-b border-slate-50 last:border-0"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="size-9 rounded-xl bg-cover bg-center border border-slate-100 shadow-sm"
            style={{ backgroundImage: `url("${img}")` }}
          ></div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">
              {name}
            </span>
            <span className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider">{id}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-foreground leading-tight">{bus} — {route}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{regNo || "KL01MT8872"}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-foreground leading-tight">{joiningDate || "Jan 12, 2022"}</span>
          <span className="text-[10px] font-medium text-[#B0AFA8]">{experience} Service</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-foreground leading-tight">{licenseNo}</span>
          <span className={cn(
            "text-[10px] font-medium",
            isExpiringThisYear ? "text-red-600" : "text-emerald-600"
          )}>
            Expires: {licenseExpiry}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-[13px] font-bold text-foreground">{phone || "+91 98472-11002"}</span>
      </td>
      <td className="px-6 py-4 w-[140px]">
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap",
            getStatusStyles(status),
          )}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(driver); }}
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:bg-white hover:text-foreground hover:shadow-sm transition-all"
            title="View Profile"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(driver); }}
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all"
            title="Delete Driver"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export const DriversPage = ({
  isHubChild,
}: {
  isHubChild?: boolean;
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [driverToDelete, setDriverToDelete] = useState<any>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [rawDrivers, setRawDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);

  const schoolId = localStorage.getItem("school_id") || "";

  const fetchDrivers = useCallback(async () => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      let mappedStatus: string | undefined = undefined;
      if (statusFilter === "Active") mappedStatus = "ACTIVE";

      const [driversRes, statsRes] = await Promise.all([
        graphqlRequest<any>(GET_DRIVERS, {
          schoolId,
          search: searchTerm || undefined,
          driverStatus: mappedStatus,
        }),
        graphqlRequest<any>(GET_DRIVER_STATS, { schoolId }).catch(() => null)
      ]);

      const items = (driversRes.users?.items || []).filter((u: any) => u.isActive);
      setRawDrivers(items);
      if (statsRes?.directoryStats) {
        setStatsData(statsRes.directoryStats);
      }
    } catch (err) {
      console.error("Failed to load drivers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, searchTerm, statusFilter]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const drivers = useMemo(() => {
    return rawDrivers.map((u: any) => {
      const meta = parseDriverAddress(u.address);
      return {
        uid: u.id,
        id: u.admissionNumber || `DRV-${u.id.slice(0, 4).toUpperCase()}`,
        name: u.name,
        phone: u.mobileNo || "N/A",
        licenseNo: u.driverLicenseNo || "N/A",
        licenseExpiry: meta.licExp,
        experience: meta.experience,
        bus: meta.bus,
        route: meta.route,
        shift: meta.shift,
        joiningDate: meta.joiningDate,
        status: "Active", // Defaulting active since they are registered in the DB
        regNo: "KL01MT8872",
        img: "/Avatar/Male Avatar Age45.png",
      };
    });
  }, [rawDrivers]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.route && d.route.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "All Status" || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, drivers]);

  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDrivers.slice(start, start + itemsPerPage);
  }, [filteredDrivers, currentPage, itemsPerPage]);

  const confirmDelete = async () => {
    if (driverToDelete && deleteConfirmationText === driverToDelete.name) {
      try {
        await graphqlRequest(DELETE_DRIVER, { id: driverToDelete.uid });
        setDriverToDelete(null);
        setDeleteConfirmationText("");
        fetchDrivers();
      } catch (err) {
        console.error("Failed to delete driver:", err);
        alert("Failed to delete driver.");
      }
    }
  };

  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden bg-transparent",
        !isHubChild && "h-screen",
      )}
    >
      {!isHubChild && (
        <TopBar
          title="Fleet Drivers Management"
          subtitle="Manage driver profiles, licenses, and bus assignments"
        />
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar pb-12 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 space-y-8">

          {/* Fleet Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              label="Total Drivers"
              value={statsData ? statsData.totalCount : drivers.length}
              trend="Registered transport captains"
              icon="badge"
              color="primary"
            />
            <StatCard
              label="Active Vehicles"
              value={statsData ? String(statsData.activeVehiclesCount) : "24"}
              trend="Institutional fleet"
              icon="directions_bus"
              color="secondary"
            />
            <StatCard
              label="Route Coverage"
              value={statsData ? `${statsData.routeCoveragePercent}%` : "98%"}
              trend="On-time metrics"
              icon="map"
              color="secondary"
            />
          </div>

          {/* Unified Drivers Registry Card */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/30 flex flex-col">

            {/* Integrated Search and Filters */}
            <div className="p-3 flex items-center gap-3 border-b border-slate-100/50 rounded-t-[24px] relative z-20">
              <div className="flex-1">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg z-20">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search drivers by name, ID or route..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-base pl-11 pr-4 w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <MenuDropdown
                  value={statusFilter}
                  trigger={
                    <button className="btn-outline gap-3">
                      <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">radio_button_checked</span>
                      {statusFilter === "All Status" ? "Status" : statusFilter}
                    </button>
                  }
                  items={[
                    { label: "Status (All)", onClick: () => setStatusFilter("All Status") },
                    { label: "On Route", onClick: () => setStatusFilter("On Route") },
                    { label: "Active", onClick: () => setStatusFilter("Active") },
                  ]}
                  width="w-48"
                />

                <button
                  onClick={() => navigate("/directory/drivers/add")}
                  className="btn-primary gap-2 ml-1"
                >
                  <span className="material-symbols-outlined text-sm font-black">add</span>
                  Add Driver
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-slate-100 bg-[#F7F8F4]/30">
                  <tr>
                    {["Driver Name", "Bus & Route", "Service", "License Credentials", "Contact Info", "Status", "Actions"].map((h, i) => (
                      <th key={h} className={cn(
                        "px-6 py-5 text-[10px] font-bold text-[#B0AFA8] uppercase tracking-widest",
                        i === 5 ? "w-[140px]" : "",
                        i === 6 ? "text-right" : ""
                      )}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedDrivers.map((driver) => (
                    <DriverRow
                      key={driver.uid}
                      driver={driver}
                      onClick={(d) => navigate(`/drivers/${d.uid}`)}
                      onDelete={(d) => {
                        setDriverToDelete(d);
                        setDeleteConfirmationText("");
                      }}
                    />
                  ))}
                  {filteredDrivers.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-40">
                          <span className="material-symbols-outlined text-5xl">person_search</span>
                          <p className="text-[13px] font-bold text-[#B0AFA8]">No driver records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              totalItems={filteredDrivers.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(count) => {
                setItemsPerPage(count);
                setCurrentPage(1);
              }}
              itemName="drivers"
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {driverToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDriverToDelete(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-slate-900/20 overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="size-20 rounded-[24px] bg-red-50 flex items-center justify-center text-red-600 mx-auto">
                  <span className="material-symbols-outlined text-[40px]">delete_forever</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[20px] font-bold text-foreground tracking-tight">Revoke Driver Credentials?</h3>
                  <p className="text-[14px] text-[#444441] leading-relaxed">
                    You are about to remove <span className="text-foreground font-bold">{driverToDelete.name}</span> from the fleet registry. <span className="font-bold text-red-600">This action cannot be undone.</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-[#B0AFA8]">Type driver's name to confirm</p>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder={driverToDelete.name}
                    className="input-base w-full"
                  />
                </div>
              </div>

              <div className="p-6 bg-red-50/30 border-t border-red-50 flex gap-3">
                <button
                  onClick={() => setDriverToDelete(null)}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteConfirmationText !== driverToDelete.name}
                  className="flex-1 h-12 bg-red-600 text-white text-[14px] font-bold rounded-2xl hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-red-600/20 transition-all"
                >
                  Confirm Revoke
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
