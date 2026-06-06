'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Requisito = {
  id: string
  codigo: string | null
  titulo: string
  descricao: string | null
  categoria: string | null
  peso: number
  ordem: number
  evidenciaEsperada: string | null
  documentoEsperado: string | null
  acaoRecomendada: string | null
}

type ModeloDetalhe = {
  id: string
  nome: string
  descricao: string | null
  categoria: string | null
  versao: string
  requisitos: Requisito[]
}

export function ModeloDetalheClient({ modelo }: { modelo: ModeloDetalhe }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      ...Object.fromEntries(formData.entries()),
      modeloId: modelo.id,
    }

    const response = await fetch('/api/requisitos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      setError('Não foi possível criar o requisito.')
      return
    }

    setIsOpen(false)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Modelo de Avaliação
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              {modelo.nome}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              {modelo.descricao || 'Sem descrição.'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Importar por planilha
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Adicionar Requisito
            </button>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <Info label="Categoria" value={modelo.categoria || 'Sem categoria'} />
          <Info label="Versão" value={modelo.versao} />
          <Info label="Requisitos" value={String(modelo.requisitos.length)} />
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-slate-950">Requisitos</h2>
        {modelo.requisitos.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Peso</th>
                  <th className="px-4 py-3">Evidência esperada</th>
                  <th className="px-4 py-3">Documento esperado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {modelo.requisitos.map((requisito) => (
                  <tr key={requisito.id}>
                    <td className="px-4 py-3 text-slate-600">
                      {requisito.codigo || '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {requisito.titulo}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {requisito.categoria || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{requisito.peso}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {requisito.evidenciaEsperada || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {requisito.documentoEsperado || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            Nenhum requisito cadastrado para este modelo.
          </div>
        )}
      </section>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8">
          <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Adicionar Requisito
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Informe os critérios que serão avaliados neste modelo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field id="codigo" label="Código" />
                <Field id="categoria" label="Categoria" />
                <Field id="peso" label="Peso" type="number" step="0.1" defaultValue="1" />
              </div>
              <Field id="titulo" label="Título" required />
              <Textarea id="descricao" label="Descrição" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="ordem" label="Ordem" type="number" defaultValue="0" />
                <Field id="documentoEsperado" label="Documento esperado" />
              </div>
              <Textarea id="evidenciaEsperada" label="Evidência esperada" />
              <Textarea id="acaoRecomendada" label="Ação recomendada" />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
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

function Field({
  id,
  label,
  type = 'text',
  step,
  required = false,
  defaultValue = '',
}: {
  id: string
  label: string
  type?: string
  step?: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </div>
  )
}

function Textarea({ id, label }: { id: string; label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={3}
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </div>
  )
}
