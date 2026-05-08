import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import successAnimation from "../../assets/animations/success.json";
import { PDSButton } from "./PDSButton";

interface PDSSuccessModalProps {
  show: boolean;
  title: string;
  description: string;
  buttonText?: string;
  onClose: () => void;
  onAction?: () => void;
}

export const PDSSuccessModal = ({
  show,
  title,
  description,
  buttonText = "Continue",
  onClose,
  onAction
}: PDSSuccessModalProps) => {
  if (!show) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-foreground/40 backdrop-blur-sm cursor-pointer"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[40px] p-12 max-w-lg w-full relative z-10 shadow-2xl text-center"
        >
          <div className="mb-8 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              className="size-32 mx-auto relative z-10"
            >
              <Lottie animationData={successAnimation} loop={false} className="w-full h-full" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 size-32 bg-[#EAF2D7] rounded-full mx-auto"
            />
          </div>

          <h3 className="text-[24px] font-bold text-[#3D6B2C] tracking-tight mb-2">{title}</h3>
          <p className="text-[#B0AFA8] text-[15px] font-medium leading-relaxed mb-10 px-4">
            {description}
          </p>

          <PDSButton
            variant="primary"
            className="w-full h-10 shadow-lg"
            onClick={onAction || onClose}
          >
            {buttonText}
          </PDSButton>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
