import { cn } from "../../../lib/utils";

interface ProgramCardProps {
  name: string;
  category: string;
  participants: number;
  status: "Active" | "Warning" | "Planning" | "Completed";
  progress: number;
  leadTeacher: string;
  startDate: string;
  endDate: string;
  onClick?: () => void;
}

export const ProgramCard = ({
  name,
  category,
  participants,
  status,
  progress,
  leadTeacher,
  startDate,
  endDate,
  onClick,
}: ProgramCardProps) => {
  const statusStyles = {
    Active: "bg-[#EAF2D7]0/10 text-[#2E7D32] border border-[#D9EA85]",
    Warning: "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]",
    Planning: "bg-[#FEF3C7]0/10 text-[#B45309] border border-[#FDE68A]",
    Completed: "bg-[#EAF2D7]0/10 text-[#2E7D32] border border-[#D9EA85]",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-100/30 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] capitalize font-bold text-[#B0AFA8]">
            {category}
          </span>
          <h3 className="text-[16px] font-semibold text-foreground group-hover:text-black transition-colors">
            {name}
          </h3>
        </div>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium capitalize",
            statusStyles[status],
          )}
        >
          {status}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="size-7 rounded-full border-2 border-white bg-[#F7F8F4] flex items-center justify-center overflow-hidden"
            >
              <img
                src={`https://i.pravatar.cc/150?u=${name}${i}`}
                alt="avatar"
                className="size-full object-cover"
              />
            </div>
          ))}
          <div className="size-7 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-bold text-foreground">
            +{participants - 3}
          </div>
        </div>
        <span className="text-xs font-medium text-[#B0AFA8]">
          Enrolled
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-[#B0AFA8]">
            person
          </span>
          <p className="text-[11px] font-medium text-[#444441]">
            Lead:{" "}
            <span className="text-foreground font-bold">{leadTeacher}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-[#B0AFA8]">
            calendar_today
          </span>
          <p className="text-[11px] font-medium text-[#444441]">
            {startDate} - {endDate}
          </p>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-xs font-medium capitalize text-[#B0AFA8]">
              Program Progress
            </span>
            <span className="text-xs font-bold text-foreground">
              {progress}%
            </span>
          </div>
          <div className="h-2 w-full bg-[#F7F8F4] rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
