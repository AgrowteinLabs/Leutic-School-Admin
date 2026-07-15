import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";

import { 
  Trophy, 
  Calendar, 
  GraduationCap, 
  X,
  Phone,
  ShieldCheck,
  FileText,
  MessageSquare,
  ChevronRight
} from "lucide-react";

interface StudentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    uid: string;
    name: string;
    id: string;
    grade: string;
    section: string;
    auraScore: number;
    attendanceRate: number | null;
    gpa: number | null;
    img: string;
    status: string;
    participation: number | null;
    phone: string;
    behavioralAuditLog: { lastAuditDate: string; auditedBy: string } | null;
  } | null;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] } }
};

export const StudentDrawer = ({ isOpen, onClose, student }: StudentDrawerProps) => {
  const navigate = useNavigate();
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
            className="relative w-full max-w-[460px] bg-white shadow-2xl h-full flex flex-col overflow-hidden border-l border-slate-100"
          >
            {/* Minimal Lean Header */}
            <div className="p-8 pb-8 bg-white border-b border-slate-50 relative shrink-0">
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 size-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-[#B0AFA8] hover:text-foreground transition-all group"
                >
                    <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div 
                            className="size-16 rounded-[20px] bg-cover bg-center border-2 border-white shadow-sm"
                            style={{ backgroundImage: `url("${student.img}")` }}
                        />
                        <div className="absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-white bg-primary flex items-center justify-center">
                            <ShieldCheck size={10} className="text-secondary" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold text-[#B0AFA8] tracking-widest">{student.id}</span>
                            <div className="size-1 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Enrollment</span>
                        </div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight leading-none mb-1">{student.name}</h2>
                        <p className="text-[12px] font-medium text-[#B0AFA8]">{student.grade} • Section {student.section}</p>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar"
            >
              
              {/* Intelligence Section */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <h4 className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-[0.2em]">Key Metrics</h4>
                    <span className="text-[10px] font-bold text-primary">Intelligence Report</span>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Trophy size={10} className="text-primary" /> Aura
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-foreground tracking-tight">
                                {student.auraScore !== null && student.auraScore !== undefined ? student.auraScore : "N/A"}
                            </span>
                            {student.auraScore !== null && student.auraScore !== undefined && (
                                <span className="text-[10px] font-bold text-[#B0AFA8]">/ 100</span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Calendar size={10} className="text-blue-500" /> Attendance
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-foreground tracking-tight">
                                {student.attendanceRate !== null && student.attendanceRate !== undefined ? `${student.attendanceRate}%` : "N/A"}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <GraduationCap size={10} className="text-amber-500" /> GPA
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-foreground tracking-tight">
                                {student.gpa !== null && student.gpa !== undefined ? student.gpa : "N/A"}
                            </span>
                        </div>
                    </div>
                </div>
              </motion.div>

              {/* Behavioral Audit Log Section */}
              <motion.div variants={itemVariants} className="space-y-4">
                  <h4 className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Behavioral Audit Log</h4>
                  <div className="bg-[#F7F8F4] p-5 rounded-2xl border border-slate-100/50">
                    {student.behavioralAuditLog ? (
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                          <ShieldCheck size={14} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[13px] font-medium text-foreground leading-relaxed">
                            Last audit performed by <span className="font-bold">{student.behavioralAuditLog.auditedBy}</span>
                          </p>
                          <p className="text-[11px] text-[#B0AFA8] font-medium">
                            {new Date(student.behavioralAuditLog.lastAuditDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[12px] text-[#B0AFA8] italic font-medium">No behavioral audits performed yet.</p>
                    )}
                  </div>
              </motion.div>

              {/* Minimal Action List */}
              <motion.div variants={itemVariants} className="space-y-1">
                  <h4 className="text-[10px] font-bold text-[#B0AFA8] uppercase tracking-[0.2em] mb-4">Direct Actions</h4>
                  
                  {[
                      { label: "Contact Guardian", icon: Phone, detail: student.phone, color: "text-blue-600", bg: "bg-blue-50", href: `tel:${student.phone}` },
                      { label: "View Academic Records", icon: FileText, detail: "Full transcript", color: "text-amber-600", bg: "bg-amber-50", onClick: () => { onClose(); navigate(`/students/${student.uid}`); } },
                      { label: "Message Student", icon: MessageSquare, detail: "Direct portal", color: "text-emerald-600", bg: "bg-emerald-50", onClick: () => { onClose(); navigate(`/students/${student.uid}`); } },
                  ].map((action, i) => (
                      action.href ? (
                          <a key={i} href={action.href} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-[#F7F8F4] transition-all group">
                              <div className="flex items-center gap-4">
                                  <div className={cn("size-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", action.bg, action.color)}>
                                      <action.icon size={16} />
                                  </div>
                                  <div className="flex flex-col text-left">
                                      <span className="text-[13px] font-bold text-foreground">{action.label}</span>
                                      <span className="text-[10px] text-[#B0AFA8] font-medium">{action.detail}</span>
                                  </div>
                              </div>
                              <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                          </a>
                      ) : (
                          <button key={i} onClick={action.onClick} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-[#F7F8F4] transition-all group">
                              <div className="flex items-center gap-4">
                                  <div className={cn("size-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", action.bg, action.color)}>
                                      <action.icon size={16} />
                                  </div>
                                  <div className="flex flex-col text-left">
                                      <span className="text-[13px] font-bold text-foreground">{action.label}</span>
                                      <span className="text-[10px] text-[#B0AFA8] font-medium">{action.detail}</span>
                                  </div>
                              </div>
                              <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                          </button>
                      )
                  ))}
              </motion.div>

              {/* Subtle Footer */}
              <motion.div variants={itemVariants} className="pt-10 text-center opacity-30">
                <p className="text-[9px] font-bold text-[#B0AFA8] uppercase tracking-[0.3em]">Verified Institutional Profile</p>
              </motion.div>

            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


