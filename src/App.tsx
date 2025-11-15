import { useState } from 'react'
import DocumentUpload from './components/DocumentUpload'
import ProcessingView from './components/ProcessingView'
import ResultsView from './components/ResultsView'
import { useDocumentStore } from './store/documentStore'

function App() {
  const { currentDocument, processingState, extractionResult } = useDocumentStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medical Document Extraction</h1>
              <p className="text-sm text-gray-600">AI-powered medical information extraction</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!currentDocument && <DocumentUpload />}
        
        {currentDocument && processingState && !extractionResult && (
          <ProcessingView />
        )}
        
        {extractionResult && (
          <ResultsView />
        )}
      </main>

      <footer className="mt-12 py-6 text-center text-gray-600 text-sm">
        <p>Medical Document Extraction System v1.0</p>
        <p className="mt-1">Powered by AI • Built with React & TypeScript</p>
      </footer>
    </div>
  )
}

export default App
