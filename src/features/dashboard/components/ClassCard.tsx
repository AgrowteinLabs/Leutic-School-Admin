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
          "flex items-center gap-4 bg-white border border-slate-100 rounded-[18px] p-4 transition-all cursor-pointer hover:bg-[#F7F8F4]/50 group",
          !onClick && "cursor-default"
        )}
      >
        <div className={cn(
          "size-10 rounded-[10px] flex items-center justify-center text-sm font-black shrink-0 border",
          statusType === "risk" ? "bg-red-50 text-red-700 border-red-100" :
            statusType === "attention" ? "bg-amber-50 text-amber-700 border-amber-100" :
              "bg-emerald-50 text-emerald-700 border-emerald-100",
        )}>
          {section}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-bold text-foreground truncate">{grade} – {section}</h4>
          <p className="text-[11px] text-[#B0AFA8] font-medium">{teacher}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border border-slate-100 rounded-[22px] p-6 transition-all cursor-pointer hover:border-primary/40 hover:shadow-xl hover:shadow-slate-100/50 group relative flex flex-col h-full",
        !onClick && "cursor-default"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1.5">
          <div className="mb-2">
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black  border",
              statusType === "risk" ? "bg-red-50 text-red-700 border-red-100" :
                statusType === "attention" ? "bg-amber-50 text-amber-700 border-amber-100" :
                  "bg-emerald-50 text-emerald-700 border-emerald-100"
            )}>
              {status}
            </span>
          </div>
          <h3 className="text-[19px] font-black text-foreground tracking-tight group-hover:text-primary transition-colors leading-none">
            {grade} <span className="text-slate-300 font-light">·</span> {section}
          </h3>
          <p className="text-[12px] font-bold text-[#B0AFA8]">{teacher}</p>
        </div>

        {/* Circular Performance Gauge replaces the letter box avatar */}
        <div className="relative size-14 shrink-0">
          <svg className="size-full -rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" strokeWidth="3.5" stroke="#F7F8F4" />
            <circle cx="28" cy="28" r="24" fill="none" strokeWidth="3.5"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={2 * Math.PI * 24 * (1 - participation / 100)}
              stroke={participation > 80 ? "#2E7D32" : participation > 60 ? "#EF9800" : "#E63535"}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-foreground">{participation}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-auto">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-widest leading-none mb-1">Facility</span>
            <span className="text-[11px] font-black text-foreground leading-none">{room.split('|')[0]}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-widest leading-none mb-1">Enrolled</span>
            <span className="text-[11px] font-black text-foreground leading-none">{students} Students</span>
          </div>
        </div>
        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">arrow_forward</span>
      </div>
    </div>
  );
};
