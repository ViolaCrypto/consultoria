'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type DadosSetor = {
  licencaAmbiental?: string | null
  pgrAtualizado?: string | null
  pcmsoAtualizado?: string | null
  produtosQuimicos?: string | null
  residuosPerigosos?: string | null
  observacoesGerais?: string | null
  documentosExistentes?: Record<string, DocumentoExistente>
}

type DocumentoExistente = {
  possui?: boolean
  dataUltimaRevisao?: string | null
  responsavelTecnico?: string | null
  observacoes?: string | null
  arquivoUrl?: string | null
}

type PerfilOperacional = {
  processos_provaveis?: string[]
  riscos_sst?: string[]
  aspectos_ambientais?: string[]
  documentos_esperados?: string[]
  legislacao_aplicavel?: string[]
  observacoes?: string
}

export type AnamneseData = {
  id: string
  projetoId: string
  numFuncionarios: number | null
  turnos: string | null
  processosPrincipais: string | null
  dadosSetor: DadosSetor | null
  perfilOperacional: PerfilOperacional | null
}

const documentosChave = [
  { key: 'pgr', nome: 'PGR' },
  { key: 'pcmso', nome: 'PCMSO' },
  { key: 'licencaAmbiental', nome: 'Licença Ambiental' },
  { key: 'avcbClcb', nome: 'AVCB/CLCB' },
  { key: 'alvaraFuncionamento', nome: 'Alvará de Funcionamento' },
  { key: 'planoEmergencia', nome: 'Plano de Emergência' },
  { key: 'inventarioProdutosQuimicos', nome: 'Inventário de Produtos Químicos' },
  { key: 'matrizTreinamentos', nome: 'Matriz de Treinamentos' },
]

