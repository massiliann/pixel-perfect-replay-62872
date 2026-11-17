import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "ghost" | "outline"; size?: "default" | "icon" };
export function buttonVariants({ variant = "default", size = "default" }: Pick<ButtonProps, "variant" | "size"> = {}) {
  return cn("inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40", variant === "default" ? "bg-primary text-primary-foreground hover:bg-primary/85" : variant === "outline" ? "border border-border bg-card text-foreground hover:border-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground", size === "icon" ? "h-11 w-11" : "min-h-11 px-4 py-2 text-sm");
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "default", size = "default", type = "button", ...props }, ref) {
  return <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});