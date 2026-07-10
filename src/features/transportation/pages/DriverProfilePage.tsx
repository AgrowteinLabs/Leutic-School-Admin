import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { graphqlRequest } from "../../../lib/graphqlClient";

const GET_DRIVER = `
  query GetDriver($id: ID!) {
    user(id: $id) {
      id
      name
      role
      email
      mobileNo
      admissionNumber
      driverLicenseNo
      address
    }
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

export const DriverProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [driver, setDriver] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDriver = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await graphqlRequest<any>(GET_DRIVER, { id });
        const u = res.user;
        if (u) {
          const meta = parseDriverAddress(u.address);
          setDriver({
            uid: u.id,
            id: u.admissionNumber || `DRV-${u.id.slice(0, 4).toUpperCase()}`,
            name: u.name,
            phone: u.mobileNo || "N/A",
            license: u.driverLicenseNo || "N/A",
            licenseExpiry: meta.licExp,
            experience: meta.experience,
            bus: meta.bus,
            route: meta.route,
            shift: meta.shift,
            status: "Active",
            img: "/Avatar/Male Avatar Age45.png",
          });
        }
      } catch (err) {
        console.error("Failed to load driver details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDriver();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-white">
        <TopBar title="Driver Profile" onBack={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center text-slate-400 font-bold">
          Driver not found
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <TopBar
        title={driver.name}
        subtitle={`Fleet Driver | ID: ${driver.id}`}
        onBack={() => navigate(-1)}
        actions={
          <div className="flex items-center gap-3">
            <a
              href={`tel:${driver.phone}`}
              className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm shadow-slate-100/30"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              Call Driver
            </a>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto mx-auto px-6 lg:px-10 py-6 max-w-[1400px] w-full space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-center border-b border-slate-100 pb-8">
          <div
            className="size-24 rounded-2xl bg-cover bg-center border border-slate-100 shrink-0 shadow-sm shadow-slate-100/30"
            style={{ backgroundImage: `url("${driver.img}")` }}
          ></div>
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[#EAF2D7] text-[#2E7D32] text-xs font-medium rounded-full border border-[#D9EA85] capitalize">
                {driver.status}
              </span>
              <p className="text-[#444441] text-[13px] font-medium">
                Assigned to: {driver.bus}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
            Current Route: {driver.route}
          </h3>
          <div className="space-y-4">
            {[
              "07:30 AM - Depot / Base Start",
              "08:00 AM - Primary Route Pickup Slots",
              "08:45 AM - School Campus Drop-off / Arrival",
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
