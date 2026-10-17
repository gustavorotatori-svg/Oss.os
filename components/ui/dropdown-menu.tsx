import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType>({
  open: false,
  setOpen: () => {},
})

function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (action: React.SetStateAction<boolean>) => {
      const nextVal = typeof action === "function" ? action(open) : action
      if (onOpenChange) onOpenChange(nextVal)
      if (!isControlled) setUncontrolledOpen(nextVal)
    },
    [isControlled, onOpenChange, open]
  )

  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, setOpen])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuTrigger({
  asChild,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        ;(children.props as any)?.onClick?.(e)
        setOpen((prev) => !prev)
      },
      "aria-expanded": open,
    })
  }

  return (
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      aria-expanded={open}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuContent({
  className,
  align = "end",
  side = "bottom",
  sideOffset = 4,
  alignOffset = 0,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  alignOffset?: number
}) {
  const { open } = React.useContext(DropdownMenuContext)
  if (!open) return null

  const alignClass =
    align === "end"
      ? "right-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-0"

  return (
    <div
      role="menu"
      className={cn(
        "absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 text-zinc-950 dark:text-zinc-50 shadow-xl animate-in fade-in-0 zoom-in-95",
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("py-1", className)} {...props} />
}

function DropdownMenuItem({
  className,
  onClick,
  children,
  inset,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  return (
    <div
      role="menuitem"
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center px-2.5 py-1.5 text-xs font-mono font-medium outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        variant === "destructive" &&
          "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-zinc-200 dark:bg-zinc-800", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "ml-auto text-[10px] tracking-widest text-zinc-400",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  return (
    <div
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center py-1.5 pr-2 pl-8 text-xs font-mono outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <span className="text-green-600 font-bold">✓</span>}
      </span>
      {children}
    </div>
  )
}

function DropdownMenuRadioGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("py-1", className)} {...props} />
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="menuitemradio"
      className={cn(
        "relative flex cursor-pointer select-none items-center py-1.5 pr-2 pl-8 text-xs font-mono outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>
}

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex cursor-pointer items-center px-2 py-1.5 text-xs font-mono hover:bg-zinc-100 dark:hover:bg-zinc-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute left-full top-0 z-50 min-w-[8rem] overflow-hidden rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 shadow-md",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