export function AnamneseForm({
  projetoId,
  anamnese,
}: {
  projetoId: string
  anamnese: AnamneseData | null
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const dados = anamnese?.dadosSetor
  const perfil = anamnese?.perfilOperacional

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const documentosExistentes = Object.fromEntries(
      documentosChave.map((documento) => [
        documento.key,
        {
          possui: formData.get(`${documento.key}_possui`) === 'on',
          dataUltimaRevisao:
            formData.get(`${documento.key}_dataUltimaRevisao`)?.toString() || null,
          responsavelTecnico:
            formData.get(`${documento.key}_responsavelTecnico`)?.toString() || null,
          observacoes:
            formData.get(`${documento.key}_observacoes`)?.toString() || null,
          arquivoUrl:
            formData.get(`${documento.key}_arquivoUrl`)?.toString() || null,
        },
      ]),
    )
    const payload = {
      ...Object.fromEntries(formData.entries()),
      projetoId,
      documentosExistentes,
    }

    const response = await fetch('/api/anamnese', {
      method: anamnese ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      setError('Não foi possível salvar a anamnese.')
      return
    }

    setMessage('Anamnese salva com sucesso.')
    router.refresh()
  }

  async function gerarPerfil() {
    setMessage('')
    setError('')
    setIsGeneratingProfile(true)

    console.log('projetoId no AnamneseForm:', projetoId)

    const response = await fetch('/api/agentes/perfil-operacional', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projetoId: projetoId }),
    })

    setIsGeneratingProfile(false)

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      console.error('Erro ao gerar perfil operacional:', payload)
      setError(payload?.error || 'Não foi possível gerar o perfil operacional.')
      return
    }

    setMessage('Perfil operacional gerado com sucesso.')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">Anamnese</h2>
          <p className="mt-1 text-sm text-slate-600">
            Registre o contexto operacional e documental do projeto.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Field
            id="numFuncionarios"
            label="Número de funcionários"
            type="number"
            defaultValue={anamnese?.numFuncionarios?.toString() ?? ''}
          />
          <Select
            id="turnos"
            label="Turnos de trabalho"
            defaultValue={anamnese?.turnos ?? ''}
            options={['1 turno', '2 turnos', '3 turnos', 'turno administrativo']}
          />
          <Select
            id="licencaAmbiental"
            label="Possui licença ambiental?"
            defaultValue={dados?.licencaAmbiental ?? ''}
            options={['sim', 'não', 'em processo']}
          />
          <Select
            id="pgrAtualizado"
            label="Possui PGR atualizado?"
            defaultValue={dados?.pgrAtualizado ?? ''}
            options={['sim', 'não', 'desconhecido']}
          />
          <Select
            id="pcmsoAtualizado"
            label="Possui PCMSO atualizado?"
            defaultValue={dados?.pcmsoAtualizado ?? ''}
            options={['sim', 'não', 'desconhecido']}
          />
          <Select
            id="produtosQuimicos"
            label="Produtos químicos utilizados?"
            defaultValue={dados?.produtosQuimicos ?? ''}
            options={['sim', 'não']}
          />
          <Select
            id="residuosPerigosos"
            label="Gera resíduos perigosos?"
            defaultValue={dados?.residuosPerigosos ?? ''}
            options={['sim', 'não', 'não sabe']}
          />
        </div>

        <div className="mt-5 grid gap-5">
          <Textarea
            id="processosPrincipais"
            label="Processos principais"
            defaultValue={anamnese?.processosPrincipais ?? ''}
          />
          <Textarea
            id="observacoesGerais"
            label="Observações gerais"
            defaultValue={dados?.observacoesGerais ?? ''}
          />
        </div>

        <section className="mt-8 border-t border-slate-200 pt-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-950">Documentos existentes</h3>
            <p className="mt-1 text-sm text-slate-600">
              Informe quais documentos a empresa já possui. Esses dados alimentam o contexto dos agentes.
            </p>
          </div>

          <div className="grid gap-4">
            {documentosChave.map((documento) => {
              const docData = dados?.documentosExistentes?.[documento.key]

              return (
                <div key={documento.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <label className="flex items-center gap-3 text-sm font-semibold text-slate-950">
                    <input
                      type="checkbox"
                      name={`${documento.key}_possui`}
                      defaultChecked={!!docData?.possui}
                      className="h-4 w-4 rounded border-slate-300 text-slate-950"
                    />
                    Possui {documento.nome}?
                  </label>

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <Field
                      id={`${documento.key}_dataUltimaRevisao`}
                      label="Data da última revisão"
                      type="date"
                      defaultValue={docData?.dataUltimaRevisao ?? ''}
                    />
                    <Field
                      id={`${documento.key}_responsavelTecnico`}
                      label="Responsável técnico"
                      defaultValue={docData?.responsavelTecnico ?? ''}
                    />
                    <Field
                      id={`${documento.key}_arquivoUrl`}
                      label="Arquivo anexado (URL)"
                      defaultValue={docData?.arquivoUrl ?? ''}
                    />
                  </div>

                  <div className="mt-4">
                    <Textarea
                      id={`${documento.key}_observacoes`}
                      label="Observações relevantes"
                      rows={2}
                      defaultValue={docData?.observacoes ?? ''}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar anamnese'}
          </button>
        </div>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Perfil Operacional gerado por IA
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Use como ponto de partida técnico para revisar riscos, aspectos e documentos.
            </p>
          </div>
          <button
            type="button"
            disabled={isGeneratingProfile}
            onClick={gerarPerfil}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGeneratingProfile ? 'Gerando...' : perfil ? 'Regenerar' : 'Gerar Perfil com IA'}
          </button>
        </div>

        {isGeneratingProfile ? (
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
            Gerando perfil operacional...
          </div>
        ) : null}

        {perfil ? (
          <div className="mt-6">
            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Gerado por IA — revisar antes de usar
            </span>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <ProfileCard title="Processos prováveis" items={perfil.processos_provaveis} />
              <ProfileCard title="Riscos SST" items={perfil.riscos_sst} />
              <ProfileCard title="Aspectos ambientais" items={perfil.aspectos_ambientais} />
              <ProfileCard title="Documentos esperados" items={perfil.documentos_esperados} />
              <ProfileCard title="Legislação aplicável" items={perfil.legislacao_aplicavel} />
              <div className="rounded-md bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-950">Observações</h3>
                <p className="mt-2 text-sm text-slate-700">
                  {perfil.observacoes || 'Sem observações.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
            Nenhum perfil operacional gerado ainda.
          </div>
        )}
      </section>
    </div>
  )
}

function ProfileCard({
  title,
  items = [],
}: {
  title: string
  items?: string[]
}) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Nenhum item retornado.</p>
      )}
    </div>
  )
}

function Field({
  id,
  label,
  type = 'text',
  defaultValue,
}: {
  id: string
  label: string
  type?: string
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
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </div>
  )
}

function Select({
  id,
  label,
  options,
  defaultValue,
}: {
  id: string
  label: string
  options: string[]
  defaultValue: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function Textarea({
  id,
  label,
  defaultValue,
  rows = 4,
}: {
  id: string
  label: string
  defaultValue: string
  rows?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </div>
  )
}
