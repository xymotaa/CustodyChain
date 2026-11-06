<!-- Autoria: Lucas Barros Mota (2026) -->
<!-- Tabela a partir de 768px; lista de cartões abaixo disso. Só linhas horizontais, sem borda por célula.
     moldura={false}: para uso dentro de <Card semPadding>, que já traz a moldura do painel. -->
<script>
  /**
   * colunas: [{ chave, rotulo }]; celula(linha, coluna) opcional para conteúdo customizado;
   * acoes(linha) opcional para botões por linha.
   */
  let { colunas, linhas, chave = 'id', celula, acoes, rotuloTabela = 'Tabela de dados', moldura = true } = $props();
</script>

{#snippet valor(linha, coluna)}
  {#if celula}{@render celula(linha, coluna)}{:else}{linha[coluna.chave]}{/if}
{/snippet}

<div class={['hidden overflow-x-auto md:block', moldura && 'rounded border border-border bg-surface']}>
  <table class="w-full text-left text-sm">
    <caption class="sr-only">{rotuloTabela}</caption>
    <thead class="border-b border-border bg-surface-2 text-xs text-muted">
      <tr>
        {#each colunas as coluna (coluna.chave)}<th scope="col" class="px-3 py-2 font-semibold">{coluna.rotulo}</th>{/each}
        {#if acoes}<th scope="col" class="px-3 py-2 text-right font-semibold">Ações</th>{/if}
      </tr>
    </thead>
    <tbody class="divide-y divide-border">
      {#each linhas as linha (linha[chave])}
        <tr class="hover:bg-surface-2/60">
          {#each colunas as coluna (coluna.chave)}<td class="px-3 py-2 align-middle">{@render valor(linha, coluna)}</td>{/each}
          {#if acoes}<td class="px-3 py-1.5 text-right"><div class="flex justify-end gap-2">{@render acoes(linha)}</div></td>{/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<ul class={['space-y-2 md:hidden', !moldura && 'p-3']} aria-label={rotuloTabela}>
  {#each linhas as linha (linha[chave])}
    <li class="rounded border border-border bg-surface p-2">
      <dl class="space-y-1">
        {#each colunas as coluna (coluna.chave)}
          <div class="flex flex-col gap-0.5">
            <dt class="text-xs font-semibold text-muted">{coluna.rotulo}</dt>
            <dd class="min-w-0 break-words text-sm text-text">{@render valor(linha, coluna)}</dd>
          </div>
        {/each}
      </dl>
      {#if acoes}<div class="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">{@render acoes(linha)}</div>{/if}
    </li>
  {/each}
</ul>
