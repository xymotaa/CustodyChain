<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  /** migalhas: [{ rotulo, caminho? }] */
  let { titulo, descricao = '', migalhas = [], acoes } = $props();
</script>

<header class="mb-4 border-b border-border pb-3">
  {#if migalhas.length}
    <nav aria-label="Trilha de navegação" class="mb-1 text-xs text-muted">
      <ol class="flex flex-wrap items-center gap-1">
        {#each migalhas as m, i}
          {#if i > 0}<li aria-hidden="true">&gt;</li>{/if}
          <li>
            {#if m.caminho}<a href={`#${m.caminho}`} class="text-primary">{m.rotulo}</a>{:else}<span aria-current="page">{m.rotulo}</span>{/if}
          </li>
        {/each}
      </ol>
    </nav>
  {/if}
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div class="min-w-0">
      <h1 class="text-lg text-text">{titulo}</h1>
      {#if descricao}<p class="text-xs text-muted">{descricao}</p>{/if}
    </div>
    {#if acoes}<div class="flex flex-wrap items-center gap-2">{@render acoes()}</div>{/if}
  </div>
</header>
