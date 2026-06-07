import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { put } from '@vercel/blob'
import { processarArquivoPorId } from '@/lib/ingestion/processarArquivo'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const projetoId = formData.get('projetoId')?.toString()
    const files = formData.getAll('files').filter((file): file is File => file instanceof File)

    if (!projetoId) {
      return NextResponse.json({ error: 'projetoId é obrigatório.' }, { status: 400 })
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'Envie ao menos um arquivo.' }, { status: 400 })
    }

    const arquivos = await Promise.all(
      files.map(async (file) => {
        const url = await salvarArquivo(file, projetoId)
        const arquivo = await prisma.arquivo.create({
          data: {
            nome: file.name,
            url,
            tipo: file.type || inferTipo(file.name),
            tamanho: file.size,
            projetoId,
            metadados: {
              statusAnalise: 'analisando',
              ingestaoMassa: true,
              recebidoEm: new Date().toISOString(),
            } satisfies Prisma.InputJsonObject,
          },
        })

        void processarArquivoPorId(arquivo.id).catch((error) => {
          console.error(`Erro na análise em background do arquivo ${arquivo.id}:`, error)
        })

        return arquivo
      }),
    )

    return NextResponse.json({
      arquivos: arquivos.map((arquivo) => ({
        id: arquivo.id,
        nome: arquivo.nome,
        tipo: arquivo.tipo,
        status: 'analisando',
      })),
    })
  } catch (error) {
    console.error('Erro na ingestão em massa:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Não foi possível importar os arquivos.' },
      { status: 500 },
    )
  }
}

async function salvarArquivo(file: File, projetoId: string) {
  const bytes = Buffer.from(await file.arrayBuffer())

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(
      `projetos/${projetoId}/${Date.now()}-${sanitizeFileName(file.name)}`,
      bytes,
      {
        access: 'public',
        contentType: file.type || undefined,
      },
    )

    return blob.url
  }

  const contentType = file.type || 'application/octet-stream'
  return `data:${contentType};base64,${bytes.toString('base64')}`
}

function sanitizeFileName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
}

function inferTipo(name: string) {
  const normalized = name.toLowerCase()

  if (normalized.endsWith('.pdf')) return 'application/pdf'
  if (normalized.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (normalized.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  if (normalized.endsWith('.png')) return 'image/png'
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg'

  return 'application/octet-stream'
}
