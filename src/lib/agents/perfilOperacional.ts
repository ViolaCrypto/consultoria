import { z } from 'zod'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

type DadosSetor = {
  produtosQuimicos?: string | null
  residuosPerigosos?: string | null
  observacoesGerais?: string | null
}

type AnamneseInput = {
  numFuncionarios: number | null
  turnos: string | null
  processosPrincipais: string | null
  dadosSetor: DadosSetor | null
}

type EmpresaInput = {
  nome: string
  setor: string | null
  setorCodigo?: string | null
  cnae: string | null
}

const perfilSchema = z.object({
  processos_provaveis: z.array(z.string()),
  riscos_sst: z.array(z.string()),
  aspectos_ambientais: z.array(z.string()),
  documentos_esperados: z.array(z.string()),
  legislacao_aplicavel: z.array(z.string()),
  observacoes: z.string(),
})

export type PerfilOperacional = z.infer<typeof perfilSchema>

export async function gerarPerfilOperacional(
  anamnese: AnamneseInput,
  empresa: EmpresaInput,
): Promise<PerfilOperacional> {
  const dadosSetor = anamnese.dadosSetor
  const codigoSetor = normalizarCodigoSetor(empresa.setorCodigo || empresa.setor)
  const setorOntologia = await buscarOntologiaSetor(codigoSetor, empresa.cnae)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Você é um especialista em SST e gestão ambiental ISO 14001/45001. Analise os dados da empresa e retorne APENAS JSON válido com o perfil operacional técnico. Nunca seja genérico — sempre referencie o setor, processos e características reais da empresa informada.',
      },
      {
        role: 'user',
        content: [
          'Retorne um JSON com as chaves:',
          'processos_provaveis, riscos_sst, aspectos_ambientais, documentos_esperados, legislacao_aplicavel, observacoes.',
          '',
          `Nome da empresa: ${empresa.nome}`,
          `Setor informado: ${empresa.setor || 'não informado'}`,
          `Código do setor na ontologia: ${empresa.setorCodigo || codigoSetor || 'não informado'}`,
          `CNAE: ${empresa.cnae || 'não informado'}`,
          `Número de funcionários: ${anamnese.numFuncionarios ?? 'não informado'}`,
          `Turnos: ${anamnese.turnos || 'não informado'}`,
          `Processos principais: ${anamnese.processosPrincipais || 'não informado'}`,
          `Produtos químicos utilizados: ${dadosSetor?.produtosQuimicos || 'não informado'}`,
          `Gera resíduos perigosos: ${dadosSetor?.residuosPerigosos || 'não informado'}`,
          `Observações da anamnese: ${dadosSetor?.observacoesGerais || 'não informado'}`,
          '',
          'Ontologia estruturada do setor encontrada no banco:',
          setorOntologia
            ? JSON.stringify(setorOntologia, null, 2)
            : 'Nenhuma ontologia estruturada encontrada para este setor/CNAE.',
          '',
          'Use a ontologia estruturada como base técnica prioritária para processos, riscos SST, aspectos ambientais, documentos e requisitos legais. Ajuste apenas quando a anamnese indicar algo diferente. Não invente evidências não informadas.',
        ].join('\n'),
      },
    ],
  })

  const content = completion.choices[0]?.message.content

  if (!content) {
    throw new Error('A OpenAI não retornou conteúdo para o perfil operacional.')
  }

  return perfilSchema.parse(JSON.parse(content))
}

function normalizarCodigoSetor(setor: string | null) {
  if (!setor) {
    return null
  }

  const normalizado = setor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, '_')
    .replace(/\s+/g, '_')

  const aliases: Record<string, string> = {
    alimentos: 'alimenticio',
    alimenticio: 'alimenticio',
    quimico: 'quimico',
    quimica: 'quimico',
    servicos: 'servicos_escritorio',
    escritorio: 'servicos_escritorio',
    tintas: 'tintas_vernizes',
  }

  return aliases[normalizado] || normalizado
}

async function buscarOntologiaSetor(codigoSetor: string | null, cnae: string | null) {
  if (!codigoSetor && !cnae) {
    return null
  }

  const setor = await prisma.setorIndustrial.findFirst({
    where: {
      OR: [
        ...(codigoSetor ? [{ codigo: codigoSetor }] : []),
        ...(cnae ? [{ cnaes: { has: cnae } }] : []),
      ],
    },
    include: {
      processos: {
        include: {
          riscosSST: true,
          aspectosAmbientais: true,
        },
      },
    },
  })

  if (!setor) {
    return null
  }

  const [requisitosLegais, documentosObrigatorios] = await Promise.all([
    prisma.requisitoLegal.findMany({
      where: { setores: { has: setor.codigo } },
      orderBy: { codigo: 'asc' },
    }),
    prisma.documentoObrigatorio.findMany({
      where: { setores: { has: setor.codigo } },
      orderBy: { nome: 'asc' },
    }),
  ])

  return {
    setor: {
      codigo: setor.codigo,
      nome: setor.nome,
      descricao: setor.descricao,
      cnaes: setor.cnaes,
    },
    processos_tipicos: setor.processos.map((processo) => ({
      nome: processo.nome,
      descricao: processo.descricao,
      riscos_sst: processo.riscosSST.map((risco) => ({
        nome: risco.nome,
        tipo: risco.tipo,
        nrs_aplicaveis: risco.nrsAplicaveis,
      })),
      aspectos_ambientais: processo.aspectosAmbientais.map((aspecto) => ({
        nome: aspecto.nome,
        tipo: aspecto.tipo,
        impacto: aspecto.impacto,
      })),
    })),
    requisitos_legais: requisitosLegais.map((requisito) => ({
      codigo: requisito.codigo,
      nome: requisito.nome,
      descricao: requisito.descricao,
      tipo: requisito.tipo,
      orgao: requisito.orgao,
    })),
    documentos_obrigatorios: documentosObrigatorios.map((documento) => ({
      nome: documento.nome,
      tipo: documento.tipo,
      nr_base: documento.nrBase,
      periodicidade: documento.periodicidade,
      observacoes: documento.observacoes,
    })),
  }
}
