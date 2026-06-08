'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { CONSULTORIA_CONFIG } from '@/lib/config/consultoria'

type EmpresaExport = {
  nome: string
}

export type DocumentoExport = {
  id?: string
  nome: string
  tipo: string
  status: string
  versao?: number
  conteudo: string
}

type ConfigExport = {
  nome: string
  nomeCompleto?: string | null
  slogan?: string | null
  logoUrl?: string | null
  responsavelNome?: string | null
  responsavelRegistro?: string | null
  responsavelCargo?: string | null
  endereco?: string | null
  telefone?: string | null
  email?: string | null
  site?: string | null
}

async function getConfig(): Promise<ConfigExport> {
  try {
    const response = await fetch('/api/configuracoes')
    if (!response.ok) throw new Error('Config indisponivel')
    return (await response.json()) as ConfigExport
  } catch {
    return {
      nome: CONSULTORIA_CONFIG.nome,
      nomeCompleto: CONSULTORIA_CONFIG.nomeCompleto,
      slogan: CONSULTORIA_CONFIG.slogan,
    }
  }
}

export async function gerarPreviewHtml(documento: DocumentoExport, _empresa?: EmpresaExport) {
  void _empresa
  return `<article class="prose prose-slate max-w-none">${escapeHtml(documento.conteudo)}</article>`
}

