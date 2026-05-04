import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../../../components/Header";

export const DriverProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const drivers = [
    {
      name: "Rajesh G.",
      id: "DRV-102",
      bus: "BUS-001",
      license: "LIC-882190",
      status: "Active",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      phone: "+91 91234 56780",
      experience: "8 Years",
    },
    {
      name: "Sajeev K.",
      id: "DRV-105",
      bus: "BUS-002",
      license: "LIC-443211",
      status: "Active",
      img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop",
      phone: "+91 91234 56781",
      experience: "5 Years",
    },
    {
      name: "Vikram C.",
      id: "DRV-110",
      bus: "BUS-003",
      license: "LIC-110944",
      status: "On Leave",
      img: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop",
      phone: "+91 91234 56782",
      experience: "12 Years",
    },
    {
      name: "Dileep K.",
      id: "DRV-115",
      bus: "BUS-004",
      license: "LIC-994022",
      status: "Active",
      img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop",
      phone: "+91 91234 56783",
      experience: "6 Years",
    },
  ];

  const driver =
    drivers.find((d) => d.id === id) ||
    drivers.find((d) => d.id === "DRV-102")!;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title={driver.name}
        subtitle={`Fleet Driver | ID: ${driver.id}`}
        onBack={() => navigate(-1)}
        actions={
          <div className="flex items-center gap-3">
            <button className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2  transition-all shadow-sm shadow-slate-100/30">
              <span className="material-symbols-outlined text-sm">call</span>
              Call Driver
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto mx-auto px-6 lg:px-10 py-6 max-w-[1400px] space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-center border-b border-slate-100 pb-8">
          <div
            className="size-24 rounded-2xl bg-cover bg-center border border-slate-100 shrink-0 shadow-sm shadow-slate-100/30"
            style={{ backgroundImage: `url("${driver.img}")` }}
          ></div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[#EAF2D7]0/10 text-[#2E7D32] text-xs font-medium rounded-full border border-[#D9EA85] capitalize">
                {driver.status}
              </span>
              <p className="text-[#444441] text-[13px] font-medium">
                Assigned to: {driver.bus}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[11px] font-bold text-[#444441] uppercase tracking-wider mb-1">
                  License Number
                </p>
                <p className="text-[13px] font-semibold text-foreground">
                  {driver.license}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#444441] uppercase tracking-wider mb-1">
                  Experience
                </p>
                <p className="text-[13px] font-semibold text-foreground">
                  {driver.experience}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#444441] uppercase tracking-wider mb-1">
                  Phone
                </p>
                <p className="text-[13px] font-semibold text-foreground">
                  {driver.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F8F4] border border-slate-100 rounded-2xl p-6">
          <h3 className="text-foreground text-base font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">route</span>
            Current Route: North Corridor Area A
          </h3>
          <div className="space-y-4">
            {[
              "07:30 AM - Sector 4 Pickup",
              "07:45 AM - Oak Street Junction",
              "08:15 AM - School Arrival",
            ].map((stop, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-primary"></div>
                <p className="text-sm text-[#444441] font-medium">
                  {stop}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
