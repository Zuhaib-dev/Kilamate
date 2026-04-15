import { motion, type Variants } from "framer-motion";
import { slideUp, fadeIn, scaleIn, slideInLeft, slideInRight, slideDown } from "@/lib/animations";

type AnimVariant = "slideUp" | "fadeIn" | "scaleIn" | "slideInLeft" | "slideInRight" | "slideDown";

const variantMap: Record<AnimVariant, Variants> = {
  slideUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  slideDown,
};

interface AnimateInProps {
  children: React.ReactNode;
  variant?: AnimVariant;
  delay?: number;
  className?: string;
  /** custom viewport margin before triggering */
  margin?: string;
}

/**
 * Scroll-triggered wrapper — animates children once when entering the viewport.
 */
export function AnimateIn({
  children,
  variant = "slideUp",
  delay = 0,
  className,
  margin = "-60px",
}: AnimateInProps) {
  const variants = variantMap[variant];

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      variants={{
        hidden: variants.hidden,
        visible: {
          ...((variants.visible as any) || {}),
          transition: {
            ...((variants.visible as any)?.transition || {}),
            delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
