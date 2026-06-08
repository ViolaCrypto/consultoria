export function matrizAspectosTemplate(contentHtml: string) {
  return `
    <section class="template-section">
      <h1>Matriz de Aspectos e Impactos Ambientais</h1>
      <p>Formato esperado: processo, aspecto, impacto, situação, probabilidade, severidade, significância e controles.</p>
      <div class="table-note">Revise se todos os processos reais da empresa foram contemplados.</div>
      ${contentHtml}
    </section>
  `
}
