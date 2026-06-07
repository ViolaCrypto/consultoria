import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type SetorSeed = {
  id: string
  codigo: string
  nome: string
  descricao: string
  cnaes: string[]
  processos: string[]
  riscos: Array<{ nome: string; tipo: string; nrsAplicaveis: string[] }>
  aspectos: Array<{ nome: string; tipo: string; impacto: string }>
  documentos: Array<{
    nome: string
    tipo: string
    nrBase?: string | null
    periodicidade?: string | null
    observacoes?: string | null
  }>
}

const setores: SetorSeed[] = [
  {
    id: 'setor-metalurgia',
    codigo: 'metalurgia',
    nome: 'Metalurgia',
    descricao:
      'Operações de transformação metálica com usinagem, soldagem, pintura, tratamento superficial e caldeiraria.',
    cnaes: ['24', '25', '2599-3/99', '2539-0/01', '2542-0/00'],
    processos: ['Usinagem', 'Soldagem', 'Pintura', 'Tratamento superficial', 'Caldeiraria'],
    riscos: [
      { nome: 'Fumos metálicos', tipo: 'químico', nrsAplicaveis: ['NR-9', 'NR-15'] },
      { nome: 'Ruído acima de 85 dB', tipo: 'físico', nrsAplicaveis: ['NR-9', 'NR-15'] },
      { nome: 'Calor radiante', tipo: 'físico', nrsAplicaveis: ['NR-9', 'NR-15'] },
      { nome: 'Agentes químicos de pintura e desengraxe', tipo: 'químico', nrsAplicaveis: ['NR-9', 'NR-15', 'NR-26'] },
      { nome: 'Prensas e guilhotinas', tipo: 'acidente', nrsAplicaveis: ['NR-12', 'NR-17'] },
      { nome: 'Vasos de pressão e compressores', tipo: 'acidente', nrsAplicaveis: ['NR-13'] },
    ],
    aspectos: [
      { nome: 'Efluentes com metais pesados', tipo: 'efluente industrial', impacto: 'Toxicidade aquática e restrição de lançamento.' },
      { nome: 'Resíduos classe I', tipo: 'resíduo perigoso', impacto: 'Contaminação de solo por borra, filtros e embalagens contaminadas.' },
      { nome: 'Emissões de VOC', tipo: 'emissão atmosférica', impacto: 'Poluição atmosférica e odor em pintura industrial.' },
      { nome: 'Óleos e graxas', tipo: 'efluente/resíduo', impacto: 'Contaminação de água pluvial e necessidade de separação água-óleo.' },
    ],
    documentos: [
      { nome: 'PGR', tipo: 'sst', nrBase: 'NR-1', periodicidade: 'Anual ou por alteração de riscos' },
      { nome: 'PCMSO', tipo: 'sst', nrBase: 'NR-7', periodicidade: 'Anual' },
      { nome: 'LTCAT', tipo: 'sst', periodicidade: 'Por alteração de exposição' },
      { nome: 'Laudo de Insalubridade', tipo: 'sst', nrBase: 'NR-15' },
      { nome: 'Licença Ambiental de Operação', tipo: 'ambiental' },
    ],
  },
  {
    id: 'setor-quimico',
    codigo: 'quimico',
    nome: 'Químico',
    descricao:
      'Produção, mistura, envase, armazenamento e expedição de substâncias e preparados químicos.',
    cnaes: ['20', '2019-3/99', '2063-1/00', '2099-1/99'],
    processos: ['Mistura', 'Envase', 'Armazenamento de químicos', 'Lavagem de equipamentos', 'Expedição'],
    riscos: [
      { nome: 'Exposição química por vapores, névoas e contato dérmico', tipo: 'químico', nrsAplicaveis: ['NR-9', 'NR-15', 'NR-26'] },
      { nome: 'Inflamáveis', tipo: 'acidente', nrsAplicaveis: ['NR-20'] },
      { nome: 'Explosivos ou atmosferas explosivas', tipo: 'acidente', nrsAplicaveis: ['NR-20', 'NR-26'] },
      { nome: 'Derramamentos químicos', tipo: 'ambiental/acidente', nrsAplicaveis: ['NR-9', 'NR-20'] },
    ],
    aspectos: [
      { nome: 'Efluentes químicos', tipo: 'efluente industrial', impacto: 'Alteração de pH, DQO e toxicidade.' },
      { nome: 'Emissões atmosféricas', tipo: 'emissão atmosférica', impacto: 'VOC, odor e emissões fugitivas.' },
      { nome: 'Resíduos perigosos classe I', tipo: 'resíduo perigoso', impacto: 'Destinação controlada e rastreabilidade obrigatória.' },
      { nome: 'Contaminação de solo', tipo: 'emergência ambiental', impacto: 'Risco por vazamento em tanques e áreas de carga.' },
    ],
    documentos: [
      { nome: 'PGR', tipo: 'sst', nrBase: 'NR-1' },
      { nome: 'PCMSO', tipo: 'sst', nrBase: 'NR-7' },
      { nome: 'FISPQ de todos os produtos', tipo: 'sst/ambiental', nrBase: 'NR-26' },
      { nome: 'Plano de Emergência', tipo: 'sst/ambiental', nrBase: 'NR-20' },
      { nome: 'Licença Ambiental', tipo: 'ambiental' },
      { nome: 'Inventário de Produtos Químicos', tipo: 'sst/ambiental', nrBase: 'NR-26' },
    ],
  },
  {
    id: 'setor-plastico',
    codigo: 'plastico',
    nome: 'Plástico',
    descricao:
      'Transformação de polímeros por injeção, sopro, extrusão, termoformagem e reciclagem.',
    cnaes: ['22', '2229-3/99', '2221-8/00', '2222-6/00'],
    processos: ['Injeção', 'Sopro', 'Extrusão', 'Termoformagem', 'Reciclagem'],
    riscos: [
      { nome: 'Calor em cilindros, moldes e resistências', tipo: 'físico', nrsAplicaveis: ['NR-9', 'NR-15'] },
      { nome: 'Ruído de extrusoras, moinhos e compressores', tipo: 'físico', nrsAplicaveis: ['NR-9', 'NR-15'] },
      { nome: 'Ergonomia em embalagem e rebarbação', tipo: 'ergonômico', nrsAplicaveis: ['NR-17'] },
      { nome: 'Máquinas com pontos de esmagamento', tipo: 'acidente', nrsAplicaveis: ['NR-12'] },
      { nome: 'Movimentação de carga e sacarias', tipo: 'ergonômico/acidente', nrsAplicaveis: ['NR-11', 'NR-17'] },
    ],
    aspectos: [
      { nome: 'Aparas plásticas', tipo: 'resíduo reciclável', impacto: 'Necessidade de segregação, moagem ou destinação.' },
      { nome: 'Consumo de energia', tipo: 'consumo de recurso', impacto: 'Alta demanda por resistências, motores e chillers.' },
      { nome: 'Emissões de gases no processo', tipo: 'emissão atmosférica', impacto: 'Odor e fumos por degradação térmica.' },
      { nome: 'Logística reversa', tipo: 'responsabilidade pós-consumo', impacto: 'Obrigação potencial conforme produto e cadeia.' },
    ],
    documentos: [
      { nome: 'PGR', tipo: 'sst', nrBase: 'NR-1' },
      { nome: 'PCMSO', tipo: 'sst', nrBase: 'NR-7' },
      { nome: 'Controle de Resíduos', tipo: 'ambiental' },
      { nome: 'RecyClass se aplicável', tipo: 'qualidade/ambiental', observacoes: 'Aplicável para cadeias que exigem certificação de reciclabilidade.' },
    ],
  },
  {
    id: 'setor-logistica',
    codigo: 'logistica',
    nome: 'Logística',
    descricao:
      'Armazenagem, movimentação, expedição, manutenção de frota e carregamento.',
    cnaes: ['49', '52', '5211-7/99', '4930-2/02'],
    processos: ['Armazenagem', 'Movimentação de cargas', 'Expedição', 'Manutenção de frota', 'Carregamento'],
    riscos: [
      { nome: 'Movimentação manual de cargas', tipo: 'ergonômico', nrsAplicaveis: ['NR-11', 'NR-17'] },
      { nome: 'Empilhadeiras e transpaleteiras', tipo: 'acidente', nrsAplicaveis: ['NR-11', 'NR-12'] },
      { nome: 'Ergonomia em picking e packing', tipo: 'ergonômico', nrsAplicaveis: ['NR-17'] },
      { nome: 'Acidentes de trânsito', tipo: 'acidente', nrsAplicaveis: ['NR-1'] },
      { nome: 'Produtos perigosos armazenados ou transportados', tipo: 'químico/acidente', nrsAplicaveis: ['NR-20', 'NR-26', 'NR-29'] },
    ],
    aspectos: [
      { nome: 'Emissões veiculares', tipo: 'emissão atmosférica', impacto: 'Emissão de material particulado, NOx e CO2.' },
      { nome: 'Derramamento de combustível', tipo: 'emergência ambiental', impacto: 'Contaminação de solo e drenagem.' },
      { nome: 'Resíduos de manutenção', tipo: 'resíduo perigoso', impacto: 'Óleo usado, filtros, estopas e pneus.' },
      { nome: 'Ruído externo', tipo: 'emissão sonora', impacto: 'Incômodo à vizinhança e restrições locais.' },
    ],
    documentos: [
      { nome: 'PGR', tipo: 'sst', nrBase: 'NR-1' },
      { nome: 'PCMSO', tipo: 'sst', nrBase: 'NR-7' },
      { nome: 'MOPP se produtos perigosos', tipo: 'transporte' },
      { nome: 'Licença Ambiental', tipo: 'ambiental' },
      { nome: 'Controle de manutenção', tipo: 'operacional/ambiental' },
    ],
  },
  {
    id: 'setor-construcao',
    codigo: 'construcao',
    nome: 'Construção',
    descricao:
      'Obras com escavação, estrutura, alvenaria, instalações, acabamento e demolição.',
    cnaes: ['41', '42', '43', '4120-4/00', '4399-1/99'],
    processos: ['Escavação', 'Estrutura', 'Alvenaria', 'Instalações', 'Acabamento', 'Demolição'],
    riscos: [
      { nome: 'Trabalho em altura', tipo: 'acidente', nrsAplicaveis: ['NR-18', 'NR-35'] },
      { nome: 'Soterramento em escavações', tipo: 'acidente', nrsAplicaveis: ['NR-18'] },
      { nome: 'Risco elétrico em instalações provisórias', tipo: 'acidente', nrsAplicaveis: ['NR-10', 'NR-18'] },
      { nome: 'Ferramentas manuais e portáteis', tipo: 'acidente', nrsAplicaveis: ['NR-6', 'NR-18'] },
      { nome: 'Poeira mineral e sílica', tipo: 'químico', nrsAplicaveis: ['NR-9', 'NR-15', 'NR-18'] },
    ],
    aspectos: [
      { nome: 'Resíduos de construção civil (RCC)', tipo: 'resíduo sólido', impacto: 'Destinação conforme classe e CONAMA 307.' },
      { nome: 'Poeira', tipo: 'emissão atmosférica', impacto: 'Impacto no entorno e trabalhadores.' },
      { nome: 'Ruído', tipo: 'emissão sonora', impacto: 'Incômodo à vizinhança e restrições legais.' },
      { nome: 'Efluentes de obra', tipo: 'efluente', impacto: 'Sedimentos, cimento e lavagem de equipamentos.' },
    ],
    documentos: [
      { nome: 'PCMAT', tipo: 'sst', nrBase: 'NR-18', observacoes: 'Aplicável conforme porte e enquadramento histórico/contratual.' },
      { nome: 'PGR', tipo: 'sst', nrBase: 'NR-1/NR-18' },
      { nome: 'PCMSO', tipo: 'sst', nrBase: 'NR-7' },
      { nome: 'ART', tipo: 'engenharia' },
      { nome: 'Licença de Instalação', tipo: 'ambiental' },
    ],
  },
  {
    id: 'setor-alimenticio',
    codigo: 'alimenticio',
    nome: 'Alimentício',
    descricao:
      'Recepção de matéria-prima, processamento, envase, armazenamento e expedição de alimentos.',
    cnaes: ['10', '11', '1099-6/99', '1011-2/01', '1122-4/01'],
    processos: ['Recepção de matéria-prima', 'Processamento', 'Envase', 'Armazenamento', 'Expedição'],
    riscos: [
      { nome: 'Frio em câmaras refrigeradas', tipo: 'físico', nrsAplicaveis: ['NR-9', 'NR-15'] },
      { nome: 'Ergonomia em linhas de produção', tipo: 'ergonômico', nrsAplicaveis: ['NR-17'] },
      { nome: 'Máquinas de corte e fatiamento', tipo: 'acidente', nrsAplicaveis: ['NR-12'] },
      { nome: 'Umidade e pisos molhados', tipo: 'acidente', nrsAplicaveis: ['NR-1'] },
      { nome: 'Agentes biológicos', tipo: 'biológico', nrsAplicaveis: ['NR-9'] },
    ],
    aspectos: [
      { nome: 'Efluentes orgânicos com DBO alto', tipo: 'efluente industrial', impacto: 'Sobrecarga de ETE e corpo receptor.' },
      { nome: 'Resíduos orgânicos', tipo: 'resíduo orgânico', impacto: 'Odor, vetores e necessidade de destinação rápida.' },
      { nome: 'Consumo de água', tipo: 'consumo de recurso', impacto: 'Uso intensivo em higienização e processamento.' },
      { nome: 'Emissões de amônia em câmaras frias', tipo: 'emissão/acidente', impacto: 'Risco tóxico e emergência ambiental.' },
    ],
    documentos: [
      { nome: 'PGR', tipo: 'sst', nrBase: 'NR-1' },
      { nome: 'PCMSO', tipo: 'sst', nrBase: 'NR-7' },
      { nome: 'Licença Sanitária', tipo: 'sanitário' },
      { nome: 'Licença Ambiental', tipo: 'ambiental' },
      { nome: 'APPCC', tipo: 'qualidade/sanitário' },
    ],
  },
  {
    id: 'setor-tintas-vernizes',
    codigo: 'tintas_vernizes',
    nome: 'Tintas e Vernizes',
    descricao:
      'Fabricação de tintas, vernizes e revestimentos com pigmentos, resinas, solventes e aditivos.',
    cnaes: ['2071-1/00', '20'],
    processos: ['Mistura de pigmentos', 'Dispersão', 'Envase', 'Controle de qualidade', 'Limpeza de equipamentos'],
    riscos: [
      { nome: 'VOCs', tipo: 'químico', nrsAplicaveis: ['NR-9', 'NR-15', 'NR-26'] },
      { nome: 'Solventes inflamáveis', tipo: 'acidente/químico', nrsAplicaveis: ['NR-20', 'NR-26'] },
      { nome: 'Explosão por atmosfera inflamável', tipo: 'acidente', nrsAplicaveis: ['NR-20'] },
      { nome: 'Dermatose ocupacional', tipo: 'químico', nrsAplicaveis: ['NR-9', 'NR-15'] },
      { nome: 'Exposição química crônica', tipo: 'químico', nrsAplicaveis: ['NR-9', 'NR-15'] },
    ],
    aspectos: [
      { nome: 'Emissões de VOC', tipo: 'emissão atmosférica', impacto: 'Poluição atmosférica, odor e condicionantes de licença.' },
      { nome: 'Efluentes com pigmentos', tipo: 'efluente industrial', impacto: 'Cor, sólidos, metais e toxicidade.' },
      { nome: 'Resíduos de solventes classe I', tipo: 'resíduo perigoso', impacto: 'Inflamabilidade e destinação licenciada.' },
      { nome: 'Embalagens contaminadas', tipo: 'resíduo perigoso', impacto: 'Necessidade de descontaminação ou coprocessamento.' },
    ],
    documentos: [
      { nome: 'PGR', tipo: 'sst', nrBase: 'NR-1' },
      { nome: 'PCMSO', tipo: 'sst', nrBase: 'NR-7' },
      { nome: 'FISPQ', tipo: 'sst/ambiental', nrBase: 'NR-26' },
      { nome: 'Plano de Emergência', tipo: 'sst/ambiental', nrBase: 'NR-20' },
      { nome: 'Licença Ambiental com condicionantes de emissão', tipo: 'ambiental' },
    ],
  },
  {
    id: 'setor-servicos-escritorio',
    codigo: 'servicos_escritorio',
    nome: 'Serviços de Escritório',
    descricao:
      'Atividades administrativas, atendimento, TI e limpeza em ambiente predominantemente corporativo.',
    cnaes: ['62', '63', '70', '82'],
    processos: ['Trabalho administrativo', 'Atendimento', 'TI', 'Limpeza'],
    riscos: [
      { nome: 'Ergonomia em postos administrativos', tipo: 'ergonômico', nrsAplicaveis: ['NR-17'] },
      { nome: 'Estresse ocupacional', tipo: 'psicossocial', nrsAplicaveis: ['NR-1', 'NR-17'] },
      { nome: 'Sedentarismo', tipo: 'ergonômico/saúde', nrsAplicaveis: ['NR-17'] },
      { nome: 'Qualidade do ar interno', tipo: 'físico/químico', nrsAplicaveis: ['NR-9'] },
    ],
    aspectos: [
      { nome: 'Resíduos recicláveis', tipo: 'resíduo reciclável', impacto: 'Papel, plástico, eletrônicos e segregação.' },
      { nome: 'Consumo de energia', tipo: 'consumo de recurso', impacto: 'Climatização, iluminação e equipamentos de TI.' },
      { nome: 'Papel', tipo: 'consumo de recurso', impacto: 'Uso de insumo florestal e geração de resíduo.' },
    ],
    documentos: [
      { nome: 'PGR simplificado', tipo: 'sst', nrBase: 'NR-1' },
      { nome: 'PCMSO', tipo: 'sst', nrBase: 'NR-7' },
      { nome: 'Laudo de Ergonomia', tipo: 'sst', nrBase: 'NR-17' },
    ],
  },
]

