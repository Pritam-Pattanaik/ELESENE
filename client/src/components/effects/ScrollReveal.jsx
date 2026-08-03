import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/**
 * ScrollReveal — wraps children and animates them into view on scroll.
 *
 * @param {'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom' | 'blur'} variant
 * @param {number} delay — seconds
 * @param {number} duration — seconds
 * @param {boolean} once — animate only once (default true)
 * @param {number} amount — viewport intersection ratio 0-1
 */
const presets = {
  'fade-up': {
    hidden: { opacity: 0, y: 60, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  'fade-down': {
    hidden: { opacity: 0, y: -60, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  'fade-left': {
    hidden: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0 },
  },
  'fade-right': {
    hidden: { opacity: 0, x: 80 },
    visible: { opacity: 1, x: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(20px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
};

const ScrollReveal = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.8,
  once = true,
  amount = 0.15,
  className = '',
  as = 'div',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });
  const shouldReduceMotion = useReducedMotion();

  const preset = presets[variant] || presets['fade-up'];

  const MotionTag = motion[as] || motion.div;

  const targetHidden = shouldReduceMotion 
    ? { opacity: 0, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }
    : preset.hidden;

  const targetVisible = shouldReduceMotion
    ? { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }
    : preset.visible;

  return (
    <MotionTag
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: targetHidden,
        visible: {
          ...targetVisible,
          transition: {
            duration: shouldReduceMotion ? 0 : duration,
            delay: shouldReduceMotion ? 0 : delay,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </MotionTag>
  );
};

export default ScrollReveal;
