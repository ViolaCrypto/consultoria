'use client'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'
import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'

type EmpresaExport = {
  nome: string
}

const consultoria = 'Plataforma Consultoria'

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function markdownToHtml(markdown: string) {
  const lines = markdown.split('\n')
  let inList = false

  const html = lines
    .map((line) => {
      const trimmed = line.trim()

      if (!trimmed) {
        if (inList) {
          inList = false
          return '</ul>'
        }
        return '<br />'
      }

      if (trimmed.startsWith('### ')) {
        return `<h3>${trimmed.slice(4)}</h3>`
      }

      if (trimmed.startsWith('## ')) {
        return `<h2>${trimmed.slice(3)}</h2>`
      }

      if (trimmed.startsWith('# ')) {
        return `<h1>${trimmed.slice(2)}</h1>`
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const item = `<li>${trimmed.slice(2)}</li>`
        if (!inList) {
          inList = true
          return `<ul>${item}`
        }
        return item
      }

      if (inList) {
        inList = false
        return `</ul><p>${trimmed}</p>`
      }

      return `<p>${trimmed}</p>`
    })
    .join('')

  return inList ? `${html}</ul>` : html
}

export async function exportarPDF(
  conteudo: string,
  nomeArquivo: string,
  empresa: EmpresaExport,
) {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-9999px'
  wrapper.style.top = '0'
  wrapper.style.width = '794px'
  wrapper.style.background = '#ffffff'
  wrapper.style.color = '#0f172a'
  wrapper.style.fontFamily = 'Arial, sans-serif'
  wrapper.innerHTML = `
    <div style="padding: 42px;">
      <header style="border-bottom: 2px solid #0f172a; padding-bottom: 18px; margin-bottom: 28px;">
        <div style="font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #64748b;">${consultoria}</div>
        <h1 style="font-size: 26px; margin: 8px 0 0;">${nomeArquivo}</h1>
        <p style="font-size: 14px; color: #475569; margin: 8px 0 0;">Empresa: ${empresa.nome} · ${new Date().toLocaleDateString('pt-BR')}</p>
      </header>
      <main style="font-size: 14px; line-height: 1.65;">
        ${markdownToHtml(conteudo)}
      </main>
      <footer style="border-top: 1px solid #cbd5e1; color: #64748b; font-size: 11px; margin-top: 36px; padding-top: 12px;">
        ${consultoria} · Documento gerado para ${empresa.nome}
      </footer>
    </div>
  `
  document.body.appendChild(wrapper)

  const canvas = await html2canvas(wrapper, { scale: 2 })
  const image = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imageHeight = (canvas.height * pageWidth) / canvas.width
  let heightLeft = imageHeight
  let position = 0

  pdf.addImage(image, 'PNG', 0, position, pageWidth, imageHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imageHeight
    pdf.addPage()
    pdf.addImage(image, 'PNG', 0, position, pageWidth, imageHeight)
    heightLeft -= pageHeight
  }

  pdf.save(`${slugify(nomeArquivo)}.pdf`)
  document.body.removeChild(wrapper)
}

function markdownToDocxParagraphs(markdown: string) {
  return markdown
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const trimmed = line.trim()

      if (trimmed.startsWith('# ')) {
        return new Paragraph({
          text: trimmed.slice(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 240 },
        })
      }

      if (trimmed.startsWith('## ')) {
        return new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 160 },
        })
      }

      if (trimmed.startsWith('### ')) {
        return new Paragraph({
          text: trimmed.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 120 },
        })
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return new Paragraph({
          text: trimmed.slice(2),
          bullet: { level: 0 },
          spacing: { after: 80 },
        })
      }

      return new Paragraph({
        children: [new TextRun(trimmed)],
        spacing: { after: 160 },
      })
    })
}

export async function exportarWord(
  conteudo: string,
  nomeArquivo: string,
  empresa: EmpresaExport,
) {
  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${consultoria} · ${empresa.nome}`,
                    bold: true,
                  }),
                ],
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
                  new TextRun(
                    `Gerado em ${new Date().toLocaleDateString('pt-BR')} · Versão 1`,
                  ),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            text: nomeArquivo,
            heading: HeadingLevel.TITLE,
            spacing: { after: 320 },
          }),
          ...markdownToDocxParagraphs(conteudo),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${slugify(nomeArquivo)}.docx`)
}
