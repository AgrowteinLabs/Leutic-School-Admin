import { useState, useEffect, useRef } from "react";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Ultra-Minimal Architectural Bus Pin
const createCustomIcon = (isActive: boolean) => L.divIcon({
    className: "custom-marker",
    html: `<div class="pin-container ${isActive ? 'active' : ''}">
             <div class="pin-shape">
               <span class="material-symbols-outlined bus-icon">directions_bus</span>
             </div>
             <div class="marker-pulse"></div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

// Panning Component - Preserves Zoom Freedom
const RecenterMap = ({ center, trigger }: { center: [number, number], trigger: number }) => {
    const map = useMap();
    const lat = center[0];
    const lng = center[1];

    useEffect(() => {
        if (trigger > 0) {
            map.panTo([lat, lng], { animate: true });
        }
    }, [lat, lng, map, trigger]);
    return null;
};

// Functional Custom Zoom & Focus Controls
const MapControls = ({ onRecenter }: { onRecenter: () => void }) => {
    const map = useMap();
    return (
        <div className="absolute bottom-6 right-6 flex flex-col gap-1.5 z-[400]">
            <button 
                onClick={(e) => { e.stopPropagation(); onRecenter(); }}
                className="size-9 rounded-xl bg-white/75 backdrop-blur-2xl border border-slate-100 flex items-center justify-center text-brand-navy hover:bg-white transition-all"
                title="Recenter on Bus"
            >
                <span className="material-symbols-outlined text-[16px]">my_location</span>
            </button>
            <div className="h-0.5" />
            <button 
                onClick={(e) => { e.stopPropagation(); map.zoomIn(); }}
                className="size-9 rounded-xl bg-white/75 backdrop-blur-2xl border border-slate-100 flex items-center justify-center text-brand-navy hover:bg-white transition-all"
            >
                <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); map.zoomOut(); }}
                className="size-9 rounded-xl bg-white/75 backdrop-blur-2xl border border-slate-100 flex items-center justify-center text-brand-navy hover:bg-white transition-all"
            >
                <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
        </div>
    );
};

export const TransportationPage = ({ isHubChild }: { isHubChild?: boolean }) => {
  const [activeRoute, setActiveRoute] = useState("1");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  // Buses starting from 1
  const buses = Array.from({ length: 32 }, (_, i) => ({
    id: (i + 1).toString(),
    route: (i + 1).toString(),
    driver: i % 2 === 0 ? "Madan Pal" : "Somesh Rao",
    status: i % 5 === 0 ? "Idle" : "Active",
    speed: i % 5 === 0 ? "0 km/h" : `${30 + (i % 20)} km/h`,
    location: i % 2 === 0 ? "Marine Drive, Kochi" : "Kakkanad, Kochi",
    eta: i % 5 === 0 ? "--" : `${2 + (i % 10)}m`,
    nextStop: i % 2 === 0 ? "High Court" : "Infopark",
    coords: i % 2 === 0 ? [9.9816, 76.2763] as [number, number] : [10.0159, 76.3419] as [number, number],
  }));

  const activeBus = buses.find(b => b.route === activeRoute) || buses[0];
  const filteredBuses = buses.filter(b => b.id.includes(searchQuery)).slice(0, 5);

  const handleNextBus = () => {
      const currentIndex = buses.findIndex(b => b.route === activeRoute);
      const nextIndex = (currentIndex + 1) % buses.length;
      setActiveRoute(buses[nextIndex].route);
      setRecenterTrigger(prev => prev + 1);
  };

  const handlePrevBus = () => {
      const currentIndex = buses.findIndex(b => b.route === activeRoute);
      const prevIndex = (currentIndex - 1 + buses.length) % buses.length;
      setActiveRoute(buses[prevIndex].route);
      setRecenterTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("w-full h-full flex flex-col bg-white relative overflow-hidden")}>
      {!isHubChild && (
        <TopBar
          title="Fleet Tracking"
          subtitle="Minimal surveillance engine"
        />
      )}

      <div className="flex-1 relative w-full h-full overflow-hidden bg-[#F0F2F5]">
        <MapContainer 
            center={activeBus.coords} 
            zoom={15} 
            maxZoom={19}
            minZoom={12}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OSM'
            maxZoom={19}
            maxNativeZoom={19}
          />
          <RecenterMap center={activeBus.coords} trigger={recenterTrigger} />
          
          {/* Architectural Neighborhood Labels */}
          {[
            { name: "Kakkanad", coords: [10.0159, 76.3419] as [number, number] },
            { name: "Vyttila", coords: [9.9707, 76.3220] as [number, number] },
            { name: "Edappally", coords: [10.0261, 76.3116] as [number, number] },
            { name: "Fort Kochi", coords: [9.9658, 76.2421] as [number, number] },
            { name: "Marine Drive", coords: [9.9816, 76.2763] as [number, number] }
          ].map(area => (
            <Marker 
              key={area.name} 
              position={area.coords}
              icon={L.divIcon({
                className: "area-label-marker",
                html: `<div class="area-label">${area.name}</div>`,
                iconSize: [0, 0],
                iconAnchor: [0, 0]
              })}
            />
          ))}

          {buses.slice(0, 5).map(bus => (
            <Marker 
                key={bus.id} 
                position={bus.coords} 
                icon={createCustomIcon(activeRoute === bus.route)}
                eventHandlers={{ click: () => {
                    setActiveRoute(bus.route);
                    setRecenterTrigger(prev => prev + 1);
                } }}
            />
          ))}
          <MapControls onRecenter={() => setRecenterTrigger(prev => prev + 1)} />
        </MapContainer>

        {/* Minimalist UI Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none p-8">
            
            {/* Expanding Search Bar */}
            <div className="absolute top-6 left-6 z-30 pointer-events-auto" ref={searchRef}>
                <motion.div 
                    initial={false}
                    animate={{ width: isSearchOpen ? 280 : 48 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white/75 backdrop-blur-2xl border border-slate-100 rounded-xl h-12 overflow-hidden relative"
                >
                    <div 
                        className="absolute left-0 top-0 h-12 w-12 flex items-center justify-center cursor-pointer text-brand-navy hover:text-primary transition-colors"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <span className="material-symbols-outlined text-[18px] font-bold">search</span>
                    </div>

                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "absolute left-12 top-0 h-12 bg-transparent outline-none text-[13px] font-bold text-brand-navy placeholder:text-muted-gray/40 transition-opacity duration-300",
                            isSearchOpen ? "opacity-100 w-[220px]" : "opacity-0 w-0"
                        )}
                    />
                </motion.div>

                {/* Suggestions Dropdown - Letuic Signature Style */}
                <AnimatePresence>
                    {isSearchOpen && searchQuery && (
                        <motion.div 
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 6, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            className="absolute left-0 top-12 w-[280px] bg-white/75 backdrop-blur-3xl border border-slate-100 rounded-xl p-2 overflow-hidden"
                        >
                            {filteredBuses.length > 0 ? (
                                <div className="space-y-0.5">
                                    {filteredBuses.map(bus => (
                                        <button
                                            key={bus.id}
                                            onClick={() => {
                                                setActiveRoute(bus.route);
                                                setRecenterTrigger(prev => prev + 1);
                                                setIsSearchOpen(false);
                                                setSearchQuery("");
                                            }}
                                            className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/40 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "size-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                                                    bus.status === "Active" ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    {bus.id}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-[12px] font-black text-brand-navy leading-none">Bus {bus.id}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={cn("size-1 rounded-full", bus.status === "Active" ? "bg-emerald-500" : "bg-slate-300")} />
                                                        <span className={cn("text-[9px] font-bold tracking-tight", bus.status === "Active" ? "text-emerald-600" : "text-muted-gray/50")}>
                                                            {bus.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="material-symbols-outlined text-[14px] text-slate-300 group-hover:text-brand-navy transition-colors">chevron_right</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-[11px] font-bold text-muted-gray/40">
                                    No units found
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Info Strip - Top Center */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto">
                 <div className="bg-white/75 backdrop-blur-2xl border border-slate-100 rounded-xl px-3 py-1.5 flex items-center gap-6 whitespace-nowrap">
                     <div className="flex items-center gap-1">
                         <button onClick={handlePrevBus} className="size-8 rounded-lg hover:bg-white/40 flex items-center justify-center text-muted-gray hover:text-brand-navy transition-all">
                             <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                         </button>
                         <div className="flex items-center gap-2.5 px-1">
                            <div className={cn("size-1.5 rounded-full", activeBus.status === "Active" ? "bg-emerald-500" : "bg-slate-300")} />
                            <span className="text-[13px] font-black text-brand-navy tracking-tight">Bus {activeBus.id}</span>
                         </div>
                         <button onClick={handleNextBus} className="size-8 rounded-lg hover:bg-white/40 flex items-center justify-center text-muted-gray hover:text-brand-navy transition-all">
                             <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                         </button>
                     </div>
                     <div className="h-3 w-px bg-slate-200" />
                     <div className="flex items-center gap-2">
                         <span className="text-[9px] font-bold text-muted-gray/60 tracking-tight">Speed</span>
                         <span className="text-[13px] font-black text-brand-navy">{activeBus.speed}</span>
                     </div>
                     <div className="h-3 w-px bg-slate-200" />
                     <div className="flex items-center gap-2">
                         <span className="text-[9px] font-bold text-muted-gray/60 tracking-tight">ETA</span>
                         <span className="text-[13px] font-black text-brand-navy">{activeBus.eta}</span>
                     </div>
                 </div>
            </div>

            {/* Refined Telemetry Card - Bottom Left */}
            <div className="absolute bottom-6 left-6 w-[220px] pointer-events-auto z-20">
                <div className="bg-white/75 backdrop-blur-2xl border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px] text-brand-navy">person</span>
                            </div>
                            <h4 className="text-[13px] font-black text-brand-navy tracking-tight">{activeBus.driver}</h4>
                        </div>
                        <button className="size-7 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all">
                            <span className="material-symbols-outlined text-[13px]">call</span>
                        </button>
                    </div>

                    <div className="space-y-3.5">
                        <div className="px-0.5">
                            <p className="text-[8px] font-bold text-muted-gray/60 mb-0.5 tracking-tight">Current location</p>
                            <p className="text-[13px] font-black text-brand-navy tracking-tight leading-tight">{activeBus.location}</p>
                        </div>

                        <div className="flex items-center justify-between px-0.5 border-t border-slate-50 pt-3">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[7px] font-bold text-muted-gray/40 leading-none tracking-tighter">Coordinates</p>
                                <p className="text-[10px] font-black text-brand-navy tracking-tighter">
                                    {activeBus.coords[0].toFixed(3)}, {activeBus.coords[1].toFixed(3)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                                <div className="flex items-center gap-1">
                                    <div className="size-1 bg-emerald-500 rounded-full" />
                                    <span className="text-[9px] font-black text-emerald-600 tracking-tight">Live</span>
                                </div>
                                <span className="text-[8px] font-bold text-muted-gray/30 tracking-tighter">14:15:10</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .custom-marker { position: relative; }
        .pin-container {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pin-shape {
          position: relative;
          width: 24px;
          height: 24px;
          background: #64748b;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid white;
          z-index: 2;
          transition: all 0.3s ease;
        }
        .bus-icon {
          transform: rotate(45deg);
          color: white;
          font-size: 14px !important;
          font-weight: bold;
        }
        .active .pin-shape {
          background: #0F2328;
          width: 28px;
          height: 28px;
          border-color: #FFD700;
        }
        .active .bus-icon {
          color: #FFD700;
          font-size: 16px !important;
        }
        .marker-pulse {
          position: absolute;
          width: 32px;
          height: 32px;
          background: rgba(15, 35, 40, 0.2);
          border-radius: 50%;
          animation: pulse 2s infinite;
          opacity: 0;
          z-index: 1;
        }
        .active .marker-pulse {
          background: rgba(255, 215, 0, 0.3);
          opacity: 1;
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        .area-label-marker { pointer-events: none; }
        .area-label {
          position: absolute;
          left: 50%;
          transform: translate(-50%, 8px);
          font-family: inherit;
          font-size: 10px;
          font-weight: 800;
          color: rgba(15, 35, 40, 0.4);
          white-space: nowrap;
          background: rgba(255, 255, 255, 0.6);
          padding: 2px 8px;
          border-radius: 10px;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};
