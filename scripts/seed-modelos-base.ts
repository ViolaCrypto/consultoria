import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type RequisitoSeed = {
  codigo: string
  titulo: string
  descricao: string
  evidenciaEsperada: string
  documentoEsperado: string
  acaoRecomendada: string
  peso: number
  categoria: string
}

type ModeloSeed = {
  id: string
  nome: string
  descricao: string
  categoria: string
  versao: string
  requisitos: RequisitoSeed[]
}

function req(
  codigo: string,
  titulo: string,
  categoria: string,
  peso: number,
  evidenciaEsperada: string,
  documentoEsperado: string,
  acaoRecomendada: string,
  descricao?: string,
): RequisitoSeed {
  return {
    codigo,
    titulo,
    categoria,
    peso,
    evidenciaEsperada,
    documentoEsperado,
    acaoRecomendada,
    descricao:
      descricao ||
      `Verificar se a organização atende ao requisito ${codigo} - ${titulo}, com evidências documentais, registros atualizados, responsáveis definidos e aplicação compatível com o porte, setor e riscos da empresa.`,
  }
}

const iso14001: RequisitoSeed[] = [
  req('4.1', 'Contexto da organização', 'Contexto', 2, 'Análise de contexto com questões internas e externas ambientais.', 'Matriz de contexto ambiental', 'Mapear contexto ambiental e fatores que afetam o SGA.'),
  req('4.2', 'Partes interessadas', 'Contexto', 2, 'Lista de partes interessadas e requisitos ambientais pertinentes.', 'Matriz de partes interessadas', 'Identificar órgãos, clientes, comunidade, fornecedores e requisitos associados.'),
  req('4.3', 'Escopo do SGA', 'Contexto', 2, 'Escopo documentado considerando atividades, limites físicos e influência.', 'Escopo do SGA', 'Definir e documentar limites e aplicabilidade do sistema ambiental.'),
  req('5.1', 'Liderança e comprometimento', 'Liderança', 2, 'Evidências de participação da direção, recursos e prestação de contas.', 'Ata de reunião da direção', 'Formalizar responsabilidades da liderança no SGA.'),
  req('5.2', 'Política ambiental', 'Liderança', 3, 'Política assinada, comunicada e adequada aos aspectos ambientais.', 'Política Ambiental', 'Criar ou revisar política ambiental com compromissos legais e melhoria contínua.'),
  req('6.1.1', 'Riscos e oportunidades', 'Planejamento', 2, 'Matriz de riscos e oportunidades ambientais.', 'Matriz de riscos e oportunidades', 'Avaliar riscos e oportunidades ligados a aspectos, requisitos legais e contexto.'),
  req('6.1.2', 'Aspectos ambientais', 'Planejamento', 3, 'Levantamento de aspectos e impactos com critérios de significância.', 'Matriz de aspectos e impactos ambientais', 'Determinar aspectos significativos por processo e ciclo de vida.'),
  req('6.1.3', 'Requisitos legais e outros requisitos', 'Planejamento', 3, 'Lista de requisitos legais aplicáveis e avaliação de atendimento.', 'Matriz de requisitos legais ambientais', 'Cadastrar, atualizar e avaliar conformidade legal ambiental.'),
  req('6.2', 'Objetivos ambientais', 'Planejamento', 2, 'Objetivos mensuráveis com metas, responsáveis, prazos e indicadores.', 'Plano de objetivos ambientais', 'Definir objetivos alinhados a aspectos significativos e política ambiental.'),
  req('7.2', 'Competência', 'Apoio', 2, 'Matriz de competências ambientais e registros de capacitação.', 'Matriz de competências', 'Determinar competências e treinar funções críticas.'),
  req('7.3', 'Conscientização', 'Apoio', 1, 'Registros de conscientização sobre política, aspectos e emergências.', 'Registro de integração/conscientização ambiental', 'Implementar comunicação de responsabilidades ambientais por função.'),
  req('7.4', 'Comunicação', 'Apoio', 1, 'Plano de comunicação interna e externa do SGA.', 'Plano de comunicação ambiental', 'Definir o que, quando, com quem e como comunicar temas ambientais.'),
  req('7.5', 'Informação documentada', 'Apoio', 2, 'Procedimento de controle de documentos e registros ambientais.', 'Procedimento de controle de documentos', 'Controlar versões, aprovações, acesso e retenção de documentos.'),
  req('8.1', 'Controle operacional', 'Operação', 3, 'Procedimentos operacionais para processos com aspectos significativos.', 'Procedimento de controle operacional ambiental', 'Implantar controles para resíduos, químicos, efluentes, emissões e emergências.'),
  req('9.1', 'Monitoramento, medição, análise e avaliação', 'Avaliação', 2, 'Indicadores ambientais, resultados de monitoramento e avaliação legal.', 'Plano de monitoramento ambiental', 'Definir indicadores, frequência, métodos e análise de resultados.'),
  req('9.2', 'Auditoria interna', 'Avaliação', 2, 'Programa, plano, relatório e registros de auditoria interna.', 'Programa de auditoria interna', 'Planejar auditorias periódicas com auditores competentes e independentes.'),
  req('9.3', 'Análise crítica pela direção', 'Avaliação', 2, 'Ata de análise crítica com entradas, decisões e ações.', 'Ata de análise crítica do SGA', 'Realizar análise crítica com desempenho, mudanças, riscos e recursos.'),
  req('10.2', 'Não conformidade e ação corretiva', 'Melhoria', 2, 'Registros de NC, causa, ação, responsável e verificação de eficácia.', 'Registro de não conformidade e ação corretiva', 'Padronizar tratamento de não conformidades e lições aprendidas.'),
]

