import * as React from "react"
import { cn } from "../../lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  sideOffset?: number
  onClose?: () => void
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const DropdownMenu = ({ children, className }: DropdownMenuProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("relative", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownMenuTrigger) {
            return React.cloneElement(child, { onClick: () => setOpen(!open) } as Partial<DropdownMenuTriggerProps>)
          }
          if (child.type === DropdownMenuContent) {
            return open ? React.cloneElement(child, { onClose: () => setOpen(false) } as Partial<DropdownMenuContentProps>) : null
          }
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, className, asChild, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"
    return (
      <Comp ref={ref} className={cn("cursor-pointer", className)} {...props}>
        {children}
      </Comp>
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, className, sideOffset = 4, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md",
          className
        )}
        style={{ marginTop: sideOffset }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ children, className, disabled, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} 