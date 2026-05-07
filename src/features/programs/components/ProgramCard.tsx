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
  const getStatusStyles = (s: string) => {
    switch (s) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Warning":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Planning":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Completed":
        return "bg-slate-50 text-slate-700 border-slate-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[32px] border border-slate-100 p-7 shadow-sm shadow-slate-100/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#B0AFA8]">
            {category}
          </span>
          <h3 className="text-[18px] font-black text-foreground group-hover:text-primary transition-colors tracking-tight leading-tight">
            {name}
          </h3>
        </div>
        <span
          className={cn(
            "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border whitespace-nowrap ml-2",
            getStatusStyles(status)
          )}
        >
          {status}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex -space-x-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="size-8 rounded-full border-2 border-white bg-[#F7F8F4] flex items-center justify-center overflow-hidden ring-1 ring-slate-100"
            >
              <img
                src={`https://i.pravatar.cc/150?u=${name}${i}`}
                alt="avatar"
                className="size-full object-cover"
              />
            </div>
          ))}
          <div className="size-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-black text-foreground ring-1 ring-slate-100">
            +{participants - 3}
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#B0AFA8] tracking-tight">
          Enrolled Participants
        </span>
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-[#B0AFA8]">
             <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-[#B0AFA8] uppercase mb-0.5">Lead Faculty</span>
            <p className="text-[13px] font-black text-secondary">{leadTeacher}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-[#B0AFA8]">
             <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-[#B0AFA8] uppercase mb-0.5">Timeline</span>
            <p className="text-[12px] font-bold text-secondary">{startDate} — {endDate}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[11px] font-black uppercase tracking-tight text-[#B0AFA8]">
            Progress
          </span>
          <span className="text-[13px] font-black text-secondary">
            {progress}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#F7F8F4] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
