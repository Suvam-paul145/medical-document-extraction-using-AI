import React from 'react'
import { motion } from 'framer-motion'

interface AlertProps {
  children: React.ReactNode
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  icon?: React.ReactNode
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  children,
  type = 'info',
  title,
  icon,
  className = ''
}) => {
  const typeConfig = {
    success: {
      bg: 'bg-health-50',
      border: 'border-health-200',
      text: 'text-health-800',
      icon: '✓'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '✕'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠'
    },
    info: {
      bg: 'bg-medical-50',
      border: 'border-medical-200',
      text: 'text-medical-800',
      icon: 'ℹ'
    }
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${typeConfig.bg} border ${typeConfig.border} rounded-lg p-4 ${className}`}
    >
      <div className="flex gap-3">
        {icon && <div className="flex-shrink-0 text-lg">{icon}</div>}
        <div className="flex-1">
          {title && <p className={`font-semibold ${typeConfig.text}`}>{title}</p>}
          <p className={`text-sm ${typeConfig.text}`}>{children}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default Alert
