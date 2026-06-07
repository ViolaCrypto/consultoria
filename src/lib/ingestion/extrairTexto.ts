import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'
import { createWorker } from 'tesseract.js'

export async function extrairTextoPDF(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer })
  const result = await parser.getText()
  await parser.destroy()
  const text = cleanText(result.text)

  if (text.length >= 100) {
    return text
  }

  // Fallback best-effort: tesseract.js works on image buffers. If the PDF is
  // scanned and cannot be interpreted directly, return the parser text.
  try {
    const ocrText = await runOcr(buffer)
    return cleanText(ocrText || text)
  } catch {
    return text
  }
}

export async function extrairTextoWord(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer })
  return cleanText(result.value)
}

export async function extrairTextoImagem(buffer: Buffer) {
  return cleanText(await runOcr(buffer))
}

export function detectarTipoDocumento(texto: string, nomeArquivo: string) {
  const content = `${nomeArquivo} ${texto}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (/\bnr[-\s]?\d{1,2}\b/.test(content) && /(treinamento|certificado|capacitacao)/.test(content)) {
    return 'treinamento_nr'
  }

  const checks: Array<[string, string[]]> = [
    ['pgr', ['pgr', 'programa de gerenciamento', 'programa de gerenciamento de riscos', 'gro', 'inventario de riscos']],
    ['pcmso', ['pcmso', 'programa de controle medico', 'programa de controle medico de saude ocupacional', 'exame clinico ocupacional']],
    ['licenca_ambiental', ['licenca ambiental', 'licenca de operacao', 'licenca previa', 'licenca de instalacao', ' lo ', ' lp ', ' li ', 'cetesb', 'orgao ambiental']],
    ['avcb', ['avcb', 'auto de vistoria do corpo de bombeiros', 'clcb', 'corpo de bombeiros']],
    ['fispq', ['fispq', 'ficha de seguranca', 'ficha de informacao de seguranca', 'sds', 'produto quimico']],
    ['aso', ['aso', 'atestado de saude', 'atestado de saude ocupacional', 'apto', 'inapto']],
    ['alvara', ['alvara', 'licenca de funcionamento', 'prefeitura municipal']],
    ['plano_emergencia', ['plano de emergencia', 'pae', 'atendimento a emergencia', 'resposta a emergencia']],
    ['certificado_treinamento', ['certificado de treinamento', 'certificamos que', 'treinamento', 'capacitacao']],
  ]

  for (const [tipo, keywords] of checks) {
    if (keywords.some((keyword) => content.includes(keyword))) {
      return tipo
    }
  }

  return 'outro'
}

async function runOcr(buffer: Buffer) {
  const worker = await createWorker('por')

  try {
    const result = await worker.recognize(buffer)
    return result.data.text
  } finally {
    await worker.terminate()
  }
}

function cleanText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}
