import { cn } from "../../../lib/utils";

interface PostCardProps {
  type: string;
  title: string;
  content: string;
  category: string;
  time: string;
  isNew?: boolean;
  status?: string;
  icon: string;
  isModerator?: boolean;
  author: {
    name: string;
    img: string;
    role: string;
  };
}

export const PostCard = ({
  type,
  title,
  content,
  category,
  time,
  isNew,
  status,
  icon,
  isModerator,
  author,
}: PostCardProps) => {
  const isSpecial = type === "Interschool";

  return (
    <article
      className={cn(
        "rounded-3xl p-6 transition-all border",
        isSpecial
          ? "bg-[#EAF2D7]/30 border-[#D9EA85]/50 hover:shadow-md hover:border-[#D9EA85]"
          : "bg-white border-slate-100 shadow-sm shadow-slate-100/30 hover:shadow-md hover:border-slate-200",
      )}
    >
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4">
          <div
            className="size-12 rounded-full bg-cover bg-center border border-slate-100 shadow-sm"
            style={{ backgroundImage: `url("${author.img}")` }}
          />
          <div>
            <p className="text-[15px] font-bold text-foreground leading-tight">
              {author.name}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest leading-none">
                {author.role}
              </p>
              <span className="size-1 bg-slate-200 rounded-full" />
              <span className="text-[12px] font-medium text-[#B0AFA8]">
                {time}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isModerator && (
            <button className="size-9 flex items-center justify-center bg-red-50 text-[#B91C1C] rounded-full hover:bg-red-500  transition-all shadow-sm">
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 pl-16">
        <h2 className="text-[18px] font-bold text-foreground mb-2.5 leading-snug">
          {title}
        </h2>
        <p className="text-[15px] text-[#444441] leading-relaxed font-medium opacity-90">
          {content}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-5 pl-16 border-t border-slate-100/60 mt-2">
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border",
            isSpecial
              ? "bg-[#EAF2D7]0/10 text-[#2E7D32] border-[#D9EA85]"
              : "bg-[#F7F8F4] text-[#444441] border-slate-200",
          )}
        >
          {type}
        </span>
        {isNew && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF2D7]0/10 text-[#2E7D32] border border-[#D9EA85] capitalize">
            New
          </span>
        )}
        {status === "Alert" && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] capitalize">
            Alert
          </span>
        )}
        {status === "Ongoing" && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF2D7]0/10 text-[#2E7D32] border border-[#D9EA85] capitalize">
            Ongoing
          </span>
        )}

        <div className="ml-auto flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-[#B0AFA8] bg-[#F7F8F4] px-3 py-1.5 rounded-full border border-slate-100">
            <span className="material-symbols-outlined text-[16px]">
              {icon}
            </span>
            <span className="text-[12px] font-bold">
              {category}
            </span>
          </div>
          <button className="text-[13px] font-bold text-foreground bg-[#F7F8F4] hover:bg-primary  px-4 py-1.5 rounded-full border border-slate-100 hover:border-primary flex items-center gap-1 transition-all shadow-sm">
            Details
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
