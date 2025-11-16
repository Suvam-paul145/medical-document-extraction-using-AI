import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import DocumentUpload from './components/DocumentUpload'
import ProcessingView from './components/ProcessingView'
import ResultsView from './components/ResultsView'
import { useDocumentStore } from './store/documentStore'

function App() {
  const { currentDocument, processingState, extractionResult } = useDocumentStore()
  const [hasApiKey, setHasApiKey] = useState(false)
  const [apiKeyUpdated, setApiKeyUpdated] = useState(0)

  useEffect(() => {
    // Check for API key on mount and when updated
    const apiKey = localStorage.getItem('openai_api_key')
    setHasApiKey(!!apiKey)
  }, [apiKeyUpdated])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-medical-50 to-teal-50">
      <Header
        hasApiKey={hasApiKey}
        onApiKeyUpdate={() => setApiKeyUpdated(prev => prev + 1)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!currentDocument && <DocumentUpload />}
        
        {currentDocument && processingState && !extractionResult && (
          <ProcessingView />
        )}
        
        {extractionResult && (
          <ResultsView />
        )}
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 py-8 text-center text-slate-600 text-sm border-t border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-slate-700">MedExtract • Medical Document AI</p>
          <p className="mt-2">© 2024 All rights reserved. Powered by Advanced AI Technology</p>
        </div>
      </motion.footer>
    </div>
  )
}

export default App
