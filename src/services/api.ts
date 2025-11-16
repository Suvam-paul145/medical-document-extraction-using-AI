import axios from 'axios'
import type { UploadDocumentResponse, ExportDataRequest } from '../types'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export async function uploadDocument(file: File, onProgress?: (progress: number) => void, apiKey?: string): Promise<UploadDocumentResponse> {
  const formData = new FormData()
  formData.append('document', file)
  if (apiKey) {
    formData.append('apiKey', apiKey)
  }

  const response = await api.post<UploadDocumentResponse>('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(apiKey && { 'X-API-Key': apiKey })
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    }
  })

  return response.data
}

export async function getExtractionResult(documentId: string) {
  const response = await api.get(`/documents/${documentId}/result`)
  return response.data
}

export async function exportData(request: ExportDataRequest): Promise<Blob> {
  const response = await api.get(`/export/${request.documentId}`, {
    params: { format: request.format },
    responseType: 'blob'
  })
  return response.data
}

export default api
