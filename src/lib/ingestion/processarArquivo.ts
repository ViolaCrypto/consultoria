import { Prisma } from '@prisma/client'
import { analisarDocumentoComIA } from '@/lib/ingestion/analisarDocumento'
import { classificarDocumentoComIA } from '@/lib/ingestion/classificadorDocumentos'
import {
  detectarTipoDocumento,
  extrairTextoImagem,
  extrairTextoPDF,
  extrairTextoWord,
} from '@/lib/ingestion/extrairTexto'
import { prisma } from '@/lib/prisma'

export async function processarArquivoPorId(arquivoId: string) {
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
    throw new Error('Arquivo não encontrado.')
  }

  await prisma.arquivo.update({
    where: { id: arquivo.id },
    data: {
      metadados: {
        statusAnalise: 'analisando',
        iniciadoEm: new Date().toISOString(),
      } satisfies Prisma.InputJsonObject,
    },
  })

  try {
    const buffer = await downloadArquivo(arquivo.url)
    const texto = await extrairTextoPorTipo(buffer, arquivo.nome, arquivo.tipo)
    let tipoDetectado = detectarTipoDocumento(texto, arquivo.nome)
    let classificacaoIA: Awaited<ReturnType<typeof classificarDocumentoComIA>> | null = null

    if (tipoDetectado === 'outro') {
      classificacaoIA = await classificarDocumentoComIA(texto, arquivo.nome)
      tipoDetectado = classificacaoIA.tipo
    }

    const analise = await analisarDocumentoComIA(texto, tipoDetectado, {
      nome: arquivo.projeto.empresa.nome,
      setor: arquivo.projeto.empresa.setorCodigo || arquivo.projeto.empresa.setor,
      cnae: arquivo.projeto.empresa.cnae,
    })

    const metadados = JSON.parse(
      JSON.stringify({
        statusAnalise: 'analisado',
        processadoEm: new Date().toISOString(),
        tipoDetectado,
        classificacaoIA,
        textoExtraidoPreview: texto.slice(0, 2000),
        analise,
      }),
    ) as Prisma.InputJsonValue

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

    return {
      arquivo: updated,
      tipoDetectado,
      analise,
    }
  } catch (error) {
    await prisma.arquivo.update({
      where: { id: arquivo.id },
      data: {
        metadados: {
          statusAnalise: 'erro',
          erro: error instanceof Error ? error.message : 'Erro desconhecido',
          finalizadoEm: new Date().toISOString(),
        } satisfies Prisma.InputJsonObject,
      },
    })

    throw error
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

  if (normalized.includes('xlsx') || normalized.includes('spreadsheet') || normalized.includes('excel')) {
    return `Planilha enviada: ${nome}. Use o nome do arquivo e metadados disponíveis para classificar.`
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
