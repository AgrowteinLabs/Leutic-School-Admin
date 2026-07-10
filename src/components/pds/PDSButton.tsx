import { cn } from "../../lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface PDSButtonProps extends Omit<HTMLMotionProps<"button">, "variant"> {
  variant?: "primary" | "secondary" | "text" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: string;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

export const PDSButton = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading,
  className,
  ...props
}: PDSButtonProps) => {
  // Mapping PDS variants to institutional index.css classes
  const variantClasses = {
    primary: "btn-primary", // Dark bg, lime text
    secondary: "btn-secondary", // Pale lime bg, dark text
    danger: "btn-danger",
    outline: "btn-outline",
    text: "btn-text",
    ghost: "bg-[#F7F8F4] text-secondary hover:bg-slate-200/50 hover:text-foreground", // Custom PDS ghost
  };

  const sizes = {
    sm: "h-8 px-4 text-[11px] rounded-lg",
    md: "h-10 px-6 text-[13px] rounded-xl",
    lg: "h-12 px-10 text-[14px] rounded-xl",
    xl: "h-14 px-12 text-[15px] rounded-2xl",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center font-bold transition-all gap-2 disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          )}
        </>
      )}
    </motion.button>
  );
};
