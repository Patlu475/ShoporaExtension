import React, { useRef, useState, memo, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue, AnimatePresence } from 'framer-motion';

// Import icons
import { IconHome, IconHeart, IconBell, IconUser } from '@tabler/icons-react';

interface DockItem {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  id: string;
}

interface AnimatedDockProps {
  className?: string;
  onNavigate?: (id: string) => void;
}

// Memoize the AnimatedDock component to prevent unnecessary re-renders
const AnimatedDock: React.FC<AnimatedDockProps> = memo(({ className, onNavigate }) => {
  const mouseXPosition = useMotionValue(Infinity);
  const [activeItem, setActiveItem] = useState<string>('home');
  
  // Handle navigation with useCallback for performance
  const handleNavigation = useCallback((id: string) => {
    setActiveItem(id);
    if (onNavigate) {
      onNavigate(id);
    }
    
    // Default navigation actions can be removed as they'll be handled in App.tsx
    console.log(`Navigate to ${id}`);
  }, [onNavigate]);
  
  // Memoize dock items to prevent recreation on each render
  const dockItems = React.useMemo<DockItem[]>(() => [
    {
      id: 'home',
      title: 'Home',
      icon: <IconHome stroke={1.5} />,
      onClick: () => handleNavigation('home')
    },
    {
      id: 'wishlists',
      title: 'Wishlists',
      icon: <IconHeart stroke={1.5} />,
      onClick: () => handleNavigation('wishlists')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <IconBell stroke={1.5} />,
      onClick: () => handleNavigation('notifications')
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: <IconUser stroke={1.5} />,
      onClick: () => handleNavigation('profile')
    }
  ], [handleNavigation]);

  // Performance optimization: Only update mouse position if actually hovering over the dock
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseXPosition.set(e.pageX);
  }, [mouseXPosition]);

  const handleMouseLeave = useCallback(() => {
    mouseXPosition.set(Infinity);
  }, [mouseXPosition]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex h-16 items-center gap-3 rounded-full bg-white/15 px-6 py-3 backdrop-blur-md border border-gray-200/30 shadow-lg dark:bg-black/30 dark:border-gray-800/30 ${className || ''}`}
    >
      {dockItems.map((item) => (
        <DockIcon 
          key={item.id} 
          mouseX={mouseXPosition} 
          title={item.title} 
          icon={item.icon} 
          onClick={item.onClick}
          isActive={activeItem === item.id}
        />
      ))}
    </motion.div>
  );
});

AnimatedDock.displayName = 'AnimatedDock';

interface DockIconProps {
  mouseX: MotionValue<number>;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
}

// Memoize the DockIcon component
const DockIcon: React.FC<DockIconProps> = memo(({ mouseX, title, icon, onClick, isActive }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate the distance from the mouse to the icon center
  const distanceFromMouse = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Only transform when actually hovered over the dock
  const widthTransform = useTransform(
    distanceFromMouse, 
    [-100, 0, 100], 
    [40, 58, 40],
    { clamp: true }
  );
  
  const heightTransform = useTransform(
    distanceFromMouse, 
    [-100, 0, 100], 
    [40, 58, 40],
    { clamp: true }
  );
  
  const iconScaleTransform = useTransform(
    distanceFromMouse, 
    [-100, 0, 100], 
    [0.8, 1.2, 0.8],
    { clamp: true }
  );

  // Create springs with initial values
  const width = useSpring(40, { mass: 0.1, stiffness: 120, damping: 10 });
  const height = useSpring(40, { mass: 0.1, stiffness: 120, damping: 10 });
  const iconScale = useSpring(1, { mass: 0.1, stiffness: 200, damping: 12 });
  
  // Update springs based on mouse position
  useEffect(() => {
    const unsubscribe = mouseX.onChange(latest => {
      if (latest === Infinity) {
        // Mouse is not over the dock, reset to default
        width.set(40);
        height.set(40);
        iconScale.set(1);
      } else {
        // Only subscribe to changes when mouse is over dock
        const distanceSubscription = distanceFromMouse.onChange(distance => {
          // Calculate scale based on distance from icon center
          const maxDistance = 100;
          const distancePercent = Math.min(Math.abs(distance), maxDistance) / maxDistance;
          const scale = 1 - distancePercent * 0.2; // Reduced scale effect
          
          if (Math.abs(distance) < maxDistance) {
            // Exponential scale for smoother transition near center
            const scaleFactor = Math.pow(1 - distancePercent, 2);
            const maxWidth = 58;
            const minWidth = 40;
            const newWidth = minWidth + (maxWidth - minWidth) * scaleFactor;
            
            width.set(newWidth);
            height.set(newWidth);
            iconScale.set(0.8 + 0.4 * scaleFactor);
          } else {
            width.set(40);
            height.set(40);
            iconScale.set(1);
          }
        });
        
        return () => {
          distanceSubscription();
        };
      }
    });
    
    return unsubscribe;
  }, [mouseX, width, height, iconScale, distanceFromMouse]);

  // Additional styling for active state
  const bgClass = isActive 
    ? "bg-gradient-to-br from-blue-600 to-violet-700" 
    : "bg-gradient-to-br from-blue-500 to-violet-500";
  
  const activeIndicatorVariants = {
    inactive: { opacity: 0, scale: 0 },
    active: { opacity: 1, scale: 1 }
  };

  // Memoize handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={`flex items-center justify-center rounded-full ${bgClass} text-white cursor-pointer shadow-md`}
      >
        <motion.div style={{ scale: iconScale }} className="w-5 h-5">
          {icon}
        </motion.div>
        
        {/* Only render tooltip when hovered for better performance */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: -5 }}
              exit={{ opacity: 0, y: 0 }}
              className="absolute -top-9 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-xs px-2 py-1 rounded-md shadow-md whitespace-nowrap z-50"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Active indicator dot */}
      <motion.div 
        variants={activeIndicatorVariants}
        initial="inactive"
        animate={isActive ? "active" : "inactive"}
        className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"
      />
    </div>
  );
});

DockIcon.displayName = 'DockIcon';

export default AnimatedDock; 