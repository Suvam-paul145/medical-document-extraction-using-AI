import { io, Socket } from 'socket.io-client'
import type { ProcessingState, ExtractionResult, ActivityLogEntry, ProcessingError } from '../types'

class WebSocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  connect() {
    if (this.socket?.connected) return

    // Use relative URL to work with Vite proxy
    const socketUrl = window.location.origin
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    this.socket.on('processing:started', (data: ProcessingState) => {
      this.emit('processing:started', data)
    })

    this.socket.on('processing:stage', (data: ProcessingState) => {
      this.emit('processing:stage', data)
    })

    this.socket.on('processing:activity', (data: ActivityLogEntry) => {
      this.emit('processing:activity', data)
    })

    this.socket.on('processing:item-extracted', (data: any) => {
      this.emit('processing:item-extracted', data)
    })

    this.socket.on('processing:completed', (data: ExtractionResult) => {
      this.emit('processing:completed', data)
    })

    this.socket.on('processing:error', (data: ProcessingError) => {
      this.emit('processing:error', data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  subscribe(documentId: string) {
    if (this.socket) {
      this.socket.emit('subscribe', documentId)
    }
  }

  unsubscribe(documentId: string) {
    if (this.socket) {
      this.socket.emit('unsubscribe', documentId)
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }
}

export const websocketService = new WebSocketService()
