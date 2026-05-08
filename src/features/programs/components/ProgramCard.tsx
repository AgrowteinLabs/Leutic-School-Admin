import { cn } from "../../../lib/utils";

interface ProgramCardProps {
  name: string;
  category: string;
  participants: number;
  status: "Active" | "Warning" | "Planning" | "Completed";
  leadTeacher: string;
  startDate: string;
  endDate: string;
  location: string;
  targetGrades: string;
  onClick?: () => void;
  index?: number;
}

const AVATAR_POOL = [
  "/Avatar/Female Avatar Age15.png",
  "/Avatar/Male Avatar Age16.png",
  "/Avatar/Female Avatar Age14.png",
  "/Avatar/Male Avatar Age30.png",
  "/Avatar/Female Avatar Age20.png",
  "/Avatar/Male Avatar Age42.png",
  "/Avatar/Female Avatar Age35.png",
  "/Avatar/Male Avatar Age1.png",
  "/Avatar/Female Avatar Age7.png",
  "/Avatar/Male Avatar Age25.png",
  "/Avatar/Female Avatar Age11.png",
  "/Avatar/Male Avatar Age44.png",
];

export const ProgramCard = ({
  name,
  category,
  participants,
  status,
  leadTeacher,
  startDate,
  endDate,
  location,
  targetGrades,
  onClick,
  index = 0,
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

  const getAvatars = () => {
    const start = (index * 4) % (AVATAR_POOL.length - 3);
    return AVATAR_POOL.slice(start, start + 4);
  };

  const avatars = getAvatars();

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[32px] border border-slate-100 p-7 shadow-sm shadow-slate-100/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[length:var(--font-size-small)] font-bold text-[#B0AFA8]">
            {category}
          </span>
          <h3 className="text-[17px] font-bold text-foreground group-hover:text-primary transition-colors tracking-tight leading-tight">
            {name}
          </h3>
        </div>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold tracking-tight border whitespace-nowrap ml-2",
            getStatusStyles(status)
          )}
        >
          {status}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex -space-x-2.5">
          {avatars.slice(0, 3).map((src, i) => (
            <div
              key={i}
              className="size-8 rounded-full border-2 border-white bg-[#F7F8F4] flex items-center justify-center overflow-hidden ring-1 ring-slate-100"
            >
              <img
                src={src}
                alt="avatar"
                className="size-full object-cover"
              />
            </div>
          ))}
          {/* Shaded overflow avatar */}
          <div className="size-8 rounded-full border-2 border-white bg-[#F7F8F4] flex items-center justify-center overflow-hidden ring-1 ring-slate-100 relative">
             <img
                src={avatars[3]}
                alt="avatar"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-[#152328]/50 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">+{participants - 3}</span>
              </div>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-[#B0AFA8] tracking-tight">
          Enrolled Participants
        </span>
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8]">
             <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-[#B0AFA8] mb-0.5">Lead Faculty</span>
            <p className="text-[length:var(--font-size-input)] font-bold text-secondary">{leadTeacher}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8]">
             <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-[#B0AFA8] mb-0.5">Timeline</span>
            <p className="text-[12px] font-semibold text-secondary">{startDate} — {endDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8]">
             <span className="material-symbols-outlined text-[18px]">location_on</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-[#B0AFA8] mb-0.5">Location</span>
            <p className="text-[12px] font-semibold text-secondary">{location}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] font-bold text-[#B0AFA8] mb-0.5">Target</span>
          <p className="text-[length:var(--font-size-input)] font-bold text-secondary">{targetGrades}</p>
        </div>
        <div className="flex items-center gap-1.5 text-primary group-hover:gap-2.5 transition-all">
          <span className="text-[12px] font-bold tracking-tight">View Details</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </div>
      </div>
    </div>
  );
};
