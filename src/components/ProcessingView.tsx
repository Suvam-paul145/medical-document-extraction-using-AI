import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { websocketService } from '../services/websocket'
import { useDocumentStore } from '../store/documentStore'
import Card from './ui/Card'
import ProgressBar from './ui/ProgressBar'
import StepIndicator from './ui/StepIndicator'
import AgentProcessing from './AgentProcessing'
import type { ProcessingStage } from '../types'

const stages = [
  { id: 'queued', label: 'Queued', icon: '⏳' },
  { id: 'ocr', label: 'OCR' },
  { id: 'analyzing', label: 'Analyzing', icon: '🔍' },
  { id: 'extracting', label: 'Extracting', icon: '🤖' },
  { id: 'validating', label: 'Validating', icon: '✓' },
]

export default function ProcessingView() {
  const { processingState, setProcessingState, setExtractionResult, addActivityLog } = useDocumentStore()
  const [itemCounts, setItemCounts] = useState({
    medications: 0,
    diagnoses: 0,
    labResults: 0,
    vitalSigns: 0
  })
  const [extractedItems, setExtractedItems] = useState({
    medications: [],
    diagnoses: [],
    labTests: []
  })

  useEffect(() => {
    const handleStarted = (data: any) => {
      setProcessingState(data)
      addActivityLog({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'info',
        stage: data.stage,
        message: `Processing started: ${data.stage}`
      })
    }

    const handleStageUpdate = (data: any) => {
      setProcessingState(data)
      addActivityLog({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'info',
        stage: data.stage,
        message: data.currentActivity || `Processing ${data.stage}...`
      })
    }

    const handleItemExtracted = (data: any) => {
      const categoryMap: Record<string, keyof typeof itemCounts> = {
        medication: 'medications',
        diagnosis: 'diagnoses',
        labResult: 'labResults',
        vitalSign: 'vitalSigns'
      }

      const stateKey = categoryMap[data.category]
      if (stateKey) {
        setItemCounts((prev) => ({
          ...prev,
          [stateKey]: prev[stateKey] + 1
        }))
      }

      // Store extracted items for display
      if (data.category === 'medication') {
        setExtractedItems((prev) => ({
          ...prev,
          medications: [...prev.medications, data.item]
        }))
      } else if (data.category === 'diagnosis') {
        setExtractedItems((prev) => ({
          ...prev,
          diagnoses: [...prev.diagnoses, data.item]
        }))
      } else if (data.category === 'labResult') {
        setExtractedItems((prev) => ({
          ...prev,
          labTests: [...prev.labTests, data.item]
        }))
      }

      let itemName = ''
      if (data.item.drugName) itemName = data.item.drugName
      else if (data.item.name) itemName = data.item.name
      else if (data.item.condition) itemName = data.item.condition
      else if (data.item.testName) itemName = data.item.testName
      else if (data.item.type) itemName = data.item.type
      else itemName = 'item'

      addActivityLog({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'success',
        stage: 'extracting',
        message: `Extracted ${data.category}: ${itemName}`
      })
    }

    const handleCompleted = (data: any) => {
      setExtractionResult(data)
      addActivityLog({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'success',
        stage: 'completed',
        message: 'Extraction completed successfully!'
      })
    }

    const handleError = (data: any) => {
      addActivityLog({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'error',
        stage: 'failed',
        message: data.message
      })
    }

    websocketService.on('processing:started', handleStarted)
    websocketService.on('processing:stage', handleStageUpdate)
    websocketService.on('processing:item-extracted', handleItemExtracted)
    websocketService.on('processing:completed', handleCompleted)
    websocketService.on('processing:error', handleError)

    return () => {
      websocketService.off('processing:started', handleStarted)
      websocketService.off('processing:stage', handleStageUpdate)
      websocketService.off('processing:item-extracted', handleItemExtracted)
      websocketService.off('processing:completed', handleCompleted)
      websocketService.off('processing:error', handleError)
    }
  }, [])

  const currentStageIndex = stages.findIndex(
    (s) => s.id === processingState?.stage
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          🤖 Agentic Medical Document Analysis
        </h2>
        <p className="text-slate-600">
          AI agent is analyzing and extracting medical information in real-time...
        </p>
      </motion.div>

      {/* Agent Processing Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AgentProcessing
          isProcessing={!['completed', 'error'].includes(processingState?.stage || '')}
          currentStage={{
            stage: processingState?.stage || 'analyzing',
            substage: processingState?.substage,
            message: processingState?.currentActivity || 'Processing...',
            progress: processingState?.progress || 0,
            data: {
              documentType: processingState?.documentType
            }
          }}
          extractedItems={extractedItems}
        />
      </motion.div>

      {/* Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 grid md:grid-cols-3 gap-4"
      >
        {[
          { icon: '⚡', title: 'Fast', desc: 'Typically completes in seconds' },
          { icon: '🎯', title: 'Accurate', desc: 'High-confidence extractions' },
          { icon: '📊', title: 'Detailed', desc: 'Comprehensive medical data' }
        ].map((item) => (
          <motion.div
            key={item.title}
            whileHover={{ y: -3 }}
            className="p-4 rounded-lg border border-slate-200 bg-white text-center"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
            <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
