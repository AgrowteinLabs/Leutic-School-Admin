import { cn } from "../../../lib/utils";

const FilterGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h3 className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-4">
      {title}
    </h3>
    <div className="flex flex-col gap-3.5">{children}</div>
  </div>
);

const Checkbox = ({ label, checked }: { label: string; checked?: boolean }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div
      className={cn(
        "size-[18px] rounded-[6px] border transition-all flex items-center justify-center shadow-sm",
        checked
          ? "bg-primary border-primary"
          : "border-slate-200 bg-white group-hover:border-slate-300",
      )}
    >
      {checked && (
        <span className="material-symbols-outlined text-foreground text-[14px] font-black">
          check
        </span>
      )}
    </div>
    <span className="text-[13px] font-medium text-[#444441] group-hover:text-foreground transition-colors">
      {label}
    </span>
  </label>
);

const Toggle = ({ label, enabled }: { label: string; enabled?: boolean }) => (
  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100/30 cursor-pointer group hover:border-slate-200 transition-all">
    <span className="text-[13px] font-medium text-[#444441] group-hover:text-foreground transition-colors">{label}</span>
    <div
      className={cn(
        "w-9 h-5 rounded-full relative transition-colors shadow-inner",
        enabled ? "bg-[#EAF2D7]0" : "bg-slate-200",
      )}
    >
      <div
        className={cn(
          "absolute top-[2px] size-4 bg-white rounded-full transition-all shadow-sm",
          enabled ? "right-[2px]" : "left-[2px]",
        )}
      ></div>
    </div>
  </label>
);

export const CommunityFilters = () => {
  return (
    <aside className="w-80 border-l border-slate-100 bg-white p-6 overflow-y-auto hidden xl:block">
      <div className="space-y-8">
        <FilterGroup title="Program Type">
          <Checkbox label="Academic" checked />
          <Checkbox label="Athletics" checked />
          <Checkbox label="Arts & Culture" />
          <Checkbox label="Social Impact" />
        </FilterGroup>

        <div>
          <h3 className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-4">
            Academic Level
          </h3>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 rounded-full bg-[#F7F8F4] text-[12px] font-semibold text-[#444441] hover:bg-[#F7F8F4] transition-all border border-transparent">
              Junior High
            </button>
            <button className="px-4 py-2 rounded-full btn-primary text-[12px] font-semibold shadow-sm transition-all border border-slate-100/50">
              Senior High
            </button>
            <button className="px-4 py-2 rounded-full bg-[#F7F8F4] text-[12px] font-semibold text-[#444441] hover:bg-[#F7F8F4] transition-all border border-transparent">
              Faculty Only
            </button>
          </div>
        </div>

        <FilterGroup title="Post Status">
          <Toggle label="Urgent Only" />
          <Toggle label="Verified Sources" enabled />
        </FilterGroup>

        <div className="pt-6 border-t border-slate-100">
          <button className="w-full py-2.5 rounded-xl bg-[#F7F8F4] text-[13px] font-semibold text-[#444441] hover:bg-[#F7F8F4] hover:text-foreground transition-all">
            Reset Filters
          </button>
        </div>
      </div>
    </aside>
  );
};
