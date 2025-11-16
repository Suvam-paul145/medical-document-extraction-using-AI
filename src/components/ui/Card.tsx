import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  variant?: 'default' | 'bordered' | 'elevated'
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  variant = 'default'
}) => {
  const baseClass = 'rounded-xl transition-all duration-300'
  
  const variantClass = {
    default: 'bg-white shadow-medical',
    bordered: 'bg-white border border-slate-200 shadow-medical-sm',
    elevated: 'bg-white shadow-medical-lg'
  }[variant]

  const hoverClass = hoverable ? 'hover:shadow-medical-lg hover:-translate-y-1' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${baseClass} ${variantClass} ${hoverClass} ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default Card
