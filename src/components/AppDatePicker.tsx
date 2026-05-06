import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AppDatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  width?: string;
  icon?: string;
  maxDate?: Date;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const AppDatePicker = ({
  value,
  onChange,
  width = "w-full",
  placeholder = "DD / MM / YYYY",
  icon = "calendar_today",
  maxDate
}: AppDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [yearInput, setYearInput] = useState("");

  // View state (which month/year is currently being viewed)
  const [viewDate, setViewDate] = useState(value || new Date());

  useEffect(() => {
    if (value) {
      setViewDate(value);
      setInputValue(`${value.getDate().toString().padStart(2, '0')} / ${(value.getMonth() + 1).toString().padStart(2, '0')} / ${value.getFullYear()}`);
    } else {
      setInputValue("");
    }
  }, [value]);

  useEffect(() => {
    setYearInput(viewDate.getFullYear().toString());
  }, [viewDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(newDate);
    setIsOpen(false);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Basic parsing for DD / MM / YYYY or DD/MM/YYYY
    const parts = val.replace(/\s/g, '').split(/[/-]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      if (year > 1900 && month >= 0 && month < 12 && day > 0 && day <= 31) {
         const newDate = new Date(year, month, day);
         if (maxDate && newDate > maxDate) return; 
         setViewDate(newDate);
         onChange(newDate);
      }
    }
  };

  return (
    <div className={cn("relative", width)} ref={containerRef}>
      <div
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] flex items-center cursor-pointer hover:border-slate-200 transition-all relative overflow-hidden h-12 outline-none group",
          isOpen && "border-primary/50 ring-4 ring-primary/5 bg-white"
        )}
      >
        {icon && (
          <span className={cn(
            "material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] transition-colors z-20 pointer-events-none text-[#B0AFA8] group-focus-within:text-primary",
            isOpen && "text-primary"
          )}>
            {icon}
          </span>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            "w-full h-full bg-transparent outline-none text-[14px] font-semibold transition-colors placeholder-[#B0AFA8] z-10",
            inputValue || value ? "text-foreground" : "text-foreground",
            icon ? "pl-12 pr-6" : "px-6"
          )}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[calc(100%+8px)] left-0 bg-white border border-slate-100 rounded-[24px] shadow-2xl p-5 z-50 w-72 origin-top"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={handlePrevMonth} className="size-8 flex items-center justify-center rounded-full border border-slate-100 hover:bg-[#F7F8F4] transition-colors text-foreground">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <div className="flex items-center gap-1">
                <select 
                  value={viewDate.getMonth()} 
                  onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))}
                  className="font-bold text-[14px] text-foreground tracking-tight bg-transparent outline-none cursor-pointer hover:bg-slate-100 px-1 py-1 rounded transition-colors appearance-none text-center"
                >
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <input 
                  type="number"
                  value={yearInput} 
                  onChange={(e) => {
                    setYearInput(e.target.value);
                    const y = parseInt(e.target.value);
                    if (!isNaN(y) && y > 1900 && y < 2100) {
                      setViewDate(new Date(y, viewDate.getMonth(), 1));
                    }
                  }}
                  className="w-16 font-bold text-[14px] text-foreground tracking-tight bg-transparent outline-none cursor-text hover:bg-slate-100 px-1 py-1 rounded transition-colors text-center"
                />
              </div>
              <button onClick={handleNextMonth} className="size-8 flex items-center justify-center rounded-full border border-slate-100 hover:bg-[#F7F8F4] transition-colors text-foreground">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-[#B0AFA8] uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateAtDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                const isSelected = value?.getDate() === day && value?.getMonth() === viewDate.getMonth() && value?.getFullYear() === viewDate.getFullYear();
                const isToday = new Date().getDate() === day && new Date().getMonth() === viewDate.getMonth() && new Date().getFullYear() === viewDate.getFullYear();
                const isDisabled = maxDate && dateAtDay > maxDate;

                return (
                  <button
                    key={day}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleDateClick(day)}
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all outline-none mx-auto",
                      isSelected 
                        ? "bg-primary text-white shadow-md shadow-primary/20 scale-110" 
                        : isToday 
                          ? "text-primary border border-primary/30 hover:bg-[#EAF2D7]" 
                          : "text-[#444441] hover:bg-[#F7F8F4] hover:text-foreground",
                      isDisabled && "opacity-20 cursor-not-allowed grayscale"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
