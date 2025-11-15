import { create } from 'zustand'
import type { DocumentMetadata, ProcessingState, ExtractionResult, ActivityLogEntry } from '../types'

interface DocumentStore {
  currentDocument: DocumentMetadata | null
  processingState: ProcessingState | null
  extractionResult: ExtractionResult | null
  activityLog: ActivityLogEntry[]
  
  setCurrentDocument: (doc: DocumentMetadata) => void
  setProcessingState: (state: ProcessingState) => void
  setExtractionResult: (result: ExtractionResult) => void
  addActivityLog: (entry: ActivityLogEntry) => void
  clearActivityLog: () => void
  reset: () => void
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  currentDocument: null,
  processingState: null,
  extractionResult: null,
  activityLog: [],

  setCurrentDocument: (doc) => set({ currentDocument: doc }),
  
  setProcessingState: (state) => set({ processingState: state }),
  
  setExtractionResult: (result) => set({ extractionResult: result }),
  
  addActivityLog: (entry) => set((state) => ({
    activityLog: [...state.activityLog, entry]
  })),
  
  clearActivityLog: () => set({ activityLog: [] }),
  
  reset: () => set({
    currentDocument: null,
    processingState: null,
    extractionResult: null,
    activityLog: []
  })
}))