const iso45001: RequisitoSeed[] = [
  req('4.1', 'Contexto da organização', 'Contexto', 2, 'Análise de contexto de SST com fatores internos e externos.', 'Matriz de contexto SST', 'Mapear fatores que impactam o sistema de gestão de SST.'),
  req('4.2', 'Trabalhadores e partes interessadas', 'Contexto', 2, 'Necessidades de trabalhadores, terceiros, clientes e órgãos legais.', 'Matriz de partes interessadas SST', 'Identificar requisitos pertinentes de trabalhadores e partes interessadas.'),
  req('4.3', 'Escopo do sistema de SST', 'Contexto', 2, 'Escopo documentado com atividades, unidades e trabalhadores cobertos.', 'Escopo do SGSST', 'Definir limites do sistema e atividades controladas/influenciadas.'),
  req('5.1', 'Liderança e comprometimento', 'Liderança', 3, 'Participação da alta direção, recursos e responsabilização por SST.', 'Ata ou declaração de liderança SST', 'Formalizar papel da liderança e integrar SST à gestão do negócio.'),
  req('5.2', 'Política SST', 'Liderança', 3, 'Política assinada com compromissos de prevenção, consulta e atendimento legal.', 'Política de SST', 'Criar política de SST adequada aos perigos e riscos reais.'),
  req('5.3', 'Papéis, responsabilidades e autoridades', 'Liderança', 2, 'Organograma ou matriz RACI de responsabilidades de SST.', 'Matriz de responsabilidades SST', 'Definir responsáveis por processos, controles e prestação de contas.'),
  req('5.4', 'Consulta e participação', 'Liderança', 2, 'Registros de consulta, participação e comunicação com trabalhadores.', 'Procedimento de consulta e participação', 'Criar canais e rotinas de participação dos trabalhadores.'),
  req('6.1.1', 'Riscos e oportunidades de SST', 'Planejamento', 2, 'Matriz de riscos e oportunidades de SST.', 'Matriz de riscos e oportunidades SST', 'Avaliar riscos e oportunidades ligados a perigos, mudanças e requisitos legais.'),
  req('6.1.2', 'Identificação de perigos e avaliação de riscos', 'Planejamento', 3, 'Inventário de perigos e riscos por função, atividade e condição.', 'Inventário de riscos ocupacionais', 'Atualizar levantamento de perigos, avaliações e controles.'),
  req('6.1.3', 'Requisitos legais e outros requisitos', 'Planejamento', 3, 'Matriz legal SST com avaliação de conformidade.', 'Matriz de requisitos legais SST', 'Mapear NRs aplicáveis e evidências de atendimento.'),
  req('6.2', 'Objetivos de SST', 'Planejamento', 2, 'Objetivos mensuráveis com indicadores e planos de ação.', 'Plano de objetivos SST', 'Definir objetivos de redução de riscos, incidentes e melhoria de controles.'),
  req('7.2', 'Competência', 'Apoio', 2, 'Matriz de treinamento por função e registros.', 'Matriz de competências SST', 'Garantir capacitação legal e operacional por função.'),
  req('7.3', 'Conscientização', 'Apoio', 1, 'Registros de integração, DDS e campanhas.', 'Registro de conscientização SST', 'Conscientizar sobre perigos, riscos, política e procedimentos.'),
  req('7.4', 'Comunicação', 'Apoio', 1, 'Plano de comunicação de SST e canais de reporte.', 'Plano de comunicação SST', 'Definir comunicação interna/externa e reporte de perigos/incidentes.'),
  req('8.1', 'Planejamento e controle operacional', 'Operação', 3, 'Procedimentos operacionais e controles de riscos críticos.', 'Procedimento de controle operacional SST', 'Implantar hierarquia de controles e procedimentos para atividades críticas.'),
  req('8.1.3', 'Gestão de mudanças', 'Operação', 2, 'Registros de análise de mudanças de processo, layout, máquinas e químicos.', 'Procedimento de gestão de mudanças', 'Avaliar riscos antes de mudanças temporárias ou permanentes.'),
  req('8.2', 'Preparação e resposta a emergências', 'Operação', 3, 'Plano de emergência, simulados, brigada e recursos de resposta.', 'Plano de atendimento a emergências', 'Planejar cenários de emergência e testar respostas.'),
  req('9.1', 'Monitoramento, medição e avaliação', 'Avaliação', 2, 'Indicadores SST, inspeções, medições e avaliação legal.', 'Plano de monitoramento SST', 'Medir desempenho, incidentes, treinamentos e eficácia de controles.'),
  req('9.2', 'Auditoria interna', 'Avaliação', 2, 'Programa e relatórios de auditoria interna SST.', 'Programa de auditoria interna SST', 'Auditar periodicamente o sistema e requisitos legais.'),
  req('9.3', 'Análise crítica pela direção', 'Avaliação', 2, 'Ata de análise crítica de SST.', 'Ata de análise crítica SST', 'Avaliar desempenho, recursos, riscos, oportunidades e ações.'),
  req('10.2', 'Incidente, não conformidade e ação corretiva', 'Melhoria', 2, 'Registros de investigação, causa raiz, ações e eficácia.', 'Registro de incidente e ação corretiva', 'Padronizar investigação e tratamento de incidentes e NCs.'),
]

