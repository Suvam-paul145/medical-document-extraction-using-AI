import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDocumentStore } from '../store/documentStore'
import { exportData } from '../services/api'
import type { ExtractionResult } from '../types'

export default function ResultsView() {
  const { extractionResult, reset } = useDocumentStore()
  const [activeTab, setActiveTab] = useState<'patient' | 'medications' | 'diagnoses' | 'labs'>('patient')
  const [exporting, setExporting] = useState(false)

  if (!extractionResult) return null

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      setExporting(true)
      const blob = await exportData({
        documentId: extractionResult.documentId,
        format
      })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `extraction_${extractionResult.documentId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Success Banner */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 flex items-center gap-4"
      >
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-green-900">Extraction Complete!</h3>
          <p className="text-sm text-green-700">
            Successfully extracted medical information in {(extractionResult.processingTime / 1000).toFixed(1)}s
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600"
          >
            New Document
          </button>
        </div>
      </motion.div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'patient', label: 'Patient Info', icon: '👤' },
              { id: 'medications', label: 'Medications', icon: '💊', count: extractionResult.medications.length },
              { id: 'diagnoses', label: 'Diagnoses', icon: '🏥', count: extractionResult.diagnoses.length },
              { id: 'labs', label: 'Lab Results', icon: '🧪', count: extractionResult.labResults.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'patient' && extractionResult.patientInfo && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {Object.entries(extractionResult.patientInfo).map(([key, value]) => {
                if (key === 'confidence') return null
                return (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-lg font-medium text-gray-900">{value || 'N/A'}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(extractionResult.patientInfo!.confidence)}`}>
                      {(extractionResult.patientInfo!.confidence * 100).toFixed(0)}% confident
                    </span>
                  </div>
                )
              })}
            </motion.div>
          )}

          {activeTab === 'medications' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {extractionResult.medications.map((med, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{med.drugName}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(med.confidence)}`}>
                      {(med.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Dosage:</span>
                      <span className="ml-2 font-medium">{med.dosage}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Frequency:</span>
                      <span className="ml-2 font-medium">{med.frequency}</span>
                    </div>
                    {med.duration && (
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium">{med.duration}</span>
                      </div>
                    )}
                    {med.route && (
                      <div>
                        <span className="text-gray-500">Route:</span>
                        <span className="ml-2 font-medium">{med.route}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'diagnoses' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {extractionResult.diagnoses.map((diag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{diag.condition}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(diag.confidence)}`}>
                      {(diag.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {diag.icdCode && (
                      <div>
                        <span className="text-gray-500">ICD Code:</span>
                        <span className="ml-2 font-medium">{diag.icdCode}</span>
                      </div>
                    )}
                    {diag.severity && (
                      <div>
                        <span className="text-gray-500">Severity:</span>
                        <span className="ml-2 font-medium">{diag.severity}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'labs' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {extractionResult.labResults.map((lab, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{lab.testName}</h4>
                    <div className="flex items-center gap-2">
                      {lab.status && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          lab.status === 'normal' ? 'bg-green-100 text-green-700' :
                          lab.status === 'abnormal' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {lab.status}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(lab.confidence)}`}>
                        {(lab.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Value:</span>
                      <span className="ml-2 font-medium">{lab.value} {lab.unit}</span>
                    </div>
                    {lab.referenceRange && (
                      <div>
                        <span className="text-gray-500">Reference:</span>
                        <span className="ml-2 font-medium">{lab.referenceRange}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
