import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const SideDrawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-[500px]"
}: SideDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-secondary/30 backdrop-blur-md"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className={cn(
              "relative w-full bg-background h-full flex flex-col overflow-hidden border-l border-border",
              maxWidth
            )}
          >
            {/* Header */}
            <div className="p-8 pb-8 border-b border-border relative shrink-0 bg-background/80 backdrop-blur-md z-10">
              <button
                onClick={onClose}
                className="absolute top-8 right-8 size-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all group"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <div className="flex flex-col pr-12">
                <h2 className="text-[length:var(--font-size-h3)] font-bold text-foreground tracking-tight leading-tight">{title}</h2>
                {subtitle && (
                  <p className="text-[length:var(--font-size-input)] font-medium text-[var(--text-color-body-muted)] mt-2 leading-relaxed max-w-[90%]">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              {children}
            </div>

            {/* Optional Footer */}
            {footer && (
              <div className="shrink-0 p-8 bg-card/80 backdrop-blur-xl border-t border-border relative z-20">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
