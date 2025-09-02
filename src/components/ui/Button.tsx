import * as React from "react";
import { cn } from "@/utils/formatters";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  icon?: React.ReactNode;
}

const variantClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "bg-transparent hover:bg-accent text-accent-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
  icon: "h-10 w-10 p-2 flex items-center justify-center",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "md", icon, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "w-full rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {icon && <span className="mr-2 flex items-center">{icon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// Usage Example:
// <Button variant="default" size="lg" icon={<IconComponent />}>Enroll Officer</Button>
