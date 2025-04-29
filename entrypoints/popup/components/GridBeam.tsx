'use client'

import React, { ReactNode, useEffect, useRef, memo } from 'react'
import { cn } from '../utils/cn'

interface GridBeamProps {
  children: ReactNode;
  className?: string;
}

const GridBeam: React.FC<GridBeamProps> = memo(({ children, className = '' }) => {
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  
  // Optimize animation for performance
  useEffect(() => {
    if (!gradientRef.current) return;
    
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;
    
    const animateGradient = () => {
      const gradient = gradientRef.current;
      if (!gradient) return;
      
      // Define animation properties with simplified transitions
      const duration = 2000; // 2s in ms
      const transition = {
        start: { x1: '40%', x2: '50%', y1: '160%', y2: '180%' },
        end: { x1: '0%', x2: '10%', y1: '-40%', y2: '-20%' }
      };
      
      // Create animation
      let startTime: number | null = null;
      
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        if (elapsed < duration) {
          // Calculate progress (0 to 1)
          const progress = elapsed / duration;
          
          // Use fewer attribute updates for better performance
          if (progress % 0.1 < 0.02) { // Update roughly every 10% of progress
            // Interpolate between start and end values
            const x1 = interpolateValue(transition.start.x1, transition.end.x1, progress);
            const x2 = interpolateValue(transition.start.x2, transition.end.x2, progress);
            const y1 = interpolateValue(transition.start.y1, transition.end.y1, progress);
            const y2 = interpolateValue(transition.start.y2, transition.end.y2, progress);
            
            // Apply values
            gradient.setAttribute('x1', x1);
            gradient.setAttribute('x2', x2);
            gradient.setAttribute('y1', y1);
            gradient.setAttribute('y2', y2);
          }
          
          animationFrameId = requestAnimationFrame(step);
        } else {
          // Reset for loop with longer pause
          timeoutId = setTimeout(() => {
            startTime = null;
            
            // Reset to initial state
            gradient.setAttribute('x1', transition.start.x1);
            gradient.setAttribute('x2', transition.start.x2);
            gradient.setAttribute('y1', transition.start.y1);
            gradient.setAttribute('y2', transition.start.y2);
            
            animationFrameId = requestAnimationFrame(step);
          }, 3000); // 3s delay for less CPU usage
        }
      };
      
      animationFrameId = requestAnimationFrame(step);
    };
    
    animateGradient();
    
    // Cleanup animation frames and timeouts
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Helper function to interpolate between values with % units - memoized for better performance
  const interpolateValue = (start: string, end: string, progress: number): string => {
    const startValue = parseFloat(start);
    const endValue = parseFloat(end);
    const result = startValue + (endValue - startValue) * progress;
    return `${result}%`;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Static grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-100/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-100/30 to-transparent"></div>
        </div>
      </div>
      
      {/* Simplified animated beam */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          width="210"
          height="210"
          viewBox="0 0 156 63"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
        >
          <path
            d="M31 .5h32M0 .5h32m30 31h32m-1 0h32m-1 31h32M62.5 32V0m62 63V31"
            stroke="url(#grad1)"
            strokeWidth={1.5}
          />
          <defs>
            <linearGradient
              ref={gradientRef}
              id="grad1"
              x1="40%"
              y1="160%"
              x2="50%"
              y2="180%"
              gradientTransform="rotate(15)"
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop offset="0.2" stopColor="#18CCFC" />
              <stop offset="0.325" stopColor="#6344F5" />
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] opacity-30"></div>
      </div>
      
      {/* Actual content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
});

export default GridBeam 