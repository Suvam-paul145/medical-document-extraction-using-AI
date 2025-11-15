import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { websocketService } from '../services/websocket'
import { useDocumentStore } from '../store/documentStore'
import type { ProcessingStage } from '../types'

const stages: { name: ProcessingStage; label: string; icon: string }[] = [
  { name: 'queued', label: 'Queued', icon: '⏳' },
  { name: 'ocr', label: 'OCR Processing', icon: '📄' },
  { name: 'analyzing', label: 'Analyzing', icon: '🔍' },
  { name: 'extracting', label: 'Extracting Data', icon: '🤖' },
  { name: 'validating', label: 'Validating', icon: '✓' },
]

export default function ProcessingView() {
  const { processingState, setProcessingState, setExtractionResult, addActivityLog } = useDocumentStore()
  const [itemCounts, setItemCounts] = useState({ medications: 0, diagnoses: 0, labResults: 0, vitalSigns: 0 })

  useEffect(() => {
    // Listen to WebSocket events
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
      // Map category names to state keys
      const categoryMap: Record<string, keyof typeof itemCounts> = {
        'medication': 'medications',
        'diagnosis': 'diagnoses',
        'labResult': 'labResults',
        'vitalSign': 'vitalSigns'
      }
      
      const stateKey = categoryMap[data.category]
      if (stateKey) {
        setItemCounts(prev => ({
          ...prev,
          [stateKey]: prev[stateKey] + 1
        }))
      }
      
      // Create a readable message
      let itemName = ''
      if (data.item.drugName) itemName = data.item.drugName
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

  const currentStageIndex = stages.findIndex(s => s.name === processingState?.stage)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Processing Document</h2>

        {/* Stage Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {stages.map((stage, index) => (
              <div key={stage.name} className="flex-1 flex items-center">
                <motion.div
                  animate={{
                    scale: currentStageIndex === index ? 1.1 : 1,
                    backgroundColor: currentStageIndex >= index ? '#0ea5e9' : '#e5e7eb'
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold relative"
                >
                  {currentStageIndex > index ? (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </motion.svg>
                  ) : (
                    <span className="text-2xl">{stage.icon}</span>
                  )}
                  
                  {currentStageIndex === index && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 rounded-full bg-primary-500 opacity-25"
                    />
                  )}
                </motion.div>
                
                {index < stages.length - 1 && (
                  <div className="flex-1 h-1 mx-2 bg-gray-200 rounded">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: currentStageIndex > index ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-primary-500 rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            {stages.map(stage => (
              <div key={stage.name} className="flex-1 text-center">
                {stage.label}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-primary-600">{processingState?.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              animate={{ width: `${processingState?.progress || 0}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
            />
          </div>
        </div>

        {/* Item Counts */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Medications', count: itemCounts.medications, icon: '💊', color: 'blue' },
            { label: 'Diagnoses', count: itemCounts.diagnoses, icon: '🏥', color: 'red' },
            { label: 'Lab Results', count: itemCounts.labResults, icon: '🧪', color: 'green' },
            { label: 'Vital Signs', count: itemCounts.vitalSigns, icon: '❤️', color: 'purple' }
          ].map(item => (
            <motion.div
              key={item.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-50 rounded-lg p-4 text-center"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <motion.div
                key={item.count}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-gray-900 mb-1"
              >
                {item.count}
              </motion.div>
              <div className="text-xs text-gray-600">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Current Activity */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="w-5 h-5"
            >
              <svg className="w-full h-full text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </motion.div>
            <span className="text-sm font-medium text-gray-700">Current Activity</span>
          </div>
          <p className="text-sm text-gray-600">{processingState?.currentActivity || 'Processing...'}</p>
        </div>
      </div>
    </motion.div>
  )
}
