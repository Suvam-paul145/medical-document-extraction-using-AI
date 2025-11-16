import React from 'react'
import { motion } from 'framer-motion'

interface Step {
  id: string
  label: string
  icon?: React.ReactNode
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  variant?: 'medical' | 'teal'
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  variant = 'medical'
}) => {
  const activeColor = variant === 'medical' ? 'bg-medical-600' : 'bg-teal-600'
  const lightColor = variant === 'medical' ? 'bg-medical-100 text-medical-600' : 'bg-teal-100 text-teal-600'

  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`flex-shrink-0 relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm ${
                index < currentStep
                  ? `${activeColor} text-white`
                  : index === currentStep
                  ? `${activeColor} text-white`
                  : `${lightColor}`
              }`}
            >
              {step.icon || index + 1}
            </motion.div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className={`flex-1 h-1 mx-2 origin-left ${
                  index < currentStep - 1 ? activeColor : 'bg-slate-200'
                }`}
                style={{ transformOrigin: 'left' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between mt-3">
        {steps.map((step, index) => (
          <p
            key={step.id}
            className={`text-xs font-medium ${
              index < currentStep ? 'text-slate-600' : index === currentStep ? 'text-medical-600 font-semibold' : 'text-slate-400'
            }`}
          >
            {step.label}
          </p>
        ))}
      </div>
    </div>
  )
}

export default StepIndicator
