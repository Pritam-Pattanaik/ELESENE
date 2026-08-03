import { useEffect, useRef } from 'react';

/**
 * Custom hook for trapping focus inside active modal dialogs and drawers.
 * Handles Tab navigation wrapping, ESC key dismissal, and restoring focus on unmount.
 * 
 * @param {boolean} isOpen - Whether the container is currently open/active
 * @param {Function} [onClose] - Optional callback when Escape key is pressed
 * @returns {React.RefObject} - Ref to attach to the container element
 */
export const useFocusTrap = (isOpen, onClose) => {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remember previously focused element to restore upon closure
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Find all focusable elements inside container
    const getFocusables = () => {
      return Array.from(
        container.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);
    };

    const focusables = getFocusables();
    if (focusables.length > 0) {
      focusables[0].focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) {
          e.stopPropagation();
          onClose();
        }
        return;
      }

      if (e.key !== 'Tab') return;

      const currentFocusables = getFocusables();
      if (currentFocusables.length === 0) return;

      const firstEl = currentFocusables[0];
      const lastEl = currentFocusables[currentFocusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl || !container.contains(document.activeElement)) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl || !container.contains(document.activeElement)) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
};

export default useFocusTrap;
