<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import { tick } from 'svelte';
  import Icon from '../ui/Icon.svelte';
  import { sessao } from '../stores/session.js';
  import { menuRecolhido, alternarMenu, gavetaAberta, ehMovel, tema, alternarTema } from '../stores/ui.js';
  import { caminhoAtual } from '../router.js';
  import { menuDoPerfil, ROTULO_PERFIL } from '../policy.js';

  let { onreiniciar } = $props();

  const itens = $derived($sessao ? menuDoPerfil($sessao.perfil) : []);
  // No celular a barra é sempre "cheia" (gaveta); só o desktop usa o modo de ícones.
  const compacta = $derived($menuRecolhido && !$ehMovel);
  const escondida = $derived($ehMovel && !$gavetaAberta);
  const ehEscuro = $derived($tema === 'escuro');
  // Gaveta móvel: leva o foco ao menu ao abrir e o devolve ao botão ao fechar.
  let gavetaFoiAberta = false;
  $effect(() => {
    if (!$ehMovel) return;
    if ($gavetaAberta) {
      gavetaFoiAberta = true;
      tick().then(() => document.querySelector('#barra-lateral nav a')?.focus());
    } else if (gavetaFoiAberta) {
      gavetaFoiAberta = false;
      document.querySelector('[aria-controls="barra-lateral"]')?.focus();
    }
  });
  const ativo = (caminho) => $caminhoAtual === caminho || $caminhoAtual.startsWith(`${caminho}/`);
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && gavetaAberta.set(false)} />

{#if $gavetaAberta}
  <div class="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-20 bg-text/40 md:hidden" role="presentation" onclick={() => gavetaAberta.set(false)}></div>
{/if}

<aside
  id="barra-lateral"
  inert={escondida}
  class={[
    'fixed bottom-0 left-0 top-[var(--header-h)] z-30 flex w-60 flex-col border-r border-border bg-surface transition-[transform,width] duration-100',
    'md:translate-x-0', compacta ? 'md:w-12' : 'md:w-56',
    $gavetaAberta ? 'translate-x-0' : '-translate-x-full',
  ]}
>
  {#if $sessao}
    <div class="border-b border-border p-4 md:hidden">
      <p class="truncate text-sm font-medium text-text">{$sessao.nome}</p>
      <p class="text-xs text-muted">{ROTULO_PERFIL[$sessao.perfil]}</p>
    </div>
  {/if}

  <nav aria-label="Navegação principal" class="flex-1 overflow-y-auto py-2">
    {#each itens as item (item.caminho)}
      <a
        href={`#${item.caminho}`}
        aria-current={ativo(item.caminho) ? 'page' : undefined}
        title={compacta ? item.rotulo : undefined}
        onclick={() => gavetaAberta.set(false)}
        class={[
          'flex h-8 items-center gap-2 border-l-2 px-3 text-sm no-underline hover:no-underline',
          ativo(item.caminho) ? 'border-primary bg-surface-2 font-semibold text-text' : 'border-transparent text-text hover:bg-surface-2',
          compacta && 'md:justify-center md:px-0',
        ]}
      >
        <Icon nome={item.icone} tamanho={16} />
        <span class={compacta ? 'md:sr-only' : ''}>{item.rotulo}</span>
      </a>
    {/each}
  </nav>

  <div class="border-t border-border py-1">
    <button
      type="button"
      onclick={alternarTema}
      title={compacta ? (ehEscuro ? 'Tema claro' : 'Tema escuro') : undefined}
      class={['flex h-8 w-full items-center gap-2 px-3 text-sm text-muted hover:bg-surface-2 hover:text-text', compacta && 'md:justify-center md:px-0']}
    >
      <Icon nome={ehEscuro ? 'sun' : 'moon'} tamanho={16} />
      <span class={compacta ? 'md:sr-only' : ''}>{ehEscuro ? 'Tema claro' : 'Tema escuro'}</span>
    </button>
    <button
      type="button"
      onclick={onreiniciar}
      title={compacta ? 'Reiniciar demonstração' : undefined}
      class={['flex h-8 w-full items-center gap-2 px-3 text-sm text-muted hover:bg-surface-2 hover:text-text', compacta && 'md:justify-center md:px-0']}
    >
      <Icon nome="refresh" tamanho={16} />
      <span class={compacta ? 'md:sr-only' : ''}>Reiniciar demonstração</span>
    </button>
    <button
      type="button"
      onclick={alternarMenu}
      aria-pressed={compacta}
      title={compacta ? 'Expandir menu' : 'Recolher menu'}
      class={['hidden h-8 w-full items-center gap-2 px-3 text-sm text-muted hover:bg-surface-2 hover:text-text md:flex', compacta && 'md:justify-center md:px-0']}
    >
      <Icon nome={compacta ? 'chevrons-right' : 'chevrons-left'} tamanho={16} />
      <span class={compacta ? 'md:sr-only' : ''}>Recolher menu</span>
    </button>
  </div>
</aside>
