import Link from 'next/link'
import { MapPin } from 'lucide-react'

export type EmpresaCardData = {
  id: string
  nome: string
  cnpj: string | null
  cnae: string | null
  setor: string | null
  cidade: string | null
  estado: string | null
  _count?: {
    projetos: number
  }
}

export function EmpresaCard({ empresa }: { empresa: EmpresaCardData }) {
  const localizacao = [empresa.cidade, empresa.estado].filter(Boolean).join(', ')
  const setor = empresa.setor || 'outro'

  return (
    <Link
      href={`/empresas/${empresa.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            {empresa.nome}
          </h2>
          <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${sectorBadgeClass(setor)}`}>
            {setor}
          </span>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {empresa._count?.projetos ?? 0} projetos
        </span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm text-slate-600">
        <div>
          <dt className="font-medium text-slate-900">CNPJ</dt>
          <dd>{empresa.cnpj || 'Não informado'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">CNAE</dt>
          <dd>{empresa.cnae || 'Não informado'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Localização</dt>
          <dd className="mt-1 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
            {localizacao || 'Não informada'}
          </dd>
        </div>
      </dl>
    </Link>
  )
}

function sectorBadgeClass(setor: string) {
  const classes: Record<string, string> = {
    metalurgia: 'bg-blue-50 text-blue-700',
    quimico: 'bg-orange-50 text-orange-700',
    plastico: 'bg-violet-50 text-violet-700',
    logistica: 'bg-emerald-50 text-emerald-700',
    construcao: 'bg-yellow-50 text-yellow-700',
    alimentos: 'bg-lime-50 text-lime-700',
    servicos: 'bg-cyan-50 text-cyan-700',
    outro: 'bg-slate-100 text-slate-700',
  }

  return classes[setor] || classes.outro
}
