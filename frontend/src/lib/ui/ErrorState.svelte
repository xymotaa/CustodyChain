<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Icon from './Icon.svelte';
  import Button from './Button.svelte';
  let { titulo = 'Não foi possível carregar', mensagem = '', ontentar } = $props();
</script>

<div role="alert" class="flex flex-col items-center gap-2 px-4 py-6 text-center">
  <span class="text-danger"><Icon nome="alert" tamanho={20} /></span>
  <h3 class="text-sm font-semibold text-text">{titulo}</h3>
  {#if mensagem}<p class="max-w-md text-sm text-muted">{mensagem}</p>{/if}
  {#if ontentar}<Button variante="secundaria" icone="refresh" onclick={ontentar}>Tentar de novo</Button>{/if}
</div>
