<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import { ICONES } from './icones.js';
  let { nome, tamanho = 20, classe = '' } = $props();
</script>

<svg
  class={['shrink-0', classe]}
  width={tamanho}
  height={tamanho}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.75"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#each ICONES[nome] ?? [] as d}
    <path {d} />
  {/each}
</svg>
