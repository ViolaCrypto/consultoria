'use client'

import { useState } from 'react'

const setores = [
  { value: 'metalurgia', label: 'Metalurgia' },
  { value: 'quimico', label: 'Químico' },
  { value: 'plastico', label: 'Plástico' },
  { value: 'logistica', label: 'Logística' },
  { value: 'construcao', label: 'Construção' },
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'outro', label: 'Outro' },
]

type EmpresaFormProps = {
  onCreated: () => void
  onCancel: () => void
}

export function EmpresaForm({ onCreated, onCancel }: EmpresaFormProps) {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = Object.fromEntries(formData.entries())

    const response = await fetch('/api/empresas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      setError('Não foi possível cadastrar a empresa. Confira os dados.')
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
        <Field id="cnpj" label="CNPJ" />
        <Field id="cnae" label="CNAE" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="setor">
          Setor
        </label>
        <select
          id="setor"
          name="setor"
          defaultValue="outro"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          {setores.map((setor) => (
            <option key={setor.value} value={setor.value}>
              {setor.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="cidade" label="Cidade" />
        <Field id="estado" label="Estado" />
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
          {isSubmitting ? 'Salvando...' : 'Cadastrar empresa'}
        </button>
      </div>
    </form>
  )
}

function Field({ id, label }: { id: string; label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </div>
  )
}
