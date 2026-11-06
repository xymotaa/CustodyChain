<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Field from './Field.svelte';
  import { CLASSE_CONTROLE } from './controle.js';

  let { rotulo, ajuda = '', erro = '', obrigatorio = false, value = $bindable(''), linhas = 4, ...resto } = $props();
  const id = $props.id();
</script>

<Field {id} {rotulo} {ajuda} {erro} {obrigatorio}>
  <textarea
    {id}
    rows={linhas}
    class={CLASSE_CONTROLE}
    bind:value
    required={obrigatorio}
    aria-invalid={erro ? 'true' : undefined}
    aria-describedby={erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined}
    {...resto}
  ></textarea>
</Field>
