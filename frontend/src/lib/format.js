// Autoria: Lucas Barros Mota (2026)
const formatadorDataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export const formatarDataHora = (iso) => formatadorDataHora.format(new Date(iso));

export const truncarHash = (hash, inicio = 8, fim = 8) =>
  hash.length <= inicio + fim + 1 ? hash : `${hash.slice(0, inicio)}…${hash.slice(-fim)}`;

export const formatarTamanho = (bytes) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;

export const ROTULO_EVENTO = Object.freeze({
  cadastro: 'Cadastro e coleta',
  transferir: 'Transferência registrada',
  receber: 'Recebimento',
  recusar: 'Recusa de recebimento',
  iniciarPericia: 'Início da perícia',
  emitirLaudo: 'Laudo emitido (lacre rompido)',
  armazenar: 'Armazenamento',
  autorizarDestinacao: 'Destinação autorizada',
});

export const rotuloEvento = (tipo) => ROTULO_EVENTO[tipo] ?? tipo;
