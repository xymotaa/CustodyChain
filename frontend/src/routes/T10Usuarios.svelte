<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import PageHeader from '../lib/ui/PageHeader.svelte';
  import Card from '../lib/ui/Card.svelte';
  import Button from '../lib/ui/Button.svelte';
  import Modal from '../lib/ui/Modal.svelte';
  import Input from '../lib/ui/Input.svelte';
  import Select from '../lib/ui/Select.svelte';
  import Skeleton from '../lib/ui/Skeleton.svelte';
  import ErrorState from '../lib/ui/ErrorState.svelte';
  import EmptyState from '../lib/ui/EmptyState.svelte';
  import DataTable from '../lib/ui/DataTable.svelte';
  import SimuladoBadge from '../lib/ui/SimuladoBadge.svelte';
  import { criarCarga } from '../lib/ui/carga.svelte.js';
  import { avisar } from '../lib/ui/toast.js';
  import { listarUsuarios, criarUsuario } from '../lib/data/index.js';
  import { PERFIS, ROTULO_PERFIL } from '../lib/policy.js';

  const carga = criarCarga(listarUsuarios);
  const colunas = [
    { chave: 'nome', rotulo: 'Nome' },
    { chave: 'login', rotulo: 'Usuário' },
    { chave: 'perfil', rotulo: 'Perfil' },
  ];
  const opcoesPerfil = Object.values(PERFIS).map((p) => ({ valor: p, rotulo: ROTULO_PERFIL[p] }));

  let aberto = $state(false);
  let nome = $state('');
  let login = $state('');
  let senha = $state('');
  let perfil = $state('');
  let erro = $state('');
  let enviando = $state(false);

  function abrir() {
    nome = login = senha = perfil = erro = '';
    aberto = true;
  }

  async function criar(evento) {
    evento.preventDefault();
    if (!perfil) {
      erro = 'Selecione o perfil.';
      return;
    }
    enviando = true;
    try {
      await criarUsuario({ nome, login, senha, perfil });
      aberto = false;
      avisar('sucesso', 'Usuário criado. O perfil vem do cadastro e define o menu.');
      await carga.recarregar();
    } catch (e) {
      erro = e.message;
    } finally {
      enviando = false;
    }
  }
</script>

<PageHeader titulo="Usuários" descricao="Somente o administrador cria usuários e define o perfil de cada um. Nenhum registro é excluído." migalhas={[{ rotulo: 'Painel', caminho: '/painel' }, { rotulo: 'Usuários' }]}>
  {#snippet acoes()}<Button icone="plus" onclick={abrir}>Novo usuário</Button>{/snippet}
</PageHeader>

<Card>
  {#if carga.status === 'carregando'}
    <Skeleton linhas={5} />
  {:else if carga.status === 'erro'}
    <ErrorState mensagem={carga.erro} ontentar={carga.recarregar} />
  {:else if carga.dados.length === 0}
    <EmptyState icone="users" titulo="Nenhum usuário cadastrado" />
  {:else}
    <DataTable {colunas} linhas={carga.dados} rotuloTabela="Usuários">
      {#snippet celula(u, coluna)}
        {#if coluna.chave === 'perfil'}{ROTULO_PERFIL[u.perfil]}
        {:else if coluna.chave === 'login'}<span class="font-mono text-xs">{u.login}</span>
        {:else if coluna.chave === 'nome'}{u.nome}{#if u.simulado !== false}<span class="ml-2"><SimuladoBadge /></span>{/if}
        {:else}{u[coluna.chave]}{/if}
      {/snippet}
    </DataTable>
  {/if}
</Card>

<Modal bind:aberto titulo="Novo usuário">
  <form id="form-usuario" onsubmit={criar} class="space-y-4" novalidate>
    <Input rotulo="Nome completo" bind:value={nome} obrigatorio />
    <Input rotulo="Usuário (login)" bind:value={login} autocomplete="off" obrigatorio />
    <Input rotulo="Senha" type="password" bind:value={senha} autocomplete="new-password" ajuda="Na demonstração, use apenas senhas fictícias." obrigatorio />
    <Select rotulo="Perfil" opcoes={opcoesPerfil} bind:value={perfil} obrigatorio />
    {#if erro}<p role="alert" class="text-sm font-medium text-danger">{erro}</p>{/if}
  </form>
  {#snippet rodape()}
    <Button variante="secundaria" desabilitado={enviando} onclick={() => (aberto = false)}>Cancelar</Button>
    <Button tipo="submit" form="form-usuario" carregando={enviando}>Criar usuário</Button>
  {/snippet}
</Modal>
