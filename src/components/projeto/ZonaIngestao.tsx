'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, FileText, Loader2, UploadCloud, XCircle } from 'lucide-react'

type ArquivoIngestao = {
  id?: string
  nome: string
  tipo?: string
  progress: number
  status: 'uploading' | 'analisando' | 'analisado' | 'erro'
  tipoDetectado?: string
  analise?: {
    tipo_confirmado?: string
    validade?: string | null
    requisitos_atendidos?: string[]
    resumo?: string
  }
  erro?: string
}

export function ZonaIngestao({
  projetoId,
  onClose,
  onApplied,
}: {
  projetoId: string
  onClose: () => void
  onApplied: () => void
}) {
  const [items, setItems] = useState<ArquivoIngestao[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const pendentes = items.filter((item) => item.id && item.status === 'analisando')

  useEffect(() => {
    if (pendentes.length === 0) {
      return
    }

    const timer = window.setInterval(async () => {
      const updates = await Promise.all(
        pendentes.map(async (item) => {
          const response = await fetch(`/api/arquivos/${item.id}/status`)
          if (!response.ok) return item
          const data = await response.json()

          return {
            ...item,
            status: normalizeStatus(data.status),
            progress: data.status === 'analisado' ? 100 : 80,
            tipoDetectado: data.tipoDetectado,
            analise: data.analise,
            erro: data.erro,
          } satisfies ArquivoIngestao
        }),
      )

      setItems((current) =>
        current.map((item) => updates.find((update) => update.id === item.id) || item),
      )
    }, 2000)

    return () => window.clearInterval(timer)
  }, [pendentes])

  const resumo = useMemo(() => {
    const analisados = items.filter((item) => item.status === 'analisado')
    const identificados = analisados.filter(
      (item) => (item.analise?.tipo_confirmado || item.tipoDetectado) !== 'outro',
    )
    const naoIdentificados = analisados.filter(
      (item) => (item.analise?.tipo_confirmado || item.tipoDetectado) === 'outro',
    )
    const vencimentos = analisados
      .map((item) => ({
        nome: item.nome,
        validade: item.analise?.validade || null,
        alerta: getValidityAlert(item.analise?.validade || null),
      }))
      .filter((item) => item.alerta)
    const requisitos = Array.from(
      new Set(analisados.flatMap((item) => item.analise?.requisitos_atendidos || [])),
    )

    return { analisados, identificados, naoIdentificados, vencimentos, requisitos }
  }, [items])

  async function handleFiles(files: FileList | File[]) {
    const selected = Array.from(files)
    if (selected.length === 0) return

    setError('')
    setIsUploading(true)
    setItems(
      selected.map((file) => ({
        nome: file.name,
        tipo: file.type,
        progress: 35,
        status: 'uploading',
      })),
    )

    const formData = new FormData()
    formData.append('projetoId', projetoId)
    selected.forEach((file) => formData.append('files', file))

    const response = await fetch('/api/arquivos/ingestao-massa', {
      method: 'POST',
      body: formData,
    })

    setIsUploading(false)

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      setError(payload?.error || 'Não foi possível importar os documentos.')
      setItems((current) =>
        current.map((item) => ({ ...item, status: 'erro', progress: 100 })),
      )
      return
    }

    const data = (await response.json()) as {
      arquivos: { id: string; nome: string; tipo: string; status: string }[]
    }

    setItems(
      data.arquivos.map((arquivo) => ({
        id: arquivo.id,
        nome: arquivo.nome,
        tipo: arquivo.tipo,
        progress: 70,
        status: 'analisando',
      })),
    )
  }

  function applyToProject() {
    onApplied()
  }

  return (
    <div className="grid max-h-[80vh] gap-5 overflow-y-auto">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          void handleFiles(event.dataTransfer.files)
        }}
        className={`rounded-xl border-2 border-dashed p-10 text-center transition ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
        }`}
      >
        <UploadCloud className="mx-auto h-12 w-12 text-slate-500" />
        <h3 className="mt-4 text-xl font-semibold text-slate-950">
          Arraste todos os documentos da empresa aqui
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          PDF, DOCX, XLSX e imagens. A análise começa automaticamente após o upload.
        </p>
        <label className="mt-5 inline-flex cursor-pointer rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
          Selecionar arquivos
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,image/*,application/pdf"
            className="hidden"
            onChange={(event) => {
              if (event.target.files) void handleFiles(event.target.files)
            }}
          />
        </label>
      </div>

      {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {items.length > 0 ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <article key={item.id || item.nome} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-950">{item.nome}</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      Tipo identificado: {item.analise?.tipo_confirmado || item.tipoDetectado || 'aguardando'}
                    </p>
                  </div>
                </div>
                <StatusPill status={item.status} />
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              {item.erro ? <p className="mt-2 text-sm text-red-600">{item.erro}</p> : null}
            </article>
          ))}
        </div>
      ) : null}

      {resumo.analisados.length > 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-950">Resumo automático</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <SummaryList
              title="Documentos identificados"
              items={resumo.identificados.map(
                (item) => `${item.analise?.tipo_confirmado || item.tipoDetectado}: ${item.nome}`,
              )}
            />
            <SummaryList
              title="Não identificados"
              items={resumo.naoIdentificados.map((item) => item.nome)}
              empty="Nenhum documento pendente de classificação manual."
            />
            <SummaryList
              title="Validades com alerta"
              items={resumo.vencimentos.map(
                (item) => `${item.nome}: ${item.validade} (${item.alerta})`,
              )}
              empty="Nenhum vencimento crítico detectado."
            />
            <SummaryList
              title="Requisitos atendidos automaticamente"
              items={resumo.requisitos}
              empty="Nenhum requisito relacionado ainda."
            />
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Fechar
            </button>
            <button
              type="button"
              disabled={isUploading || pendentes.length > 0}
              onClick={applyToProject}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Aplicar ao projeto
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function normalizeStatus(status: string): ArquivoIngestao['status'] {
  if (status === 'analisado') return 'analisado'
  if (status === 'erro') return 'erro'
  return 'analisando'
}

function StatusPill({ status }: { status: ArquivoIngestao['status'] }) {
  const config = {
    uploading: { label: 'enviando', className: 'bg-slate-100 text-slate-700', icon: Loader2 },
    analisando: { label: 'analisando', className: 'bg-amber-50 text-amber-700', icon: Loader2 },
    analisado: { label: 'analisado', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
    erro: { label: 'erro', className: 'bg-red-50 text-red-700', icon: XCircle },
  }[status]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      <Icon className={`h-3.5 w-3.5 ${status === 'analisando' || status === 'uploading' ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  )
}

function SummaryList({
  title,
  items,
  empty = 'Nada encontrado.',
}: {
  title: string
  items: string[]
  empty?: string
}) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">{empty}</p>
      )}
    </div>
  )
}

function getValidityAlert(validade: string | null) {
  if (!validade) return null
  const date = new Date(validade)
  if (Number.isNaN(date.getTime())) return null
  const diff = date.getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return 'vencido'
  if (days <= 30) return 'vence em breve'

  return null
}
