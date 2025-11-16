/**
 * OpenRouter API Client for Medical Document Extraction
 * 
 * OpenRouter is a unified API proxy that provides access to multiple AI models
 * with a single interface. This module provides TypeScript interfaces and methods
 * to interact with the OpenRouter API for medical document analysis.
 * 
 * Key features:
 * - Support for multiple models (GPT-4, Claude, Llama, etc.)
 * - Image/document support for analysis
 * - Streaming responses
 * - Better fallback support
 */

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * OpenRouter API request/response interfaces
 */

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system'
  content: OpenRouterMessageContent[]
}

export type OpenRouterMessageContent = 
  | OpenRouterTextContent 
  | OpenRouterImageContent

export interface OpenRouterTextContent {
  type: 'text'
  text: string
}

export interface OpenRouterImageContent {
  type: 'image_url'
  image_url: {
    url: string  // Can be base64 or URL
  }
}

export interface OpenRouterRequestBody {
  model: string  // e.g., "openai/gpt-4", "anthropic/claude-3-opus", "meta-llama/llama-2-70b"
  messages: OpenRouterMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  top_k?: number
  frequency_penalty?: number
  presence_penalty?: number
  repetition_penalty?: number
  tools?: OpenRouterTool[]
  tool_choice?: string | { type: string; function: { name: string } }
  functions?: OpenRouterFunction[]  // Deprecated, use tools instead
}

export interface OpenRouterTool {
  type: 'function'
  function: OpenRouterFunction
}

export interface OpenRouterFunction {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

export interface OpenRouterResponse {
  id: string
  choices: OpenRouterChoice[]
  created: number
  model: string
  object: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
  }
  error?: {
    code: number
    message: string
    param?: string | null
    type: string
  }
}

export interface OpenRouterChoice {
  finish_reason: 'stop' | 'function_call' | 'tool_calls' | null
  message: {
    role: 'assistant'
    content: string | null
    tool_calls?: OpenRouterToolCall[]
    function_call?: OpenRouterFunctionCall
  }
  index: number
}

export interface OpenRouterToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string  // JSON string, needs parsing
  }
}

export interface OpenRouterFunctionCall {
  name: string
  arguments: string  // JSON string, needs parsing
}

export interface OpenRouterConfig {
  apiKey: string
  apiBaseUrl?: string
  siteUrl?: string  // Your application URL (optional)
  siteName?: string  // Your application name (optional)
  timeout?: number
}

export interface OpenRouterOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

// ============================================================================
// COMMON MODELS
// ============================================================================

export const OPENROUTER_MODELS = {
  // OpenAI Models
  GPT_4_TURBO: 'openai/gpt-4-turbo-preview',
  GPT_4: 'openai/gpt-4',
  GPT_3_5_TURBO: 'openai/gpt-3.5-turbo',

  // Anthropic Claude
  CLAUDE_3_OPUS: 'anthropic/claude-3-opus',
  CLAUDE_3_SONNET: 'anthropic/claude-3-sonnet',
  CLAUDE_3_HAIKU: 'anthropic/claude-3-haiku',

  // Meta Llama
  LLAMA_2_70B: 'meta-llama/llama-2-70b-chat',
  LLAMA_2_13B: 'meta-llama/llama-2-13b-chat',
  LLAMA_2_7B: 'meta-llama/llama-2-7b-chat',

  // Mistral
  MISTRAL_7B: 'mistralai/mistral-7b-instruct',
  MISTRAL_MEDIUM: 'mistralai/mistral-medium',

  // Other models
  PALMYRA_X: 'Writer/Palmyra-X',
  SOLAR: 'upstage/solar-0-70b-chat'
} as const

// ============================================================================
// CLIENT CLASS
// ============================================================================

