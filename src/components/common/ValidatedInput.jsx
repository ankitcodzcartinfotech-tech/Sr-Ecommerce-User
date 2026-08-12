"use client";

import { useState, useEffect, forwardRef } from "react";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { validateField, sanitizeInput, trimInput } from "@/utils/validation";

const ValidatedInput = forwardRef(({
  label,
  type = "text",
  validationType, // "name", "mobileNumber", etc.
  value,
  onChange,
  onBlur,
  placeholder,
  className = "",
  inputClassName = "",
  maxLength,
  multiline = false,
  rows = 4,
  required = false,
  error: externalError, // Allow external override
  success: externalSuccess,
  touched: externalTouched,
  icon: Icon,
  rightElement,
  variant = "stone", // "stone" | "account" | "dark"
  ...props
}, ref) => {
  const [internalError, setInternalError] = useState("");
  const [internalTouched, setInternalTouched] = useState(false);

  // Sync external touched state if provided
  useEffect(() => {
    if (externalTouched !== undefined) {
      setInternalTouched(externalTouched);
    }
  }, [externalTouched]);

  // Validate when value changes (if touched) to clear errors dynamically
  useEffect(() => {
    if ((internalTouched || externalTouched) && validationType) {
      const err = validateField(validationType, value);
      setInternalError(err);
    }
  }, [value, internalTouched, externalTouched, validationType]);

  const handleChange = (e) => {
    let val = e.target.value;
    
    if (validationType) {
      val = sanitizeInput(validationType, val);
    }
    
    // Call parent onChange with the sanitized event/value
    if (onChange) {
      e.target.value = val;
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    setInternalTouched(true);
    let val = e.target.value;
    
    // Auto trim on blur
    if (validationType) {
      val = trimInput(val);
      if (onChange && val !== e.target.value) {
        e.target.value = val;
        onChange(e);
      }
      
      const err = validateField(validationType, val);
      setInternalError(err);
    }
    
    if (onBlur) onBlur(e);
  };

  const activeError = externalError !== undefined ? externalError : internalError;
  const activeTouched = externalTouched !== undefined ? externalTouched : internalTouched;
  const isInvalid = activeTouched && !!activeError;
  const isValid = activeTouched && !activeError && (value?.toString().length > 0);
  const showSuccess = externalSuccess !== undefined ? externalSuccess : isValid;

  // Resolve variants
  let defaultStateStyles = "";
  if (variant === "stone") {
    defaultStateStyles = "border-stone-200 bg-white focus:border-[var(--gold)] focus:ring-[var(--gold)]/30 placeholder:text-stone-400 text-stone-900";
  } else if (variant === "account") {
    defaultStateStyles = "border-black/10 bg-white text-[#2D2A26] focus:border-[var(--gold)] focus:ring-[var(--gold)]/20 focus:bg-white placeholder:text-[#A39C93]";
  } else if (variant === "dark") {
    defaultStateStyles = "border-white/10 bg-black/20 text-white focus:border-[var(--gold)]/50 focus:ring-[var(--gold)]/10 hover:bg-black/30 focus:bg-black/40 placeholder:text-stone-600";
  }

  const baseInputStyles = `w-full border transition-all outline-none focus:ring-2 ${
    isInvalid
      ? variant === "dark"
        ? "border-rose-500/50 bg-rose-500/10 text-white focus:border-rose-500 focus:ring-rose-500/20 placeholder:text-rose-300/50"
        : "border-rose-400 bg-rose-50 text-rose-900 focus:border-rose-500 focus:ring-rose-300/30 placeholder:text-rose-300"
      : isValid
      ? variant === "dark"
        ? "border-emerald-500/50 bg-emerald-500/10 text-white focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-emerald-300/50"
        : "border-emerald-400 bg-emerald-50 text-emerald-900 focus:border-emerald-500 focus:ring-emerald-300/30 placeholder:text-emerald-300"
      : defaultStateStyles
  }`;

  const InputElement = multiline ? "textarea" : "input";

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={`mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] ${
          variant === 'stone' ? 'text-stone-600' : 
          variant === 'dark' ? 'text-stone-400 pl-1' : 'text-[#736B63]'
        }`}>
          {label} {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex flex-col">
        {Icon && (
          <Icon
            size={18}
            className={`absolute left-4 top-[26px] -translate-y-1/2 ${
              isInvalid ? "text-rose-400" : isValid ? "text-emerald-500" : (variant === 'stone' ? "text-stone-400" : variant === 'dark' ? "text-stone-500" : "text-[#A39C93]")
            }`}
          />
        )}
        <InputElement
          ref={ref}
          type={multiline ? undefined : type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={multiline ? rows : undefined}
          aria-invalid={isInvalid ? "true" : "false"}
          aria-describedby={isInvalid ? `${props.id || 'input'}-error` : undefined}
          className={`${baseInputStyles} ${multiline ? "rounded-[14px] py-4" : "rounded-[14px] h-[52px]"} ${
            Icon ? "pl-12" : "px-4"
          } ${isInvalid || isValid || rightElement ? (rightElement && (isInvalid || isValid) ? "pr-[68px]" : "pr-11") : "pr-4"} text-sm ${inputClassName}`}
          {...props}
        />

        {/* Validation Icons */}
        {!multiline && (isInvalid || isValid) && (
          <div className={`absolute top-[26px] -translate-y-1/2 ${rightElement ? "right-11" : "right-4"}`}>
            {isInvalid ? (
              <X size={16} className="text-rose-500" />
            ) : (
              <Check size={16} className="text-emerald-500" />
            )}
          </div>
        )}

        {/* Custom Right Element (like password toggle) */}
        {rightElement && (
          <div className="absolute right-4 top-[26px] -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {/* Helper text / Error / Character count */}
      <div className="mt-1.5 flex justify-between items-start min-h-[20px]">
        <div className="flex-1">
          <AnimatePresence>
            {isInvalid && activeError && (
              <motion.p
                id={`${props.id || 'input'}-error`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs font-medium text-rose-500"
              >
                {activeError}
              </motion.p>
            )}
            {!isInvalid && showSuccess && typeof showSuccess === 'string' && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs font-medium text-emerald-600"
              >
                {showSuccess}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {maxLength && (
          <div className="text-[10px] font-semibold text-stone-400 ml-2 shrink-0">
            {value?.toString().length || 0} / {maxLength}
          </div>
        )}
      </div>
    </div>
  );
});

ValidatedInput.displayName = "ValidatedInput";
export default ValidatedInput;
