import React from 'react'
import { motion } from 'framer-motion'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'medical' | 'teal'
  label?: string
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'medical',
  label
}) => {
  const sizeClass = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }[size]

  const variantColor = {
    medical: 'border-medical-600 border-t-medical-200',
    teal: 'border-teal-600 border-t-teal-200'
  }[variant]

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClass} border-4 rounded-full ${variantColor}`}
      />
      {label && (
        <p className="text-sm text-slate-600">{label}</p>
      )}
    </div>
  )
}

export default Loader
