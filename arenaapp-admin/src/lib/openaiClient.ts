// src/lib/openaiClient.ts
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY
const modelFromEnv = process.env.OPENAI_MODEL

if (!apiKey) {
  throw new Error('OPENAI_API_KEY no está definida en las variables de entorno')
}

export const openai = new OpenAI({
  apiKey,
})

export const OPENAI_MODEL = modelFromEnv || 'gpt-4o-mini'
