"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogContext = React.createContext({
  open: false,
  onOpenChange: () => {},
});

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, asChild, ...props }) {
  const { onOpenChange } = React.useContext(DialogContext);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e);
        onOpenChange(true);
      },
      ...props
    });
  }

  return (
    <button onClick={() => onOpenChange(true)} {...props} className="cursor-pointer">
      {children}
    </button>
  );
}

export function DialogPortal({ children }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

export function DialogOverlay({ className, ...props }) {
  const { onOpenChange } = React.useContext(DialogContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`${cn(
  "fixed inset-0 z-50 bg-black/60 backdrop-blur-md",
  className
)} cursor-pointer`}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}

export function DialogContent({ children, className, hideCloseButton, ...props }) {
  const { open, onOpenChange } = React.useContext(DialogContext);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <DialogPortal>
          <DialogOverlay />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto no-scrollbar pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className={cn(
                "relative w-full max-w-lg overflow-hidden rounded-3xl border border-stone-200/50 bg-[#fffaf3] p-6 shadow-2xl pointer-events-auto",
                "max-h-[92vh] flex flex-col md:max-h-[85vh]",
                className
              )}
              {...props}
            >
              {!hideCloseButton && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute right-4 top-4 z-50 rounded-full p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </DialogPortal>
      )}
    </AnimatePresence>
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left mb-4 shrink-0",
        className
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <h2
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight font-serif text-[#241713]",
        className
      )}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-sm text-[#6d5e57]", className)}
      {...props}
    />
  );
}
