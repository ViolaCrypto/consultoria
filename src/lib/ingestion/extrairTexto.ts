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
  const content = `${nomeArquivo} ${texto}`.toLowerCase()

  const checks: Array<[string, string[]]> = [
    ['licenca_ambiental', ['licença ambiental', 'licenca ambiental', 'cetESb'.toLowerCase(), 'órgão ambiental', 'orgao ambiental', 'licença de operação', 'licenca de operacao']],
    ['pgr', ['programa de gerenciamento de riscos', 'pgr', 'gro', 'inventário de riscos', 'inventario de riscos']],
    ['pcmso', ['programa de controle médico', 'programa de controle medico', 'pcmso', 'exame clínico ocupacional', 'exame clinico ocupacional']],
    ['avcb', ['avcb', 'auto de vistoria do corpo de bombeiros', 'clcb', 'corpo de bombeiros']],
    ['alvara', ['alvará', 'alvara', 'licença de funcionamento', 'licenca de funcionamento', 'prefeitura municipal']],
    ['certificado_treinamento', ['certificado de treinamento', 'certificamos que', 'treinamento nr', 'capacitação', 'capacitacao']],
    ['fispq', ['fispq', 'ficha de informação de segurança', 'ficha de informacao de seguranca', 'sds', 'gqs', 'produto químico']],
    ['aso', ['aso', 'atestado de saúde ocupacional', 'atestado de saude ocupacional', 'apto', 'inapto']],
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
