import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

interface PDSPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}

export const PDSPageHeader = ({
  title,
  subtitle,
  actions,
  showBack = true,
  onBack,
  className
}: PDSPageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("bg-white border-b border-slate-100 py-6 px-6 lg:px-10 shrink-0", className)}>
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button 
              onClick={onBack || (() => navigate(-1))}
              className="size-10 rounded-xl bg-[#F7F8F4] border border-slate-100 flex items-center justify-center text-secondary hover:bg-slate-100 transition-all active:scale-95 group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-[20px] font-bold text-foreground tracking-tight leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-[12px] font-medium text-[#B0AFA8] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
