<!-- Autoria: Lucas Barros Mota (2026) -->
<!-- Herda a cor do contêiner (barra superior escura ou página clara). -->
<script>
  import Icon from '../ui/Icon.svelte';
  import { tema, alternarTema } from '../stores/ui.js';
</script>

<button
  type="button"
  class="grid h-8 w-8 place-items-center rounded opacity-90 hover:bg-text/10 hover:opacity-100"
  onclick={alternarTema}
  aria-label={$tema === 'escuro' ? 'Ativar tema claro' : 'Ativar tema escuro'}
  title={$tema === 'escuro' ? 'Tema claro' : 'Tema escuro'}
>
  <Icon nome={$tema === 'escuro' ? 'sun' : 'moon'} tamanho={16} />
</button>
