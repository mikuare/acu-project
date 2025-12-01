import { useEffect, useState } from "react";

interface CountUpProps {
    end: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
}

export const CountUp = ({
    end,
    duration = 1500,
    className = "",
    prefix = "",
    suffix = ""
}: CountUpProps) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            // Calculate current count based on progress
            const percentage = Math.min(progress / duration, 1);

            // Easing function (easeOutQuart) for smoother animation
            const easeOut = (x: number): number => {
                return 1 - Math.pow(1 - x, 4);
            };

            const currentCount = Math.floor(easeOut(percentage) * end);

            setCount(currentCount);

            if (progress < duration) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(end); // Ensure we land exactly on the end number
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [end, duration]);

    return (
        <span className={className}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
};