export class OpenRouterClient {
  private apiKey: string
  private apiBaseUrl: string
  private siteUrl?: string
  private siteName?: string
  private timeout: number

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required')
    }

    this.apiKey = config.apiKey
    this.apiBaseUrl = config.apiBaseUrl || 'https://openrouter.ai/api/v1'
    this.siteUrl = config.siteUrl
    this.siteName = config.siteName
    this.timeout = config.timeout || 30000
  }

  /**
   * Make a request to OpenRouter API
   */
  async request(
    body: OpenRouterRequestBody,
    options?: { timeout?: number }
  ): Promise<OpenRouterResponse> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }

    // Add optional headers for ranking on openrouter.ai
    if (this.siteUrl) {
      headers['HTTP-Referer'] = this.siteUrl
    }
    if (this.siteName) {
      headers['X-Title'] = this.siteName
    }

    const controller = new AbortController()
    const timeout = options?.timeout || this.timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json() as OpenRouterResponse
        throw new Error(
          `OpenRouter API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`
        )
      }

      return await response.json() as OpenRouterResponse
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        throw new Error(`OpenRouter request failed: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Chat completion with text messages
   */
  async chat(
    messages: OpenRouterMessage[],
    options?: OpenRouterOptions
  ): Promise<string> {
    const body: OpenRouterRequestBody = {
      model: options?.model || OPENROUTER_MODELS.GPT_4_TURBO,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 2048
    }

    const response = await this.request(body)

    if (response.error) {
      throw new Error(`OpenRouter error: ${response.error.message}`)
    }

    const choice = response.choices[0]
    if (!choice || !choice.message.content) {
      throw new Error('No response content from OpenRouter')
    }

    return choice.message.content
  }

  /**
   * Chat completion with function calling
   */
  async chatWithFunctions(
    messages: OpenRouterMessage[],
    functions: OpenRouterFunction[],
    options?: OpenRouterOptions
  ): Promise<OpenRouterResponse> {
    const body: OpenRouterRequestBody = {
      model: options?.model || OPENROUTER_MODELS.GPT_4_TURBO,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 2048,
      functions,
      tool_choice: 'auto'
    }

    return await this.request(body)
  }

  /**
   * Analyze an image/document with text
   */
  async analyzeImage(
    imageUrl: string,
    prompt: string,
    options?: OpenRouterOptions
  ): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ]

    return await this.chat(messages, options)
  }

  /**
   * Analyze multiple images/documents
   */
  async analyzeMultipleImages(
    imageUrls: string[],
    prompt: string,
    options?: OpenRouterOptions
  ): Promise<string> {
    const content: OpenRouterMessageContent[] = [
      {
        type: 'text',
        text: prompt
      },
      ...imageUrls.map(url => ({
        type: 'image_url' as const,
        image_url: { url }
      }))
    ]

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content
      }
    ]

    return await this.chat(messages, options)
  }

  /**
   * Extract medical data from image using function calling
   */
  async extractMedicalDataFromImage(
    imageUrl: string,
    prompt: string,
    functions: OpenRouterFunction[],
    options?: OpenRouterOptions
  ): Promise<OpenRouterResponse> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ]

    return await this.chatWithFunctions(messages, functions, options)
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert file to base64 for OpenRouter image_url parameter
 */
export async function fileToBase64(filePath: string): Promise<string> {
  const fs = await import('fs/promises')
  const buffer = await fs.readFile(filePath)
  return buffer.toString('base64')
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf'
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

/**
 * Create base64 data URL for image
 */
export async function createImageDataUrl(filePath: string): Promise<string> {
  const base64 = await fileToBase64(filePath)
  const mimeType = getMimeType(filePath)
  return `data:${mimeType};base64,${base64}`
}

/**
 * Parse function call arguments (JSON string to object)
 */
export function parseFunctionArguments(
  argumentsJson: string
): Record<string, any> {
  try {
    return JSON.parse(argumentsJson)
  } catch (error) {
    throw new Error(`Failed to parse function arguments: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================================
// EXAMPLE MEDICAL EXTRACTION FUNCTIONS
// ============================================================================

export const MEDICAL_EXTRACTION_FUNCTIONS: OpenRouterFunction[] = [
  {
    name: 'extract_patient_info',
    description: 'Extract patient demographic information from medical document',
    parameters: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        dateOfBirth: { type: 'string' },
        gender: { type: 'string', enum: ['M', 'F', 'Other'] },
        mrn: { type: 'string' }
      },
      required: ['firstName', 'lastName']
    }
  },
  {
    name: 'extract_medications',
    description: 'Extract medication information from medical document',
    parameters: {
      type: 'object',
      properties: {
        medications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              dosage: { type: 'string' },
              frequency: { type: 'string' },
              route: { type: 'string' }
            },
            required: ['name']
          }
        }
      }
    }
  },
  {
    name: 'extract_diagnoses',
    description: 'Extract diagnoses and conditions from medical document',
    parameters: {
      type: 'object',
      properties: {
        diagnoses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              condition: { type: 'string' },
              icdCode: { type: 'string' },
              severity: { type: 'string', enum: ['mild', 'moderate', 'severe'] }
            },
            required: ['condition']
          }
        }
      }
    }
  }
]
