export function politicaAmbientalTemplate(contentHtml: string) {
  return `
    <section class="template-section">
      <h1>Apresentação</h1>
      <p>Este documento formaliza as diretrizes ambientais aplicáveis à organização cliente.</p>
      <h1>Política Ambiental</h1>
      ${contentHtml}
      <h1>Compromissos</h1>
      <ul>
        <li>Atendimento aos requisitos legais e outros requisitos subscritos.</li>
        <li>Prevenção da poluição e melhoria contínua do desempenho ambiental.</li>
      </ul>
      <h1>Comunicação e Revisão</h1>
      <p>A política deve ser comunicada às partes interessadas e revisada periodicamente.</p>
    </section>
  `
}
