'use client'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { CONSULTORIA_CONFIG } from '@/lib/config/consultoria'
import { diagnosticoInicialTemplate } from '@/lib/exportar/templates/diagnosticoInicial'
import { inventarioRiscosTemplate } from '@/lib/exportar/templates/inventarioRiscos'
import { matrizAspectosTemplate } from '@/lib/exportar/templates/matrizAspectos'
import { planoAcaoTemplate } from '@/lib/exportar/templates/planoAcao'
import { politicaAmbientalTemplate } from '@/lib/exportar/templates/politicaAmbiental'
import { politicaSSTTemplate } from '@/lib/exportar/templates/politicaSST'

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
    if (!response.ok) throw new Error('Config indisponível')
    return (await response.json()) as ConfigExport
  } catch {
    return {
      nome: CONSULTORIA_CONFIG.nome,
      nomeCompleto: CONSULTORIA_CONFIG.nomeCompleto,
      slogan: CONSULTORIA_CONFIG.slogan,
    }
  }
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

function markdownToHtml(markdown: string) {
  const lines = markdown.split('\n')
  let inList = false
  let inTable = false

  const html = lines
    .map((line) => {
      const trimmed = line.trim()

      if (!trimmed) {
        const closers = `${inList ? '</ul>' : ''}${inTable ? '</tbody></table>' : ''}`
        inList = false
        inTable = false
        return closers || '<br />'
      }

      if (trimmed.includes('|') && trimmed.startsWith('|')) {
        const cells = trimmed
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim())

        if (cells.every((cell) => /^-+$/.test(cell.replace(/:/g, '')))) {
          return ''
        }

        const row = `<tr>${cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
        if (!inTable) {
          inTable = true
          return `<table><tbody>${row}`
        }
        return row
      }

      if (trimmed.startsWith('### ')) return closeFlow(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`)
      if (trimmed.startsWith('## ')) return closeFlow(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`)
      if (trimmed.startsWith('# ')) return closeFlow(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`)

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const item = `<li>${escapeHtml(trimmed.slice(2))}</li>`
        if (!inList) {
          inList = true
          return `${inTable ? '</tbody></table>' : ''}<ul>${item}`
        }
        return item
      }

      return closeFlow(`<p>${escapeHtml(trimmed)}</p>`)
    })
    .join('')

  return `${html}${inList ? '</ul>' : ''}${inTable ? '</tbody></table>' : ''}`

  function closeFlow(value: string) {
    const prefix = `${inList ? '</ul>' : ''}${inTable ? '</tbody></table>' : ''}`
    inList = false
    inTable = false
    return `${prefix}${value}`
  }
}

function getDocumentCode(documento: DocumentoExport) {
  return `DOC-${slugify(documento.nome).slice(0, 18).toUpperCase()}-V${documento.versao || 1}`
}

function getWatermark(status: string) {
  return status === 'aprovado' ? 'APROVADO' : 'RASCUNHO'
}

function getChartsHtml(documento: DocumentoExport) {
  if (!documento.nome.toLowerCase().includes('diagnóstico') && !documento.nome.toLowerCase().includes('diagnostico')) {
    return ''
  }

  const atende = countOccurrences(documento.conteudo, ['atende', 'conforme'])
  const parcial = countOccurrences(documento.conteudo, ['parcial'])
  const naoAtende = countOccurrences(documento.conteudo, ['não atende', 'nao atende', 'lacuna'])
  const total = Math.max(atende + parcial + naoAtende, 1)
  const conformidade = Math.round((atende / total) * 100)

  return `
    <div class="chart-card">
      <h3>Conformidade geral</h3>
      <svg viewBox="0 0 120 120" role="img">
        <circle cx="60" cy="60" r="42" fill="none" stroke="#e2e8f0" stroke-width="16" />
        <circle cx="60" cy="60" r="42" fill="none" stroke="#1a56db" stroke-width="16"
          stroke-dasharray="${conformidade * 2.64} 264" transform="rotate(-90 60 60)" />
        <text x="60" y="66" text-anchor="middle" font-size="22" font-weight="700">${conformidade}%</text>
      </svg>
    </div>
    <div class="chart-card">
      <h3>Requisitos por status</h3>
      ${bar('Atende', atende, total, '#057a55')}
      ${bar('Parcial', parcial, total, '#c27803')}
      ${bar('Não atende', naoAtende, total, '#c81e1e')}
    </div>
    <div class="chart-card wide">
      <h3>Top gaps críticos</h3>
      ${Array.from({ length: 5 }).map((_, index) => bar(`Gap ${index + 1}`, Math.max(5 - index, 1), 5, '#1e40af')).join('')}
    </div>
  `
}

