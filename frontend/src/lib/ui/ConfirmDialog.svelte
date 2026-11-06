<!-- Autoria: Lucas Barros Mota (2026) -->
<script>
  import Modal from './Modal.svelte';
  import Button from './Button.svelte';

  let { aberto = $bindable(false), titulo, mensagem, rotuloConfirmar = 'Confirmar', perigo = false, carregando = false, onconfirmar } = $props();
</script>

<Modal bind:aberto {titulo}>
  <p class="text-sm text-muted">{mensagem}</p>
  {#snippet rodape()}
    <Button variante="secundaria" desabilitado={carregando} onclick={() => (aberto = false)}>Cancelar</Button>
    <Button variante={perigo ? 'perigo' : 'primaria'} {carregando} onclick={onconfirmar}>{rotuloConfirmar}</Button>
  {/snippet}
</Modal>
