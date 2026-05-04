import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";

const DriverRow = ({
  driver,
  onClick,
}: {
  driver: any;
  onClick: (d: any) => void;
}) => {
  return (
    <tr
      onClick={() => onClick(driver)}
      className="hover:bg-[#F7F8F4] transition-colors group cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="size-8 rounded-full bg-cover bg-center border border-slate-100"
            style={{ backgroundImage: `url("${driver.img}")` }}
          ></div>
          <span className="text-[13px] font-semibold text-foreground group-hover:underline decoration-primary underline-offset-4">
            {driver.name}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-[#444441] font-mono">
        {driver.id}
      </td>
      <td className="px-6 py-4 text-sm text-foreground">{driver.bus}</td>
      <td className="px-6 py-4 text-sm text-[#444441]">
        {driver.license}
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize border",
            driver.status === "Active"
              ? "bg-[#EAF2D7]0/10 text-[#2E7D32] border border-[#D9EA85]"
              : "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]",
          )}
        >
          {driver.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-[#B0AFA8] hover:text-foreground transition-colors">
          <span className="material-symbols-outlined text-xl">more_vert</span>
        </button>
      </td>
    </tr>
  );
};

export const DriversPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const navigate = useNavigate();
  const drivers = [
    {
      name: "Rajesh G.",
      id: "DRV-102",
      bus: "BUS-001",
      license: "LIC-882190",
      status: "Active",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
    {
      name: "Sajeev K.",
      id: "DRV-105",
      bus: "BUS-002",
      license: "LIC-443211",
      status: "Active",
      img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop",
    },
    {
      name: "Vikram C.",
      id: "DRV-110",
      bus: "BUS-003",
      license: "LIC-110944",
      status: "On Leave",
      img: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop",
    },
    {
      name: "Dileep K.",
      id: "DRV-115",
      bus: "BUS-004",
      license: "LIC-994022",
      status: "Active",
      img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop",
    },
  ];

  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden bg-white",
        !isHubChild && "h-screen",
      )}
    >
      {!isHubChild && (
        <TopBar
          title="Fleet Drivers Management"
          subtitle="Manage driver profiles, licenses, and bus assignments."
          actions={
            <div className="flex items-center gap-3">
              <button className="bg-white border border-slate-100 text-foreground px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-[#F7F8F4] transition-all shadow-sm shadow-slate-100/30">
                <span className="material-symbols-outlined text-lg">
                  upload_file
                </span>
                Bulk CSV Import
              </button>
              <button className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2  transition-all shadow-sm shadow-slate-100/30 ">
                <span className="material-symbols-outlined text-sm">
                  person_add
                </span>
                Add New Driver
              </button>
            </div>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto mx-auto px-6 lg:px-10 py-6 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F7F8F4] border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441] uppercase tracking-wider">
                    Driver Name
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441] uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441] uppercase tracking-wider">
                    Bus Assignment
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441] uppercase tracking-wider">
                    License No
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#444441] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {drivers.map((driver, i) => (
                  <DriverRow
                    key={i}
                    driver={driver}
                    onClick={(d) => navigate(`/drivers/${d.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
