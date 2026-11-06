<!-- Autoria: Lucas Barros Mota (2026) -->
<!-- O seletor nativo fica oculto para que o texto do botão seja pt-BR. -->
<script>
  import Field from './Field.svelte';
  import Icon from './Icon.svelte';

  let { rotulo, ajuda = '', erro = '', onselecionar, ...resto } = $props();
  const id = $props.id();
  let nomeArquivo = $state('');

  function aoEscolher(evento) {
    const arquivo = evento.currentTarget.files?.[0] ?? null;
    nomeArquivo = arquivo?.name ?? '';
    onselecionar?.(arquivo);
  }
</script>

<Field {id} {rotulo} {ajuda} {erro}>
  <div class="flex min-w-0 items-center gap-3">
    <input {id} type="file" class="peer sr-only" aria-describedby={erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined} onchange={aoEscolher} {...resto} />
    <label
      for={id}
      class="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded border border-border bg-surface px-4 text-sm font-medium text-text hover:bg-surface-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
    >
      <Icon nome="file" tamanho={16} />Escolher arquivo
    </label>
    <span class="min-w-0 truncate text-sm text-muted">{nomeArquivo || 'Nenhum arquivo selecionado'}</span>
  </div>
</Field>
