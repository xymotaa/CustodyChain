<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  let { linhas = 3, classe = '' } = $props();
</script>

<div class={['space-y-3', classe]} role="status" aria-busy="true">
  <span class="sr-only">Carregando…</span>
  {#each Array(linhas) as _, i}
    <div class="h-5 animate-pulse rounded bg-surface-2" style:width={`${100 - (i % 3) * 12}%`}></div>
  {/each}
</div>
