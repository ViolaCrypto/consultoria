export function inventarioRiscosTemplate(contentHtml: string) {
  return `
    <section class="template-section">
      <h1>Inventário de Riscos Ocupacionais</h1>
      <p>Formato esperado: função/GHE, atividade, perigo, risco, agentes, classificação e controles por hierarquia.</p>
      <div class="table-note">Este documento deve ser validado por responsável técnico habilitado.</div>
      ${contentHtml}
    </section>
  `
}
