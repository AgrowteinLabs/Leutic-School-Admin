import { cn } from "../../../lib/utils";
import { motion } from "framer-motion";

const FilterGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h3 className="text-[11px] font-bold text-[#B0AFA8] mb-5 tracking-tight">
      {title}
    </h3>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

const Checkbox = ({ label, checked }: { label: string; checked?: boolean }) => (
  <label className="flex items-center gap-3.5 cursor-pointer group">
    <div
      className={cn(
        "size-5 rounded-[7px] border transition-all flex items-center justify-center",
        checked
          ? "bg-primary border-primary"
          : "border-slate-200 bg-white group-hover:border-slate-300",
      )}
    >
      {checked && (
        <span className="material-symbols-outlined text-secondary text-[16px] font-black">
          check
        </span>
      )}
    </div>
    <span className="text-[14px] font-bold text-[#444441] group-hover:text-foreground transition-colors tracking-tight">
      {label}
    </span>
  </label>
);

const Toggle = ({ label, enabled }: { label: string; enabled?: boolean }) => (
  <label className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 cursor-pointer group hover:border-slate-200 transition-all">
    <span className="text-[14px] font-bold text-[#444441] group-hover:text-foreground transition-colors tracking-tight">{label}</span>
    <div
      className={cn(
        "w-10 h-6 rounded-full relative transition-colors",
        enabled ? "bg-primary" : "bg-slate-100",
      )}
    >
      <motion.div
        animate={{ x: enabled ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-[2px] size-[20px] bg-white rounded-full border border-slate-200/20"
      ></motion.div>
    </div>
  </label>
);

export const CommunityFilters = () => {
  return (
    <aside className="w-80 border-l border-slate-100 bg-white p-6 lg:p-8 overflow-y-auto hidden xl:block">
      <div className="space-y-10">
        <FilterGroup title="Program category">
          <Checkbox label="Academic programs" checked />
          <Checkbox label="Athletics & sports" checked />
          <Checkbox label="Arts & culture" />
          <Checkbox label="Social impact" />
        </FilterGroup>

        <div>
          <h3 className="text-[11px] font-bold text-[#B0AFA8] mb-5 tracking-tight">
            Academic level
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Junior high", "Senior high", "Faculty only"].map((level, i) => (
                <button 
                    key={level}
                    className={cn(
                        "px-4 py-2 rounded-xl text-[12px] font-bold transition-all border",
                        i === 1 
                            ? "bg-primary text-secondary border-primary" 
                            : "bg-[#F7F8F4] text-[#444441] border-transparent hover:border-slate-200"
                    )}
                >
                    {level}
                </button>
            ))}
          </div>
        </div>

        <FilterGroup title="Post visibility">
          <Toggle label="Urgent updates only" />
          <Toggle label="Verified sources" enabled />
        </FilterGroup>

        <div className="pt-6 border-t border-slate-100">
          <button className="w-full py-3 rounded-xl bg-[#F7F8F4] text-[13px] font-bold text-[#444441] hover:bg-secondary hover:text-white transition-all">
            Reset all filters
          </button>
        </div>
      </div>
    </aside>
  );
};
