<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import PageHeader from '../lib/ui/PageHeader.svelte';
  import Card from '../lib/ui/Card.svelte';
  import Modal from '../lib/ui/Modal.svelte';
  import Input from '../lib/ui/Input.svelte';
  import Textarea from '../lib/ui/Textarea.svelte';
  import Button from '../lib/ui/Button.svelte';
  import Skeleton from '../lib/ui/Skeleton.svelte';
  import ErrorState from '../lib/ui/ErrorState.svelte';
  import EmptyState from '../lib/ui/EmptyState.svelte';
  import DataTable from '../lib/ui/DataTable.svelte';
  import StatusBadge from '../lib/ui/StatusBadge.svelte';
  import SimuladoBadge from '../lib/ui/SimuladoBadge.svelte';
  import Icon from '../lib/ui/Icon.svelte';
  import { criarCarga } from '../lib/ui/carga.svelte.js';
  import { avisar } from '../lib/ui/toast.js';
  import { registrarEvento } from '../lib/data/index.js';
  import { carregarVestigiosComContexto } from '../lib/data/consultas.js';
  import { ESTADOS } from '../lib/domain/estados.js';
  import { emTransitoPara } from '../lib/policy.js';
  import { formatarDataHora } from '../lib/format.js';
  import { sessao } from '../lib/stores/session.js';

  const JUSTIFICATIVA_MINIMA = 10;
  const carga = criarCarga(carregarVestigiosComContexto);

  const colunas = [
    { chave: 'rotuloRE', rotulo: 'Rótulo (RE)' },
    { chave: 'tipo', rotulo: 'Tipo' },
    { chave: 'origem', rotulo: 'Origem' },
    { chave: 'enviadoEm', rotulo: 'Enviado em' },
    { chave: 'estado', rotulo: 'Estado' },
  ];

  let dialogo = $state(null); // { modo: 'aceitar' | 'recusar', vestigio }
  let aberto = $state(false);
  let lacreInformado = $state('');
  let justificativa = $state('');
  let erro = $state('');
  let enviando = $state(false);
  let resultado = $state(null); // último desfecho, mantido visível após a ação

  const itens = $derived(carga.dados ? emTransitoPara(carga.dados.vestigios, $sessao.id) : []);

  function abrir(modo, vestigio) {
    dialogo = { modo, vestigio };
    lacreInformado = justificativa = erro = '';
    aberto = true;
  }

  async function confirmar(evento) {
    evento.preventDefault();
    const { modo, vestigio } = dialogo;
    if (modo === 'recusar' && justificativa.trim().length < JUSTIFICATIVA_MINIMA) {
      erro = `Informe uma justificativa com pelo menos ${JUSTIFICATIVA_MINIMA} caracteres.`;
      return;
    }
    if (modo === 'aceitar' && !lacreInformado.trim()) {
      erro = 'Informe o número do lacre conferido.';
      return;
    }
    enviando = true;
    try {
      const comando = modo === 'aceitar'
        ? { vestigioId: vestigio.id, tipo: 'receber', lacreInformado }
        : { vestigioId: vestigio.id, tipo: 'recusar', justificativa };
      const registro = await registrarEvento(comando);
      resultado = { modo, vestigio, estado: registro.para };
      aberto = false;
      await carga.recarregar();
    } catch (e) {
      erro = e.message;
    } finally {
      enviando = false;
    }
  }
</script>

<PageHeader
  titulo="Recebimento"
  descricao="Confira o lacre de cada item em trânsito. Recusar exige justificativa e devolve o item ao estado anterior."
  migalhas={[{ rotulo: 'Painel', caminho: '/painel' }, { rotulo: 'Recebimento' }]}
/>

