<!-- Derivado de leandroloffi/CustodyChain (2024); modificado por Lucas Barros Mota (2026) -->
<!-- Monta o shell e resolve a rota atual; o acesso por perfil vem de lib/policy.js. -->
<script>
  import AppShell from './lib/layout/AppShell.svelte';
  import EmptyState from './lib/ui/EmptyState.svelte';
  import Card from './lib/ui/Card.svelte';
  import { sessao, limparSessao } from './lib/stores/session.js';
  import { logout } from './lib/data/index.js';
  import { caminhoAtual, resolver, navegar, CAMINHO_LOGIN } from './lib/router.js';
  import { ROTAS, permiteRota } from './lib/policy.js';
  import T01Login from './routes/T01Login.svelte';
  import T02Painel from './routes/T02Painel.svelte';
  import T03CadastroVestigio from './routes/T03CadastroVestigio.svelte';
  import T04Recebimento from './routes/T04Recebimento.svelte';
  import T05Movimentacoes from './routes/T05Movimentacoes.svelte';
  import T10Usuarios from './routes/T10Usuarios.svelte';
  import T11Verificador from './routes/T11Verificador.svelte';

  const TELAS = {
    '/painel': T02Painel,
    '/vestigios/novo': T03CadastroVestigio,
    '/movimentacoes': T05Movimentacoes,
    '/recebimento': T04Recebimento,
    '/verificador': T11Verificador,
    '/verificador/:id': T11Verificador,
    '/usuarios': T10Usuarios,
  };
  const rotas = [{ caminho: CAMINHO_LOGIN, publica: true, componente: T01Login }, ...ROTAS.map((r) => ({ ...r, componente: TELAS[r.caminho] }))];

  const decisao = $derived(resolver(rotas, $caminhoAtual, Boolean($sessao), (rota) => permiteRota(rota, $sessao.perfil)));

  $effect(() => {
    if (decisao.tipo === 'redirecionar') navegar(decisao.para);
  });

  async function sair() {
    await logout();
    limparSessao();
    navegar(CAMINHO_LOGIN);
  }
</script>

<AppShell autenticado={Boolean($sessao)} onsair={sair}>
  {#if decisao.tipo === 'ok'}
    {#key $caminhoAtual}
      <decisao.rota.componente params={decisao.params} />
    {/key}
  {:else if decisao.tipo === 'negado'}
    <Card><EmptyState icone="lock" titulo="Acesso não permitido" descricao="O seu perfil não tem acesso a esta tela." /></Card>
  {:else if decisao.tipo === 'nao-encontrada'}
    <Card><EmptyState icone="search" titulo="Página não encontrada" descricao="Verifique o endereço ou volte ao painel." /></Card>
  {/if}
</AppShell>
