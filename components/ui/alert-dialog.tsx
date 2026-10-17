import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AlertDialogContextType {
  open: boolean
  onOpenChange?: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextType>({
  open: false,
})

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function AlertDialog({ open = false, onOpenChange, children }: AlertDialogProps) {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {children}
        </div>
      )}
    </AlertDialogContext.Provider>
  )
}

function AlertDialogTrigger({
  asChild,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) {
  const { onOpenChange } = React.useContext(AlertDialogContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        ;(children.props as any)?.onClick?.(e)
        onOpenChange?.(true)
      },
    })
  }

  return (
    <button type="button" onClick={() => onOpenChange?.(true)} {...props}>
      {children}
    </button>
  )
}

function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function AlertDialogOverlay({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { onOpenChange } = React.useContext(AlertDialogContext)
  return (
    <div
      onClick={() => onOpenChange?.(false)}
      className={cn(
        "fixed inset-0 z-50 bg-black/80 backdrop-blur-xs animate-in fade-in-0 duration-150",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: "default" | "sm" }) {
  return (
    <>
      <AlertDialogOverlay />
      <div
        role="alertdialog"
        className={cn(
          "relative z-50 grid w-full max-w-lg gap-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 sm:max-w-md",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-4",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-xs text-zinc-500 dark:text-zinc-400 font-light leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { onOpenChange } = React.useContext(AlertDialogContext)
  return (
    <Button
      onClick={(e) => {
        onClick?.(e)
        onOpenChange?.(false)
      }}
      className={cn(className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  onClick,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { onOpenChange } = React.useContext(AlertDialogContext)
  return (
    <Button
      variant={variant}
      size={size}
      onClick={(e) => {
        onClick?.(e)
        onOpenChange?.(false)
      }}
      className={cn(className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