const modelos: ModeloSeed[] = [
  {
    id: 'modelo-iso-14001-base',
    nome: 'ISO 14001 — Gestão Ambiental Base',
    descricao: 'Diagnóstico baseado nas cláusulas essenciais da ISO 14001:2015.',
    categoria: 'iso14001',
    versao: '1.0',
    requisitos: iso14001,
  },
  {
    id: 'modelo-iso-45001-base',
    nome: 'ISO 45001 — SST Base',
    descricao: 'Diagnóstico baseado nas cláusulas essenciais da ISO 45001:2018.',
    categoria: 'iso45001',
    versao: '1.0',
    requisitos: iso45001,
  },
  {
    id: 'modelo-sst-basico-nrs',
    nome: 'SST Básico — NRs',
    descricao: 'Verificação prática de atendimento mínimo às principais obrigações de SST.',
    categoria: 'sst',
    versao: '1.0',
    requisitos: checklist('SST', [
      ['NR-1', 'Possui PGR?', 'PGR vigente com inventário de riscos e plano de ação.', 'PGR', 'Elaborar ou atualizar PGR conforme riscos reais.', 3],
      ['NR-7', 'Possui PCMSO?', 'PCMSO assinado e alinhado ao PGR.', 'PCMSO', 'Revisar PCMSO com médico responsável.', 3],
      ['NR-5', 'Possui CIPA ou designado?', 'Dimensionamento CIPA/designado e registros.', 'Documentos CIPA/designado', 'Regularizar CIPA ou designado conforme quadro de empregados.', 2],
      ['NR-23', 'Possui brigada de incêndio?', 'Lista e certificados da brigada.', 'Certificados de brigada', 'Treinar brigada conforme risco e exigência local.', 2],
      ['NR-5', 'Realiza SIPAT?', 'Programa, lista de presença e evidências da SIPAT.', 'Registros de SIPAT', 'Planejar SIPAT anual ou campanhas equivalentes.', 1],
      ['NR-6', 'EPIs fornecidos e com CA?', 'Fichas de EPI com CA, entrega e treinamento.', 'Ficha de EPI', 'Atualizar fichas e validar CA dos EPIs.', 3],
      ['PREV', 'Possui LTCAT?', 'LTCAT assinado por responsável habilitado.', 'LTCAT', 'Elaborar LTCAT para base previdenciária.', 2],
      ['NR-7', 'Realiza exames ocupacionais?', 'ASOs admissionais, periódicos, retorno, mudança e demissionais.', 'ASO', 'Regularizar exames conforme PCMSO.', 3],
      ['NR-5', 'Possui mapa de riscos?', 'Mapa de riscos por setor ou análise equivalente.', 'Mapa de riscos', 'Atualizar mapa com participação dos trabalhadores.', 1],
      ['NR-26', 'Sinalização de segurança?', 'Sinalização de rotas, riscos, EPIs e produtos químicos.', 'Relatório fotográfico de sinalização', 'Implantar sinalização adequada aos riscos.', 2],
    ]),
  },
  {
    id: 'modelo-ambiental-basico',
    nome: 'Ambiental Básico',
    descricao: 'Verificação objetiva de controles ambientais essenciais.',
    categoria: 'ambiental',
    versao: '1.0',
    requisitos: checklist('Ambiental', [
      ['AMB-01', 'Possui licença ambiental?', 'Licença vigente ou protocolo aplicável.', 'Licença Ambiental', 'Confirmar enquadramento e regularizar licença.', 3],
      ['AMB-02', 'Possui controle de resíduos?', 'Planilha, MTRs e certificados de destinação.', 'Controle de resíduos', 'Implantar controle mensal de resíduos.', 3],
      ['AMB-03', 'Possui PGRS?', 'Plano de gerenciamento de resíduos sólidos.', 'PGRS', 'Elaborar PGRS conforme atividades e resíduos.', 2],
      ['AMB-04', 'Possui controle de efluentes?', 'Laudos, monitoramentos e ponto de lançamento.', 'Laudos de efluentes', 'Definir monitoramento conforme licença/CONAMA 430.', 3],
      ['AMB-05', 'Inventário de produtos químicos?', 'Lista com produtos, quantidades e FISPQs.', 'Inventário químico', 'Organizar inventário e FISPQs atualizadas.', 2],
      ['AMB-06', 'Monitora emissões atmosféricas?', 'Laudos ou justificativa de não aplicabilidade.', 'Laudo de emissões', 'Avaliar fontes fixas e condicionantes.', 2],
      ['AMB-07', 'Plano de emergência ambiental?', 'PAE com cenários, contatos e recursos.', 'Plano de emergência ambiental', 'Criar plano para derrames, incêndio e vazamentos.', 2],
    ]),
  },
  {
    id: 'modelo-requisitos-legais-basicos',
    nome: 'Requisitos Legais Básicos',
    descricao: 'Triagem de regularidade legal corporativa, ambiental e operacional.',
    categoria: 'legal',
    versao: '1.0',
    requisitos: checklist('Legal', [
      ['LEG-01', 'CNPJ ativo?', 'Comprovante de inscrição e situação cadastral ativa.', 'Cartão CNPJ', 'Verificar situação cadastral e CNAEs.', 2],
      ['LEG-02', 'Alvará de funcionamento?', 'Alvará municipal vigente ou dispensa formal.', 'Alvará', 'Regularizar licença municipal.', 2],
      ['LEG-03', 'Licença ambiental vigente?', 'Licença ou documento de dispensa válido.', 'Licença Ambiental', 'Validar condicionantes e prazo.', 3],
      ['LEG-04', 'Licença sanitária se aplicável?', 'Licença sanitária ou dispensa.', 'Licença Sanitária', 'Confirmar aplicabilidade e regularizar.', 2],
      ['LEG-05', 'AVCB/CLCB vigente?', 'Auto ou certificado do Corpo de Bombeiros.', 'AVCB/CLCB', 'Regularizar bombeiros e medidas de incêndio.', 3],
      ['LEG-06', 'Outorga se aplicável?', 'Outorga/cadastro de uso de água ou dispensa.', 'Outorga', 'Avaliar captação, poço, lançamento e regularidade.', 2],
      ['LEG-07', 'Certidões negativas?', 'Certidões ambientais/fiscais/trabalhistas quando exigidas.', 'Certidões negativas', 'Definir matriz de certidões críticas.', 1],
    ]),
  },
  simpleModel('modelo-gestao-documental', 'Gestão Documental e Evidências', 'documental', 'Controle de documentos, registros e evidências auditáveis.', [
    ['DOC-01', 'Procedimento de controle de documentos?', 'Procedimento aprovado com regras de criação, revisão, aprovação e obsolescência.', 'Procedimento de controle de documentos', 'Criar procedimento e matriz documental.', 2],
    ['DOC-02', 'Registros são mantidos?', 'Registros preservados, legíveis e recuperáveis.', 'Lista mestra de registros', 'Definir retenção e local de guarda.', 2],
    ['DOC-03', 'Documentos têm versão e data?', 'Cabeçalho/rodapé com versão, data e aprovação.', 'Documentos controlados', 'Padronizar templates e codificação.', 2],
    ['DOC-04', 'Responsável pela gestão documental?', 'Responsável formal definido.', 'Matriz de responsabilidades', 'Nomear responsável e suplente.', 1],
    ['DOC-05', 'Treinamentos arquivados?', 'Listas, certificados e conteúdos arquivados.', 'Arquivo de treinamentos', 'Organizar evidências por pessoa/função.', 2],
  ]),
  simpleModel('modelo-auditoria-pre-auditoria', 'Auditoria e Pré-auditoria', 'auditoria', 'Preparação para auditorias internas e externas.', [
    ['AUD-01', 'Programa de auditoria interna?', 'Programa anual por escopo, processo e requisito.', 'Programa de auditoria', 'Criar programa baseado em riscos e importância dos processos.', 2],
    ['AUD-02', 'Auditores independentes?', 'Evidência de independência e competência dos auditores.', 'Matriz de auditores', 'Definir auditores sem conflito com área auditada.', 2],
    ['AUD-03', 'NCs são registradas?', 'Relatórios com NCs, evidências e requisito violado.', 'Relatório de auditoria', 'Padronizar registro de NCs e oportunidades.', 2],
    ['AUD-04', 'Ações corretivas implementadas?', 'Planos de ação com responsáveis e prazos.', 'Plano de ação corretiva', 'Acompanhar ações até fechamento.', 3],
    ['AUD-05', 'Análise crítica realizada?', 'Ata com entradas, saídas e decisões.', 'Ata de análise crítica', 'Realizar análise crítica pela direção.', 2],
  ]),
  simpleModel('modelo-treinamentos-competencias', 'Treinamentos e Competências', 'treinamentos', 'Gestão de competências e capacitações obrigatórias.', [
    ['TRE-01', 'Matriz de treinamentos existe?', 'Matriz por função, risco e requisito legal.', 'Matriz de treinamentos', 'Mapear treinamentos obrigatórios por cargo.', 3],
    ['TRE-02', 'NR-01 integração?', 'Registro de integração e ordem de serviço.', 'Treinamento de integração', 'Padronizar integração de SST.', 2],
    ['TRE-03', 'Treinamentos específicos por função?', 'NRs e treinamentos técnicos conforme atividade.', 'Certificados de treinamento', 'Vincular treinamentos aos riscos da função.', 3],
    ['TRE-04', 'Registros com assinatura?', 'Lista de presença/certificado com conteúdo e carga horária.', 'Registros assinados', 'Padronizar evidências de treinamento.', 2],
    ['TRE-05', 'Avaliação de eficácia?', 'Avaliação prática, prova ou verificação em campo.', 'Avaliação de eficácia', 'Definir método de eficácia para treinamentos críticos.', 2],
  ]),
  simpleModel('modelo-emergencias-incidentes', 'Emergências e Resposta a Incidentes', 'emergencia', 'Preparação e resposta a emergências de SST e ambientais.', [
    ['EME-01', 'Possui PAE ou plano de emergência?', 'Plano com cenários, responsáveis, recursos e contatos.', 'PAE', 'Criar ou revisar plano de emergência.', 3],
    ['EME-02', 'Simulados realizados?', 'Relatórios de simulados e ações de melhoria.', 'Relatório de simulado', 'Executar simulado anual por cenário crítico.', 2],
    ['EME-03', 'Brigada treinada?', 'Certificados e dimensionamento da brigada.', 'Certificados de brigada', 'Treinar e reciclar brigadistas.', 3],
    ['EME-04', 'Contatos visíveis?', 'Lista de contatos em áreas estratégicas.', 'Lista de emergência', 'Atualizar e fixar contatos.', 1],
    ['EME-05', 'Extintores inspecionados?', 'Inspeções e validade de extintores.', 'Relatório de extintores', 'Regularizar inspeções e sinalização.', 2],
    ['EME-06', 'Hidrantes testados?', 'Teste de hidrantes/mangueiras quando aplicável.', 'Relatório de hidrantes', 'Testar sistema conforme projeto e bombeiros.', 2],
    ['EME-07', 'Rotas de fuga sinalizadas?', 'Sinalização e desobstrução das rotas.', 'Relatório fotográfico', 'Sinalizar e manter rotas livres.', 2],
  ]),
  simpleModel('modelo-residuos-quimicos-fispq', 'Resíduos Químicos e FISPQ', 'quimicos', 'Controle de produtos químicos, FISPQs e resíduos perigosos.', [
    ['QUI-01', 'FISPQ de todos os produtos?', 'FISPQs atualizadas e disponíveis aos trabalhadores.', 'FISPQ/SDS', 'Completar biblioteca de FISPQs.', 3],
    ['QUI-02', 'Armazenamento correto de químicos?', 'Compatibilidade, contenção, ventilação e identificação.', 'Inspeção de armazenamento', 'Adequar segregação e contenção.', 3],
    ['QUI-03', 'Segregação de resíduos?', 'Resíduos separados por classe e compatibilidade.', 'Plano/registro de segregação', 'Implantar segregação na fonte.', 3],
    ['QUI-04', 'Destinação com MTR?', 'MTRs emitidos e certificados vinculados.', 'MTR/CDF', 'Regularizar rastreabilidade dos resíduos.', 3],
    ['QUI-05', 'Destinador licenciado?', 'Licenças válidas dos transportadores/destinadores.', 'Licenças de fornecedores', 'Homologar fornecedores ambientais.', 2],
    ['QUI-06', 'Inventário de resíduos atualizado?', 'Inventário quantitativo por resíduo, classe e destino.', 'Inventário de resíduos', 'Atualizar inventário mensal/anual.', 2],
  ]),
  simpleModel('modelo-indicadores-objetivos-metas', 'Indicadores Objetivos e Metas', 'indicadores', 'Gestão de objetivos, metas e indicadores ambientais/SST.', [
    ['IND-01', 'Objetivos ambientais definidos?', 'Objetivos ambientais documentados e mensuráveis.', 'Plano de objetivos ambientais', 'Definir objetivos ligados a aspectos significativos.', 2],
    ['IND-02', 'Objetivos SST definidos?', 'Objetivos SST documentados e mensuráveis.', 'Plano de objetivos SST', 'Definir objetivos ligados a riscos críticos.', 2],
    ['IND-03', 'Indicadores monitorados?', 'Resultados periódicos e análise de tendência.', 'Painel de indicadores', 'Criar rotina mensal de monitoramento.', 2],
    ['IND-04', 'Metas têm prazo e responsável?', 'Metas SMART com responsável e prazo.', 'Plano de metas', 'Revisar metas incompletas.', 2],
    ['IND-05', 'Resultados comunicados?', 'Comunicação interna de desempenho.', 'Comunicados/atas', 'Comunicar resultados para liderança e equipes.', 1],
  ]),
  simpleModel('modelo-fornecedor-homologacao', 'Fornecedor e Homologação Básica', 'homologacao', 'Avaliação de fornecedores críticos ambientais e SST.', [
    ['FOR-01', 'Fornecedores críticos identificados?', 'Lista de fornecedores por criticidade.', 'Matriz de fornecedores críticos', 'Classificar fornecedores por risco ambiental/SST.', 2],
    ['FOR-02', 'Licenças ambientais de fornecedores?', 'Licenças de transportadores/destinadores e fornecedores críticos.', 'Licenças de fornecedores', 'Solicitar e controlar validade de licenças.', 3],
    ['FOR-03', 'Documentação SST de fornecedores?', 'PGR, PCMSO, treinamentos e seguros quando aplicável.', 'Dossiê SST de terceiros', 'Definir requisitos mínimos por serviço.', 2],
    ['FOR-04', 'Critérios de qualificação?', 'Procedimento ou checklist de homologação.', 'Procedimento de homologação', 'Implantar critérios de aprovação e bloqueio.', 2],
    ['FOR-05', 'Cláusulas ambientais/SST?', 'Contratos com responsabilidades e exigências.', 'Contrato padrão', 'Incluir cláusulas de conformidade ambiental e SST.', 2],
  ]),
  simpleModel('modelo-esg-governanca-basica', 'ESG e Governança Básica', 'esg', 'Triagem inicial de práticas ESG e governança.', [
    ['ESG-01', 'Política de sustentabilidade?', 'Política ou diretriz formal de sustentabilidade.', 'Política de sustentabilidade', 'Criar política compatível com riscos e impactos.', 2],
    ['ESG-02', 'Monitora energia?', 'Indicador de consumo de energia.', 'Controle de energia', 'Implantar medição e metas de eficiência.', 1],
    ['ESG-03', 'Monitora água?', 'Indicador de consumo de água.', 'Controle de água', 'Implantar controle mensal e análise de desvios.', 1],
    ['ESG-04', 'Monitora resíduos?', 'Indicador de geração e destinação de resíduos.', 'Indicador de resíduos', 'Criar indicadores por classe/destino.', 2],
    ['ESG-05', 'Ações sociais?', 'Registros de ações sociais ou comunitárias.', 'Relatório de ações sociais', 'Mapear iniciativas e indicadores sociais.', 1],
    ['ESG-06', 'Canal de denúncias?', 'Canal, política de não retaliação e tratamento.', 'Procedimento de denúncias', 'Implantar canal proporcional ao porte.', 2],
    ['ESG-07', 'Código de conduta?', 'Código formal comunicado aos colaboradores.', 'Código de conduta', 'Criar e comunicar código de conduta.', 2],
  ]),
  {
    id: 'modelo-diagnostico-inicial-completo',
    nome: 'Diagnóstico Inicial Completo',
    descricao: 'Primeiro diagnóstico rápido com requisitos críticos de ambiental, SST, legal, documentos, fornecedores e emergências.',
    categoria: 'diagnostico',
    versao: '1.0',
    requisitos: [
      ...pickCritical(iso14001, ['5.2', '6.1.2', '6.1.3', '8.1', '9.1']),
      ...pickCritical(iso45001, ['5.2', '6.1.2', '6.1.3', '8.1', '8.2']),
      ...checklist('Diagnóstico', [
        ['DIA-01', 'PGR e PCMSO vigentes?', 'PGR e PCMSO integrados aos riscos atuais.', 'PGR e PCMSO', 'Regularizar programas legais de SST.', 3],
        ['DIA-02', 'Licenças e AVCB vigentes?', 'Licenças, AVCB/CLCB e alvarás aplicáveis.', 'Dossiê legal', 'Montar matriz de validade legal.', 3],
        ['DIA-03', 'Controle de resíduos e químicos?', 'MTRs, FISPQs, inventário e fornecedores licenciados.', 'Controle ambiental operacional', 'Priorizar resíduos classe I e produtos químicos.', 3],
        ['DIA-04', 'Treinamentos críticos em dia?', 'Matriz e certificados das funções críticas.', 'Matriz de treinamentos', 'Regularizar treinamentos vencidos ou ausentes.', 2],
        ['DIA-05', 'Plano de emergência testado?', 'PAE, brigada, simulados e inspeções.', 'PAE e relatório de simulado', 'Planejar simulado e corrigir lacunas.', 2],
      ]),
    ],
  },
  simpleModel('modelo-gestao-integrada-14001-45001', 'Gestão Integrada 14001 + 45001', 'sgi', 'Requisitos de integração entre ISO 14001 e ISO 45001.', [
    ['SIG-01', 'Política integrada?', 'Política única contemplando meio ambiente e SST.', 'Política integrada SGI', 'Unificar compromissos ambientais e SST.', 3],
    ['SIG-02', 'Objetivos integrados?', 'Objetivos com indicadores ambientais e SST.', 'Plano de objetivos integrados', 'Criar objetivos integrados por risco/aspecto.', 2],
    ['SIG-03', 'Auditoria integrada?', 'Programa de auditoria cobrindo ISO 14001 e 45001.', 'Programa de auditoria integrada', 'Planejar auditoria por processos e normas.', 2],
    ['SIG-04', 'Análise crítica integrada?', 'Ata avaliando desempenho ambiental e SST.', 'Ata de análise crítica integrada', 'Unificar pauta de análise crítica.', 2],
    ['SIG-05', 'Equipe responsável pelo SIG?', 'Responsabilidades, autoridades e recursos definidos.', 'Matriz de responsabilidades SIG', 'Formalizar governança do SIG.', 2],
  ]),
]

