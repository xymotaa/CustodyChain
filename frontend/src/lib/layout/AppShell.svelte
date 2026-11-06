<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Topbar from './Topbar.svelte';
  import Sidebar from './Sidebar.svelte';
  import ConfirmDialog from '../ui/ConfirmDialog.svelte';
  import ToastHost from '../ui/ToastHost.svelte';
  import { menuRecolhido, gavetaAberta } from '../stores/ui.js';
  import { avisar } from '../ui/toast.js';
  import { reiniciarDemonstracao } from '../data/index.js';
  import { caminhoAtual } from '../router.js';

  let { autenticado, onsair, children } = $props();

  let confirmarReinicio = $state(false);
  let reiniciando = $state(false);

  // Fecha a gaveta móvel ao trocar de tela.
  $effect(() => {
    $caminhoAtual;
    gavetaAberta.set(false);
  });

  async function reiniciar() {
    reiniciando = true;
    try {
      await reiniciarDemonstracao();
      location.reload(); // recarrega para que nenhuma tela mantenha dados antigos
    } catch (e) {
      avisar('erro', e.message);
    } finally {
      reiniciando = false;
    }
  }
</script>

{#if autenticado}
  <header class="fixed inset-x-0 top-0 z-40 bg-surface">
    <Topbar {onsair} />
  </header>
  <Sidebar onreiniciar={() => (confirmarReinicio = true)} />
  <main
    id="conteudo"
    class={['min-h-screen pt-[var(--header-h)] transition-[padding] duration-100', $menuRecolhido ? 'md:pl-12' : 'md:pl-56']}
  >
    <div class="w-full px-4 py-4">{@render children()}</div>
  </main>
  <ConfirmDialog
    bind:aberto={confirmarReinicio}
    titulo="Reiniciar demonstração"
    mensagem="Todos os dados simulados voltam ao estado inicial (vestígios, eventos e usuários criados). Esta ação afeta apenas este navegador."
    rotuloConfirmar="Reiniciar"
    perigo
    carregando={reiniciando}
    onconfirmar={reiniciar}
  />
{:else}
  <main id="conteudo">{@render children()}</main>
{/if}
<ToastHost />
