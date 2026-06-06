'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ModeloCard = {
  id: string
  nome: string
  descricao: string | null
  categoria: string | null
  versao: string
  _count: {
    requisitos: number
  }
}

const categorias = [
  'iso14001',
  'iso45001',
  'sst',
  'ambiental',
  'homologacao',
  'auditoria',
  'esg',
  'outro',
]

export function ModelosClient({ modelos }: { modelos: ModeloCard[] }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = Object.fromEntries(formData.entries())

    const response = await fetch('/api/modelos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      setError('Não foi possível criar o modelo.')
      return
    }

    setIsOpen(false)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Modelos
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Modelos de Avaliação
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Cadastre modelos e requisitos para avaliações, auditorias e gap analysis.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Novo Modelo
        </button>
      </div>

      <section className="mt-8">
        {modelos.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modelos.map((modelo) => (
              <div
                key={modelo.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      {modelo.nome}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {modelo.categoria || 'Sem categoria'}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    v{modelo.versao}
                  </span>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-slate-600">
                  {modelo.descricao || 'Sem descrição.'}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {modelo._count.requisitos} requisitos
                  </span>
                  <Link
                    href={`/modelos/${modelo.id}`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              Nenhum modelo cadastrado
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Crie o primeiro modelo de avaliação.
            </p>
          </div>
        )}
      </section>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Novo Modelo
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Informe os dados principais do modelo de avaliação.
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
              <Field id="nome" label="Nome" required />
              <Textarea id="descricao" label="Descrição" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select id="categoria" label="Categoria" options={categorias} />
                <Field id="versao" label="Versão" defaultValue="1.0" required />
              </div>
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
                  {isSubmitting ? 'Salvando...' : 'Criar modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Field({
  id,
  label,
  required = false,
  defaultValue = '',
}: {
  id: string
  label: string
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

function Select({
  id,
  label,
  options,
}: {
  id: string
  label: string
  options: string[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue="outro"
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
