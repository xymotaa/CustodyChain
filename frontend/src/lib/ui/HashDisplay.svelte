<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Icon from './Icon.svelte';
  import { truncarHash } from '../format.js';
  import { avisar } from './toast.js';

  let { hash, rotulo = '', completo = false } = $props();
  let copiado = $state(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(hash);
      copiado = true;
      setTimeout(() => (copiado = false), 1500);
    } catch {
      avisar('erro', 'Não foi possível copiar. Selecione o texto manualmente.');
    }
  }
</script>

<span class="inline-flex max-w-full items-center gap-1.5 align-middle">
  {#if rotulo}<span class="text-xs text-muted">{rotulo}</span>{/if}
  <code class={['rounded bg-surface-2 px-2 py-1 font-mono text-xs text-text', completo ? 'break-all' : 'truncate']} title={hash}>
    {completo ? hash : truncarHash(hash)}
  </code>
  <button
    type="button"
    class="grid h-7 w-7 shrink-0 place-items-center rounded text-muted hover:bg-surface-2 hover:text-text"
    onclick={copiar}
    aria-label={copiado ? 'Hash copiado' : 'Copiar hash'}
  >
    <Icon nome={copiado ? 'check' : 'copy'} tamanho={14} />
  </button>
</span>
