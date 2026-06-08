export function planoAcaoTemplate(contentHtml: string) {
  return `
    <section class="template-section">
      <h1>Plano de Ação 5W2H</h1>
      <p>O plano organiza prioridades, responsáveis, prazos, recursos e indicadores de conclusão.</p>
      <div class="timeline">
        <span>Imediato</span><span>Curto prazo</span><span>Médio prazo</span><span>Validação</span>
      </div>
      ${contentHtml}
    </section>
  `
}
