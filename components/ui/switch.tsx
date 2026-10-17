import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: "sm" | "default"
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, size = "default", disabled, ...props }, ref) => {
    const isSm = size === "sm"
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        data-state={checked ? "checked" : "unchecked"}
        onClick={() => {
          if (!disabled && onCheckedChange) {
            onCheckedChange(!checked)
          }
        }}
        ref={ref}
        className={cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isSm ? "h-4 w-7" : "h-5 w-9",
          checked ? "bg-green-600" : "bg-zinc-300 dark:bg-zinc-700",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
            isSm ? "h-3 w-3" : "h-4 w-4",
            checked ? (isSm ? "translate-x-3" : "translate-x-4") : "translate-x-0"
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
