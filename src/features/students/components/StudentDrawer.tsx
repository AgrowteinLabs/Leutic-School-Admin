import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { 
  Trophy, 
  Calendar, 
  GraduationCap, 
  Activity, 
  X,
  Phone,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  ChevronRight,
  FileText,
  MessageSquare
} from "lucide-react";

interface StudentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    name: string;
    id: string;
    grade: string;
    section: string;
    auraScore: number;
    attendanceRate: number;
    gpa: number;
    img: string;
    status: string;
    participation: number;
    phone: string;
  } | null;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export const StudentDrawer = ({ isOpen, onClose, student }: StudentDrawerProps) => {
  if (!student) return null;

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
            className="relative w-full max-w-[500px] bg-[#FBFBFA] shadow-2xl h-full flex flex-col overflow-hidden border-l border-slate-100"
          >
            {/* Minimal Header */}
            <div className="p-8 pb-6 bg-white border-b border-slate-50 relative shrink-0">
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 size-10 rounded-full bg-[#FBFBFA] flex items-center justify-center text-[#B0AFA8] hover:text-foreground transition-all group"
                >
                    <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div 
                            className="size-20 rounded-[24px] bg-cover bg-center border-4 border-[#FBFBFA] shadow-sm"
                            style={{ backgroundImage: `url("${student.img}")` }}
                        />
                        <div className="absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-white bg-primary shadow-sm flex items-center justify-center">
                            <ShieldCheck size={10} className="text-secondary" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-black text-[#B0AFA8] uppercase tracking-widest">{student.id}</span>
                            <span className="text-[9px] font-black text-[#3D6B2C] uppercase tracking-widest">Active Enrollment</span>
                        </div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight leading-none mb-1">{student.name}</h2>
                        <p className="text-[13px] font-medium text-[#B0AFA8]">{student.grade} • Section {student.section}</p>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar"
            >
              
              {/* Intelligence Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                {/* Main Aura Score */}
                <div className="col-span-2 p-6 rounded-[24px] bg-white border border-slate-100 shadow-sm group hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-[0.18em]">Aura Intelligence</h4>
                        <Trophy size={16} className="text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-foreground tracking-tighter">{student.auraScore}</span>
                        <span className="text-sm font-bold text-[#B0AFA8]">/ 100</span>
                    </div>
                    <div className="mt-4 h-1.5 bg-[#F7F8F4] rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${student.auraScore}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-primary" 
                        />
                    </div>
                </div>

                {/* Sub Stats */}
                <div className="p-5 rounded-[24px] bg-white border border-slate-100 shadow-sm hover:border-primary/20 transition-all">
                    <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-[0.18em] mb-3">Attendance</p>
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-foreground">{student.attendanceRate}%</span>
                        <Calendar size={18} className="text-blue-500 opacity-20" />
                    </div>
                </div>

                <div className="p-5 rounded-[24px] bg-white border border-slate-100 shadow-sm hover:border-primary/20 transition-all">
                    <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-[0.18em] mb-3">GPA Index</p>
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-foreground">{student.gpa}</span>
                        <GraduationCap size={18} className="text-secondary opacity-20" />
                    </div>
                </div>
              </motion.div>

              {/* Status Insight Card */}
              <motion.div variants={itemVariants} className="p-6 rounded-[24px] bg-[#F7F8F4] border border-slate-100 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                             <div className="size-2 rounded-full bg-primary animate-pulse" />
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B0AFA8]">Administrative Insight</h4>
                        </div>
                        <p className="text-[14px] font-bold text-foreground leading-snug">
                            {student.auraScore >= 80 
                                ? `${student.name} is demonstrating exceptional leadership. Recommend for elite programs.`
                                : `${student.name} shows a participation decline. Early intervention session suggested.`
                            }
                        </p>
                    </div>
              </motion.div>

              {/* Action Stack */}
              <motion.div variants={itemVariants} className="space-y-3">
                <button className="w-full h-14 bg-secondary text-white rounded-[18px] text-[14px] font-black flex items-center justify-center gap-3 hover:bg-primary hover:text-secondary transition-all active:scale-[0.98] shadow-lg shadow-secondary/5">
                  <Phone size={18} fill="currentColor" strokeWidth={0} />
                  Contact Guardian
                </button>
                <div className="grid grid-cols-2 gap-3">
                    <button className="h-12 bg-white border border-slate-100 text-foreground rounded-[16px] text-[12px] font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <FileText size={16} className="opacity-40" />
                        Records
                    </button>
                    <button className="h-12 bg-white border border-slate-100 text-foreground rounded-[16px] text-[12px] font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <MessageSquare size={16} className="opacity-40" />
                        Quick Chat
                    </button>
                </div>
              </motion.div>

              {/* Footnote */}
              <motion.div variants={itemVariants} className="pt-10 text-center">
                <p className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-[0.2em] opacity-40">Institutional Verification Active</p>
              </motion.div>

            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
