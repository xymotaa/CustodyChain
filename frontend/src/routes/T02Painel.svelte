<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import PageHeader from '../lib/ui/PageHeader.svelte';
  import Card from '../lib/ui/Card.svelte';
  import Button from '../lib/ui/Button.svelte';
  import Skeleton from '../lib/ui/Skeleton.svelte';
  import ErrorState from '../lib/ui/ErrorState.svelte';
  import EmptyState from '../lib/ui/EmptyState.svelte';
  import StatusBadge from '../lib/ui/StatusBadge.svelte';
  import SimuladoBadge from '../lib/ui/SimuladoBadge.svelte';
  import DataTable from '../lib/ui/DataTable.svelte';
  import { criarCarga } from '../lib/ui/carga.svelte.js';
  import { carregarVestigiosComContexto } from '../lib/data/consultas.js';
  import { ESTADOS } from '../lib/domain/estados.js';
  import { pendenciasDoPerfil, pode } from '../lib/policy.js';
  import { sessao } from '../lib/stores/session.js';

  const carga = criarCarga(carregarVestigiosComContexto);

  const colunas = [
    { chave: 'rotuloRE', rotulo: 'Rótulo (RE)' },
    { chave: 'tipo', rotulo: 'Tipo' },
    { chave: 'processoId', rotulo: 'Processo' },
    { chave: 'estado', rotulo: 'Estado' },
    { chave: 'responsavelId', rotulo: 'Responsável' },
    { chave: 'simulado', rotulo: 'Origem' },
  ];

  const contagem = (vestigios, estado) => vestigios.filter((v) => v.estado === estado).length;
  const pendencias = $derived(carga.dados ? pendenciasDoPerfil($sessao.perfil, $sessao.id, carga.dados.vestigios) : []);
  const comPendencia = $derived(pendencias.filter((p) => p.vestigios.length > 0));
  const podeVerificar = $derived(pode($sessao.perfil, 'verificar'));
</script>

<PageHeader titulo="Painel" />

{#if carga.status === 'carregando'}
  <Card titulo="Carregando"><Skeleton linhas={4} /></Card>
{:else if carga.status === 'erro'}
  <Card><ErrorState mensagem={carga.erro} ontentar={carga.recarregar} /></Card>
{:else}
  {@const { vestigios, nomeDe, pseudonimoDe } = carga.dados}
  <div class="space-y-4">
    <Card titulo="Pendências do seu perfil" semPadding>
      {#if comPendencia.length === 0}
        <div class="p-3"><EmptyState icone="check" titulo="Nenhuma pendência" descricao="Não há itens aguardando ação do seu perfil neste momento." /></div>
      {:else}
        <ul class="divide-y divide-border">
          {#each comPendencia as pendencia (pendencia.rotulo)}
            <li class="flex items-center justify-between gap-3 px-3 py-2">
              <span>{pendencia.rotulo}</span>
              <span class="flex items-center gap-4">
                <span class="font-semibold tabular-nums">{pendencia.vestigios.length}</span>
                <a href={`#${pendencia.caminho}`}>Abrir</a>
              </span>
            </li>
          {/each}
        </ul>
      {/if}
    </Card>

    <Card titulo="Vestígios por estado" semPadding>
      <ul class="grid grid-cols-1 gap-px bg-border sm:grid-cols-3" aria-label="Quantidade de vestígios por estado">
        {#each Object.values(ESTADOS) as estado (estado)}
          <li class="flex items-center justify-between gap-2 bg-surface px-3 py-2.5">
            <StatusBadge {estado} />
            <span class="text-lg font-semibold tabular-nums">{contagem(vestigios, estado)}</span>
          </li>
        {/each}
      </ul>
    </Card>

    <Card titulo="Vestígios registrados" semPadding>
      {#if vestigios.length === 0}
        <div class="p-3"><EmptyState titulo="Nenhum vestígio registrado" descricao="Os vestígios cadastrados aparecerão aqui." /></div>
      {:else}
        <DataTable {colunas} linhas={vestigios} rotuloTabela="Vestígios registrados" moldura={false}>
          {#snippet celula(v, coluna)}
            {#if coluna.chave === 'estado'}<StatusBadge estado={v.estado} />
            {:else if coluna.chave === 'processoId'}{pseudonimoDe(v.processoId)}
            {:else if coluna.chave === 'responsavelId'}{nomeDe(v.responsavelId)}
            {:else if coluna.chave === 'simulado'}{#if v.simulado}<SimuladoBadge />{:else}Ledger{/if}
            {:else if coluna.chave === 'rotuloRE'}<span class="font-mono text-xs">{v.rotuloRE}</span>
            {:else}{v[coluna.chave]}{/if}
          {/snippet}
          {#snippet acoes(v)}
            {#if podeVerificar}<Button tamanho="sm" variante="secundaria" onclick={() => (location.hash = `#/verificador/${v.id}`)}>Verificar</Button>{/if}
          {/snippet}
        </DataTable>
      {/if}
    </Card>
  </div>
{/if}
