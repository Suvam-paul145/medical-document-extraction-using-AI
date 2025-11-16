import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from './ui/Card'
import Badge from './ui/Badge'
import ProgressBar from './ui/ProgressBar'
import Loader from './ui/Loader'

interface AgentStage {
  stage: string
  substage?: string
  message: string
  progress: number
  data?: any
  documentType?: string
}

interface AgentProcessingProps {
  isProcessing: boolean
  currentStage: AgentStage | null
  extractedItems: {
    medications: any[]
    diagnoses: any[]
    labTests: any[]
  }
}

export default function AgentProcessing({
  isProcessing,
  currentStage,
  extractedItems
}: AgentProcessingProps) {
  const [completedStages, setCompletedStages] = useState<string[]>([])

  useEffect(() => {
    if (currentStage?.stage && !completedStages.includes(currentStage.stage)) {
      if (currentStage.progress >= 90) {
        setCompletedStages([...completedStages, currentStage.stage])
      }
    }
  }, [currentStage?.progress])

  const stages = [
    { id: 'ocr', label: 'Text Extraction', icon: '📄', color: 'medical' },
    { id: 'analyzing', label: 'Document Analysis', icon: '🔍', color: 'teal' },
    { id: 'extracting', label: 'Information Extraction', icon: '✂️', color: 'health' },
    { id: 'validating', label: 'Data Validation', icon: '✓', color: 'medical' },
    { id: 'complete', label: 'Complete', icon: '✨', color: 'teal' }
  ]

  const documentType = currentStage?.documentType

  const documentTypeConfig: Record<string, { icon: string; color: string; label: string }> = {
    prescription: { icon: '💊', color: 'medical', label: 'Prescription' },
    lab_report: { icon: '🧪', color: 'health', label: 'Lab Report' },
    medical_report: { icon: '📋', color: 'teal', label: 'Medical Report' },
    imaging_report: { icon: '🖼️', color: 'medical', label: 'Imaging Report' },
    discharge_summary: { icon: '📤', color: 'health', label: 'Discharge Summary' },
    progress_note: { icon: '📝', color: 'teal', label: 'Progress Note' },
    other: { icon: '📄', color: 'slate', label: 'Document' }
  }

  const docConfig = documentType ? documentTypeConfig[documentType] : documentTypeConfig.other

  return (
    <div className="space-y-6">
      {/* Stage Indicators */}
      <Card variant="elevated" className="bg-gradient-to-r from-slate-50 to-medical-50">
        <div className="space-y-6">
          {/* Progress Bar */}
          <ProgressBar
            value={currentStage?.progress || 0}
            max={100}
            showLabel={true}
            variant="medical"
          />

          {/* Document Type Badge */}
          {documentType && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-2xl">{docConfig.icon}</span>
              <Badge variant="info">{docConfig.label}</Badge>
              {currentStage?.data?.confidence && (
                <span className="text-xs text-slate-500">
                  Confidence: {Math.round(currentStage.data.confidence * 100)}%
                </span>
              )}
            </motion.div>
          )}

          {/* Stage Timeline */}
          <div className="space-y-3">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                {/* Stage Circle */}
                <motion.div
                  animate={{
                    scale: currentStage?.stage === stage.id ? 1.1 : 1,
                    backgroundColor:
                      completedStages.includes(stage.id)
                        ? '#16a34a'
                        : currentStage?.stage === stage.id
                          ? 'var(--color-medical-600)'
                          : '#e2e8f0'
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                >
                  {completedStages.includes(stage.id) ? '✓' : index + 1}
                </motion.div>

                {/* Stage Info */}
                <div className="flex-1 min-w-0">
                  <motion.div
                    animate={{
                      fontWeight: currentStage?.stage === stage.id ? 600 : 500,
                      color:
                        currentStage?.stage === stage.id
                          ? '#0d9e8e'
                          : '#64748b'
                    }}
                    className="text-sm truncate"
                  >
                    {stage.label}
                  </motion.div>

                  {/* Substage info */}
                  <AnimatePresence>
                    {currentStage?.stage === stage.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-slate-500 mt-1 flex items-center gap-2"
                      >
                        <Loader size="sm" variant="medical" />
                        {currentStage?.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Substage timeline */}
                  {currentStage?.stage === stage.id && stage.id !== 'complete' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1 mt-2 text-xs"
                    >
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="inline-block w-1.5 h-1.5 rounded-full bg-medical-600"
                      />
                      <span className="text-slate-400">
                        Processing... {currentStage.progress}%
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Connector Line */}
                {index < stages.length - 1 && (
                  <motion.div
                    animate={{
                      backgroundColor:
                        completedStages.includes(stage.id)
                          ? '#16a34a'
                          : '#e2e8f0'
                    }}
                    className="w-0.5 h-8 -ml-5 -mr-3"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Extracted Items Real-time Display */}
      <AnimatePresence>
        {(extractedItems.medications.length > 0 ||
          extractedItems.diagnoses.length > 0 ||
          extractedItems.labTests.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <span>📊 Extracted Information</span>
              <Badge variant="success">Live Update</Badge>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Medications */}
              {extractedItems.medications.length > 0 && (
                <Card variant="bordered" className="border-medical-200">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">💊</span>
                      <h4 className="font-semibold text-slate-700">Medications</h4>
                      <Badge variant="info">{extractedItems.medications.length}</Badge>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {extractedItems.medications.map((med, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-2 bg-medical-50 rounded text-sm border-l-2 border-medical-400"
                        >
                          <div className="font-medium text-slate-700">
                            {med.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {med.dosage} {med.unit} • {med.frequency}
                          </div>
                          {med.confidence && (
                            <div className="text-xs text-medical-600 mt-1">
                              Confidence: {Math.round(med.confidence * 100)}%
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </Card>
              )}

              {/* Diagnoses */}
              {extractedItems.diagnoses.length > 0 && (
                <Card variant="bordered" className="border-teal-200">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🔍</span>
                      <h4 className="font-semibold text-slate-700">Diagnoses</h4>
                      <Badge variant="warning">{extractedItems.diagnoses.length}</Badge>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {extractedItems.diagnoses.map((diag, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-2 bg-teal-50 rounded text-sm border-l-2 border-teal-400"
                        >
                          <div className="font-medium text-slate-700">
                            {diag.condition || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-500">
                            Status: {diag.status} • Severity: {diag.severity}
                          </div>
                          {diag.confidence && (
                            <div className="text-xs text-teal-600 mt-1">
                              Confidence: {Math.round(diag.confidence * 100)}%
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </Card>
              )}

              {/* Lab Results */}
              {extractedItems.labTests.length > 0 && (
                <Card variant="bordered" className="border-health-200">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🧪</span>
                      <h4 className="font-semibold text-slate-700">Lab Results</h4>
                      <Badge variant="success">{extractedItems.labTests.length}</Badge>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {extractedItems.labTests.map((lab, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-2 bg-health-50 rounded text-sm border-l-2 border-health-400"
                        >
                          <div className="font-medium text-slate-700">
                            {lab.testName || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {lab.value} {lab.unit} • {lab.resultStatus}
                          </div>
                          {lab.confidence && (
                            <div className="text-xs text-health-600 mt-1">
                              Confidence: {Math.round(lab.confidence * 100)}%
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Thinking Animation */}
      {isProcessing && !currentStage?.stage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-8"
        >
          <Loader variant="medical" />
          <span className="ml-3 text-slate-600">Agent is thinking...</span>
        </motion.div>
      )}
    </div>
  )
}
