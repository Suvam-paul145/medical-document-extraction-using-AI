import { useState } from 'react'
import { motion } from 'framer-motion'
import SettingsModal from './SettingsModal.tsx'

interface HeaderProps {
  hasApiKey?: boolean
  onApiKeyUpdate?: () => void
}

export default function Header({ hasApiKey = false, onApiKeyUpdate }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false)

  const handleApiKeySet = () => {
    setShowSettings(false)
    onApiKeyUpdate?.()
  }

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-gradient-to-r from-white to-slate-50 border-b border-slate-200 shadow-medical-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-medical-600 to-teal-600 rounded-lg flex items-center justify-center shadow-medical">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v-3m0 0l-3 3m3-3l3 3"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-medical-700 to-teal-700 bg-clip-text text-transparent">
                  MedExtract
                </h1>
                <p className="text-xs text-slate-500">Clinical Document AI</p>
              </div>
            </motion.div>

            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden md:block flex-1 text-center"
            >
              <p className="text-sm text-slate-600 font-medium">
                Medical Document Extraction with AI
              </p>
            </motion.div>

            {/* Actions Section */}
            <div className="flex items-center gap-4">
              {/* API Status */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    hasApiKey ? 'bg-health-500 animate-pulse' : 'bg-alert-warning'
                  }`}
                />
                <span className="text-xs font-medium text-slate-700">
                  {hasApiKey ? 'API Active' : 'No API Key'}
                </span>
              </motion.div>

              {/* Settings Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Settings"
              >
                <svg
                  className="w-5 h-5 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onApiKeySet={handleApiKeySet}
        />
      )}
    </>
  )
}
