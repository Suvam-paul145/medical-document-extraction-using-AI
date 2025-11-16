#!/usr/bin/env node

/**
 * Quick test to verify OpenRouter API integration
 */

import fs from 'fs'

// Load .env file manually
const envPath = '.env'
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')
  for (const line of lines) {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=')
      if (key.trim() === 'OPENROUTER_API_KEY') {
        process.env.OPENROUTER_API_KEY = value.trim()
      }
    }
  }
}

const apiKey = process.env.OPENROUTER_API_KEY

if (!apiKey) {
  console.error('❌ OPENROUTER_API_KEY not found in environment variables')
  process.exit(1)
}

console.log('🔍 Testing OpenRouter API integration...')
console.log(`📌 API Key (first 10 chars): ${apiKey.substring(0, 10)}...`)

const testPayload = {
  model: 'openai/gpt-3.5-turbo',
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant that extracts medical data.'
    },
    {
      role: 'user',
      content: 'Extract any key information from: "Patient John Doe, Age 35, Hypertension"'
    }
  ],
  tools: [
    {
      type: 'function',
      function: {
        name: 'extract_patient_info',
        description: 'Extract patient information',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            conditions: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  ],
  tool_choice: 'auto',
  max_tokens: 600,
  temperature: 0.5
}

console.log('\n📡 Sending test request to OpenRouter...')

fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'Medical Document Extraction Test'
  },
  body: JSON.stringify(testPayload)
})
  .then(async (response) => {
    console.log(`✅ Got response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ API Error:', error.error?.message || error)
      process.exit(1)
    }

    const data = await response.json()
    console.log('\n✅ Success! OpenRouter is working!')
    console.log('📋 Response:')
    console.log(JSON.stringify(data.choices[0].message, null, 2))
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Network Error:', error.message)
    process.exit(1)
  })
