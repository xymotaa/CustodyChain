<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import PageHeader from '../lib/ui/PageHeader.svelte';
  import Card from '../lib/ui/Card.svelte';
  import Select from '../lib/ui/Select.svelte';
  import Input from '../lib/ui/Input.svelte';
  import Button from '../lib/ui/Button.svelte';
  import Skeleton from '../lib/ui/Skeleton.svelte';
  import ErrorState from '../lib/ui/ErrorState.svelte';
  import EmptyState from '../lib/ui/EmptyState.svelte';
  import DataTable from '../lib/ui/DataTable.svelte';
  import StatusBadge from '../lib/ui/StatusBadge.svelte';
  import SimuladoBadge from '../lib/ui/SimuladoBadge.svelte';
  import { criarCarga } from '../lib/ui/carga.svelte.js';
  import { avisar } from '../lib/ui/toast.js';
  import { registrarEvento } from '../lib/data/index.js';
  import { carregarMovimentacoes } from '../lib/data/consultas.js';
  import { ESTADOS } from '../lib/domain/estados.js';
  import { pode, ROTULO_PERFIL } from '../lib/policy.js';
  import { rotuloEvento, formatarDataHora } from '../lib/format.js';
  import { sessao } from '../lib/stores/session.js';

  const carga = criarCarga(carregarMovimentacoes);

  let vestigioId = $state('');
  let destinoId = $state('');
  let erros = $state({});
  let enviando = $state(false);

  const colunas = [
    { chave: 'em', rotulo: 'Quando' },
    { chave: 'vestigio', rotulo: 'Vestígio' },
    { chave: 'tipo', rotulo: 'Movimentação' },
    { chave: 'autorNome', rotulo: 'Registrada por' },
    { chave: 'para', rotulo: 'Resultado' },
  ];

  const meusVestigios = $derived(
    (carga.dados?.vestigios ?? []).filter((v) => v.estado === ESTADOS.COLETADO && v.responsavelId === $sessao.id),
  );
  const opcoesVestigio = $derived(meusVestigios.map((v) => ({ valor: v.id, rotulo: `${v.rotuloRE} · ${v.tipo}` })));
  const opcoesDestino = $derived(
    (carga.dados?.usuarios ?? [])
      .filter((u) => u.id !== $sessao.id && pode(u.perfil, 'receber'))
      .map((u) => ({ valor: u.id, rotulo: `${u.nome} (${ROTULO_PERFIL[u.perfil]})` })),
  );

  async function transferir(evento) {
    evento.preventDefault();
    erros = {
      ...(!vestigioId && { vestigioId: 'Selecione o vestígio.' }),
      ...(!destinoId && { destinoId: 'Selecione o destinatário.' }),
    };
    if (Object.keys(erros).length) return;
    enviando = true;
    try {
      await registrarEvento({ vestigioId, tipo: 'transferir', destinoId });
      avisar('sucesso', 'Transferência registrada. O destinatário precisa conferir o lacre para concluir.');
      vestigioId = destinoId = '';
      await carga.recarregar();
    } catch (e) {
      avisar('erro', e.message);
    } finally {
      enviando = false;
    }
  }
</script>

<PageHeader
  titulo="Movimentações"
  descricao="Transfira a custódia de um vestígio. A transferência só se conclui quando o destinatário confere o lacre."
  migalhas={[{ rotulo: 'Painel', caminho: '/painel' }, { rotulo: 'Movimentações' }]}
/>

{#if carga.status === 'carregando'}
  <Card><Skeleton linhas={5} /></Card>
{:else if carga.status === 'erro'}
  <Card><ErrorState mensagem={carga.erro} ontentar={carga.recarregar} /></Card>
{:else}
  {@const { movimentacoes, nomeDe } = carga.dados}
  <div class="space-y-4">
    <Card titulo="Transferir vestígio" descricao="Somente vestígios Coletados sob a sua custódia podem ser transferidos.">
      {#if opcoesVestigio.length === 0}
        <EmptyState icone="package" titulo="Nenhum vestígio disponível para transferir" descricao="Cadastre um vestígio ou aguarde a devolução de uma recusa." />
      {:else}
        <form onsubmit={transferir} class="grid grid-cols-1 gap-4 md:grid-cols-3" novalidate>
          <Select rotulo="Vestígio" opcoes={opcoesVestigio} bind:value={vestigioId} erro={erros.vestigioId} obrigatorio />
          <Input rotulo="Origem (você)" value={$sessao.nome} readonly />
          <Select rotulo="Destino" opcoes={opcoesDestino} bind:value={destinoId} erro={erros.destinoId} obrigatorio />
          <div class="md:col-span-3"><Button tipo="submit" carregando={enviando} icone="transfer">Registrar transferência</Button></div>
        </form>
      {/if}
    </Card>

    <Card titulo="Histórico de movimentações" semPadding>
      {#if movimentacoes.length === 0}
        <div class="p-3"><EmptyState icone="transfer" titulo="Nenhuma movimentação registrada" descricao="As transferências, recebimentos e recusas aparecerão aqui." /></div>
      {:else}
        <DataTable {colunas} linhas={movimentacoes} rotuloTabela="Histórico de movimentações" moldura={false}>
          {#snippet celula(m, coluna)}
            {#if coluna.chave === 'em'}{formatarDataHora(m.em)}
            {:else if coluna.chave === 'vestigio'}<span class="font-mono text-xs">{m.vestigio.rotuloRE}</span> <span class="text-muted">· {m.vestigio.tipo}</span>
            {:else if coluna.chave === 'tipo'}
              {rotuloEvento(m.tipo)}
              {#if m.tipo === 'transferir'}<span class="block text-xs text-muted">{nomeDe(m.detalhes.origemId)} → {nomeDe(m.detalhes.destinoId)}</span>{/if}
              {#if m.simulado}<span class="mt-1 block"><SimuladoBadge /></span>{/if}
            {:else if coluna.chave === 'para'}<StatusBadge estado={m.para} />
            {:else}{m[coluna.chave]}{/if}
          {/snippet}
        </DataTable>
      {/if}
    </Card>
  </div>
{/if}
