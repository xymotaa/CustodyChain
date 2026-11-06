<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Card from '../lib/ui/Card.svelte';
  import Input from '../lib/ui/Input.svelte';
  import Button from '../lib/ui/Button.svelte';
  import Icon from '../lib/ui/Icon.svelte';
  import SimulatedBanner from '../lib/ui/SimulatedBanner.svelte';
  import ThemeToggle from '../lib/layout/ThemeToggle.svelte';
  import { login, ehSimulado } from '../lib/data/index.js';
  import { USUARIOS_SEED, SENHA_DEMO } from '../lib/data/seeds.js';
  import { ROTULO_PERFIL } from '../lib/policy.js';
  import { navegar } from '../lib/router.js';

  let usuario = $state('');
  let senha = $state('');
  let erro = $state('');
  let carregando = $state(false);

  async function entrar(evento) {
    evento.preventDefault();
    erro = '';
    carregando = true;
    try {
      await login({ login: usuario, senha });
      navegar('/painel');
    } catch {
      erro = 'Usuário ou senha inválidos.'; // mensagem genérica de propósito
    } finally {
      carregando = false;
    }
  }

  function preencher(conta) {
    usuario = conta.login;
    senha = SENHA_DEMO;
    erro = '';
  }
</script>

<div class="flex min-h-screen flex-col">
  {#if ehSimulado}<SimulatedBanner />{/if}
  <div class="flex justify-end px-3 py-1"><ThemeToggle /></div>

  <div class="mx-auto grid w-full max-w-4xl flex-1 content-start gap-4 px-4 pb-10 md:grid-cols-5 md:content-center">
    <div class="md:col-span-5">
      <div>
        <h1 class="text-xl text-text">CustodyChain</h1>
        <p class="text-sm text-muted">Cadeia de custódia de vestígios com registro verificável.</p>
      </div>
    </div>

    <Card titulo="Entrar" classe="md:col-span-3">
      <form onsubmit={entrar} class="space-y-4">
        <Input rotulo="Usuário" bind:value={usuario} autocomplete="username" obrigatorio />
        <Input rotulo="Senha" type="password" bind:value={senha} autocomplete="current-password" obrigatorio />
        {#if erro}
          <p role="alert" class="flex items-center gap-2 border-l-4 border-danger bg-surface-2 px-3 py-2 text-sm font-medium text-danger"><Icon nome="alert" tamanho={16} />{erro}</p>
        {/if}
        <Button tipo="submit" {carregando} classe="w-full">Entrar</Button>
      </form>
    </Card>

    {#if ehSimulado}
      <Card titulo="Contas de demonstração" descricao="Dica de demonstração: senha fixa, sem valor real." classe="md:col-span-2">
        <p class="mb-3 text-sm text-text">Senha de todas as contas: <code class="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">{SENHA_DEMO}</code></p>
        <ul class="space-y-2">
          {#each USUARIOS_SEED as conta (conta.id)}
            <li>
              <button type="button" onclick={() => preencher(conta)} class="flex w-full items-center justify-between gap-3 border border-border px-2 py-1.5 text-left hover:bg-surface-2">
                <span class="min-w-0">
                  <span class="block truncate text-sm font-medium text-text">{ROTULO_PERFIL[conta.perfil]}</span>
                  <span class="block font-mono text-xs text-muted">{conta.login}</span>
                </span>
                <span class="text-xs font-medium text-primary">Usar</span>
              </button>
            </li>
          {/each}
        </ul>
      </Card>
    {/if}
  </div>
</div>
