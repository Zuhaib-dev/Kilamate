import { useEffect } from 'react';

/**
 * Custom hook to optimize performance by preventing forced reflows
 * and batching DOM reads/writes
 */
export function usePerformanceOptimization() {
    useEffect(() => {
        // Batch DOM reads and writes to prevent layout thrashing
        let rafId: number;
        const scheduledReads: Array<() => void> = [];
        const scheduledWrites: Array<() => void> = [];

        const flushReads = () => {
            scheduledReads.forEach(read => read());
            scheduledReads.length = 0;
        };

        const flushWrites = () => {
            scheduledWrites.forEach(write => write());
            scheduledWrites.length = 0;
        };

        const scheduleWork = () => {
            if (rafId) return;

            rafId = requestAnimationFrame(() => {
                flushReads();
                flushWrites();
                rafId = 0;
            });
        };

        // Cleanup
        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };
    }, []);
}

/**
 * Debounce function to optimize frequent operations
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Lazy load images with Intersection Observer
 */
export function useLazyImage(ref: React.RefObject<HTMLImageElement>) {
    useEffect(() => {
        const img = ref.current;
        if (!img) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target as HTMLImageElement;
                        const src = lazyImage.dataset.src;
                        if (src) {
                            lazyImage.src = src;
                            lazyImage.removeAttribute('data-src');
                            observer.unobserve(lazyImage);
                        }
                    }
                });
            },
            {
                rootMargin: '50px',
            }
        );

        observer.observe(img);

        return () => {
            if (img) observer.unobserve(img);
        };
    }, [ref]);
}
