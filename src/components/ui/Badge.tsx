import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const variantClass = {
    primary: 'bg-medical-100 text-medical-800',
    success: 'bg-health-100 text-health-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  }[variant]

  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }[size]

  return (
    <span className={`inline-block rounded-full font-medium ${variantClass} ${sizeClass} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
