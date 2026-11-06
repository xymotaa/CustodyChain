<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import PageHeader from '../lib/ui/PageHeader.svelte';
  import Card from '../lib/ui/Card.svelte';
  import Button from '../lib/ui/Button.svelte';
  import Modal from '../lib/ui/Modal.svelte';
  import ConfirmDialog from '../lib/ui/ConfirmDialog.svelte';
  import Textarea from '../lib/ui/Textarea.svelte';
  import Input from '../lib/ui/Input.svelte';
  import Skeleton from '../lib/ui/Skeleton.svelte';
  import ErrorState from '../lib/ui/ErrorState.svelte';
  import EmptyState from '../lib/ui/EmptyState.svelte';
  import DataTable from '../lib/ui/DataTable.svelte';
  import StatusBadge from '../lib/ui/StatusBadge.svelte';
  import SimuladoBadge from '../lib/ui/SimuladoBadge.svelte';
  import HashDisplay from '../lib/ui/HashDisplay.svelte';
  import Timeline from '../lib/ui/Timeline.svelte';
  import Icon from '../lib/ui/Icon.svelte';
  import { criarCarga } from '../lib/ui/carga.svelte.js';
  import { avisar } from '../lib/ui/toast.js';
  import { obterVestigio, linhaDoTempo, verificarIntegridade, registrarEvento, simularAdulteracao, ehSimulado } from '../lib/data/index.js';
  import { carregarVestigiosComContexto } from '../lib/data/consultas.js';
  import { acoesDoVestigio } from '../lib/policy.js';
  import { sessao } from '../lib/stores/session.js';
  import { formatarDataHora } from '../lib/format.js';

  let { params = {} } = $props();

  const lista = criarCarga(carregarVestigiosComContexto);
  const colunas = [
    { chave: 'rotuloRE', rotulo: 'Rótulo (RE)' },
    { chave: 'tipo', rotulo: 'Tipo' },
    { chave: 'processoId', rotulo: 'Processo' },
    { chave: 'estado', rotulo: 'Estado' },
  ];

  const ROTULO_ACAO = {
    iniciarPericia: 'Iniciar perícia',
    emitirLaudo: 'Emitir laudo (rompe o lacre)',
    armazenar: 'Armazenar',
    autorizarDestinacao: 'Autorizar destinação',
  };

  // Detalhe do vestígio selecionado (reexecuta ao trocar de id).
  let detalhe = $state(null);
  async function buscarDetalhe(id) {
    const [vestigio, eventos, integridade, contexto] = await Promise.all([
      obterVestigio(id), linhaDoTempo(id), verificarIntegridade(id), carregarVestigiosComContexto(),
    ]);
    return { vestigio, eventos, integridade, nomeDe: contexto.nomeDe, pseudonimoDe: contexto.pseudonimoDe };
  }
  let status = $state('carregando');
  let erro = $state('');
  async function carregarDetalhe(id) {
    status = 'carregando';
    try {
      detalhe = await buscarDetalhe(id);
      status = 'pronto';
    } catch (e) {
      erro = e.message;
      status = 'erro';
    }
  }
  $effect(() => {
    if (params.id) carregarDetalhe(params.id);
  });

  let confirmarAdulteracao = $state(false);
  let adulterando = $state(false);
  let dialogoAcao = $state(null); // 'emitirLaudo' | 'autorizarDestinacao'
  let abertoAcao = $state(false);
  let textoAcao = $state('');
  let erroAcao = $state('');
  let executando = $state(false);

  const acoesDisponiveis = $derived(detalhe ? acoesDoVestigio($sessao.perfil, $sessao.id, detalhe.vestigio) : []);

  async function adulterar() {
    adulterando = true;
    try {
      await simularAdulteracao(params.id);
      confirmarAdulteracao = false;
      await carregarDetalhe(params.id);
      avisar('info', 'Banco alterado (simulação). Confira o resultado da verificação.');
    } catch (e) {
      avisar('erro', e.message);
    } finally {
      adulterando = false;
    }
  }

  async function executarAcao(tipo, parametros = {}) {
    executando = true;
    erroAcao = '';
    try {
      await registrarEvento({ vestigioId: params.id, tipo, ...parametros });
      abertoAcao = false;
      avisar('sucesso', `${ROTULO_ACAO[tipo]}: registrado.`);
      await carregarDetalhe(params.id);
    } catch (e) {
      erroAcao = e.message;
      if (!abertoAcao) avisar('erro', e.message);
    } finally {
      executando = false;
    }
  }

  function abrirAcao(acao) {
    if (acao === 'emitirLaudo' || acao === 'autorizarDestinacao') {
      dialogoAcao = acao;
      textoAcao = erroAcao = '';
      abertoAcao = true;
    } else {
      executarAcao(acao);
    }
  }

  function confirmarDialogoAcao(evento) {
    evento.preventDefault();
    if (!textoAcao.trim()) {
      erroAcao = 'Este campo é obrigatório.';
      return;
    }
    executarAcao(dialogoAcao, dialogoAcao === 'emitirLaudo' ? { conclusao: textoAcao } : { numeroAutorizacao: textoAcao });
  }
