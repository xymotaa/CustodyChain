<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Icon from './Icon.svelte';

  let { aberto = $bindable(false), titulo, children, rodape, onfechar } = $props();
  const idTitulo = $props.id();
  let caixa = $state();
  let focoAnterior = null;

  const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function fechar() {
    aberto = false;
    onfechar?.();
  }

  function aoTeclar(evento) {
    if (evento.key === 'Escape') return fechar();
    if (evento.key !== 'Tab') return;
    const itens = [...caixa.querySelectorAll(FOCAVEIS)];
    if (!itens.length) return;
    const primeiro = itens[0];
    const ultimo = itens.at(-1);
    if (evento.shiftKey && document.activeElement === primeiro) { ultimo.focus(); evento.preventDefault(); }
    else if (!evento.shiftKey && document.activeElement === ultimo) { primeiro.focus(); evento.preventDefault(); }
  }

  $effect(() => {
    if (!aberto) return;
    focoAnterior = document.activeElement;
    document.body.style.overflow = 'hidden';
    caixa.querySelector(FOCAVEIS)?.focus();
    return () => {
      document.body.style.overflow = '';
      focoAnterior?.focus?.();
    };
  });
</script>

{#if aberto}
  <div class="fixed inset-0 z-50 grid place-items-center p-4">
    <div class="absolute inset-0 bg-text/50" role="presentation" onmousedown={fechar}></div>
    <div
      bind:this={caixa}
      role="dialog"
      aria-modal="true"
      aria-labelledby={idTitulo}
      tabindex="-1"
      onkeydown={aoTeclar}
      class="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded border border-border bg-surface"
    >
      <header class="flex items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-2">
        <h2 id={idTitulo} class="text-sm font-semibold text-text">{titulo}</h2>
        <button type="button" class="grid h-8 w-8 place-items-center rounded text-muted hover:bg-surface-2 hover:text-text" onclick={fechar} aria-label="Fechar">
          <Icon nome="x" tamanho={18} />
        </button>
      </header>
      <div class="overflow-y-auto px-4 py-3">{@render children()}</div>
      {#if rodape}<footer class="flex flex-wrap justify-end gap-2 border-t border-border px-4 py-2">{@render rodape()}</footer>{/if}
    </div>
  </div>
{/if}
