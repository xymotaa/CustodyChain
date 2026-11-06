<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Icon from '../ui/Icon.svelte';
  import { sessao } from '../stores/session.js';
  import { gavetaAberta } from '../stores/ui.js';
  import { ROTULO_PERFIL } from '../policy.js';

  let { onsair } = $props();

  // Iniciais para o avatar: primeira letra do primeiro e do último nome.
  const iniciais = $derived.by(() => {
    const partes = ($sessao?.nome ?? '').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '?';
    const primeira = partes[0][0];
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
  });
</script>

<div class="flex h-14 items-center gap-2 border-b border-border bg-chrome px-4 text-sm text-chrome-fg">
  <button
    type="button"
    class="grid h-9 w-9 place-items-center rounded hover:bg-chrome-fg/10 md:hidden"
    onclick={() => gavetaAberta.update((v) => !v)}
    aria-label="Abrir menu de navegação"
    aria-expanded={$gavetaAberta}
    aria-controls="barra-lateral"
  >
    <Icon nome="menu" tamanho={18} />
  </button>

  <a href="#/painel" class="flex items-center gap-2 text-base font-semibold text-chrome-fg no-underline hover:no-underline">
    <span class="grid h-7 w-7 place-items-center rounded bg-primary text-primary-fg" aria-hidden="true"><Icon nome="shield-check" tamanho={16} /></span>
    CustodyChain
  </a>

  <div class="ml-auto flex items-center gap-2 sm:gap-3">
    {#if $sessao}
      <div class="hidden items-center gap-2 border-r border-border pr-3 sm:flex">
        <span class="grid h-9 w-9 place-items-center rounded bg-primary/10 text-sm font-semibold text-primary" aria-hidden="true">{iniciais}</span>
        <div class="leading-tight">
          <p class="max-w-56 truncate text-sm font-semibold">{$sessao.nome}</p>
          <p class="text-xs opacity-80">{ROTULO_PERFIL[$sessao.perfil]}</p>
        </div>
      </div>
    {/if}
    <button type="button" class="inline-flex h-9 items-center gap-1.5 rounded px-2.5 text-sm hover:bg-chrome-fg/10" onclick={onsair} aria-label="Sair">
      <Icon nome="logout" tamanho={16} /><span class="hidden sm:inline">Sair</span>
    </button>
  </div>
</div>
