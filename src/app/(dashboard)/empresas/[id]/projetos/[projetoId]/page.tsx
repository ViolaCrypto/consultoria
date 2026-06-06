import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProjetoTabs } from '@/components/projeto/ProjetoTabs'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ProjetoDetalhePage({
  params,
}: {
  params: Promise<{ id: string; projetoId: string }>
}) {
  const { id, projetoId } = await params
  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    include: {
      empresa: {
        select: {
          id: true,
          nome: true,
        },
      },
      arquivos: {
        orderBy: { createdAt: 'desc' },
      },
      anamnese: true,
      avaliacoes: {
        include: {
          modelo: {
            include: {
              requisitos: true,
            },
          },
          itens: {
            include: {
              requisito: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      },
      documentos: {
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  })

  if (!projeto || projeto.empresaId !== id) {
    notFound()
  }

  const modelosDisponiveis = await prisma.modeloAvaliacao.findMany({
    orderBy: { nome: 'asc' },
    include: {
      _count: {
        select: { requisitos: true },
      },
    },
  })

  const projetoData = {
    id: projeto.id,
    nome: projeto.nome,
    tipo: projeto.tipo,
    status: projeto.status,
    createdAt: projeto.createdAt.toISOString(),
    empresa: projeto.empresa,
    hasPerfilOperacional: Boolean(projeto.anamnese?.perfilOperacional),
    arquivos: projeto.arquivos.map((arquivo) => ({
      id: arquivo.id,
      nome: arquivo.nome,
      url: arquivo.url,
      tipo: arquivo.tipo,
      tamanho: arquivo.tamanho,
      createdAt: arquivo.createdAt.toISOString(),
    })),
    anamnese: projeto.anamnese
      ? {
          id: projeto.anamnese.id,
          projetoId: projeto.anamnese.projetoId,
          numFuncionarios: projeto.anamnese.numFuncionarios,
          turnos: projeto.anamnese.turnos,
          processosPrincipais: projeto.anamnese.processosPrincipais,
          dadosSetor:
            projeto.anamnese.dadosSetor &&
            typeof projeto.anamnese.dadosSetor === 'object' &&
            !Array.isArray(projeto.anamnese.dadosSetor)
              ? projeto.anamnese.dadosSetor
              : null,
          perfilOperacional:
            projeto.anamnese.perfilOperacional &&
            typeof projeto.anamnese.perfilOperacional === 'object' &&
            !Array.isArray(projeto.anamnese.perfilOperacional)
              ? projeto.anamnese.perfilOperacional
              : null,
        }
      : null,
    avaliacoes: projeto.avaliacoes.map((avaliacao) => ({
      id: avaliacao.id,
      modeloId: avaliacao.modeloId,
      modelo: {
        id: avaliacao.modelo.id,
        nome: avaliacao.modelo.nome,
        categoria: avaliacao.modelo.categoria,
        versao: avaliacao.modelo.versao,
        requisitos: avaliacao.modelo.requisitos.map((requisito) => ({
          id: requisito.id,
          codigo: requisito.codigo,
          titulo: requisito.titulo,
          descricao: requisito.descricao,
          categoria: requisito.categoria,
          peso: requisito.peso,
          evidenciaEsperada: requisito.evidenciaEsperada,
          documentoEsperado: requisito.documentoEsperado,
        })),
      },
      itens: avaliacao.itens.map((item) => ({
        id: item.id,
        status: item.status,
        confiancaIA: item.confiancaIA,
        observacao: item.observacao,
        requisito: {
          id: item.requisito.id,
          codigo: item.requisito.codigo,
          titulo: item.requisito.titulo,
          descricao: item.requisito.descricao,
          evidenciaEsperada: item.requisito.evidenciaEsperada,
          documentoEsperado: item.requisito.documentoEsperado,
        },
      })),
    })),
    documentos: projeto.documentos.map((documento) => ({
      id: documento.id,
      nome: documento.nome,
      tipo: documento.tipo,
      status: documento.status,
      conteudo: documento.conteudo,
      updatedAt: documento.updatedAt.toISOString(),
    })),
    modelosDisponiveis: modelosDisponiveis.map((modelo) => ({
      id: modelo.id,
      nome: modelo.nome,
      categoria: modelo.categoria,
      versao: modelo.versao,
      requisitosCount: modelo._count.requisitos,
    })),
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href={`/empresas/${id}`}
        className="text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        Voltar para empresa
      </Link>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Projeto
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          {projeto.nome}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {projeto.empresa.nome} · {projeto.status}
        </p>
      </div>
      <ProjetoTabs projeto={projetoData} />
    </div>
  )
}
