import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";

interface AppDropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  label?: string;
  width?: string;
  placeholder?: string;
  searchable?: boolean;
  icon?: string;
}

export const AppDropdown = ({
  options,
  value,
  onChange,
  width = "w-full",
  placeholder = "Select option",
  searchable = false,
  icon,
}: AppDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) setSearchQuery(value || "");
  }, [isOpen, value]);

  const displayValue = (searchable && isOpen) ? searchQuery : (value || placeholder);

  const filteredOptions = searchable
    ? options.filter((opt: string) => opt.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <div className={cn("relative", width)} ref={containerRef}>
      <div className={cn(
        "w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] flex items-center justify-between cursor-pointer hover:border-slate-200 transition-all relative overflow-hidden h-12",
        isOpen && "border-primary/50 bg-white"
      )}>
        {icon && (
          <span className={cn(
            "material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] transition-colors z-20 pointer-events-none",
            isOpen ? "text-primary" : "text-[#B0AFA8]"
          )}>
            {icon}
          </span>
        )}
        {searchable ? (
          <input
            type="text"
            value={displayValue}
            onChange={(e) => { setSearchQuery(e.target.value); if (!isOpen) setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={cn(
              "w-full h-full bg-transparent outline-none text-[14px] font-semibold text-foreground placeholder-[#B0AFA8] z-10 transition-all",
              icon ? "pl-12 pr-6" : "px-6"
            )}
          />
        ) : (
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full text-[14px] font-semibold transition-colors flex items-center h-full", 
              value && value !== placeholder ? "text-foreground" : "text-[#B0AFA8]",
              icon ? "pl-12 pr-6" : "px-6"
            )}
          >
            {displayValue}
          </div>
        )}
        <span
          onClick={() => setIsOpen(!isOpen)}
          className={cn("material-symbols-outlined text-[#B0AFA8] absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-500 z-0", isOpen && "rotate-180 text-primary")}
        >
          expand_more
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-[20px] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
          <div className="max-h-64 overflow-y-auto no-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt: string) => {
                const isSelected = value === opt;
                return (
                  <div
                    key={opt}
                    onClick={() => { onChange?.(opt); setIsOpen(false); }}
                    className={cn(
                      "px-4 py-3 mx-2 my-1 rounded-[10px] text-[14px] font-semibold cursor-pointer transition-all flex items-center justify-between group",
                      isSelected
                        ? "bg-[#EAF2D7] text-foreground border border-[#D9EA85]"
                        : "text-[#444441] hover:bg-[#F7F8F4] hover:text-foreground"
                    )}
                  >
                    <span className="flex-1">{opt}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[20px] text-foreground animate-in zoom-in duration-300">check_circle</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-8 text-center space-y-2">
                <span className="material-symbols-outlined text-[#B0AFA8] text-[40px]">person_search</span>
                <p className="text-[12px] font-bold text-[#B0AFA8]">No results found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
