'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type ProblemaAuditoria = {
  severidade: 'critica' | 'alta' | 'media'
  tipo: string
  descricao: string
}

type ValidacaoAuditoria = {
  scoreAuditoria: number
  aprovadoAuditoria: boolean
  problemas: ProblemaAuditoria[]
  temProblemasCriticos: boolean
}

type DocumentoPreview = {
  id: string
  nome: string
  conteudo: string | null
  metadados?: unknown
  validacaoAuditoria?: unknown
}

export function PreviewDocumento({
  documento,
  onRegenerarCorrigindo,
  regenerando,
}: {
  documento: DocumentoPreview
  onRegenerarCorrigindo?: (problemas: ProblemaAuditoria[]) => void
  regenerando?: boolean
}) {
  const validacao = getValidacaoAuditoria(documento)
  const problemas = validacao?.problemas || []

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h4 className="break-words font-semibold text-slate-950">Auditoria Tecnica</h4>
            <p className="mt-1 break-words text-sm text-slate-600">
              Score: {validacao?.scoreAuditoria ?? '-'} / 100
              {validacao?.temProblemasCriticos ? ' - problemas criticos encontrados' : ''}
            </p>
          </div>
          <button
            type="button"
            disabled={!problemas.length || regenerando}
            onClick={() => onRegenerarCorrigindo?.(problemas)}
            className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {regenerando ? 'Regenerando...' : 'Regenerar corrigindo problemas'}
          </button>
        </div>

        {problemas.length ? (
          <div className="mt-4 grid gap-3">
            {(['critica', 'alta', 'media'] as const).map((severidade) => {
              const itens = problemas.filter((problema) => problema.severidade === severidade)
              if (!itens.length) return null

              return (
                <div key={severidade} className={`rounded-md border p-3 ${tone(severidade)}`}>
                  <p className="text-sm font-semibold capitalize">{severidade}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {itens.map((problema, index) => (
                      <li key={`${problema.tipo}-${index}`} className="break-words">
                        {problema.descricao}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Nenhuma validacao de auditoria registrada ainda.</p>
        )}
      </section>

      <div className="prose prose-slate max-w-none break-words">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {documento.conteudo || 'Sem conteudo.'}
        </ReactMarkdown>
      </div>
    </div>
  )
}

function getValidacaoAuditoria(documento: DocumentoPreview): ValidacaoAuditoria | null {
  const metadados = parseJsonIfNeeded(documento.metadados)
  const validacaoDireta = parseJsonIfNeeded(documento.validacaoAuditoria)

  if (isValidacaoAuditoria(validacaoDireta)) {
    return normalizeValidacao(validacaoDireta)
  }

  if (!metadados || typeof metadados !== 'object') {
    return null
  }

  const validacao = (metadados as { validacaoAuditoria?: unknown }).validacaoAuditoria
  const parsedValidacao = parseJsonIfNeeded(validacao)
  if (!isValidacaoAuditoria(parsedValidacao)) {
    return null
  }

  return normalizeValidacao(parsedValidacao)
}

function parseJsonIfNeeded(value: unknown) {
  if (typeof value !== 'string') return value

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function isValidacaoAuditoria(value: unknown): value is Partial<ValidacaoAuditoria> {
  return Boolean(value && typeof value === 'object' && 'problemas' in value)
}

function normalizeValidacao(value: Partial<ValidacaoAuditoria>): ValidacaoAuditoria {
  return {
    scoreAuditoria:
      typeof value.scoreAuditoria === 'number' ? value.scoreAuditoria : 0,
    aprovadoAuditoria: Boolean(value.aprovadoAuditoria),
    problemas: Array.isArray(value.problemas) ? value.problemas : [],
    temProblemasCriticos: Boolean(value.temProblemasCriticos),
  }
}

function tone(severidade: ProblemaAuditoria['severidade']) {
  if (severidade === 'critica') return 'border-red-200 bg-red-50 text-red-800'
  if (severidade === 'alta') return 'border-orange-200 bg-orange-50 text-orange-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}
