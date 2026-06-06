'use client'

import { useState } from 'react'

const tipos = [
  { value: 'diagnostico_inicial', label: 'Diagnóstico inicial' },
  { value: 'adequacao_iso14001', label: 'Adequação ISO 14001' },
  { value: 'adequacao_iso45001', label: 'Adequação ISO 45001' },
  { value: 'homologacao_fornecedor', label: 'Homologação fornecedor' },
  { value: 'auditoria_interna', label: 'Auditoria interna' },
  { value: 'outro', label: 'Outro' },
]

const statusOptions = [
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'pausado', label: 'Pausado' },
]

export function ProjetoForm({
  empresaId,
  onCreated,
  onCancel,
}: {
  empresaId: string
  onCreated: () => void
  onCancel: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      ...Object.fromEntries(formData.entries()),
      empresaId,
    }

    const response = await fetch('/api/projetos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      setError('Não foi possível criar o projeto. Confira os dados.')
      return
    }

    onCreated()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="nome">
          Nome
        </label>
        <input
          required
          id="nome"
          name="nome"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="tipo">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue="diagnostico_inicial"
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {tipos.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="em_andamento"
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Salvando...' : 'Criar projeto'}
        </button>
      </div>
    </form>
  )
}
