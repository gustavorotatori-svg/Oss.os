import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
  value?: string
  onValueChange?: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType>({})

export type TabsProps = React.ComponentProps<"div"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue

  const handleValueChange = React.useCallback(
    (val: string) => {
      if (onValueChange) onValueChange(val)
      else setUncontrolledValue(val)
    },
    [onValueChange]
  )

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export type TabsListProps = React.ComponentProps<"div">

function TabsList({
  className,
  children,
  ...props
}: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-none bg-zinc-100 dark:bg-zinc-900 p-1 text-zinc-500 dark:text-zinc-400",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type TabsTriggerProps = React.ComponentProps<"button"> & {
  value: string
}

function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  const isActive = context.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context.onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs font-mono font-bold uppercase transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        isActive
          ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
          : "hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export type TabsContentProps = React.ComponentProps<"div"> & {
  value: string
}

function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const context = React.useContext(TabsContext)
  if (context.value !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn("mt-2 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
