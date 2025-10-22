import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  variant?: 'default' | 'glass' | 'neon' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  active?: boolean
}

export function IconButton({ 
  icon: Icon, 
  variant = 'default', 
  size = 'md', 
  active = false,
  className, 
  ...props 
}: IconButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    default: "bg-accent-blue-500/20 hover:bg-accent-blue-500/30 text-accent-blue-500 hover:glow-accent-hover",
    glass: "floating-glass text-white hover:glow-accent-hover",
    neon: "neon-button text-white",
    ghost: "bg-transparent hover:bg-white/10 text-white"
  }
  
  const sizes = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3"
  }

  const activeClasses = active ? "bg-accent-blue-500/30 text-accent-blue-400" : ""

  return (
    <button
      className={cn(
        baseClasses, 
        variants[variant], 
        sizes[size], 
        activeClasses,
        className
      )}
      {...props}
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}
