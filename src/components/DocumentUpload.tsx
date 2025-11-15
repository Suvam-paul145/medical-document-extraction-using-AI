import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { uploadDocument } from '../services/api'
import { websocketService } from '../services/websocket'
import { useDocumentStore } from '../store/documentStore'

export default function DocumentUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const { setCurrentDocument, setProcessingState } = useDocumentStore()

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

      // Upload file
      const response = await uploadDocument(file, (progress) => {
        setUploadProgress(progress)
      })

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
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Medical Document</h2>
        <p className="text-gray-600 mb-6">
          Upload a medical report or prescription to extract important information
        </p>

        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={{
            scale: isDragging ? 1.02 : 1,
            borderColor: isDragging ? '#0ea5e9' : '#e5e7eb'
          }}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragging ? 'bg-blue-50' : 'bg-gray-50'
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
          
          <label htmlFor="file-upload" className="cursor-pointer">
            <motion.div
              animate={{ scale: isDragging ? 1.1 : 1 }}
              className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4"
            >
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </motion.div>
            
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragging ? 'Drop your file here' : 'Drag and drop your file here'}
            </p>
            <p className="text-sm text-gray-600 mb-4">or click to browse</p>
            <p className="text-xs text-gray-500">
              Supported formats: PDF, JPEG, PNG • Max size: 10MB
            </p>
          </label>
        </motion.div>

        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm font-medium text-primary-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-primary-500"
              />
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Upload Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
