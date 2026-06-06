import OpenAI from 'openai'

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined
}

export const openai = globalForOpenAI.openai ?? new OpenAI()

if (process.env.NODE_ENV !== 'production') globalForOpenAI.openai = openai
