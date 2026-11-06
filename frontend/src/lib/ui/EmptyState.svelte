<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Icon from './Icon.svelte';
  let { icone = 'inbox', titulo, descricao = '', acao } = $props();
</script>

<div class="flex flex-col items-center gap-2 px-4 py-6 text-center">
  <span class="text-muted"><Icon nome={icone} tamanho={20} /></span>
  <h3 class="text-sm font-semibold text-text">{titulo}</h3>
  {#if descricao}<p class="max-w-md text-sm text-muted">{descricao}</p>{/if}
  {#if acao}<div class="mt-1">{@render acao()}</div>{/if}
</div>
