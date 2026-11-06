<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  let { tamanho = 18, rotulo = 'Carregando' } = $props();
</script>

<span role="status" class="inline-flex">
  <svg class="animate-spin" width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  </svg>
  <span class="sr-only">{rotulo}</span>
</span>
