import { ButtonHTMLAttributes, ReactElement, ReactNode, cloneElement } from "react";

type Variant = "primary" | "secondary" | "whatsapp" | "ghost" | "outline";
type Size = "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
};

const base =
  "inline-flex items-center justify-center rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:outline-primary shadow-sm font-bold",
  secondary:
    "border-2 border-primary text-primary hover:bg-primary-50 active:bg-primary-100 focus-visible:outline-primary font-bold",
  whatsapp:
    "bg-whatsapp text-white hover:bg-whatsapp-600 active:bg-whatsapp-700 focus-visible:outline-whatsapp shadow-sm",
  ghost: "text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-slate-400",
  outline: "border-2 border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-slate-400",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export function Button({ children, variant = "primary", size = "md", className = "", asChild, ...props }: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (asChild && typeof children === "object" && children) {
    const child = children as ReactElement<any>;
    return cloneElement(child, {
      className: `${classes} ${(child.props as any).className ?? ""}`.trim(),
    });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
