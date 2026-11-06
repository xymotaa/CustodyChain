<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Icon from './Icon.svelte';
  import { avisos, dispensar } from './toast.js';

  const DURACAO_MS = 5000;
  const VISUAL = {
    sucesso: { icone: 'check', classe: 'text-success' },
    erro: { icone: 'alert', classe: 'text-danger' },
    info: { icone: 'info', classe: 'text-info' },
  };

  function expirar(no, id) {
    const timer = setTimeout(() => dispensar(id), DURACAO_MS);
    return { destroy: () => clearTimeout(timer) };
  }
</script>

<div class="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end" aria-live="polite">
  {#each $avisos as aviso (aviso.id)}
    <div use:expirar={aviso.id} class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded border border-border bg-surface p-3" role={aviso.tipo === 'erro' ? 'alert' : 'status'}>
      <span class={VISUAL[aviso.tipo].classe}><Icon nome={VISUAL[aviso.tipo].icone} tamanho={20} /></span>
      <p class="min-w-0 flex-1 break-words text-sm text-text">{aviso.mensagem}</p>
      <button type="button" class="text-muted hover:text-text" onclick={() => dispensar(aviso.id)} aria-label="Dispensar aviso"><Icon nome="x" tamanho={16} /></button>
    </div>
  {/each}
</div>
