<!-- Autoria: Lucas Barros Mota (2026) -->
<!-- semPadding: o conteúdo (tabela, lista, quadro) ocupa o painel de borda a borda, sem moldura própria. -->
<script>
  let { titulo = '', descricao = '', acoes, children, classe = '', semPadding = false } = $props();
</script>

<section class={['rounded border border-border bg-surface', classe]}>
  {#if titulo || acoes}
    <header class="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-2 px-3 py-2">
      <div class="min-w-0">
        <h2 class="text-sm font-semibold text-text">{titulo}</h2>
        {#if descricao}<p class="text-xs text-muted">{descricao}</p>{/if}
      </div>
      {#if acoes}<div class="flex flex-wrap items-center gap-2">{@render acoes()}</div>{/if}
    </header>
  {/if}
  <div class={semPadding ? '' : 'p-3'}>{@render children()}</div>
</section>
