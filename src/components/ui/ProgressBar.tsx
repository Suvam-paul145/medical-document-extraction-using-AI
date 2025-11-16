import React from 'react'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'medical' | 'teal' | 'success'
  showLabel?: boolean
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'medical',
  showLabel = false,
  animated = true,
  size = 'md',
  className = ''
}) => {
  const percentage = (value / max) * 100

  const variantClass = {
    medical: 'bg-medical-600',
    teal: 'bg-teal-600',
    success: 'bg-health-600'
  }[variant]

  const sizeClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }[size]

  return (
    <div className={`w-full ${className}`}>
      <div className={`bg-slate-200 rounded-full overflow-hidden ${sizeClass}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`${variantClass} ${sizeClass} rounded-full ${animated ? 'animate-pulse-medical' : ''}`}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-600 mt-1 text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  )
}

export default ProgressBar
