<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Spinner from './Spinner.svelte';
  import Icon from './Icon.svelte';

  /** @type {{ variante?: 'primaria'|'secundaria'|'perigo'|'fantasma', tamanho?: 'sm'|'md', carregando?: boolean, icone?: string, tipo?: 'button'|'submit', desabilitado?: boolean, classe?: string, children: import('svelte').Snippet, [chave: string]: any }} */
  let { variante = 'primaria', tamanho = 'md', carregando = false, icone, tipo = 'button', desabilitado = false, classe = '', children, ...resto } = $props();

  const VARIANTES = {
    primaria: 'bg-primary text-primary-fg hover:bg-primary/85',
    secundaria: 'border border-border bg-surface text-text hover:bg-surface-2',
    perigo: 'bg-danger text-danger-fg hover:bg-danger/90',
    fantasma: 'text-text hover:bg-surface-2',
  };
  const TAMANHOS = { sm: 'min-h-7 px-2.5 py-1 text-sm', md: 'min-h-8 px-3 py-1.5 text-sm' };
</script>

<button
  type={tipo}
  disabled={desabilitado || carregando}
  aria-busy={carregando}
  class={[
    'inline-flex max-w-full items-center justify-center gap-1.5 rounded text-center font-medium',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTES[variante], TAMANHOS[tamanho], classe,
  ]}
  {...resto}
>
  {#if carregando}<Spinner tamanho={16} />{:else if icone}<Icon nome={icone} tamanho={16} />{/if}
  {@render children()}
</button>