<div class="space-y-4">
  {#if resultado}
    {@const comprometida = resultado.estado === ESTADOS.CUSTODIA_COMPROMETIDA}
    {@const recusado = resultado.modo === 'recusar'}
    <div role={comprometida ? 'alert' : 'status'} class={['flex items-start gap-2 border border-l-4 border-border bg-surface p-3', comprometida ? 'border-l-danger' : 'border-l-success']}>
      <span class={comprometida ? 'text-danger' : 'text-success'}><Icon nome={comprometida ? 'shield-alert' : 'check'} tamanho={18} /></span>
      <div class="min-w-0 text-sm">
        <p class="font-semibold text-text">
          {#if comprometida}Divergência de lacre: custódia comprometida.
          {:else if recusado}Recebimento recusado e item devolvido ao responsável anterior.
          {:else}Recebimento concluído: lacre conferido.{/if}
        </p>
        <p class="mt-1 text-muted">
          {resultado.vestigio.rotuloRE} agora está <StatusBadge estado={resultado.estado} />
          {#if comprometida} A divergência foi registrada na linha do tempo e não será revertida automaticamente (RN21).{/if}
        </p>
      </div>
    </div>
  {/if}

  <Card titulo="Itens em trânsito para você" descricao="RN16: quem registrou a transferência não pode aprová-la.">
    {#if carga.status === 'carregando'}
      <Skeleton linhas={4} />
    {:else if carga.status === 'erro'}
      <ErrorState mensagem={carga.erro} ontentar={carga.recarregar} />
    {:else if itens.length === 0}
      <EmptyState icone="inbox" titulo="Nenhum item em trânsito para você" descricao="Quando alguém transferir um vestígio a você, ele aparecerá aqui." />
    {:else}
      {@const { nomeDe } = carga.dados}
      <DataTable {colunas} linhas={itens} rotuloTabela="Itens em trânsito">
        {#snippet celula(v, coluna)}
          {#if coluna.chave === 'origem'}{nomeDe(v.transferencia.origemId)}
          {:else if coluna.chave === 'enviadoEm'}{formatarDataHora(v.transferencia.em)}
          {:else if coluna.chave === 'estado'}<StatusBadge estado={v.estado} />{#if v.simulado}<span class="ml-2"><SimuladoBadge /></span>{/if}
          {:else if coluna.chave === 'rotuloRE'}<span class="font-mono text-xs">{v.rotuloRE}</span>
          {:else}{v[coluna.chave]}{/if}
        {/snippet}
        {#snippet acoes(v)}
          <Button tamanho="sm" icone="check" onclick={() => abrir('aceitar', v)}>Conferir e aceitar</Button>
          <Button tamanho="sm" variante="secundaria" onclick={() => abrir('recusar', v)}>Recusar</Button>
        {/snippet}
      </DataTable>
    {/if}
  </Card>
</div>

<Modal bind:aberto titulo={dialogo?.modo === 'recusar' ? 'Recusar recebimento' : 'Conferir lacre e aceitar'}>
  {#if dialogo}
    <form id="form-recebimento" onsubmit={confirmar} class="space-y-4" novalidate>
      <p class="text-sm text-muted">
        {dialogo.vestigio.rotuloRE} · {dialogo.vestigio.tipo}
      </p>
      {#if dialogo.modo === 'aceitar'}
        <Input rotulo="Número do lacre conferido" bind:value={lacreInformado} ajuda="Digite o número lido no lacre físico. Se divergir do registrado, a custódia será marcada como comprometida." autocomplete="off" obrigatorio {erro} />
      {:else}
        <Textarea rotulo="Justificativa da recusa" bind:value={justificativa} ajuda="Obrigatória. O item volta ao estado anterior e ao responsável de origem." obrigatorio {erro} />
      {/if}
    </form>
  {/if}
  {#snippet rodape()}
    <Button variante="secundaria" desabilitado={enviando} onclick={() => (aberto = false)}>Cancelar</Button>
    <Button tipo="submit" form="form-recebimento" variante={dialogo?.modo === 'recusar' ? 'perigo' : 'primaria'} carregando={enviando}>
      {dialogo?.modo === 'recusar' ? 'Confirmar recusa' : 'Confirmar recebimento'}
    </Button>
  {/snippet}
</Modal>
