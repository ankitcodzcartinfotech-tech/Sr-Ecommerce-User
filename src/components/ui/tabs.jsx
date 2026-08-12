"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext({
  value: "",
  onValueChange: () => {},
});

export function Tabs({ defaultValue, value, onValueChange, children, className, ...props }) {
  const [localValue, setLocalValue] = React.useState(defaultValue);
  
  const activeValue = value !== undefined ? value : localValue;
  const setActiveValue = onValueChange !== undefined ? onValueChange : setLocalValue;

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: setActiveValue }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-stone-200/50 p-1 text-stone-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, ...props }) {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={`${cn(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  isActive
    ? "text-[#fffaf3] z-10"
    : "text-[#6d5e57] hover:text-[#241713]",
  className
)} cursor-pointer`}
      {...props}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute inset-0 rounded-full bg-[#b67b45]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function TabsContent({ value, children, className, ...props }) {
  const { value: activeValue } = React.useContext(TabsContext);

  if (activeValue !== value) return null;

  return (
    <div
      className={cn(
        "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
