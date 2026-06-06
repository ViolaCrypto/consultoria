'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { exportarPDF, exportarWord } from '@/lib/exportar'

type DocumentoAprovado = {
  id: string
  nome: string
  tipo: string
  conteudo: string | null
}

type EntregaProjeto = {
  id: string
  nome: string
  tipo: string
  status: string
  createdAt: string
  empresa: {
    nome: string
  }
  documentos: DocumentoAprovado[]
  conformidade: number
}

export function EntregaFinalClient({ projeto }: { projeto: EntregaProjeto }) {
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)
  const [message, setMessage] = useState('')

  async function exportAll() {
    for (const documento of projeto.documentos) {
      if (documento.conteudo) {
        await exportarPDF(documento.conteudo, documento.nome, projeto.empresa)
      }
    }
  }

  async function completeProject() {
    setIsCompleting(true)
    setMessage('')

    const response = await fetch(`/api/projetos/${projeto.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'concluido' }),
    })

    setIsCompleting(false)

    if (!response.ok) {
      setMessage('Não foi possível concluir o projeto.')
      return
    }

    setMessage('Projeto marcado como concluído.')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-6xl">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Entrega Final
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">
              {projeto.nome}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {projeto.empresa.nome} · {projeto.tipo}
            </p>
          </div>
          <button
            type="button"
            disabled={isCompleting || projeto.status === 'concluido'}
            onClick={completeProject}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCompleting ? 'Concluindo...' : 'Marcar projeto como concluído'}
          </button>
        </div>

        <dl className="mt-6 grid gap-4 md:grid-cols-4">
          <Info label="Data" value={new Date().toLocaleDateString('pt-BR')} />
          <Info label="Consultora responsável" value="Equipe consultoria" />
          <Info label="Status" value={projeto.status} />
          <Info label="Conformidade" value={`${Math.round(projeto.conformidade)}%`} />
        </dl>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm text-slate-600">
            <span>Status geral do Gap Analysis</span>
            <span>{Math.round(projeto.conformidade)}% conformidade</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-950"
              style={{ width: `${Math.min(100, Math.max(0, projeto.conformidade))}%` }}
            />
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Documentos aprovados
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Exporte os documentos finais aprovados para entrega ao cliente.
            </p>
          </div>
          <button
            type="button"
            onClick={exportAll}
            disabled={projeto.documentos.length === 0}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Exportar todos como ZIP
          </button>
        </div>

        {projeto.documentos.length > 0 ? (
          <div className="grid gap-4">
            {projeto.documentos.map((documento) => (
              <div
                key={documento.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {documento.nome}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{documento.tipo}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        documento.conteudo &&
                        exportarPDF(documento.conteudo, documento.nome, projeto.empresa)
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        documento.conteudo &&
                        exportarWord(documento.conteudo, documento.nome, projeto.empresa)
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Word
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            Nenhum documento aprovado ainda.
          </div>
        )}
      </section>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-slate-950">{value}</dd>
    </div>
  )
}
