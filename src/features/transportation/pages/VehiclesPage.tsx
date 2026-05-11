import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { MenuDropdown } from "../../../components/MenuDropdown";
import { TablePagination } from "../../../components/TablePagination";

const VehicleRow = ({
  vehicle,
  onClick,
  onDelete,
}: {
  vehicle: any;
  onClick: (vehicle: any) => void;
  onDelete: (vehicle: any) => void;
}) => {
  const { id, type, regNo, capacity, fuelType, route, status, expiryCount } = vehicle;

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-[#EAF2D7] text-[#2E7D32] border border-[#D9EA85]";
      case "idle":
        return "bg-[#F0F0EC] text-[#444441] border border-slate-200";
      case "at risk":
        return "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]";
      default:
        return "bg-slate-50 text-slate-400 border border-slate-100";
    }
  };

  return (
    <tr
      onClick={() => onClick(vehicle)}
      className="hover:bg-[#F7F8F4] transition-colors group cursor-pointer border-b border-slate-50 last:border-0"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-slate-50 flex items-center justify-center text-brand-navy border border-slate-100">
            <span className="material-symbols-outlined text-[20px]">directions_bus</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-brand-navy group-hover:text-primary transition-colors">
              Bus {id}
            </span>
            <span className="text-[10px] font-medium text-[#B0AFA8] tracking-wide">{type}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-brand-navy leading-tight">{regNo}</span>
          <span className="text-[10px] font-medium text-slate-500 tracking-wide mt-0.5">{fuelType}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-brand-navy leading-tight">{route}</span>
          <span className="text-[10px] font-medium text-slate-400 tracking-wide mt-0.5">Primary Route</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-brand-navy leading-tight">{capacity} Students</span>
          <span className="text-[10px] font-medium text-[#B0AFA8]">Full capacity</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[12px] font-bold",
            expiryCount > 0 ? "text-red-600" : "text-emerald-600"
          )}>
            {expiryCount > 0 ? `${expiryCount} Docs expiring` : "All docs valid"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 w-[140px]">
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap",
            getStatusStyles(status),
          )}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(vehicle); }}
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:bg-white hover:text-foreground hover:shadow-sm transition-all"
            title="Vehicle Details"
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
          </button>
          <button
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:bg-white hover:text-primary hover:shadow-sm transition-all"
            title="Edit Asset"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(vehicle); }}
            className="size-8 flex items-center justify-center rounded-lg text-[#B0AFA8] hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all"
            title="Decommission Vehicle"
          >
            <span className="material-symbols-outlined text-[18px]">bus_alert</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export const VehiclesPage = ({
  isHubChild,
}: {
  isHubChild?: boolean;
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [vehicleToDelete, setVehicleToDelete] = useState<any>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [vehicles, setVehicles] = useState([
    { id: "01", type: "Standard Bus", regNo: "KL01PC4456", capacity: 42, fuelType: "Diesel", route: "North Coast", status: "Active", expiryCount: 0 },
    { id: "05", type: "Mini Bus", regNo: "KL01TR0112", capacity: 24, fuelType: "CNG", route: "Central Loop", status: "Active", expiryCount: 1 },
    { id: "08", type: "Standard Bus", regNo: "KL07BB9982", capacity: 42, fuelType: "Diesel", route: "East Extension", status: "Idle", expiryCount: 0 },
    { id: "12", type: "Standard Bus", regNo: "KA01ME3342", capacity: 42, fuelType: "Electric", route: "West Hub", status: "At Risk", expiryCount: 2 },
    { id: "15", type: "Van", regNo: "KL01MT8872", capacity: 12, fuelType: "Petrol", route: "Highland", status: "Active", expiryCount: 0 },
    { id: "04", type: "Standard Bus", regNo: "MH12TS5541", capacity: 42, fuelType: "Diesel", route: "South Sector", status: "At Risk", expiryCount: 1 },
    { id: "02", type: "Standard Bus", regNo: "TN01ES2210", capacity: 42, fuelType: "CNG", route: "Coastal Road", status: "Active", expiryCount: 0 },
  ]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.route.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "All Status" || v.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, vehicles]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden bg-white",
        !isHubChild && "h-screen",
      )}
    >
      {!isHubChild && (
        <TopBar
          title="Fleet Inventory"
          subtitle="Manage institutional vehicles, registration and logistics"
        />
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 space-y-8">

          {/* Fleet Performance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Fleet" value="32" trend="Registered units" icon="directions_bus" color="primary" />
            <StatCard label="Expiring Soon" value="5" trend="Next 30 days" icon="assignment_late" color="secondary" />
            <StatCard label="Compliance Risk" value="2" trend="Action required" icon="error" color="secondary" />
            <StatCard label="Idle Units" value="8" trend="Unassigned" icon="hourglass_empty" color="secondary" />
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 flex flex-col overflow-hidden">

            <div className="p-3 flex items-center gap-3 border-b border-slate-100/50 relative z-20">
              <div className="flex-1">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg z-20">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by Bus ID, Plate or Route..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-base pl-11 pr-4 w-full h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <MenuDropdown
                  value={statusFilter}
                  trigger={
                    <button className="btn-outline gap-3 h-10 px-4">
                      <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">filter_list</span>
                      {statusFilter === "All Status" ? "Status" : statusFilter}
                    </button>
                  }
                  items={[
                    { label: "All Vehicles", onClick: () => setStatusFilter("All Status") },
                    { label: "Active", onClick: () => setStatusFilter("Active") },
                    { label: "Idle", onClick: () => setStatusFilter("Idle") },
                    { label: "At Risk", onClick: () => setStatusFilter("At Risk") },
                  ]}
                  width="w-48"
                />

                <button
                  onClick={() => navigate("/transportation/add-vehicle")}
                  className="btn-primary gap-2 h-10 px-5 ml-1"
                >
                  <span className="material-symbols-outlined text-[18px] font-black">add</span>
                  Register Bus
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-slate-100 bg-[#F7F8F4]/30">
                  <tr>
                    {["Bus ID", "Registration", "Primary route", "Capacity", "Documentation", "Status", "Actions"].map((h, i) => (
                      <th key={h} className={cn(
                        "px-6 py-5 text-[10px] font-bold text-[#B0AFA8] tracking-widest uppercase",
                        i === 6 ? "text-right" : ""
                      )}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-brand-navy">
                  {paginatedVehicles.map((vehicle) => (
                    <VehicleRow
                      key={vehicle.id}
                      vehicle={vehicle}
                      onClick={() => { }}
                      onDelete={(v) => setVehicleToDelete(v)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              totalItems={filteredVehicles.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(count) => {
                setItemsPerPage(count);
                setCurrentPage(1);
              }}
              itemName="vehicles"
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {vehicleToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setVehicleToDelete(null)} />
            <div className="relative bg-white p-8 rounded-[32px] max-w-md w-full shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="size-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">bus_alert</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy tracking-tight">Decommission Bus {vehicleToDelete.id}?</h3>
                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">This will remove the vehicle from all active routes and tracking systems.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setVehicleToDelete(null)} className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-[#B0AFA8] hover:text-foreground transition-colors">Cancel</button>
                <button className="flex-1 h-12 bg-red-600 text-white text-[14px] font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/10">Decommission</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
