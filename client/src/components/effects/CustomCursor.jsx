import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hoverText, setHoverText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Smooth spring physics for the outer ring
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  // Smoother trailing for the glow
  const glowConfig = { damping: 30, stiffness: 100, mass: 1 };
  const glowX = useSpring(cursorX, glowConfig);
  const glowY = useSpring(cursorY, glowConfig);

  useEffect(() => {
    // Only show on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Detect hoverable elements
    const handleElementHover = (e) => {
      const target = e.target.closest('a, button, [data-cursor], input, select, textarea, details summary');
      if (target) {
        setIsHovering(true);
        setHoverText(target.getAttribute('data-cursor') || '');
      } else {
        setIsHovering(false);
        setHoverText('');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleElementHover);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    // Hide default cursor
    document.body.style.cursor = 'none';
    const styleSheet = document.createElement('style');
    styleSheet.id = 'custom-cursor-styles';
    styleSheet.textContent = `
      a, button, input, select, textarea, [data-cursor], details summary { cursor: none !important; }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleElementHover);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      document.body.style.cursor = '';
      const el = document.getElementById('custom-cursor-styles');
      if (el) el.remove();
    };
  }, [cursorX, cursorY, isVisible]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" style={{ mixBlendMode: 'difference' }}>
      {/* Ambient glow trail */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            width: isHovering ? 120 : 60,
            height: isHovering ? 120 : 60,
            opacity: isVisible ? 0.12 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-full bg-gold blur-2xl"
        />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            width: isHovering ? 56 : 36,
            height: isHovering ? 56 : 36,
            opacity: isVisible ? 1 : 0,
            borderColor: isHovering ? 'rgba(201, 168, 76, 0.6)' : 'rgba(255, 255, 255, 0.15)',
            scale: isClicking ? 0.8 : 1,
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-full border flex items-center justify-center"
        >
          <AnimatePresence>
            {hoverText && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-[7px] font-futura tracking-[0.2em] uppercase text-white whitespace-nowrap"
              >
                {hoverText}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Inner dot */}
      <motion.div
        style={{ x: cursorX, y: cursorY }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            width: isClicking ? 6 : 4,
            height: isClicking ? 6 : 4,
            opacity: isVisible ? 1 : 0,
            backgroundColor: isHovering ? '#C9A84C' : '#ffffff',
          }}
          transition={{ duration: 0.15 }}
          className="rounded-full"
        />
      </motion.div>
    </div>
  );
};

export default CustomCursor;
