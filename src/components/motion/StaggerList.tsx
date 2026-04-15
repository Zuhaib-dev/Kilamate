import { motion } from "framer-motion";
import { slideUp } from "@/lib/animations";

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  /** ms delay before stagger starts */
  delay?: number;
  /** stagger speed preset */
  speed?: "fast" | "normal" | "slow";
}

const speedMap = {
  fast: 0.05,
  normal: 0.08,
  slow: 0.14,
};

/**
 * Wraps children in a stagger container — each child animates in sequence
 * when the list comes into the viewport.
 *
 * Usage: wrap direct children in <motion.div variants={slideUp}> or use the
 * StaggerItem export below.
 */
export function StaggerList({
  children,
  className,
  delay = 0,
  speed = "normal",
}: StaggerListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: speedMap[speed],
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Drop-in child item for StaggerList */
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={slideUp}>
      {children}
    </motion.div>
  );
}