function countOccurrences(text: string, terms: string[]) {
  const normalized = text.toLowerCase()
  return terms.reduce((count, term) => count + (normalized.match(new RegExp(term, 'g'))?.length || 0), 0)
}

function bar(label: string, value: number, total: number, color: string) {
  const width = Math.max(8, Math.round((value / total) * 100))
  return `
    <div class="bar-row">
      <span>${label}</span>
      <div><strong style="width:${width}%;background:${color};"></strong></div>
      <em>${value}</em>
    </div>
  `
}

function applyTemplate(documento: DocumentoExport, contentHtml: string) {
  const normalized = documento.nome.toLowerCase()
  const charts = getChartsHtml(documento)

  if (normalized.includes('política ambiental') || normalized.includes('politica ambiental')) return politicaAmbientalTemplate(contentHtml)
  if (normalized.includes('sst') && (normalized.includes('política') || normalized.includes('politica'))) return politicaSSTTemplate(contentHtml)
  if (normalized.includes('aspectos') || normalized.includes('impactos ambientais')) return matrizAspectosTemplate(contentHtml)
  if (normalized.includes('inventário de riscos') || normalized.includes('inventario de riscos')) return inventarioRiscosTemplate(contentHtml)
  if (normalized.includes('plano de ação') || normalized.includes('plano de acao')) return planoAcaoTemplate(contentHtml)
  if (normalized.includes('diagnóstico') || normalized.includes('diagnostico')) return diagnosticoInicialTemplate(contentHtml, charts)

  return `<section class="template-section">${contentHtml}</section>`
}

