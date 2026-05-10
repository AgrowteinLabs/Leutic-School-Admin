import { cn } from "../../../lib/utils";
import { motion } from "framer-motion";

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
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-3xl p-6 lg:p-8 transition-all border",
        isSpecial
          ? "bg-[#F7F8F4]/50 border-primary/20"
          : "bg-white border-slate-100",
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div
            className="size-12 rounded-[18px] bg-cover bg-center border border-slate-100"
            style={{ backgroundImage: `url("${author.img}")` }}
          />
          <div>
            <p className="text-[15px] font-bold text-foreground leading-tight tracking-tight">
              {author.name}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider leading-none">
                {author.role}
              </p>
              <span className="size-1 bg-slate-200 rounded-full" />
              <span className="text-[11px] font-medium text-[#B0AFA8]">
                {time}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isModerator && (
            <button className="size-10 flex items-center justify-center bg-red-50 text-[#B91C1C] rounded-xl hover:bg-red-500 hover:text-white transition-all">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 lg:pl-16">
        <h2 className="text-[17px] font-bold text-foreground mb-2 leading-snug tracking-tight">
          {title}
        </h2>
        <p className="text-[15px] text-[#444441] leading-relaxed font-medium opacity-90">
          {content}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 lg:pl-16 border-t border-slate-100/60">
        <div className="flex flex-wrap items-center gap-2">
            <span
            className={cn(
                "inline-flex items-center px-4 py-1.5 rounded-xl text-[11px] font-bold tracking-tight border transition-all",
                isSpecial
                ? "bg-primary/10 text-secondary border-primary/20"
                : "bg-[#F7F8F4] text-[#444441] border-slate-200/50",
            )}
            >
            {type}
            </span>
            {isNew && (
            <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[11px] font-bold bg-primary text-secondary border border-primary tracking-tight">
                New
            </span>
            )}
            {status === "Alert" && (
            <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[11px] font-bold bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] tracking-tight">
                Alert
            </span>
            )}
            {status === "Ongoing" && (
            <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[11px] font-bold bg-primary/10 text-secondary border border-primary/20 tracking-tight">
                Ongoing
            </span>
            )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#B0AFA8] bg-[#F7F8F4]/80 px-4 py-2 rounded-xl border border-slate-100/60">
            <span className="material-symbols-outlined text-[18px]">
              {icon}
            </span>
            <span className="text-[12px] font-bold">
              {category}
            </span>
          </div>
          <button className="text-[13px] font-bold text-foreground bg-[#F7F8F4] hover:bg-primary px-5 py-2 rounded-xl border border-slate-100 hover:border-primary flex items-center gap-2 transition-all">
            Details
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  );
};
