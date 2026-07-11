import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface MenuDropdownProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  side?: "top" | "bottom";
  width?: string;
  value?: string;
}

export const MenuDropdown = ({
  trigger,
  items,
  align = "right",
  side = "bottom",
  width = "w-48",
  value,
}: MenuDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "fixed z-[9999] bg-card border border-border rounded-2xl shadow-2xl shadow-slate-900/15 overflow-hidden",
                width
              )}
              style={{
                ...(side === "top" 
                   ? { bottom: `${window.innerHeight - coords.top + 8}px` }
                   : { top: `${coords.top + coords.height + 8}px` }
                ),
                ...(align === "right" 
                   ? { right: `${window.innerWidth - (coords.left + coords.width)}px` }
                   : { left: `${coords.left}px` }
                )
              }}
            >
              <div className="p-1.5">
                {items.map((item, index) => {
                  const isSelected = value === item.label;
                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        item.onClick();
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all text-left group",
                        isSelected 
                          ? "bg-accent text-foreground border border-primary/20" 
                          : item.variant === "danger"
                          ? "text-red-600 hover:bg-red-50"
                          : "text-muted-foreground hover:bg-muted hover:text-primary"
                      )}
                    >
                      {item.icon && (
                        <span className="material-symbols-outlined text-[20px] opacity-70 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                      )}
                      <span className="flex-1">{item.label}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[18px] text-foreground font-black">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
