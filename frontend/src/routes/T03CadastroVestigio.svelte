<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import PageHeader from '../lib/ui/PageHeader.svelte';
  import Card from '../lib/ui/Card.svelte';
  import Input from '../lib/ui/Input.svelte';
  import Select from '../lib/ui/Select.svelte';
  import Textarea from '../lib/ui/Textarea.svelte';
  import FileInput from '../lib/ui/FileInput.svelte';
  import Button from '../lib/ui/Button.svelte';
  import Skeleton from '../lib/ui/Skeleton.svelte';
  import ErrorState from '../lib/ui/ErrorState.svelte';
  import HashDisplay from '../lib/ui/HashDisplay.svelte';
  import SimuladoBadge from '../lib/ui/SimuladoBadge.svelte';
  import StatusBadge from '../lib/ui/StatusBadge.svelte';
  import Timeline from '../lib/ui/Timeline.svelte';
  import Icon from '../lib/ui/Icon.svelte';
  import { criarCarga } from '../lib/ui/carga.svelte.js';
  import { avisar } from '../lib/ui/toast.js';
  import { listarProcessos, cadastrarVestigio, linhaDoTempo, ehSimulado } from '../lib/data/index.js';
  import { dadosAncoraveis } from '../lib/domain/vestigio.js';
  import { sha256DeObjeto, sha256DeArquivo } from '../lib/crypto/hash.js';
  import { formatarTamanho } from '../lib/format.js';

  const TIPOS = ['Aparelho celular', 'Computador', 'Mídia de armazenamento', 'Documento', 'Material biológico', 'Arma', 'Outro']
    .map((t) => ({ valor: t, rotulo: t }));

  const processos = criarCarga(listarProcessos);

  let processoId = $state('');
  let tipo = $state('');
  let descricao = $state('');
  let lacre = $state('');
  let anexo = $state(null); // { nome, tamanho, sha256 }
  let calculandoAnexo = $state(false);
  let hashVestigio = $state('');
  let erros = $state({});
  let enviando = $state(false);
  let registrado = $state(null); // { vestigio, eventos }

  const opcoesProcesso = $derived((processos.dados ?? []).map((p) => ({ valor: p.id, rotulo: p.pseudonimo })));
  const camposPreenchidos = $derived(processoId && tipo && descricao.trim() && lacre.trim());

  // Recalcula o hash real do vestígio sempre que os dados mudam (descarta resultados atrasados).
  let versaoCalculo = 0;
  $effect(() => {
    const dados = { processoId, tipo, descricao, lacre, anexo };
    const versao = ++versaoCalculo;
    if (!camposPreenchidos || calculandoAnexo) {
      hashVestigio = '';
      return;
    }
    sha256DeObjeto(dadosAncoraveis(dados)).then((hash) => {
      if (versao === versaoCalculo) hashVestigio = hash;
    });
  });

  async function selecionarAnexo(arquivo) {
    if (!arquivo) {
      anexo = null;
      return;
    }
    calculandoAnexo = true;
    try {
      anexo = { nome: arquivo.name, tamanho: arquivo.size, sha256: await sha256DeArquivo(arquivo) };
    } catch {
      anexo = null;
      avisar('erro', 'Não foi possível ler o arquivo para calcular o hash.');
    } finally {
      calculandoAnexo = false;
    }
  }

  function validar() {
    const novos = {};
    if (!processoId) novos.processoId = 'Selecione o processo.';
    if (!tipo) novos.tipo = 'Selecione o tipo do vestígio.';
    if (!descricao.trim()) novos.descricao = 'Descreva o vestígio.';
    if (!lacre.trim()) novos.lacre = 'Informe o número do lacre.';
    erros = novos;
    return Object.keys(novos).length === 0;
  }

  async function registrar(evento) {
    evento.preventDefault();
    if (!validar() || !hashVestigio) return;
    enviando = true;
    try {
      const vestigio = await cadastrarVestigio({ processoId, tipo, descricao, lacre, anexo, hashVestigio });
      registrado = { vestigio, eventos: await linhaDoTempo(vestigio.id), hashVestigio };
      avisar('sucesso', `Vestígio ${vestigio.rotuloRE} registrado.`);
    } catch (e) {
      avisar('erro', e.message);
      if (/lacre/i.test(e.message)) erros = { ...erros, lacre: e.message };
    } finally {
      enviando = false;
    }
  }

  function cadastrarOutro() {
    processoId = tipo = descricao = lacre = '';
    anexo = null;
    erros = {};
    registrado = null;
  }
</script>

