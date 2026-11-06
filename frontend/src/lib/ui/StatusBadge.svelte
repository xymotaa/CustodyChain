<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Icon from './Icon.svelte';
  import { VISUAL_ESTADO } from './estadoVisual.js';
  import { ROTULO_ESTADO } from '../domain/estados.js';

  let { estado } = $props();
  const visual = $derived(VISUAL_ESTADO[estado]);
</script>

<span class={['inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-xs', visual?.classe]}>
  <Icon nome={visual?.icone ?? 'info'} tamanho={12} />
  {ROTULO_ESTADO[estado] ?? estado}
</span>
