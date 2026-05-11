import { cn } from "../../../lib/utils";

const AlertItem = ({
  type,
  title,
  message,
  time,
}: {
  type: "urgent" | "notice" | "info";
  title: string;
  message: string;
  time: string;
}) => {
  return (
    <div className="flex gap-3 py-3 border-b border-slate-50 last:border-0 group cursor-pointer hover:bg-[#F7F8F4] -mx-1 px-1 rounded-[10px] transition-colors">
      <div className={cn(
        "w-1.5 rounded-full shrink-0 mt-1 flex-shrink-0",
        type === "urgent" && "bg-[#E63535]",
        type === "notice" && "bg-[#EF9800]",
        type === "info" && "bg-[#2E77F4]"
      )} style={{ height: "32px" }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-medium text-foreground truncate">{title}</p>
          <span className="text-[10px] text-[#B0AFA8] font-medium shrink-0">{time}</span>
        </div>
        <p className="text-[12px] text-[#71716A] leading-relaxed line-clamp-2">
          {message}
        </p>
      </div>
    </div>
  );
};

export const AlertsSection = ({ className }: { className?: string }) => {
  return (
    <div className={cn("bg-white border border-slate-100 rounded-2xl flex flex-col h-full overflow-hidden", className)}>
      <div className="p-7 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-foreground text-[17px] font-semibold tracking-tight">Notifications</h3>
          <button className="text-[12px] text-[#3D6B2C] font-semibold hover:underline underline-offset-2 transition-colors">
            View All
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pb-3 border-b border-slate-50">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#B0AFA8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E63535] flex-shrink-0" />Urgent
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#B0AFA8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF9800] flex-shrink-0" />Notice
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#B0AFA8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E77F4] flex-shrink-0" />Info
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-7 pb-7 no-scrollbar space-y-2">
        <AlertItem
          type="urgent"
          title="Attendance Drop — Grade 10B"
          message="22% drop in morning attendance today. Requires immediate review."
          time="10m"
        />
        <AlertItem
          type="notice"
          title="Math Scores Declining"
          message="Grade 12 Math scores decreased by 4% this semester."
          time="2h"
        />
        <AlertItem
          type="info"
          title="PTA Meeting Reminder"
          message="Annual PTA meeting scheduled for next Monday at 10:00 AM."
          time="5h"
        />
        <AlertItem
          type="notice"
          title="3 Missing Substitute Teachers"
          message="Upcoming substitute classes lack registered supervisors."
          time="1d"
        />
        <AlertItem
          type="info"
          title="Campus Security Update"
          message="Enhanced monitoring protocols implemented in the north wing starting Monday."
          time="2d"
        />
      </div>
    </div>
  );
};