function checklist(categoria: string, items: Array<[string, string, string, string, string, number]>): RequisitoSeed[] {
  return items.map(([codigo, titulo, evidencia, documento, acao, peso]) =>
    req(codigo, titulo, categoria, peso, evidencia, documento, acao, `Verificar criticamente: ${titulo}. ${evidencia}`),
  )
}

function simpleModel(
  id: string,
  nome: string,
  categoria: string,
  descricao: string,
  items: Array<[string, string, string, string, string, number]>,
): ModeloSeed {
  return {
    id,
    nome,
    descricao,
    categoria,
    versao: '1.0',
    requisitos: checklist(categoria, items),
  }
}

function pickCritical(requisitos: RequisitoSeed[], codigos: string[]) {
  return requisitos
    .filter((requisito) => codigos.includes(requisito.codigo))
    .map((requisito) => ({
      ...requisito,
      codigo: `CRIT-${requisito.codigo}`,
      categoria: 'Crítico',
      peso: Math.max(requisito.peso, 3),
    }))
}

async function main() {
  let requisitosCriados = 0

  for (const modeloSeed of modelos) {
    const modelo = await prisma.modeloAvaliacao.upsert({
      where: { id: modeloSeed.id },
      update: {
        nome: modeloSeed.nome,
        descricao: modeloSeed.descricao,
        categoria: modeloSeed.categoria,
        versao: modeloSeed.versao,
        ativo: true,
      },
      create: {
        id: modeloSeed.id,
        nome: modeloSeed.nome,
        descricao: modeloSeed.descricao,
        categoria: modeloSeed.categoria,
        versao: modeloSeed.versao,
        ativo: true,
      },
    })

    await prisma.requisito.deleteMany({
      where: { modeloId: modelo.id },
    })

    await prisma.requisito.createMany({
      data: modeloSeed.requisitos.map((requisito, index) => ({
        modeloId: modelo.id,
        codigo: requisito.codigo,
        titulo: requisito.titulo,
        descricao: requisito.descricao,
        evidenciaEsperada: requisito.evidenciaEsperada,
        documentoEsperado: requisito.documentoEsperado,
        acaoRecomendada: requisito.acaoRecomendada,
        peso: requisito.peso,
        categoria: requisito.categoria,
        ordem: index + 1,
      })),
    })

    requisitosCriados += modeloSeed.requisitos.length
  }

  const modelosCount = await prisma.modeloAvaliacao.count({
    where: { id: { in: modelos.map((modelo) => modelo.id) } },
  })
  const requisitosCount = await prisma.requisito.count({
    where: { modeloId: { in: modelos.map((modelo) => modelo.id) } },
  })

  console.log('Seed de modelos base concluído.')
  console.log(`Modelos criados/atualizados: ${modelosCount}`)
  console.log(`Requisitos criados: ${requisitosCriados}`)
  console.log(`Requisitos no banco para estes modelos: ${requisitosCount}`)
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed de modelos base:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
