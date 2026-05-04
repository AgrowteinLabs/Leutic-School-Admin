import { type ChangeEvent } from "react";
import { cn } from "../lib/utils";

interface AppFormSelectProps {
  label?: string;
  options: string[];
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export const AppFormSelect = ({ label, options, value, onChange, className }: AppFormSelectProps) => (
  <div className={cn("space-y-1.5", className)}>
    {label && <label className="text-[11px] font-bold text-[#B0AFA8] ml-1">{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] px-4 h-10 text-[13px] font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

interface AppFormInputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  icon?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const AppFormInput = ({ label, placeholder, type = "text", icon, value, onChange, className }: AppFormInputProps) => (
  <div className={cn("space-y-1.5", className)}>
    {label && <label className="text-[11px] font-bold text-[#B0AFA8] ml-1">{label}</label>}
    <div className="relative">
      {icon && (
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] text-[18px]">
          {icon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] h-10 text-[13px] font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#B0AFA8]",
          icon ? "px-12" : "px-4"
        )}
      />
    </div>
  </div>
);
