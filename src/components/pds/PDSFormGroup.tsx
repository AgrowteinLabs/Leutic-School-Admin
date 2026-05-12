import { cn } from "../../lib/utils";
import { AppDatePicker } from "../AppDatePicker";
import { AppDropdown } from "../AppDropdown";
import { AppTimePicker } from "../AppTimePicker";
import { AppDateTimePicker } from "../AppDateTimePicker";

interface PDSFormGroupProps {
  label: string;
  placeholder?: string;
  icon?: string;
  type?: "input" | "date" | "select" | "textarea" | "chips" | "datetime";
  options?: string[];
  searchable?: boolean;
  disabled?: boolean;
  optional?: boolean;
  value: any;
  onChange: (val: any) => void;
  className?: string;
  error?: string;
  rows?: number;
  maxDate?: Date;
}

export const PDSFormGroup = ({
  label,
  placeholder,
  icon,
  type = "input",
  options = [],
  searchable = false,
  disabled = false,
  optional = false,
  value,
  onChange,
  className,
  error,
  rows = 4,
  maxDate
}: PDSFormGroupProps) => {
  return (
    <div className={cn("space-y-2 group", className)}>
      <label className={cn(
        "text-[length:var(--font-size-label)] font-[var(--font-weight-label)] transition-colors px-1 flex items-center justify-between tracking-tight",
        error ? "text-rose-500" : "text-[var(--text-color-label)] group-focus-within:text-foreground"
      )}>
        <span className="flex items-center gap-2">
          {label}
          {optional && <span className="text-[length:var(--font-size-small)] text-[var(--text-color-label)] font-medium normal-case tracking-normal opacity-60">Optional</span>}
        </span>
      </label>
      <div className="relative">
        {icon && type === "input" && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-color-label)] text-[18px] group-focus-within:text-primary transition-colors z-10">
            {icon}
          </span>
        )}

        {type === "input" && (
          <div className="relative h-10">
            <div className={cn(
              "absolute inset-0 bg-[#F7F8F4] border border-slate-100 rounded-[10px] transition-all group-focus-within:border-primary/50 group-focus-within:ring-4 group-focus-within:ring-primary/5 group-focus-within:bg-white overflow-hidden pointer-events-none",
              error ? "border-rose-200 bg-rose-50/30" : "",
            )} />
            <input
              disabled={disabled}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "relative w-full h-full bg-transparent border-none outline-none text-[length:var(--font-size-input)] font-[var(--font-weight-input)] text-foreground placeholder-[#B0AFA8] placeholder:font-medium z-10",
                icon ? "pl-11 pr-4" : "px-4",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              placeholder={placeholder}
            />
          </div>
        )}

        {type === "textarea" && (
          <textarea
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className={cn(
              "w-full py-4 bg-[#F7F8F4] border border-slate-100 rounded-[12px] outline-none text-[length:var(--font-size-body)] font-[var(--font-weight-input)] text-foreground placeholder-[var(--text-color-label)] placeholder:font-medium transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-white px-6 resize-none",
              error ? "border-rose-200 bg-rose-50/30" : "",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            placeholder={placeholder}
          />
        )}

        {type === "date" && (
          <AppDatePicker
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            icon={icon}
            maxDate={maxDate}
            className={cn(error && "border-rose-200 bg-rose-50/30")}
          />
        )}

        {type === "select" && (
          <AppDropdown
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            searchable={searchable}
            icon={icon}
            className={cn(error && "border-rose-200 bg-rose-50/30")}
          />
        )}

        {type === "datetime" && (
          <AppDateTimePicker
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            icon={icon}
            className={cn(error && "border-rose-200 bg-rose-50/30")}
          />
        )}

        {type === "chips" && (
          <div className="flex flex-wrap gap-2 pt-1">
            {options.map((opt: string) => {
              const isActive = Array.isArray(value) ? value.includes(opt) : value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    if (Array.isArray(value)) {
                      if (value.includes(opt)) onChange(value.filter(v => v !== opt));
                      else onChange([...value, opt]);
                    } else {
                      onChange(opt);
                    }
                  }}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-[length:var(--font-size-small)] font-bold transition-all border",
                    isActive
                      ? "bg-secondary text-white border-secondary shadow-md shadow-secondary/10"
                      : "bg-[#F7F8F4] text-[var(--text-color-label)] border-transparent hover:border-slate-200"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="text-[10px] font-bold text-rose-500 px-1">{error}</p>}
    </div>
  );
};
