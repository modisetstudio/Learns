import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, errorMessage, helperText, id, required, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
            {required ? <span className="ml-0.5 text-danger-500" aria-hidden="true">*</span> : null}
          </label>
        ) : null}
        <input
          id={inputId}
          type={type}
          ref={ref}
          required={required}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? errorId : helperText ? helperId : undefined}
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            errorMessage && "border-danger-500 focus-visible:ring-danger-500",
            className,
          )}
          {...props}
        />
        {errorMessage ? (
          <p id={errorId} role="alert" className="mt-1.5 text-sm text-danger-600">
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1.5 text-sm text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
