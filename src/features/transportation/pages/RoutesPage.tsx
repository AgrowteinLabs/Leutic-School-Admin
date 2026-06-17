import { useState, useMemo, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { TopBar } from "../../../components/Header";
import { StatCard } from "../../../components/StatCard";
import { MenuDropdown } from "../../../components/MenuDropdown";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import { PDSSuccessModal } from "../../../components/pds/PDSSuccessModal";
import { motion, AnimatePresence } from "framer-motion";

interface RouteItem {
    id: string;
    name: string;
    driver: string;
    vehicle: string;
    startTime: string;
    endTime: string;
    status: string;
    stops: string[];
}

const DEFAULT_ROUTES: RouteItem[] = [
    {
        id: "route-1",
        name: "Route A - North Coast",
        driver: "Madan Pal",
        vehicle: "KL01PC4456 (Bus 01)",
        startTime: "07:30 AM",
        endTime: "09:00 AM",
        status: "Active",
        stops: ["Marine Drive", "High Court", "Mulavukad", "Cheranallur", "Koonamavu"]
    },
    {
        id: "route-2",
        name: "Route B - Central Kochi",
        driver: "Somesh Rao",
        vehicle: "KL01TR0112 (Bus 05)",
        startTime: "08:00 AM",
        endTime: "09:15 AM",
        status: "Active",
        stops: ["Vyttila Hub", "Kadavanthra", "Kaloor", "Palarivattom", "Kakkanad"]
    },
    {
        id: "route-3",
        name: "Route C - Suburban South",
        driver: "Unassigned",
        vehicle: "Unassigned",
        startTime: "07:15 AM",
        endTime: "08:45 AM",
        status: "Inactive",
        stops: ["Tripunithura", "Maradu", "Kundannoor", "Nettoor", "Aroor"]
    },
    {
        id: "route-4",
        name: "Route D - Infopark Express",
        driver: "Rajesh Nair",
        vehicle: "KA01ME3342 (Bus 12)",
        startTime: "07:45 AM",
        endTime: "09:10 AM",
        status: "Active",
        stops: ["Aluva", "Kalamassery", "Edappally", "Vazhakkala", "Infopark"]
    }
];

const DRIVERS_LIST = ["Madan Pal", "Somesh Rao", "Rajesh Nair", "Kishore Kumar", "Unassigned"];
const VEHICLES_LIST = [
    "KL01PC4456 (Bus 01)",
    "KL01TR0112 (Bus 05)",
    "KA01ME3342 (Bus 12)",
    "KL07BB9982 (Bus 08)",
    "TN01ES2210 (Bus 02)",
    "Unassigned"
];

const RouteCard = ({
    route,
    onEdit,
    onDelete
}: {
    route: RouteItem;
    onEdit: (route: RouteItem) => void;
    onDelete: (id: string, name: string) => void;
}) => {
    const [tripMode, setTripMode] = useState<"morning" | "evening">("morning");

    const displayStops = useMemo(() => {
        if (tripMode === "morning") {
            return [...route.stops, "School Campus"];
        } else {
            return ["School Campus", ...[...route.stops].reverse()];
        }
    }, [route.stops, tripMode]);

    return (
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 hover:shadow-lg hover:shadow-slate-100/50 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-4">
                {/* Top Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-[14px] bg-slate-50 flex items-center justify-center text-brand-navy border border-slate-100">
                            <span className="material-symbols-outlined text-[20px]">route</span>
                        </div>
                        <h4 className="text-[15px] font-bold text-brand-navy tracking-tight">{route.name}</h4>
                    </div>
                    <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap",
                        route.status === "Active"
                            ? "bg-[#EAF2D7] text-[#2E7D32] border border-[#D9EA85]"
                            : "bg-[#F0F0EC] text-[#444441] border border-slate-200"
                    )}>
                        {route.status}
                    </span>
                </div>

                {/* Assignment details */}
                <div className="grid grid-cols-3 gap-2 bg-[#F7F8F4]/30 rounded-2xl p-4 border border-slate-100/50">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Driver</span>
                        <span className="text-[12px] font-bold text-brand-navy mt-0.5 truncate">{route.driver}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vehicle</span>
                        <span className="text-[12px] font-bold text-brand-navy mt-0.5 truncate">{route.vehicle.split(" ")[0]}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Timings</span>
                        <span className="text-[12px] font-bold text-brand-navy mt-0.5 truncate">
                            {tripMode === "morning" ? `${route.startTime} - ${route.endTime}` : "03:30 PM - 05:00 PM"}
                        </span>
                    </div>
                </div>

                {/* Trip Mode Switcher & Timeline Header */}
                <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Timeline ({displayStops.length} stops)</span>
                    <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50 shrink-0">
                        <button
                            onClick={() => setTripMode("morning")}
                            className={cn(
                                "text-[10px] font-bold px-2.5 py-1 rounded-md transition-all",
                                tripMode === "morning"
                                    ? "bg-[#152328] text-[#D9EA85] shadow-sm"
                                    : "text-slate-500 hover:text-brand-navy"
                            )}
                        >
                            Morning (Pickup)
                        </button>
                        <button
                            onClick={() => setTripMode("evening")}
                            className={cn(
                                "text-[10px] font-bold px-2.5 py-1 rounded-md transition-all",
                                tripMode === "evening"
                                    ? "bg-[#152328] text-[#D9EA85] shadow-sm"
                                    : "text-slate-500 hover:text-brand-navy"
                            )}
                        >
                            Evening (Drop)
                        </button>
                    </div>
                </div>

                {/* Stop timeline (Zig-zag Horizontal Infographic) */}
                <div className="relative mt-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                    <div className="relative flex items-center overflow-x-auto no-scrollbar py-2">
                        {/* Horizontal Timeline Connector Line */}
                        <div className="absolute left-[40px] right-[40px] h-[2px] bg-slate-200/60 top-1/2 -translate-y-1/2 z-0" />

                        {displayStops.map((stop, sIdx) => {
                            const isSchool = stop === "School Campus";
                            const isFirst = sIdx === 0;
                            const isLast = sIdx === displayStops.length - 1;

                            return (
                                <div key={`${stop}-${sIdx}`} className="flex-1 min-w-[80px] flex flex-col items-center text-center relative z-10">
                                    {/* Upper Label (Even index stops) */}
                                    <div className="h-9 flex items-end justify-center pb-1">
                                        {sIdx % 2 === 0 && (
                                            <span className={cn(
                                                "text-[10px] leading-tight font-bold tracking-tight px-1 max-w-[75px] line-clamp-2",
                                                isSchool 
                                                    ? "text-primary font-black" 
                                                    : isFirst || isLast 
                                                        ? "text-brand-navy font-bold" 
                                                        : "text-slate-500"
                                            )}>
                                                {stop}
                                            </span>
                                        )}
                                    </div>

                                    {/* Middle Dot */}
                                    <div className="relative flex items-center justify-center w-full my-0.5">
                                        <div className={cn(
                                            "size-[10px] rounded-full border-2 bg-white z-10 transition-all shadow-sm",
                                            isSchool 
                                                ? "border-[#152328] bg-[#D9EA85] scale-110" 
                                                : isFirst 
                                                    ? "border-primary bg-primary" 
                                                    : isLast 
                                                        ? "border-[#FFD700] bg-[#FFD700]" 
                                                        : "border-slate-300"
                                        )} />
                                    </div>

                                    {/* Lower Label (Odd index stops) */}
                                    <div className="h-9 flex items-start justify-center pt-1">
                                        {sIdx % 2 !== 0 && (
                                            <span className={cn(
                                                "text-[10px] leading-tight font-bold tracking-tight px-1 max-w-[75px] line-clamp-2",
                                                isSchool 
                                                    ? "text-primary font-black" 
                                                    : isFirst || isLast 
                                                        ? "text-brand-navy font-bold" 
                                                        : "text-slate-500"
                                            )}>
                                                {stop}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-4 mt-6">
                <button
                    onClick={() => onEdit(route)}
                    className="btn-outline h-9 px-4 gap-2 text-[12px]"
                >
                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                    Configure
                </button>
                <button
                    onClick={() => onDelete(route.id, route.name)}
                    className="size-9 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                    title="Delete Route"
                >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
            </div>
        </div>
    );
};

export const RoutesPage = ({ isHubChild }: { isHubChild?: boolean }) => {
    const [routes, setRoutes] = useState<RouteItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [successModal, setSuccessModal] = useState({ show: false, title: "", message: "" });

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<RouteItem | null>(null);

    // Form fields state
    const [formName, setFormName] = useState("");
    const [formDriver, setFormDriver] = useState("Unassigned");
    const [formVehicle, setFormVehicle] = useState("Unassigned");
    const [formStartTime, setFormStartTime] = useState("07:30 AM");
    const [formEndTime, setFormEndTime] = useState("09:00 AM");
    const [formStatus, setFormStatus] = useState("Active");
    const [formStops, setFormStops] = useState<{ id: string; name: string }[]>([]);
    const [newStopText, setNewStopText] = useState("");

    // Drag & Drop reordering state for stops (highly optimized native HTML5 live-sorting)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        // Perform the swap in state instantly for a premium, live-feedback experience
        const updated = [...formStops];
        const [draggedItem] = updated.splice(draggedIndex, 1);
        updated.splice(index, 0, draggedItem);

        setFormStops(updated);
        setDraggedIndex(index); // Update source index to new position
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDraggedIndex(null);
    };

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem("leutic-routes");
        if (saved) {
            setRoutes(JSON.parse(saved));
        } else {
            setRoutes(DEFAULT_ROUTES);
            localStorage.setItem("leutic-routes", JSON.stringify(DEFAULT_ROUTES));
        }
    }, []);

    // Save to local storage helper
    const saveRoutes = (updatedRoutes: RouteItem[]) => {
        setRoutes(updatedRoutes);
        localStorage.setItem("leutic-routes", JSON.stringify(updatedRoutes));
    };

    // Filtered routes
    const filteredRoutes = useMemo(() => {
        return routes.filter((r) => {
            const matchesSearch =
                r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.stops.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus =
                statusFilter === "All Status" || r.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, routes]);

    // Stat derivations
    const totalStopsCount = useMemo(() => {
        return routes.reduce((acc, r) => acc + r.stops.length, 0);
    }, [routes]);

    const activeRoutesCount = useMemo(() => {
        return routes.filter((r) => r.status === "Active").length;
    }, [routes]);

    const fleetAssignedPercent = useMemo(() => {
        if (routes.length === 0) return 0;
        const assigned = routes.filter((r) => r.vehicle !== "Unassigned").length;
        return Math.round((assigned / routes.length) * 100);
    }, [routes]);

    // Open Drawer for Add
    const handleAddClick = () => {
        setEditingRoute(null);
        setFormName("");
        setFormDriver("Unassigned");
        setFormVehicle("Unassigned");
        setFormStartTime("07:30 AM");
        setFormEndTime("09:00 AM");
        setFormStatus("Active");
        setFormStops([{ id: "default-stop", name: "School Main Gate" }]);
        setNewStopText("");
        setIsDrawerOpen(true);
    };

    // Open Drawer for Edit
    const handleEditClick = (route: RouteItem) => {
        setEditingRoute(route);
        setFormName(route.name);
        setFormDriver(route.driver);
        setFormVehicle(route.vehicle);
        setFormStartTime(route.startTime);
        setFormEndTime(route.endTime);
        setFormStatus(route.status);
        setFormStops(route.stops.map((s, idx) => ({ id: `stop-${idx}-${Date.now()}`, name: s })));
        setNewStopText("");
        setIsDrawerOpen(true);
    };

    // Delete Route
    const handleDeleteClick = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            const updated = routes.filter((r) => r.id !== id);
            saveRoutes(updated);
            setSuccessModal({
                show: true,
                title: "Route Deleted",
                message: `Route "${name}" has been permanently removed.`
            });
        }
    };

    // Save Drawer Changes
    const handleSaveRoute = () => {
        if (!formName.trim()) {
            alert("Please enter a route name.");
            return;
        }
        if (formStops.length === 0) {
            alert("Please add at least one stop to the route.");
            return;
        }

        if (editingRoute) {
            // Edit mode
            const updated = routes.map((r) => {
                if (r.id === editingRoute.id) {
                    return {
                        ...r,
                        name: formName,
                        driver: formDriver,
                        vehicle: formVehicle,
                        startTime: formStartTime,
                        endTime: formEndTime,
                        status: formStatus,
                        stops: formStops.map((s) => s.name)
                    };
                }
                return r;
            });
            saveRoutes(updated);
            setSuccessModal({
                show: true,
                title: "Route Updated",
                message: `Route details for "${formName}" saved successfully.`
            });
        } else {
            // Add mode
            const newRoute: RouteItem = {
                id: `route-${Date.now()}`,
                name: formName,
                driver: formDriver,
                vehicle: formVehicle,
                startTime: formStartTime,
                endTime: formEndTime,
                status: formStatus,
                stops: formStops.map((s) => s.name)
            };
            saveRoutes([...routes, newRoute]);
            setSuccessModal({
                show: true,
                title: "Route Created",
                message: `New route "${formName}" configured successfully.`
            });
        }
        setIsDrawerOpen(false);
    };

    // Stops handlers
    const addStop = () => {
        if (newStopText.trim()) {
            setFormStops([...formStops, { id: `stop-${Date.now()}-${Math.random()}`, name: newStopText.trim() }]);
            setNewStopText("");
        }
    };

    const removeStop = (index: number) => {
        setFormStops(formStops.filter((_, i) => i !== index));
    };

    const moveStopUp = (index: number) => {
        if (index === 0) return;
        const updated = [...formStops];
        const temp = updated[index];
        updated[index] = updated[index - 1];
        updated[index - 1] = temp;
        setFormStops(updated);
    };

    const moveStopDown = (index: number) => {
        if (index === formStops.length - 1) return;
        const updated = [...formStops];
        const temp = updated[index];
        updated[index] = updated[index + 1];
        updated[index + 1] = temp;
        setFormStops(updated);
    };

    return (
        <div className={cn("flex-1 flex flex-col overflow-hidden bg-white", !isHubChild && "h-screen")}>
            {!isHubChild && (
                <TopBar
                    title="Route Setup"
                    subtitle="Configure transport lines, stops timelines, and assignments"
                />
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 space-y-8">
                    
                    {/* Performance metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Total Routes" value={routes.length.toString()} trend="Configured lines" icon="route" color="primary" />
                        <StatCard label="Active Routes" value={activeRoutesCount.toString()} trend="Currently running" icon="check_circle" color="secondary" />
                        <StatCard label="Total Stops" value={totalStopsCount.toString()} trend="Stop checkpoints" icon="location_on" color="secondary" />
                        <StatCard label="Fleet Coverage" value={`${fleetAssignedPercent}%`} trend="Vehicles assigned" icon="directions_bus" color="secondary" />
                    </div>

                    {/* Filter and Action Header */}
                    <div className="bg-white rounded-[24px] border border-slate-100 p-3 flex flex-col md:flex-row items-center gap-3 relative z-20 shadow-sm shadow-slate-100/50">
                        <div className="flex-1 w-full">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg z-20">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by route name, driver, or stop..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-base pl-11 pr-4 w-full h-10"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                            <MenuDropdown
                                value={statusFilter}
                                trigger={
                                    <button className="btn-outline gap-3 h-10 px-4">
                                        <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">filter_list</span>
                                        {statusFilter === "All Status" ? "Status" : statusFilter}
                                    </button>
                                }
                                items={[
                                    { label: "All Statuses", onClick: () => setStatusFilter("All Status") },
                                    { label: "Active Only", onClick: () => setStatusFilter("Active") },
                                    { label: "Inactive Only", onClick: () => setStatusFilter("Inactive") },
                                ]}
                                width="w-48"
                            />

                            <button
                                onClick={handleAddClick}
                                className="btn-primary gap-2 h-10 px-5 ml-1"
                            >
                                <span className="material-symbols-outlined text-[18px] font-black">add</span>
                                Add Route
                            </button>
                        </div>
                    </div>

                    {/* Route Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredRoutes.map((route) => (
                            <RouteCard
                                key={route.id}
                                route={route}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                            />
                        ))}

                        {filteredRoutes.length === 0 && (
                            <div className="col-span-2 text-center py-16 bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200">
                                <span className="material-symbols-outlined text-[40px] text-slate-300 mb-2">route</span>
                                <p className="text-slate-400 font-bold text-[14px]">No routes match your search</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Slide-over Drawer component */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm cursor-pointer"
                        />

                        {/* Drawer body */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 350, damping: 35 }}
                            className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-100"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-[18px] font-bold text-brand-navy tracking-tight">
                                        {editingRoute ? "Configure Route" : "Create New Route"}
                                    </h3>
                                    <p className="text-[12px] text-[#B0AFA8] font-medium mt-0.5">Define name, assignments, and stops sequence</p>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="size-8 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-navy transition-all"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            {/* Content Body */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                                <PDSFormGroup
                                    label="Route Name"
                                    placeholder="e.g. Route E - Coastal Road"
                                    value={formName}
                                    onChange={setFormName}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <PDSFormGroup
                                        label="Driver"
                                        type="select"
                                        options={DRIVERS_LIST}
                                        value={formDriver}
                                        onChange={setFormDriver}
                                    />
                                    <PDSFormGroup
                                        label="Vehicle"
                                        type="select"
                                        options={VEHICLES_LIST}
                                        value={formVehicle}
                                        onChange={setFormVehicle}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <PDSFormGroup
                                        label="Start Time"
                                        placeholder="e.g. 07:30 AM"
                                        value={formStartTime}
                                        onChange={setFormStartTime}
                                    />
                                    <PDSFormGroup
                                        label="End Time"
                                        placeholder="e.g. 09:00 AM"
                                        value={formEndTime}
                                        onChange={setFormEndTime}
                                    />
                                </div>

                                <PDSFormGroup
                                    label="Status"
                                    type="select"
                                    options={["Active", "Inactive"]}
                                    value={formStatus}
                                    onChange={setFormStatus}
                                />

                                {/* Interactive Stops section */}
                                <div className="space-y-4">
                                    <label className="text-[13px] font-bold text-brand-navy">Stops Timeline Sequence</label>
                                    
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                                        {formStops.map((stop, idx) => {
                                            const isDragged = draggedIndex === idx;
                                            return (
                                                <div 
                                                    key={stop.id} 
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, idx)}
                                                    onDragOver={(e) => handleDragOver(e, idx)}
                                                    onDragEnd={handleDragEnd}
                                                    onDrop={handleDrop}
                                                    className={cn(
                                                        "flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-150 select-none",
                                                        isDragged 
                                                            ? "opacity-30 border-dashed border-primary bg-slate-50 scale-[0.98]" 
                                                            : "bg-[#F7F8F4] border-slate-100"
                                                    )}
                                                >
                                                    {/* Drag Handle */}
                                                    <div 
                                                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-brand-navy flex items-center justify-center shrink-0 p-0.5"
                                                        title="Drag to reorder"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                                                    </div>

                                                    <span className="text-[11px] font-black text-[#B0AFA8] size-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-[13px] font-semibold text-brand-navy flex-1 truncate">
                                                        {stop.name}
                                                    </span>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => moveStopUp(idx)}
                                                            disabled={idx === 0}
                                                            className="size-7 rounded-lg hover:bg-white text-slate-400 hover:text-brand-navy flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                                            type="button"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                                        </button>
                                                        <button
                                                            onClick={() => moveStopDown(idx)}
                                                            disabled={idx === formStops.length - 1}
                                                            className="size-7 rounded-lg hover:bg-white text-slate-400 hover:text-brand-navy flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                                            type="button"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                                                        </button>
                                                        <button
                                                            onClick={() => removeStop(idx)}
                                                            className="size-7 rounded-lg hover:bg-rose-50 text-[#B0AFA8] hover:text-rose-600 flex items-center justify-center transition-all"
                                                            type="button"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {formStops.length === 0 && (
                                            <p className="text-[11px] font-bold text-slate-400 text-center py-4">No stops added yet.</p>
                                        )}
                                    </div>

                                    {/* Add stop control */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <input
                                            type="text"
                                            placeholder="Enter stop name..."
                                            value={newStopText}
                                            onChange={(e) => setNewStopText(e.target.value)}
                                            className="input-base flex-1 h-10 px-4"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addStop();
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={addStop}
                                            type="button"
                                            className="btn-primary h-10 px-4 gap-1.5"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">add</span>
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                                <PDSButton variant="text" onClick={() => setIsDrawerOpen(false)}>Cancel</PDSButton>
                                <PDSButton variant="primary" onClick={handleSaveRoute}>
                                    {editingRoute ? "Save Configurations" : "Create Route"}
                                </PDSButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <PDSSuccessModal
                show={successModal.show}
                title={successModal.title}
                description={successModal.message}
                buttonText="Return to Setup"
                onClose={() => setSuccessModal({ ...successModal, show: false })}
            />
        </div>
    );
};
