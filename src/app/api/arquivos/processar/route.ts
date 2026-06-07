import { NextResponse } from 'next/server'
import { z } from 'zod'
import { analisarDocumentoComIA } from '@/lib/ingestion/analisarDocumento'
import {
  detectarTipoDocumento,
  extrairTextoImagem,
  extrairTextoPDF,
  extrairTextoWord,
} from '@/lib/ingestion/extrairTexto'
import { prisma } from '@/lib/prisma'

const requestSchema = z.object({
  arquivoId: z.string().trim().min(1, 'Arquivo é obrigatório.'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const { arquivoId } = requestSchema.parse(body)

    const arquivo = await prisma.arquivo.findUnique({
      where: { id: arquivoId },
      include: {
        projeto: {
          include: {
            empresa: true,
            avaliacoes: {
              include: {
                itens: {
                  include: {
                    requisito: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!arquivo) {
      return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 })
    }

    const buffer = await downloadArquivo(arquivo.url)
    const texto = await extrairTextoPorTipo(buffer, arquivo.nome, arquivo.tipo)
    const tipoDetectado = detectarTipoDocumento(texto, arquivo.nome)
    const analise = await analisarDocumentoComIA(texto, tipoDetectado, {
      nome: arquivo.projeto.empresa.nome,
      setor: arquivo.projeto.empresa.setorCodigo || arquivo.projeto.empresa.setor,
      cnae: arquivo.projeto.empresa.cnae,
    })

    const metadados = {
      processadoEm: new Date().toISOString(),
      tipoDetectado,
      textoExtraidoPreview: texto.slice(0, 2000),
      analise,
    }

    const updated = await prisma.arquivo.update({
      where: { id: arquivo.id },
      data: { metadados },
    })

    await atualizarGapComEvidencias(
      arquivo.projeto.avaliacoes.flatMap((avaliacao) => avaliacao.itens),
      analise.requisitos_atendidos,
      arquivo.nome,
      arquivo.url,
    )

    return NextResponse.json({
      arquivo: updated,
      tipoDetectado,
      analise,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', issues: error.issues },
        { status: 400 },
      )
    }

    console.error('Erro ao processar arquivo:', error)
    return NextResponse.json(
      { error: 'Não foi possível processar o arquivo.' },
      { status: 500 },
    )
  }
}

async function downloadArquivo(url: string) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Falha ao baixar arquivo: ${response.status}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function extrairTextoPorTipo(buffer: Buffer, nome: string, tipo: string) {
  const normalized = `${nome} ${tipo}`.toLowerCase()

  if (normalized.includes('pdf')) {
    return extrairTextoPDF(buffer)
  }

  if (normalized.includes('docx') || normalized.includes('word')) {
    return extrairTextoWord(buffer)
  }

  if (
    normalized.includes('png') ||
    normalized.includes('jpg') ||
    normalized.includes('jpeg') ||
    normalized.includes('imagem') ||
    normalized.includes('image')
  ) {
    return extrairTextoImagem(buffer)
  }

  return extrairTextoPDF(buffer).catch(() => extrairTextoWord(buffer))
}

async function atualizarGapComEvidencias(
  itens: {
    id: string
    evidencias: string[]
    requisito: {
      codigo: string | null
      titulo: string
    }
  }[],
  requisitosAtendidos: string[],
  nomeArquivo: string,
  urlArquivo: string,
) {
  const codigos = requisitosAtendidos.map(normalize).filter(Boolean)

  if (codigos.length === 0) {
    return
  }

  const updates = itens.filter((item) => {
    const codigo = normalize(item.requisito.codigo || '')
    const titulo = normalize(item.requisito.titulo)

    return codigos.some((requisito) => codigo === requisito || titulo.includes(requisito))
  })

  await Promise.all(
    updates.map((item) =>
      prisma.itemAvaliacao.update({
        where: { id: item.id },
        data: {
          status: 'atende',
          observacao: `Evidência encontrada: ${nomeArquivo}`,
          confiancaIA: 'media',
          evidencias: Array.from(new Set([...item.evidencias, urlArquivo])),
        },
      }),
    ),
  )
}

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}