export async function exportarPDF(documento: DocumentoExport, empresa: EmpresaExport) {
  const config = await getConfig()
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })
  const margemEsq = 20
  const margemDir = 20
  const larguraTexto = 210 - margemEsq - margemDir
  let y = 20

  drawHeader()

  const linhas = documento.conteudo.split('\n')
  for (let index = 0; index < linhas.length; index += 1) {
    const linha = linhas[index].trim()

    if (linha.startsWith('|') && linha.includes('|')) {
      const tableLines: string[] = []
      while (index < linhas.length && linhas[index].trim().startsWith('|')) {
        tableLines.push(linhas[index].trim())
        index += 1
      }
      index -= 1
      drawTable(tableLines)
      continue
    }

    if (y > 270) addPage()

    if (linha.startsWith('# ')) {
      y += 5
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      writeWrapped(cleanMarkdown(linha.replace(/^# /, '')), margemEsq, larguraTexto, 8)
      y += 5
    } else if (linha.startsWith('## ')) {
      y += 4
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      writeWrapped(cleanMarkdown(linha.replace(/^## /, '')), margemEsq, larguraTexto, 6)
      y += 3
    } else if (linha.startsWith('### ')) {
      y += 3
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      writeWrapped(cleanMarkdown(linha.replace(/^### /, '')), margemEsq, larguraTexto, 6)
    } else if (linha.startsWith('- ') || linha.startsWith('* ')) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      writeWrapped(`• ${cleanMarkdown(linha.replace(/^[-*] /, ''))}`, margemEsq + 3, larguraTexto - 5, 5)
    } else if (linha === '') {
      y += 3
    } else if (linha === '---') {
      y += 2
      doc.line(margemEsq, y, 210 - margemDir, y)
      y += 4
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      writeWrapped(cleanMarkdown(linha), margemEsq, larguraTexto, 5)
    }
  }

  drawFooters()
  const fileName = `${slugify(documento.nome)}.pdf`
  const blob = doc.output('blob')
  doc.save(fileName)
  await registrarExportacao(documento, 'pdf', fileName, await hashBlob(blob), config)

  function drawHeader() {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(config.nome || 'Consultoria', margemEsq, y)
    doc.setFont('helvetica', 'normal')
    doc.text(empresa.nome, 210 - margemDir, y, { align: 'right' })
    y += 5
    doc.setLineWidth(0.3)
    doc.line(margemEsq, y, 210 - margemDir, y)
    y += 10
  }

  function addPage() {
    doc.addPage()
    y = 20
    drawHeader()
  }

  function writeWrapped(texto: string, x: number, width: number, lineHeight: number) {
    const linhasQuebradas = doc.splitTextToSize(texto, width) as string[]
    for (const line of linhasQuebradas) {
      if (y > 270) addPage()
      doc.text(line, x, y)
      y += lineHeight
    }
  }

  function drawTable(tableLines: string[]) {
    const rows = tableLines
      .filter((line) => !/^\|[\s:-|]+\|$/.test(line))
      .map((line) => line.split('|').slice(1, -1).map((cell) => cleanMarkdown(cell.trim())))

    if (!rows.length) return

    autoTable(doc, {
      head: [rows[0]],
      body: rows.slice(1),
      startY: y,
      margin: { left: margemEsq, right: margemDir },
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [26, 86, 219], textColor: 255 },
    })

    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y) + 6
  }

  function drawFooters() {
    const totalPaginas = doc.getNumberOfPages()
    for (let i = 1; i <= totalPaginas; i += 1) {
      doc.setPage(i)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(120)
      doc.text(`Pagina ${i} de ${totalPaginas}`, 105, 287, { align: 'center' })
      doc.text('Documento confidencial - uso exclusivo do cliente', 105, 292, { align: 'center' })
      doc.setTextColor(0)
    }
  }
}

export async function exportarWord(documento: DocumentoExport, empresa: EmpresaExport) {
  const config = await getConfig()
  const doc = new Document({
    title: documento.nome,
    creator: config.nome,
    subject: documento.tipo,
    description: `Documento tecnico para ${empresa.nome}`,
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${config.nome} - ${empresa.nome}`, bold: true })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun('Pagina '),
                  new TextRun({ children: [PageNumber.CURRENT] }),
                  new TextRun(' de '),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                  new TextRun(` - ${config.email || ''} - Documento confidencial`),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ text: documento.nome, heading: HeadingLevel.TITLE, spacing: { after: 320 } }),
          new Paragraph({ text: `Cliente: ${empresa.nome}` }),
          new Paragraph({ text: `Consultoria: ${config.nome}` }),
          new Paragraph({ text: `Data: ${new Date().toLocaleDateString('pt-BR')} - Versao ${documento.versao || 1}` }),
          ...markdownToDocxParagraphs(documento.conteudo),
          new Paragraph({ text: 'Assinaturas', heading: HeadingLevel.HEADING_1 }),
          signatureTable(config, empresa),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const fileName = `${slugify(documento.nome)}.docx`
  saveAs(blob, fileName)
  await registrarExportacao(documento, 'word', fileName, await hashBlob(blob), config)
}

function markdownToDocxParagraphs(markdown: string) {
  const children: Array<Paragraph | Table> = []
  const lines = markdown.split('\n')

  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim()
    if (!trimmed) continue

    if (trimmed.startsWith('|') && trimmed.includes('|')) {
      const tableLines: string[] = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        tableLines.push(lines[index].trim())
        index += 1
      }
      index -= 1
      const rows = tableLines
        .filter((line) => !/^\|[\s:-|]+\|$/.test(line))
        .map((line) => line.split('|').slice(1, -1).map((cell) => cleanMarkdown(cell.trim())))
      if (rows.length) {
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows.map(
              (row) =>
                new TableRow({
                  children: row.map(
                    (cell) =>
                      new TableCell({
                        borders: simpleBorders(),
                        children: [new Paragraph({ children: [new TextRun(cell)] })],
                      }),
                  ),
                }),
            ),
          }),
        )
      }
      continue
    }

    if (trimmed.startsWith('# ')) {
      children.push(new Paragraph({ text: cleanMarkdown(trimmed.slice(2)), heading: HeadingLevel.HEADING_1 }))
    } else if (trimmed.startsWith('## ')) {
      children.push(new Paragraph({ text: cleanMarkdown(trimmed.slice(3)), heading: HeadingLevel.HEADING_2 }))
    } else if (trimmed.startsWith('### ')) {
      children.push(new Paragraph({ text: cleanMarkdown(trimmed.slice(4)), heading: HeadingLevel.HEADING_3 }))
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      children.push(new Paragraph({ text: cleanMarkdown(trimmed.slice(2)), bullet: { level: 0 } }))
    } else {
      children.push(new Paragraph({ children: [new TextRun(cleanMarkdown(trimmed))], spacing: { after: 160 } }))
    }
  }

  return children
}

function signatureTable(config: ConfigExport, empresa: EmpresaExport) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: simpleBorders(),
            children: [
              new Paragraph('Responsavel tecnico'),
              new Paragraph(config.responsavelNome || 'Nome completo'),
              new Paragraph(config.responsavelRegistro || 'Registro profissional'),
              new Paragraph('Data: ____/____/______'),
            ],
          }),
          new TableCell({
            borders: simpleBorders(),
            children: [
              new Paragraph('Representante do cliente'),
              new Paragraph(empresa.nome),
              new Paragraph('Assinatura: ____________________________'),
              new Paragraph('Data: ____/____/______'),
            ],
          }),
        ],
      }),
    ],
  })
}

function simpleBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  }
}

function cleanMarkdown(value: string) {
  return value
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function hashBlob(blob: Blob) {
  const buffer = await blob.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function registrarExportacao(
  documento: DocumentoExport,
  formato: 'pdf' | 'word',
  fileName: string,
  hashArquivo: string,
  config: ConfigExport,
) {
  if (!documento.id) return

  await fetch('/api/exportacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      docProjetoId: documento.id,
      formato,
      versao: documento.versao || 1,
      urlArquivo: fileName,
      hashArquivo,
      exportadoPor: config.responsavelNome || 'consultor',
    }),
  }).catch(() => null)
}
