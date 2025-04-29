import React from 'react';
import { cn } from '../utils/cn';

interface MeteorProps {
  number?: number;
  className?: string;
}

const MeteorEffect: React.FC<MeteorProps> = ({
  number = 20,
  className = "",
}) => {
  const meteors = new Array(number).fill(true);
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {meteors.map((_, idx) => {
        const size = Math.floor(Math.random() * 2) + 1;
        return (
          <span
            key={idx}
            className={cn(
              "absolute top-0 left-0 w-0.5 h-0.5 rounded-full bg-white rotate-[215deg] shadow-[0_0_0_1px_rgba(255,255,255,0.1)]",
              "before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[rgba(255,255,255,0.1)] before:to-transparent before:-translate-y-1/2 before:-translate-x-[20%]"
            )}
            style={{
              top: Math.floor(Math.random() * 100) + "%",
              left: Math.floor(Math.random() * 100) + "%",
              width: size + "px",
              height: size + "px",
              animationDelay: Math.random() * 2 + "s",
              animationDuration: Math.floor(Math.random() * 10) + 2 + "s",
              animation: "meteor linear infinite",
            }}
          />
        );
      })}
    </div>
  );
};

export default MeteorEffect; 