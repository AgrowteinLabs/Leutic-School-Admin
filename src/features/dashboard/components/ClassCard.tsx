import { cn } from "../../../lib/utils";

interface ClassCardProps {
  grade: string;
  section: string;
  room: string;
  status: string;
  statusType: "normal" | "attention" | "risk";
  teacher: string;
  students: number;
  participation: number;
  variant?: "default" | "compact";
  onClick?: () => void;
}

export const ClassCard = ({
  grade,
  section,
  room,
  status,
  statusType,
  teacher,
  students,
  participation,
  variant = "default",
  onClick,
}: ClassCardProps) => {
  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 transition-all cursor-pointer hover:border-primary/30 hover:shadow-sm group",
          !onClick && "cursor-default"
        )}
      >
        <div className={cn(
          "size-10 rounded-[10px] flex items-center justify-center text-sm font-bold shrink-0",
          statusType === "risk"      ? "bg-[#FEE2E2] text-[#B91C1C]" :
          statusType === "attention" ? "bg-[#FEF3C7] text-[#B45309]" :
          "bg-[#EAF2D7] text-[#2E7D32]",
        )}>
          {section}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-[13px] font-bold text-foreground truncate">{grade} – {section}</h4>
            <span className={cn(
              "text-[9px] font-bold px-2 py-0.5 rounded-full border",
              statusType === "risk"      && "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]",
              statusType === "attention" && "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
              statusType === "normal"    && "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]",
            )}>{status}</span>
          </div>
          <p className="text-[11px] text-[#B0AFA8] mt-0.5 truncate">{teacher} · {students} Students</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={cn("text-[11px] font-bold", participation < 70 ? "text-[#B91C1C]" : "text-[#2E7D32]")}>{participation}%</span>
          <div className="w-12 h-1 bg-[#F0F0EC] rounded-full overflow-hidden border border-slate-100">
            <div className={cn("h-full", participation < 70 ? "bg-[#B91C1C]" : "bg-[#3D6B2C]")} style={{ width: `${participation}%` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border border-slate-100 rounded-2xl p-6 transition-all cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/20 hover:-translate-y-1 group relative overflow-hidden",
        !onClick && "cursor-default"
      )}
    >
      {/* Decorative accent */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.04] transition-transform duration-700 group-hover:scale-150",
        statusType === "risk"      && "bg-[#B91C1C]",
        statusType === "attention" && "bg-[#B45309]",
        statusType === "normal"    && "bg-[#2E7D32]",
      )}></div>

      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "size-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm border",
          statusType === "risk"      ? "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]" :
          statusType === "attention" ? "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]" :
          "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]",
        )}>
          {section}
        </div>
        <span className={cn(
          "text-[10px] font-bold px-3 py-1.5 rounded-full border shadow-sm",
          statusType === "risk"      && "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]",
          statusType === "attention" && "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
          statusType === "normal"    && "bg-[#EAF2D7] text-[#2E7D32] border-[#D9EA85]",
        )}>
          {status}
        </span>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-black transition-colors">{grade}</h3>
          <div className="flex items-center gap-2 mt-1.5 text-[#B0AFA8]">
            <span className="material-symbols-outlined text-[16px] font-light">person</span>
            <span className="text-[13px] font-medium">{teacher}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#B0AFA8]">
              <span className="material-symbols-outlined text-[14px]">meeting_room</span>
              <span className="text-[10px] font-bold text-[#B0AFA8]">Room</span>
            </div>
            <p className="text-[12px] font-bold text-foreground truncate">{room.split('|')[0]}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#B0AFA8]">
              <span className="material-symbols-outlined text-[14px]">groups</span>
              <span className="text-[10px] font-bold text-[#B0AFA8]">Students</span>
            </div>
            <p className="text-[12px] font-bold text-foreground">{students} Enrolled</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-end">
          <span className="text-[11px] font-bold text-[#B0AFA8]">Participation</span>
          <span className={cn(
            "text-[13px] font-bold",
            participation < 70 ? "text-[#B91C1C]" : "text-[#2E7D32]"
          )}>
            {participation}%
          </span>
        </div>
        <div className="h-2 w-full bg-[#F0F0EC] rounded-full overflow-hidden border border-slate-100">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 group-hover:duration-500",
              participation < 70 ? "bg-[#B91C1C]" : "bg-[#3D6B2C]"
            )}
            style={{ width: `${participation}%` }}
          />
        </div>
      </div>
    </div>
  );
};
