// Autoria: Lucas Barros Mota (2026)
// Estado assíncrono padrão das telas: carregando -> pronto | erro, com "tentar de novo".
export function criarCarga(buscar) {
  let status = $state('carregando');
  let dados = $state(null);
  let erro = $state('');

  async function recarregar() {
    status = 'carregando';
    try {
      dados = await buscar();
      status = 'pronto';
    } catch (e) {
      erro = e instanceof Error ? e.message : 'Falha inesperada.';
      status = 'erro';
    }
  }
  recarregar();

  return {
    get status() { return status; },
    get dados() { return dados; },
    get erro() { return erro; },
    recarregar,
  };
}
