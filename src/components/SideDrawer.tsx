import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const SideDrawer = ({ 
  isOpen, 
  onClose, 
  title, 
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
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 400 }}
            className={cn(
              "relative w-full bg-[#FBFBFA] shadow-2xl h-full flex flex-col overflow-hidden border-l border-slate-100",
              maxWidth
            )}
          >
            {/* Header */}
            <div className="p-8 pb-6 bg-white border-b border-slate-50 relative shrink-0">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 size-10 rounded-full bg-[#FBFBFA] flex items-center justify-center text-[#B0AFA8] hover:text-foreground transition-all group"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
              
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#B0AFA8] uppercase tracking-[0.2em] mb-1">Management Console</span>
                <h2 className="text-2xl font-black text-foreground tracking-tight leading-none">{title}</h2>
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
