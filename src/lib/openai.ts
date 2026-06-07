import OpenAI from 'openai'

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined
  openaiConnectionTest: Promise<boolean> | undefined
}

export const openai = globalForOpenAI.openai ?? new OpenAI()

if (process.env.NODE_ENV !== 'production') globalForOpenAI.openai = openai

export async function testarConexaoOpenAI() {
  if (globalForOpenAI.openaiConnectionTest) {
    return globalForOpenAI.openaiConnectionTest
  }

  globalForOpenAI.openaiConnectionTest = openai.models
    .list()
    .then(() => {
      console.log('OpenAI: chave funcionando.')
      return true
    })
    .catch((error: unknown) => {
      console.error('OpenAI: falha ao validar chave.', extractOpenAIErrorMessage(error))
      return false
    })

  return globalForOpenAI.openaiConnectionTest
}

export function extractOpenAIErrorMessage(error: unknown) {
  const typedError = error as {
    message?: string
    error?: {
      message?: string
      code?: string
      type?: string
    }
    response?: {
      data?: {
        error?: {
          message?: string
          code?: string
          type?: string
        }
        message?: string
      }
    }
  }

  return (
    typedError?.error?.message ||
    typedError?.response?.data?.error?.message ||
    typedError?.response?.data?.message ||
    typedError?.message ||
    String(error)
  )
}

export function extractOpenAIErrorDetails(error: unknown) {
  const typedError = error as {
    status?: number
    code?: string
    type?: string
    error?: unknown
    response?: {
      data?: unknown
    }
  }

  return {
    status: typedError?.status ?? null,
    code: typedError?.code ?? null,
    type: typedError?.type ?? null,
    error: typedError?.error ?? null,
    responseData: typedError?.response?.data ?? null,
  }
}