async function main() {
  await prisma.empresa.updateMany({ data: { setorId: null, setorCodigo: null } })
  await prisma.riscoSST.deleteMany()
  await prisma.aspectoAmbiental.deleteMany()
  await prisma.processoTipico.deleteMany()
  await prisma.documentoObrigatorio.deleteMany()
  await prisma.setorIndustrial.deleteMany()

  for (const setor of setores) {
    const processos = setor.processos.map((nome) => ({
      nome,
      descricao: `Processo típico do setor ${setor.nome}: ${nome}.`,
      riscosSST: {
        create: setor.riscos.map((risco) => ({
          nome: risco.nome,
          tipo: risco.tipo,
          nrsAplicaveis: risco.nrsAplicaveis,
        })),
      },
      aspectosAmbientais: {
        create: setor.aspectos.map((aspecto) => ({
          nome: aspecto.nome,
          tipo: aspecto.tipo,
          impacto: aspecto.impacto,
        })),
      },
    }))

    await prisma.setorIndustrial.create({
      data: {
        id: setor.id,
        nome: setor.nome,
        codigo: setor.codigo,
        descricao: setor.descricao,
        cnaes: setor.cnaes,
        processos: { create: processos },
      },
    })

    await prisma.documentoObrigatorio.createMany({
      data: setor.documentos.map((documento) => ({
        nome: documento.nome,
        tipo: documento.tipo,
        setores: [setor.codigo],
        nrBase: documento.nrBase ?? null,
        periodicidade: documento.periodicidade ?? null,
        observacoes: documento.observacoes ?? null,
      })),
    })

    await prisma.empresa.updateMany({
      where: {
        OR: [{ setor: setor.codigo }, { setor: setor.codigo.replace('_', '-') }],
      },
      data: {
        setorId: setor.id,
        setorCodigo: setor.codigo,
      },
    })
  }

  const [setoresCount, processosCount, riscosCount, aspectosCount, documentosCount] =
    await Promise.all([
      prisma.setorIndustrial.count(),
      prisma.processoTipico.count(),
      prisma.riscoSST.count(),
      prisma.aspectoAmbiental.count(),
      prisma.documentoObrigatorio.count(),
    ])

  console.log('Seed da ontologia concluído.')
  console.log(`Setores: ${setoresCount}`)
  console.log(`Processos típicos: ${processosCount}`)
  console.log(`Riscos SST: ${riscosCount}`)
  console.log(`Aspectos ambientais: ${aspectosCount}`)
  console.log(`Documentos obrigatórios: ${documentosCount}`)
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed da ontologia:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
