import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { uploadDocument } from '../services/api'
import { websocketService } from '../services/websocket'
import { useDocumentStore } from '../store/documentStore'
import Button from './ui/Button'
import Alert from './ui/Alert'
import Card from './ui/Card'

export default function DocumentUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [apiKeyError, setApiKeyError] = useState(false)
  
  const { setCurrentDocument, setProcessingState } = useDocumentStore()

  const checkApiKey = useCallback(() => {
    const apiKey = localStorage.getItem('openai_api_key')
    if (!apiKey) {
      setApiKeyError(true)
      setError('Please configure your OpenAI API key in settings first.')
      return false
    }
    setApiKeyError(false)
    return true
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFileUpload(files[0])
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    setError(null)
    
    // Check API key first
    if (!checkApiKey()) {
      return
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only PDF, JPEG, and PNG files are allowed.')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      // Connect WebSocket first
      websocketService.connect()

      // Upload file with API key
      const response = await uploadDocument(file, (progress) => {
        setUploadProgress(progress)
      }, localStorage.getItem('openai_api_key')!)

      if (response.success) {
        // Set document metadata
        setCurrentDocument({
          id: response.documentId,
          filename: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          status: 'queued'
        })

        // Wait a bit for WebSocket to connect, then subscribe
        setTimeout(() => {
          websocketService.subscribe(response.documentId)
        }, 500)

        // Set initial processing state
        setProcessingState({
          documentId: response.documentId,
          stage: 'queued',
          progress: 0
        })
        
        setUploading(false)
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.response?.data?.error?.message || 'Failed to upload document')
      setUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-8"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-medical-100 to-teal-100 rounded-2xl mb-4">
          <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Upload Medical Document</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Extract medical information from prescriptions, lab reports, and clinical documents using advanced AI
        </p>
      </motion.div>

      {/* Error Alerts */}
      {error && (
        <Alert
          type={apiKeyError ? 'error' : 'error'}
          icon={apiKeyError ? '🔐' : '⚠️'}
          title={apiKeyError ? 'API Key Required' : 'Upload Error'}
          className="mb-6"
        >
          {error}
          {apiKeyError && (
            <p className="mt-2 text-xs">
              Click the settings button in the header to configure your OpenAI API key.
            </p>
          )}
        </Alert>
      )}

      {/* Upload Card */}
      <Card className="overflow-hidden" variant="elevated">
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={{
            scale: isDragging ? 1.02 : 1,
            backgroundColor: isDragging ? '#f0fdfa' : '#ffffff'
          }}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            isDragging
              ? 'border-teal-500 bg-teal-50'
              : 'border-slate-200'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          
          <label htmlFor="file-upload" className="cursor-pointer block">
            <motion.div
              animate={{ scale: isDragging ? 1.1 : 1, y: isDragging ? -5 : 0 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-100 to-medical-100 rounded-2xl flex items-center justify-center mb-4"
            >
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </motion.div>
            
            <p className="text-lg font-semibold text-slate-900 mb-2">
              {isDragging ? '📥 Drop your file here' : '📤 Drag and drop your file'}
            </p>
            <p className="text-sm text-slate-600 mb-4">or click to select from your device</p>
            <p className="text-xs text-slate-500 space-x-2">
              <span>📄 PDF</span>
              <span>•</span>
              <span>🖼️ JPEG</span>
              <span>•</span>
              <span>🖼️ PNG</span>
              <span>•</span>
              <span>Max 10MB</span>
            </p>
          </label>

          {/* Progress Bar */}
          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-slate-200"
            >
              <div className="mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Uploading...</span>
                  <span className="text-sm font-medium text-teal-600">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-medical-600 to-teal-600"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Features */}
        <div className="px-6 py-6 bg-slate-50 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-700 mb-3">SUPPORTED EXTRACTIONS</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '👤', label: 'Patient Info' },
              { icon: '💊', label: 'Medications' },
              { icon: '🏥', label: 'Diagnoses' },
              { icon: '🧪', label: 'Lab Results' }
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-slate-600 text-center font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 grid md:grid-cols-3 gap-4"
      >
        {[
          {
            icon: '⚡',
            title: 'Fast Processing',
            desc: 'AI-powered extraction in seconds'
          },
          {
            icon: '🔒',
            title: 'Secure',
            desc: 'Your data is processed securely'
          },
          {
            icon: '🎯',
            title: 'Accurate',
            desc: 'High accuracy with confidence scores'
          }
        ].map((item) => (
          <motion.div
            key={item.title}
            whileHover={{ y: -5 }}
            className="p-4 rounded-lg border border-slate-200 bg-white text-center"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="font-semibold text-slate-900 text-sm mb-1">{item.title}</p>
            <p className="text-xs text-slate-600">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
