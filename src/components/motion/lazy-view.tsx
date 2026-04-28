import { useRef, useState } from "react";
import { useInView } from "framer-motion";

interface LazyViewProps {
  children: React.ReactNode;
  /** Margin around the root. px or %. e.g. "200px" will load when 200px from viewport */
  margin?: string;
  className?: string;
  /** A fallback to show while the component hasn't loaded yet */
  fallback?: React.ReactNode;
}

export function LazyView({
  children,
  margin = "400px",
  className = "",
  fallback = null,
}: LazyViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);
  
  const isInView = useInView(ref, {
    once: true,
    margin,
  });

  if (isInView && !hasRendered) {
    setHasRendered(true);
  }

  return (
    <div ref={ref} className={className}>
      {hasRendered ? children : fallback}
    </div>
  );
}
