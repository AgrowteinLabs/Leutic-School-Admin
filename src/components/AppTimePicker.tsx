import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AppTimePickerProps {
  value: string; // HH:mm format (24h)
  onChange: (time: string) => void;
  width?: string;
  icon?: string;
  placeholder?: string;
}

export const AppTimePicker = ({
  value,
  onChange,
  width = "w-full",
  icon = "schedule",
  placeholder = "HH:MM AM/PM"
}: AppTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minListRef = useRef<HTMLDivElement>(null);
  const periodListRef = useRef<HTMLDivElement>(null);

  const { h12, m, period } = useMemo(() => {
    const [h24Str, mStr] = value.split(':');
    const h24 = parseInt(h24Str) || 0;
    const period = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return {
      h12: h12.toString().padStart(2, '0'),
      m: mStr || '00',
      period
    };
  }, [value]);

  const [inputValue, setInputValue] = useState(`${h12}:${m} ${period}`);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periods = ["AM", "PM"];

  useEffect(() => {
    setInputValue(`${h12}:${m} ${period}`);
  }, [h12, m, period]);

  useEffect(() => {
    if (isOpen) {
      const scrollToSelected = (el: HTMLDivElement | null, val: string) => {
        if (!el) return;
        const selectedBtn = el.querySelector(`[data-value="${val}"]`) as HTMLElement;
        if (selectedBtn) el.scrollTop = selectedBtn.offsetTop - 80;
      };

      setTimeout(() => {
        scrollToSelected(hourListRef.current, h12);
        scrollToSelected(minListRef.current, m);
        scrollToSelected(periodListRef.current, period);
      }, 50);
    }
  }, [isOpen, h12, m, period]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateTime = (newH12: string, newM: string, newPeriod: string) => {
    let h24 = parseInt(newH12);
    if (newPeriod === 'PM' && h24 < 12) h24 += 12;
    if (newPeriod === 'AM' && h24 === 12) h24 = 0;

    const h24Str = h24.toString().padStart(2, '0');
    onChange(`${h24Str}:${newM}`);
  };

  return (
    <div className={cn("relative", width)} ref={containerRef}>
      <div
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] flex items-center cursor-pointer hover:border-slate-200 transition-all relative h-10 outline-none group",
          isOpen && "border-primary/50 ring-2 ring-primary/5 bg-white"
        )}
      >
        <span className={cn(
          "material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] transition-colors z-20 pointer-events-none text-[#B0AFA8] group-hover:text-secondary group-focus-within:text-primary",
          isOpen && "text-primary"
        )}>
          {icon}
        </span>
        <input
          type="text"
          value={inputValue}
          readOnly
          placeholder={placeholder}
          className="w-full h-full bg-transparent outline-none text-[13px] font-bold text-foreground pl-10 pr-4 z-10 cursor-pointer"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-[calc(100%+6px)] left-0 bg-white border border-slate-100 rounded-[16px] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] z-50 overflow-hidden flex origin-top min-w-[220px] h-[240px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hours Column */}
            <div ref={hourListRef} className="flex-1 overflow-y-auto pb-4 scroll-smooth no-scrollbar">
              <div className="px-4 pt-3 pb-2 mb-1 text-[9px] font-bold text-[#B0AFA8] uppercase tracking-[0.12em] sticky top-0 bg-white z-20">Hour</div>
              <div className="px-1.5 relative">
                {hours.map(h => (
                  <button
                    key={h}
                    data-value={h}
                    onClick={() => updateTime(h, m, period)}
                    className={cn(
                      "w-full px-3 py-1.5 rounded-lg text-[13px] font-bold text-left transition-all relative group",
                      h12 === h ? "text-foreground" : "text-[#B0AFA8] hover:bg-[#F7F8F4] hover:text-foreground"
                    )}
                  >
                    <span className="relative z-10">{h}</span>
                    {h12 === h && <motion.div layoutId="h-pill-slim" className="absolute inset-0 bg-primary rounded-lg z-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-[1px] bg-slate-50 h-full self-center" />

            {/* Minutes Column */}
            <div ref={minListRef} className="flex-1 overflow-y-auto pb-4 scroll-smooth no-scrollbar">
              <div className="px-4 pt-3 pb-2 mb-1 text-[9px] font-bold text-[#B0AFA8] uppercase tracking-[0.12em] sticky top-0 bg-white z-20">Min</div>
              <div className="px-1.5 relative">
                {minutes.filter(min => parseInt(min) % 5 === 0).map(min => (
                  <button
                    key={min}
                    data-value={min}
                    onClick={() => updateTime(h12, min, period)}
                    className={cn(
                      "w-full px-3 py-1.5 rounded-lg text-[13px] font-bold text-left transition-all relative group",
                      m === min ? "text-foreground" : "text-[#B0AFA8] hover:bg-[#F7F8F4] hover:text-foreground"
                    )}
                  >
                    <span className="relative z-10">{min}</span>
                    {m === min && <motion.div layoutId="m-pill-slim" className="absolute inset-0 bg-primary rounded-lg z-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-[1px] bg-slate-50 h-full self-center" />

            {/* Period Column */}
            <div ref={periodListRef} className="w-20 overflow-y-auto pb-4 scroll-smooth no-scrollbar">
              <div className="px-4 pt-3 pb-2 mb-1 text-[9px] font-bold text-[#B0AFA8] uppercase tracking-[0.12em] sticky top-0 bg-white z-20">Per</div>
              <div className="px-1.5 relative">
                {periods.map(p => (
                  <button
                    key={p}
                    data-value={p}
                    onClick={() => updateTime(h12, m, p)}
                    className={cn(
                      "w-full px-3 py-1.5 rounded-lg text-[13px] font-bold text-left transition-all relative group",
                      period === p ? "text-foreground" : "text-[#B0AFA8] hover:bg-[#F7F8F4] hover:text-foreground"
                    )}
                  >
                    <span className="relative z-10">{p}</span>
                    {period === p && <motion.div layoutId="p-pill-slim" className="absolute inset-0 bg-primary rounded-lg z-0" />}
                  </button>
                ))}
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