</script>

{#if !params.id}
  <PageHeader titulo="Verificador" descricao="Escolha um vestígio para ver a linha do tempo e recalcular a integridade." migalhas={[{ rotulo: 'Painel', caminho: '/painel' }, { rotulo: 'Verificador' }]} />
  <Card titulo="Vestígios">
    {#if lista.status === 'carregando'}
      <Skeleton linhas={5} />
    {:else if lista.status === 'erro'}
      <ErrorState mensagem={lista.erro} ontentar={lista.recarregar} />
    {:else if lista.dados.vestigios.length === 0}
      <EmptyState titulo="Nenhum vestígio registrado" descricao="Cadastre um vestígio para poder verificá-lo." />
    {:else}
      {@const { vestigios, pseudonimoDe } = lista.dados}
      <DataTable {colunas} linhas={vestigios} rotuloTabela="Vestígios para verificação">
        {#snippet celula(v, coluna)}
          {#if coluna.chave === 'estado'}<StatusBadge estado={v.estado} />
          {:else if coluna.chave === 'processoId'}{pseudonimoDe(v.processoId)}
          {:else if coluna.chave === 'rotuloRE'}<span class="font-mono text-xs">{v.rotuloRE}</span>{#if v.simulado}<span class="ml-2"><SimuladoBadge /></span>{/if}
          {:else}{v[coluna.chave]}{/if}
        {/snippet}
        {#snippet acoes(v)}
          <a href={`#/verificador/${v.id}`} class="inline-flex h-9 items-center gap-2 rounded border border-border bg-surface px-3 text-sm font-medium text-text no-underline hover:bg-surface-2 hover:no-underline"><Icon nome="shield-check" tamanho={16} />Verificar</a>
        {/snippet}
      </DataTable>
    {/if}
  </Card>
{:else if status === 'carregando'}
  <PageHeader titulo="Verificador" migalhas={[{ rotulo: 'Painel', caminho: '/painel' }, { rotulo: 'Verificador', caminho: '/verificador' }, { rotulo: 'Carregando' }]} />
  <div class="space-y-4"><Card><Skeleton linhas={4} /></Card><Card><Skeleton linhas={4} /></Card></div>
{:else if status === 'erro'}
  <PageHeader titulo="Verificador" migalhas={[{ rotulo: 'Painel', caminho: '/painel' }, { rotulo: 'Verificador', caminho: '/verificador' }]} />
  <Card><ErrorState mensagem={erro} ontentar={() => carregarDetalhe(params.id)} /></Card>
{:else}
  {@const { vestigio, eventos, integridade, nomeDe, pseudonimoDe } = detalhe}
  <PageHeader
    titulo={vestigio.rotuloRE}
    descricao={`${vestigio.tipo} · ${pseudonimoDe(vestigio.processoId)}`}
    migalhas={[{ rotulo: 'Painel', caminho: '/painel' }, { rotulo: 'Verificador', caminho: '/verificador' }, { rotulo: vestigio.rotuloRE }]}
  >
    {#snippet acoes()}{#if vestigio.simulado}<SimuladoBadge />{/if}<StatusBadge estado={vestigio.estado} />{/snippet}
  </PageHeader>

  <div class="space-y-4">
    <Card titulo="Verificação de integridade" descricao="O hash é recalculado agora a partir do dado no banco e comparado ao valor registrado.">
      {#snippet acoes()}
        <Button variante="secundaria" icone="refresh" onclick={() => carregarDetalhe(params.id)}>Verificar novamente</Button>
      {/snippet}
      <div role="status" class={['flex items-center gap-3 border border-l-4 border-border bg-surface p-3', integridade.integro ? 'border-l-success' : 'border-l-danger']}>
        <span class={integridade.integro ? 'text-success' : 'text-danger'}><Icon nome={integridade.integro ? 'shield-check' : 'shield-alert'} tamanho={24} /></span>
        <div>
          <p class={['text-base font-semibold', integridade.integro ? 'text-success' : 'text-danger']}>{integridade.integro ? 'Íntegro' : 'Divergente'}</p>
          <p class="text-sm text-text">
            {integridade.integro
              ? 'O dado no banco confere com o hash registrado.'
              : 'O dado no banco não confere com o hash registrado: houve alteração fora do fluxo de custódia.'}
          </p>
        </div>
      </div>

      <dl class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="min-w-0 space-y-1">
          <dt class="text-xs font-medium text-muted">Hash registrado (ancorado)</dt>
          <dd><HashDisplay hash={integridade.hashRegistrado} completo /></dd>
          <dd class="text-xs text-muted">Ancorado em {formatarDataHora(integridade.ancoradoEm)} · <span class="font-mono">{integridade.txId}</span> {#if integridade.simulado}<SimuladoBadge />{/if}</dd>
        </div>
        <div class="min-w-0 space-y-1">
          <dt class="text-xs font-medium text-muted">Hash recalculado (dado atual no banco)</dt>
          <dd><HashDisplay hash={integridade.hashRecalculado} completo /></dd>
        </div>
      </dl>

      <div class="mt-3 border border-border bg-surface-2 p-2 text-sm">
        <p class="font-medium text-text">Dado atual no banco</p>
        <p class="mt-1 break-words text-muted">{vestigio.descricao}</p>
        <p class="mt-1 text-xs text-muted">Lacre {vestigio.lacre} · Responsável: {nomeDe(vestigio.responsavelId)}</p>
      </div>

      {#if ehSimulado}
        <div class="mt-4 flex flex-col items-start gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
          <Button variante="perigo" icone="database" onclick={() => (confirmarAdulteracao = true)}>Simular adulteração do banco</Button>
          <p class="min-w-0 text-xs text-muted sm:flex-1">Altera o dado no banco simulado sem passar pelo ledger. O hash registrado não muda, então a verificação passa a apontar divergência.</p>
        </div>
      {/if}
    </Card>

    <Card titulo="Ações de custódia" descricao="Disponíveis conforme o seu perfil e o estado do vestígio.">
      {#if acoesDisponiveis.length === 0}
        <p class="text-sm text-muted">Nenhuma ação disponível para o seu perfil neste estado.</p>
      {:else}
        <div class="flex flex-wrap gap-2">
          {#each acoesDisponiveis as acao (acao)}
            <Button variante={acao === 'autorizarDestinacao' ? 'secundaria' : 'primaria'} carregando={executando && !abertoAcao} onclick={() => abrirAcao(acao)}>{ROTULO_ACAO[acao]}</Button>
          {/each}
        </div>
      {/if}
    </Card>

    <Card titulo="Linha do tempo" descricao={`${eventos.length} evento(s) encadeados por hash.`}>
      {#if eventos.length === 0}
        <EmptyState icone="clock" titulo="Sem eventos" descricao="Este vestígio ainda não tem eventos registrados." />
      {:else}
        <Timeline {eventos} integridade={integridade.eventos} />
      {/if}
    </Card>
  </div>

  <ConfirmDialog
    bind:aberto={confirmarAdulteracao}
    titulo="Simular adulteração do banco"
    mensagem="Isto altera a descrição do vestígio diretamente no banco simulado, como faria quem administra o banco. O hash ancorado permanece intacto. Use «Reiniciar demonstração» para restaurar."
    rotuloConfirmar="Alterar o banco"
    perigo
    carregando={adulterando}
    onconfirmar={adulterar}
  />

  <Modal bind:aberto={abertoAcao} titulo={ROTULO_ACAO[dialogoAcao] ?? ''}>
    <form id="form-acao" onsubmit={confirmarDialogoAcao} class="space-y-4" novalidate>
      {#if dialogoAcao === 'emitirLaudo'}
        <p class="text-sm text-muted">Emitir o laudo rompe o lacre do vestígio e o move para Periciado.</p>
        <Textarea rotulo="Conclusão do laudo" bind:value={textoAcao} obrigatorio erro={erroAcao} />
      {:else}
        <p class="text-sm text-muted">Registra a autorização para destinar (descartar) o vestígio. O registro permanece na cadeia.</p>
        <Input rotulo="Referência da autorização judicial" bind:value={textoAcao} obrigatorio erro={erroAcao} placeholder="Ex.: Ofício sintético 12/2026" autocomplete="off" />
      {/if}
    </form>
    {#snippet rodape()}
      <Button variante="secundaria" desabilitado={executando} onclick={() => (abertoAcao = false)}>Cancelar</Button>
      <Button tipo="submit" form="form-acao" carregando={executando}>Confirmar</Button>
    {/snippet}
  </Modal>
{/if}
