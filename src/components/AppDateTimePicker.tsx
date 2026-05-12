import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AppDateTimePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  icon?: string;
  className?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const AppDateTimePicker = ({
  value,
  onChange,
  placeholder = "Select Date & Time",
  icon = "calendar_today",
  className,
}: AppDateTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // View state for calendar
  const [viewDate, setViewDate] = useState(value || new Date());
  
  // Time state (internal)
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periods = ["AM", "PM"];

  const { h12, m, period } = useMemo(() => {
    if (!value) return { h12: "12", m: "00", period: "AM" };
    const h24 = value.getHours();
    const period = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return {
      h12: h12.toString().padStart(2, '0'),
      m: value.getMinutes().toString().padStart(2, '0'),
      period
    };
  }, [value]);

  const displayValue = useMemo(() => {
    if (!value) return "";
    const dateStr = `${value.getDate().toString().padStart(2, '0')} / ${(value.getMonth() + 1).toString().padStart(2, '0')} / ${value.getFullYear()}`;
    return `${dateStr}, ${h12}:${m} ${period}`;
  }, [value, h12, m, period]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateClick = (day: number) => {
    const current = value || new Date();
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, current.getHours(), current.getMinutes());
    onChange(newDate);
  };

  const updateTime = (newH12: string, newM: string, newPeriod: string) => {
    let h24 = parseInt(newH12);
    if (newPeriod === 'PM' && h24 < 12) h24 += 12;
    if (newPeriod === 'AM' && h24 === 12) h24 = 0;
    
    const current = value || new Date();
    const newDate = new Date(current.getFullYear(), current.getMonth(), current.getDate(), h24, parseInt(newM));
    onChange(newDate);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] flex items-center cursor-pointer hover:border-slate-200 transition-all h-10 px-4 gap-3 group relative",
          isOpen && "border-primary/50 ring-4 ring-primary/5 bg-white",
          className
        )}
      >
        <span className={cn(
          "material-symbols-outlined text-[18px] text-[#B0AFA8] group-hover:text-primary transition-colors",
          isOpen && "text-primary"
        )}>
          {icon}
        </span>
        <span className={cn(
          "text-[14px] font-medium transition-colors",
          displayValue ? "text-foreground" : "text-[#B0AFA8]"
        )}>
          {displayValue || placeholder}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 bg-white border border-slate-100 rounded-[24px] z-[100] flex overflow-hidden"
          >
            {/* Calendar Part */}
            <div className="p-6 border-r border-slate-50 w-72">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="font-bold text-[14px]">{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {DAYS.map(d => <div key={d} className="text-[10px] font-black text-[#B0AFA8] uppercase">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = value?.getDate() === day && value?.getMonth() === viewDate.getMonth() && value?.getFullYear() === viewDate.getFullYear();
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "size-8 rounded-full text-[12px] font-bold transition-all",
                        isSelected ? "bg-primary text-secondary" : "hover:bg-slate-50 text-foreground"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Part */}
            <div className="p-6 bg-slate-50/50 flex flex-col gap-4 min-w-[200px]">
              <div className="text-[12px] font-bold text-[#B0AFA8] uppercase tracking-widest mb-2">Set Time</div>
              
              <div className="flex gap-4 h-48">
                {/* Hours */}
                <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth flex flex-col gap-1">
                  {hours.map(h => (
                    <button 
                      key={h} 
                      onClick={() => updateTime(h, m, period)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all",
                        h12 === h ? "bg-primary text-secondary" : "hover:bg-white text-[#B0AFA8]"
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                {/* Minutes */}
                <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth flex flex-col gap-1">
                  {minutes.filter(min => parseInt(min) % 5 === 0).map(min => (
                    <button 
                      key={min} 
                      onClick={() => updateTime(h12, min, period)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all",
                        m === min ? "bg-primary text-secondary" : "hover:bg-white text-[#B0AFA8]"
                      )}
                    >
                      {min}
                    </button>
                  ))}
                </div>
                {/* Period */}
                <div className="flex flex-col gap-2">
                  {periods.map(p => (
                    <button 
                      key={p} 
                      onClick={() => updateTime(h12, m, p)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-black transition-all",
                        period === p ? "bg-primary text-secondary" : "hover:bg-white text-[#B0AFA8]"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 bg-white border border-slate-100 rounded-xl text-[12px] font-black text-primary hover:bg-primary hover:text-secondary transition-all"
                >
                  Confirm Time
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
