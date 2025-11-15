import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import uploadRoutes from './routes/upload.js'
import exportRoutes from './routes/export.js'
import { initializeQueue } from './services/queue.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'))

// Make io available to routes
app.set('io', io)

// Routes
app.use('/api/documents', uploadRoutes)
app.use('/api/export', exportRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('subscribe', (documentId) => {
    socket.join(`document:${documentId}`)
    console.log(`Client ${socket.id} subscribed to document ${documentId}`)
  })

  socket.on('unsubscribe', (documentId) => {
    socket.leave(`document:${documentId}`)
    console.log(`Client ${socket.id} unsubscribed from document ${documentId}`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Initialize job queue
initializeQueue(io)

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 WebSocket server ready`)
})

export { io }