<PageHeader
  titulo="Cadastrar vestígio"
  descricao="Registre o vestígio. A impressão digital (SHA-256) é calculada neste navegador antes da gravação."
  migalhas={[{ rotulo: 'Painel', caminho: '/painel' }, { rotulo: 'Cadastrar vestígio' }]}
/>

{#if registrado}
  {@const { vestigio, eventos } = registrado}
  <div class="space-y-4">
    <Card titulo="Vestígio registrado" descricao={ehSimulado ? 'Gravação simulada: nada foi enviado a um ledger real.' : ''}>
      {#snippet acoes()}{#if vestigio.simulado}<SimuladoBadge />{/if}<StatusBadge estado={vestigio.estado} />{/snippet}
      <dl class="grid gap-4 sm:grid-cols-3">
        <div><dt class="text-xs text-muted">Rótulo de evidência (RE)</dt><dd class="mt-1 font-mono text-sm text-text">{vestigio.rotuloRE}</dd></div>
        <div><dt class="text-xs text-muted">Rótulo de conjunto (RC)</dt><dd class="mt-1 font-mono text-sm text-text">{vestigio.rotuloRC}</dd></div>
        <div><dt class="text-xs text-muted">Lacre</dt><dd class="mt-1 font-mono text-sm text-text">{vestigio.lacre}</dd></div>
      </dl>
      <div class="mt-4"><HashDisplay hash={registrado.hashVestigio} rotulo="SHA-256" completo /></div>
      <div class="mt-6 flex flex-wrap gap-2">
        <a href="#/movimentacoes" class="inline-flex h-10 items-center gap-2 rounded bg-primary px-4 text-sm font-medium text-primary-fg no-underline hover:bg-primary/90 hover:no-underline"><Icon nome="transfer" tamanho={16} />Transferir este vestígio</a>
        <Button variante="secundaria" icone="plus" onclick={cadastrarOutro}>Cadastrar outro</Button>
      </div>
    </Card>
    <Card titulo="Linha do tempo"><Timeline {eventos} /></Card>
  </div>
{:else if processos.status === 'carregando'}
  <Card><Skeleton linhas={5} /></Card>
{:else if processos.status === 'erro'}
  <Card><ErrorState mensagem={processos.erro} ontentar={processos.recarregar} /></Card>
{:else}
  <form onsubmit={registrar} class="grid grid-cols-1 gap-4 lg:grid-cols-5" novalidate>
    <Card titulo="Dados do vestígio" classe="lg:col-span-3">
      <div class="space-y-4">
        <Select rotulo="Processo" opcoes={opcoesProcesso} bind:value={processoId} erro={erros.processoId} ajuda="Identificado por pseudônimo, nunca pelo número real." obrigatorio />
        <Select rotulo="Tipo de vestígio" opcoes={TIPOS} bind:value={tipo} erro={erros.tipo} obrigatorio />
        <Textarea rotulo="Descrição" bind:value={descricao} erro={erros.descricao} ajuda="Descreva o estado e as características visíveis." obrigatorio />
        <Input rotulo="Número do lacre" bind:value={lacre} erro={erros.lacre} placeholder="Ex.: LAC-2001" autocomplete="off" obrigatorio />
        <FileInput rotulo="Anexo (opcional)" ajuda="O arquivo não sai do navegador: apenas o hash dele é registrado." onselecionar={selecionarAnexo} />
      </div>
    </Card>

    <Card titulo="Impressão digital" descricao="SHA-256 real, calculado agora neste navegador." classe="h-fit lg:col-span-2">
      <div class="space-y-4">
        <div>
          <p class="mb-1.5 text-sm font-medium text-text">Hash do vestígio</p>
          {#if hashVestigio}<HashDisplay hash={hashVestigio} completo />
          {:else}<p class="text-sm text-muted">Preencha processo, tipo, descrição e lacre para calcular.</p>{/if}
        </div>
        <div>
          <p class="mb-1.5 text-sm font-medium text-text">Hash do anexo</p>
          {#if calculandoAnexo}<Skeleton linhas={1} />
          {:else if anexo}
            <p class="mb-1 break-all text-xs text-muted">{anexo.nome} ({formatarTamanho(anexo.tamanho)})</p>
            <HashDisplay hash={anexo.sha256} completo />
          {:else}<p class="text-sm text-muted">Nenhum anexo selecionado.</p>{/if}
        </div>
        <Button tipo="submit" carregando={enviando} desabilitado={!hashVestigio || calculandoAnexo} classe="w-full" icone="lock">
          {ehSimulado ? 'Registrar (gravação simulada)' : 'Registrar vestígio'}
        </Button>
      </div>
    </Card>
  </form>
{/if}
