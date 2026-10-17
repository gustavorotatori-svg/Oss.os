import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextType>({
  open: false,
  setOpen: () => {},
})

function TooltipProvider({ children }: { children?: React.ReactNode; delay?: number }) {
  return <>{children}</>
}

function Tooltip({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = React.useCallback(
    (val: boolean) => {
      if (onOpenChange) onOpenChange(val)
      else setUncontrolledOpen(val)
    },
    [onOpenChange]
  )

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-flex items-center group/tooltip">
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

function TooltipTrigger({
  asChild = false,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) {
  const { setOpen } = React.useContext(TooltipContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: (e: any) => {
        setOpen(true)
        ;(children.props as any)?.onMouseEnter?.(e)
      },
      onMouseLeave: (e: any) => {
        setOpen(false)
        ;(children.props as any)?.onMouseLeave?.(e)
      },
      onFocus: (e: any) => {
        setOpen(true)
        ;(children.props as any)?.onFocus?.(e)
      },
      onBlur: (e: any) => {
        setOpen(false)
        ;(children.props as any)?.onBlur?.(e)
      },
    })
  }

  return (
    <span
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className={className}
      {...props}
    >
      {children}
    </span>
  )
}

function TooltipContent({
  className,
  side = "top",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  align?: string
  alignOffset?: number
}) {
  const { open } = React.useContext(TooltipContext)

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side] || "bottom-full left-1/2 -translate-x-1/2 mb-2"

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-[9999] whitespace-nowrap bg-black text-white border border-zinc-800 text-[10px] font-mono font-medium px-2 py-1 shadow-xl transition-all duration-150",
        positionClasses,
        open
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none hidden group-hover/tooltip:inline-flex group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
