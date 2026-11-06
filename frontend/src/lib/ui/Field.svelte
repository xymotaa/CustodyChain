<!-- Autoria: Lucas Barros Mota (2026) -->
<!-- Rótulo, ajuda e erro de um campo. O controle entra como filho e usa `id`. -->
<script>
  let { id, rotulo, ajuda = '', erro = '', obrigatorio = false, children } = $props();
</script>

<div class="space-y-1">
  <label for={id} class="block text-sm font-medium text-text">
    {rotulo}{#if obrigatorio}<span class="text-danger" aria-hidden="true"> *</span>{/if}
  </label>
  {@render children()}
  {#if ajuda && !erro}<p id="{id}-ajuda" class="text-xs text-muted">{ajuda}</p>{/if}
  {#if erro}<p id="{id}-erro" role="alert" class="text-xs font-medium text-danger">{erro}</p>{/if}
</div>
