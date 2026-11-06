<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Field from './Field.svelte';
  import { CLASSE_CONTROLE } from './controle.js';

  /** opcoes: [{ valor, rotulo }] */
  let { rotulo, opcoes, placeholder = 'Selecione…', ajuda = '', erro = '', obrigatorio = false, value = $bindable(''), ...resto } = $props();
  const id = $props.id();
</script>

<Field {id} {rotulo} {ajuda} {erro} {obrigatorio}>
  <select
    {id}
    class={CLASSE_CONTROLE}
    bind:value
    required={obrigatorio}
    aria-invalid={erro ? 'true' : undefined}
    aria-describedby={erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined}
    {...resto}
  >
    <option value="">{placeholder}</option>
    {#each opcoes as opcao (opcao.valor)}
      <option value={opcao.valor}>{opcao.rotulo}</option>
    {/each}
  </select>
</Field>
