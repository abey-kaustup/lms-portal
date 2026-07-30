'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export interface UseDropdownOptions {
  onClose?: () => void;
  closeOnRouteChange?: boolean;
  closeOnEscape?: boolean;
}

export function useDropdown<T extends HTMLElement = HTMLDivElement>(
  options: UseDropdownOptions = {}
) {
  const { onClose, closeOnRouteChange = true, closeOnEscape = true } = options;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<T>(null);
  const pathname = usePathname();

  const close = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const open = () => setIsOpen(true);
  const toggle = () => setIsOpen((prev) => !prev);

  // Close on route change
  useEffect(() => {
    if (closeOnRouteChange && isOpen) {
      setIsOpen(false);
      if (onClose) onClose();
    }
  }, [pathname, closeOnRouteChange]);

  // Close on click outside and Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEscape]);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
    containerRef,
  };
}