export async function gerarPreviewHtml(documento: DocumentoExport, empresa: EmpresaExport) {
  const config = await getConfig()
  const today = new Date().toLocaleDateString('pt-BR')
  const code = getDocumentCode(documento)
  const watermark = getWatermark(documento.status)
  const body = applyTemplate(documento, markdownToHtml(documento.conteudo))

  return `
    <style>
      .export-preview { background:#f1f5f9; padding:24px; color:#0f172a; }
      .export-page { position:relative; width:794px; min-height:1123px; margin:0 auto 24px; background:#fff; box-shadow:0 20px 45px rgba(15,23,42,.12); overflow:hidden; }
      .export-inner { padding:92px 58px 92px; }
      .cover { display:flex; min-height:1123px; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:72px; }
      .logo { max-height:92px; max-width:180px; object-fit:contain; margin-bottom:24px; }
      .logo-placeholder { width:92px; height:92px; border-radius:999px; background:#1a56db; color:#fff; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; margin-bottom:24px; }
      .cover h1 { font-family:Georgia,serif; font-size:36px; margin:18px 0 8px; }
      .cover .doc-type { color:#1a56db; font-size:16px; text-transform:uppercase; letter-spacing:2px; font-weight:700; }
      .cover .meta { margin-top:36px; color:#475569; line-height:1.8; }
      .page-header,.page-footer { position:absolute; left:42px; right:42px; color:#64748b; font-size:11px; display:flex; align-items:center; justify-content:space-between; }
      .page-header { top:28px; border-bottom:1px solid #cbd5e1; padding-bottom:10px; }
      .page-footer { bottom:28px; border-top:1px solid #cbd5e1; padding-top:10px; gap:16px; }
      .watermark { position:absolute; top:46%; left:12%; transform:rotate(-32deg); font-size:86px; font-weight:800; color:rgba(15,23,42,.055); letter-spacing:8px; pointer-events:none; }
      .template-section h1 { font-family:Georgia,serif; font-size:28px; margin:26px 0 14px; color:#0f172a; }
      .template-section h2 { font-size:20px; margin:22px 0 10px; color:#1e3a8a; }
      .template-section h3 { font-size:16px; margin:18px 0 8px; color:#334155; }
      .template-section p,.template-section li { font-family:Arial,sans-serif; font-size:13.5px; line-height:1.75; color:#334155; }
      .template-section table { width:100%; border-collapse:collapse; margin:18px 0; font-size:11px; page-break-inside:auto; }
      .template-section td,.template-section th { border:1px solid #cbd5e1; padding:8px; vertical-align:top; }
      .template-section tr:first-child td { background:#1e40af; color:white; font-weight:700; }
      .table-note { border-left:4px solid #1a56db; background:#eff6ff; padding:12px; font-size:12px; color:#1e3a8a; }
      .timeline { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin:18px 0; }
      .timeline span { border-radius:999px; background:#eff6ff; color:#1d4ed8; padding:8px 10px; text-align:center; font-size:12px; font-weight:700; }
      .charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:18px 0; }
      .chart-card { border:1px solid #dbe3ef; border-radius:10px; padding:14px; background:#f8fafc; }
      .chart-card.wide { grid-column:1 / -1; }
      .chart-card h3 { margin-top:0; }
      .bar-row { display:grid; grid-template-columns:88px 1fr 28px; align-items:center; gap:8px; margin:8px 0; font-size:11px; }
      .bar-row div { height:10px; border-radius:999px; background:#e2e8f0; overflow:hidden; }
      .bar-row strong { display:block; height:100%; border-radius:999px; }
      .signature-grid { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-top:120px; }
      .signature-box { border-top:1px solid #0f172a; padding-top:12px; font-size:12px; color:#334155; min-height:120px; }
    </style>
    <div class="export-preview">
      <section class="export-page">
        <div class="cover">
          ${config.logoUrl ? `<img src="${config.logoUrl}" class="logo" />` : `<div class="logo-placeholder">${getInitials(config.nome)}</div>`}
          <div class="doc-type">${escapeHtml(documento.tipo || 'Documento técnico')}</div>
          <h1>${escapeHtml(documento.nome)}</h1>
          <h2>${escapeHtml(empresa.nome)}</h2>
          <div class="meta">
            <div>${escapeHtml(config.nome)}</div>
            <div>${escapeHtml(config.slogan || '')}</div>
            <div>Data: ${today} · Versão ${documento.versao || 1}</div>
            <div>Código: ${code}</div>
          </div>
        </div>
      </section>
      <section class="export-page">
        ${pageChrome(config, empresa, watermark)}
        <div class="export-inner">${body}</div>
      </section>
      <section class="export-page">
        ${pageChrome(config, empresa, watermark)}
        <div class="export-inner">
          <h1 style="font-family:Georgia,serif;font-size:28px;">Assinaturas</h1>
          <p>Este documento foi elaborado para análise, validação e aprovação pelas partes responsáveis.</p>
          <div class="signature-grid">
            <div class="signature-box">
              <strong>${escapeHtml(config.responsavelNome || 'Responsável técnico')}</strong><br/>
              ${escapeHtml(config.responsavelCargo || 'Cargo técnico')}<br/>
              ${escapeHtml(config.responsavelRegistro || 'Registro profissional')}
              <p>Data: ____/____/______</p>
            </div>
            <div class="signature-box">
              <strong>Representante do cliente</strong><br/>
              ${escapeHtml(empresa.nome)}
              <p>Data: ____/____/______</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
}

function pageChrome(config: ConfigExport, empresa: EmpresaExport, watermark: string) {
  return `
    <div class="watermark">${watermark}</div>
    <header class="page-header">
      <span>${config.logoUrl ? `<img src="${config.logoUrl}" style="height:20px;vertical-align:middle;" />` : escapeHtml(config.nome)}</span>
      <strong>${escapeHtml(empresa.nome)}</strong>
      <span>Página X de Y</span>
    </header>
    <footer class="page-footer">
      <span>${escapeHtml(config.nome)} · ${[config.endereco, config.telefone, config.email, config.site].filter(Boolean).map(String).join(' · ')}</span>
      <strong>Documento confidencial — uso exclusivo do cliente</strong>
    </footer>
  `
}

function getInitials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join('')
}

export async function exportarPDF(documento: DocumentoExport, empresa: EmpresaExport) {
  const config = await getConfig()
  const html = await gerarPreviewHtml(documento, empresa)
  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-9999px'
  wrapper.style.top = '0'
  wrapper.innerHTML = html
  document.body.appendChild(wrapper)

  const pages = Array.from(wrapper.querySelectorAll('.export-page')) as HTMLElement[]
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  for (let index = 0; index < pages.length; index += 1) {
    const canvas = await html2canvas(pages[index], { scale: 2, useCORS: true })
    const image = canvas.toDataURL('image/png')
    if (index > 0) pdf.addPage()
    pdf.addImage(image, 'PNG', 0, 0, pageWidth, pageHeight)
    pdf.setFontSize(9)
    pdf.setTextColor(100, 116, 139)
    pdf.text(`Página ${index + 1} de ${pages.length}`, pageWidth - 35, 12)
  }

  const fileName = `${slugify(documento.nome)}.pdf`
  const blob = pdf.output('blob')
  pdf.save(fileName)
  document.body.removeChild(wrapper)
  await registrarExportacao(documento, 'pdf', fileName, await hashBlob(blob), config)
}

function markdownToDocxParagraphs(markdown: string) {
  const children: Array<Paragraph | Table> = []
  const lines = markdown.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('|') && trimmed.includes('|')) {
      const cells = trimmed.split('|').slice(1, -1).map((cell) => cell.trim())
      if (cells.every((cell) => /^-+$/.test(cell.replace(/:/g, '')))) continue
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: cells.map(
                (cell) =>
                  new TableCell({
                    shading: { fill: 'EFF6FF' },
                    borders: simpleBorders(),
                    children: [new Paragraph({ children: [new TextRun(cell)] })],
                  }),
              ),
            }),
          ],
        }),
      )
      continue
    }

    if (trimmed.startsWith('# ')) {
      children.push(new Paragraph({ text: trimmed.slice(2), heading: HeadingLevel.HEADING_1, spacing: { after: 240 } }))
      continue
    }
    if (trimmed.startsWith('## ')) {
      children.push(new Paragraph({ text: trimmed.slice(3), heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 160 } }))
      continue
    }
    if (trimmed.startsWith('### ')) {
      children.push(new Paragraph({ text: trimmed.slice(4), heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 } }))
      continue
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      children.push(new Paragraph({ text: trimmed.slice(2), bullet: { level: 0 }, spacing: { after: 80 } }))
      continue
    }

    children.push(new Paragraph({ children: [new TextRun(trimmed)], spacing: { after: 160 } }))
  }

  return children
}

function simpleBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  }
}

export async function exportarWord(documento: DocumentoExport, empresa: EmpresaExport) {
  const config = await getConfig()
  const doc = new Document({
    title: documento.nome,
    creator: config.nome,
    subject: documento.tipo,
    description: `Documento técnico para ${empresa.nome}`,
    styles: {
      paragraphStyles: [
        { id: 'Normal', name: 'Normal', run: { font: 'Arial', size: 22 }, paragraph: { spacing: { after: 160 } } },
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Georgia', size: 34, bold: true, color: '0F172A' } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 28, bold: true, color: '1E40AF' } },
      ],
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${config.nome} · ${empresa.nome}`, bold: true })],
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
                  new TextRun('Página '),
                  new TextRun({ children: [PageNumber.CURRENT] }),
                  new TextRun(' de '),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                  new TextRun(` · ${config.email || ''} · Documento confidencial — uso exclusivo do cliente`),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ text: documento.nome, heading: HeadingLevel.TITLE, spacing: { after: 320 } }),
          new Paragraph({ text: `Cliente: ${empresa.nome}` }),
          new Paragraph({ text: `Consultoria: ${config.nome}` }),
          new Paragraph({ text: `Data: ${new Date().toLocaleDateString('pt-BR')} · Versão ${documento.versao || 1} · Código ${getDocumentCode(documento)}` }),
          new Paragraph({ children: [new PageBreak()] }),
          ...markdownToDocxParagraphs(documento.conteudo),
          new Paragraph({ children: [new PageBreak()] }),
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

function signatureTable(config: ConfigExport, empresa: EmpresaExport) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: simpleBorders(),
            children: [
              new Paragraph('Responsável técnico'),
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
