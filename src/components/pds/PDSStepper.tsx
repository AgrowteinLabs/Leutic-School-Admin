import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

interface Step {
  id: number;
  title: string;
  subtitle?: string;
}

interface PDSStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const PDSStepper = ({ steps, currentStep, className }: PDSStepperProps) => {
  return (
    <div className={cn("mb-12", className)}>
      <div className="flex items-center justify-between relative max-w-sm mx-auto">
        {/* Background line */}
        <div className="absolute top-[11px] left-0 right-0 h-[2px] bg-slate-100 -z-10" />
        
        {/* Progress line */}
        <motion.div
          className="absolute top-[11px] left-0 h-[2px] bg-foreground -z-10 origin-left"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((s) => {
          const isActive = currentStep === s.id;
          const isCompleted = currentStep > s.id;

          return (
            <div key={s.id} className="flex flex-col items-center gap-4 relative bg-white px-4">
              <motion.div
                className={cn(
                  "size-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 z-10",
                  isActive ? "bg-foreground text-white shadow-md shadow-slate-900/10" :
                    isCompleted ? "bg-foreground text-white" : "bg-white border-2 border-slate-100 text-[#B0AFA8]"
                )}
                animate={isActive ? { scale: 1.2 } : { scale: 1 }}
              >
                {isCompleted ? <span className="material-symbols-outlined text-[14px]">check</span> : s.id}
              </motion.div>
              <div className="text-center absolute top-10 w-32 -ml-16 left-1/2">
                <p className={cn(
                  "text-[12px] font-bold transition-colors duration-300",
                  isActive || isCompleted ? "text-foreground" : "text-[#B0AFA8]"
                )}>{s.title}</p>
                {s.subtitle && (
                  <p className="text-[10px] text-[#B0AFA8] font-medium mt-0.5 whitespace-nowrap">{s.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
