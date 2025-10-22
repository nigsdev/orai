import React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col'
  breakpoint?: 'sm' | 'md' | 'lg'
  gap?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export function ResponsiveStack({ 
  direction = 'row',
  breakpoint = 'md',
  gap = 'md',
  align = 'start',
  justify = 'start',
  className,
  children,
  ...props 
}: ResponsiveStackProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  const baseClasses = [
    'flex',
    direction === 'col' ? 'flex-col' : 'flex-row',
    `sm:flex-${direction}`,
    `md:flex-${direction === 'row' ? 'row' : 'col'}`,
    `lg:flex-${direction === 'row' ? 'row' : 'col'}`,
    gapClasses[gap],
    alignClasses[align],
    justifyClasses[justify]
  ].join(' ')

  return (
    <div
      className={cn(baseClasses, className)}
      {...props}
    >
      {children}
    </div>
  )
}
