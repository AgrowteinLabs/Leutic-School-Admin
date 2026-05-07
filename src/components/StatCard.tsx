import { cn } from "../lib/utils";
import { Info } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: string;
    trendType?: "up" | "down" | "stable";
    trendUp?: boolean;
    icon: string;
    iconBg?: string;
    color?: string;
    tooltip?: string;
}

export const StatCard = ({
    label,
    value,
    trend,
    trendType,
    trendUp,
    icon,
    iconBg = "bg-[#EAF2D7]",
    color,
    tooltip,
}: StatCardProps) => {
    const finalTrendType = trendType || (trendUp ? "up" : "stable");
    
    return (
        <div className="flex items-center gap-4 rounded-2xl px-5 py-4 bg-white border border-slate-100 hover:shadow-sm transition-shadow group relative">
            <div className={cn(
                "size-11 rounded-2xl flex items-center justify-center shrink-0", 
                color === "primary" ? "bg-[#D9EA85]" : color === "secondary" ? "bg-[#E0F2FE]" : iconBg
            )}>
                <span className="material-symbols-outlined text-[22px] text-[#152328]">
                    {icon}
                </span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1">
                    <p className="text-[#B0AFA8] text-[12px] font-medium truncate">
                        {label}
                    </p>
                    {tooltip && (
                        <div className="relative group/tooltip">
                            <Info size={12} className="text-[#B0AFA8] cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#152328] text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                {tooltip}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#152328]"></div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                    <p className="text-foreground text-[22px] font-semibold leading-none tracking-tight">
                        {value}
                    </p>
                    {trend && (
                        <span
                            className={cn(
                                "text-[11px] font-medium",
                                finalTrendType === "up" && "text-[#2E7D32]",
                                finalTrendType === "down" && "text-[#B91C1C]",
                                finalTrendType === "stable" && "text-[#B0AFA8]"
                            )}
                        >
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
