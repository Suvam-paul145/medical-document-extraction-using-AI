import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './ui/Button'
import Alert from './ui/Alert'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onApiKeySet: () => void
}

export default function SettingsModal({ isOpen, onClose, onApiKeySet }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSaveApiKey = () => {
    setError(null)
    setSuccess(false)

    if (!apiKey.trim()) {
      setError('Please enter a valid API key')
      return
    }

    if (!apiKey.startsWith('sk-')) {
      setError('Invalid OpenAI API key format. Should start with "sk-"')
      return
    }

    setLoading(true)

    // Save to localStorage for now (in production, use secure backend)
    setTimeout(() => {
      try {
        localStorage.setItem('openai_api_key', apiKey)
        setSuccess(true)
        setApiKey('')
        setShowApiKey(false)
        
        setTimeout(() => {
          onApiKeySet()
        }, 1000)
      } catch (err) {
        setError('Failed to save API key. Please try again.')
      } finally {
        setLoading(false)
      }
    }, 500)
  }

  const hasApiKey = localStorage.getItem('openai_api_key') !== null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -50 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-medical-lg p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
              </div>

              {/* API Key Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">OpenAI API Key</h3>

                {/* Status */}
                {hasApiKey && !success && (
                  <div className="mb-4 p-3 bg-health-50 border border-health-200 rounded-lg flex items-center gap-2">
                    <span className="text-health-600 text-sm">✓ API key is configured</span>
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert type="error" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Success Alert */}
                {success && (
                  <Alert type="success" className="mb-4">
                    API key saved successfully!
                  </Alert>
                )}

                {/* Input Field */}
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-medical-600 hover:underline font-medium"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>

              {/* Info Box */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">⚠️ Security Notice:</span> Your API key is stored locally in your browser. Never share your key with anyone.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  loading={loading}
                  onClick={handleSaveApiKey}
                >
                  Save API Key
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
