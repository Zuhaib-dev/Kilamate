import type { Variants, Transition } from "framer-motion";

// ─── Shared Transitions ───────────────────────────────────────────────────────

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

export const easeOut: Transition = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1],
  duration: 0.5,
};

export const easeOutFast: Transition = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1],
  duration: 0.3,
};

// ─── Entrance Variants ────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: easeOut,
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: easeOut,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSnappy,
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springBouncy,
  },
};

// ─── Stagger Container ────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// ─── Hover / Tap Micro-animations ────────────────────────────────────────────

export const cardHover = {
  rest: { scale: 1, y: 0, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0px 16px 48px rgba(0,0,0,0.15)",
    transition: springSnappy,
  },
  tap: { scale: 0.98, y: 0, transition: springSnappy },
};

export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: springSnappy },
  tap: { scale: 0.95, transition: springSnappy },
};

export const iconHover = {
  rest: { rotate: 0, scale: 1 },
  hover: { rotate: 10, scale: 1.2, transition: springBouncy },
  tap: { rotate: -5, scale: 0.9, transition: springSnappy },
};

export const iconSpin = {
  rest: { rotate: 0 },
  hover: { rotate: 180, transition: { duration: 0.4, ease: "easeInOut" } },
};

// ─── Special / Looping ───────────────────────────────────────────────────────

/** Float loop — use with animate directly */
export const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const shimmerAnimation = {
  backgroundPosition: ["200% 0", "-200% 0"],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "linear",
  },
};

/** Rotate continuously (e.g. refresh icon when loading) */
export const spinAnimation = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear",
  },
};

// ─── Page Transition ──────────────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(4px)",
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

// ─── Number Counter (used with useMotionValue) ────────────────────────────────

export const numberReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springBouncy, delay: 0.1 },
  },
};
