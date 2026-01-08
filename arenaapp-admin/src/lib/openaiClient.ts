// src/lib/openaiClient.ts
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY
const modelFromEnv = process.env.OPENAI_MODEL

export const OPENAI_MODEL = modelFromEnv || 'gpt-4o-mini'

let openaiInstance: OpenAI | null = null

export function getOpenAIClient() {
  if (openaiInstance) return openaiInstance

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY no está definida en las variables de entorno'
    )
  }

  openaiInstance = new OpenAI({
    apiKey,
  })
  return openaiInstance
}
