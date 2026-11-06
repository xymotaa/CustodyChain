<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Icon from './Icon.svelte';
  import StatusBadge from './StatusBadge.svelte';
  import HashDisplay from './HashDisplay.svelte';
  import { formatarDataHora, rotuloEvento } from '../format.js';

  /** integridade: [{ seq, ok }] opcional, vindo de verificarIntegridade */
  let { eventos, integridade = null } = $props();

  const okDoEvento = (seq) => integridade?.find((i) => i.seq === seq)?.ok;
  const DETALHES = [
    ['justificativa', 'Justificativa'],
    ['lacreEsperado', 'Lacre registrado'],
    ['lacreInformado', 'Lacre conferido'],
    ['conclusao', 'Conclusão'],
    ['autorizacao', 'Autorização'],
  ];
</script>

<ol class="relative space-y-6 border-l border-border pl-6">
  {#each eventos as evento (evento.seq)}
    {@const ok = okDoEvento(evento.seq)}
    {@const comprometido = evento.detalhes?.lacreConferido === false}
    <li class="relative">
      <span class={['absolute -left-[37px] grid h-6 w-6 place-items-center rounded ring-4 ring-surface', ok === false || comprometido ? 'bg-danger text-danger-fg' : 'bg-primary text-primary-fg']}>
        <Icon nome={ok === false || comprometido ? 'alert' : 'check'} tamanho={14} />
      </span>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 class="text-sm font-semibold text-text">#{evento.seq} {rotuloEvento(evento.tipo)}</h3>
        <time class="text-xs text-muted" datetime={evento.em}>{formatarDataHora(evento.em)}</time>
        {#if ok === false}<span class="text-xs font-semibold text-danger">Hash do evento divergente</span>{/if}
      </div>
      <p class="mt-1 text-sm text-muted">Por {evento.autorNome}</p>
      <div class="mt-2 flex flex-wrap items-center gap-2">
        {#if evento.de}<StatusBadge estado={evento.de} /><Icon nome="arrow-right" tamanho={14} classe="text-muted" />{/if}
        <StatusBadge estado={evento.para} />
      </div>
      {#each DETALHES as [campo, rotulo]}
        {#if evento.detalhes?.[campo]}<p class="mt-2 break-words text-sm text-text"><span class="text-muted">{rotulo}:</span> {evento.detalhes[campo]}</p>{/if}
      {/each}
      <div class="mt-2"><HashDisplay hash={evento.hash} rotulo="hash" /></div>
    </li>
  {/each}
</ol>
