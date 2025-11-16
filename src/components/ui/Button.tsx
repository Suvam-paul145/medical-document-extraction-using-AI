import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  title?: string
  id?: string
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  onClick,
  type = 'button',
  title,
  id
}) => {
  const baseClass = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClass = {
    primary: 'bg-medical-600 text-white hover:bg-medical-700 focus:ring-medical-500 disabled:bg-slate-400',
    secondary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 disabled:bg-slate-400',
    outline: 'border-2 border-medical-600 text-medical-600 hover:bg-medical-50 focus:ring-medical-500',
    ghost: 'text-medical-600 hover:bg-medical-50',
    danger: 'bg-alert-error text-white hover:bg-alert-critical focus:ring-alert-error disabled:bg-slate-400'
  }[variant]

  const sizeClass = {
    sm: 'px-3 py-1.5 text-sm gap-2',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-3'
  }[size]

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      title={title}
      id={id}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      {!loading && icon && icon}
      {children}
    </motion.button>
  )
}

export default Button
