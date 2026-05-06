import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const SideDrawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
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
            className="absolute inset-0 bg-[#152328]/30 backdrop-blur-md"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className={cn(
              "relative w-full bg-[#FBFBFA] shadow-[-20px_0_50px_-10px_rgba(21,35,40,0.1)] h-full flex flex-col overflow-hidden border-l border-white/20",
              maxWidth
            )}
          >
            {/* Header */}
            <div className="p-8 pb-8 border-b border-slate-100 relative shrink-0 bg-[#FBFBFA]/80 backdrop-blur-md z-10">
              <button
                onClick={onClose}
                className="absolute top-8 right-8 size-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[#B0AFA8] hover:text-foreground transition-all group shadow-sm"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <div className="flex flex-col pr-12">
                <h2 className="text-2xl font-bold text-foreground tracking-tight leading-tight">{title}</h2>
                {subtitle && (
                  <p className="text-[13px] font-medium text-[#B0AFA8] mt-2 leading-relaxed max-w-[90%]">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
