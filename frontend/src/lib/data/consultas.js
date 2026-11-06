// Autoria: Lucas Barros Mota (2026)
// Consultas compostas sobre lib/data (funciona igual em mock e api).
import { listarVestigios, listarProcessos, listarUsuarios, linhaDoTempo } from './index.js';

export async function carregarVestigiosComContexto() {
  const [vestigios, processos, usuarios] = await Promise.all([listarVestigios(), listarProcessos(), listarUsuarios()]);
  const nomeDe = (id) => usuarios.find((u) => u.id === id)?.nome ?? 'Desconhecido';
  const pseudonimoDe = (id) => processos.find((p) => p.id === id)?.pseudonimo ?? 'Processo desconhecido';
  return { vestigios, processos, usuarios, nomeDe, pseudonimoDe };
}

const EVENTOS_DE_MOVIMENTACAO = new Set(['transferir', 'receber', 'recusar']);

/** Eventos de movimentação de todos os vestígios, do mais recente ao mais antigo. */
export async function carregarMovimentacoes() {
  const contexto = await carregarVestigiosComContexto();
  const linhas = await Promise.all(contexto.vestigios.map((v) => linhaDoTempo(v.id)));
  const movimentacoes = linhas
    .flat()
    .filter((e) => EVENTOS_DE_MOVIMENTACAO.has(e.tipo))
    .map((e) => ({ ...e, id: `${e.vestigioId}-${e.seq}`, vestigio: contexto.vestigios.find((v) => v.id === e.vestigioId) }))
    .sort((a, b) => b.em.localeCompare(a.em));
  return { ...contexto, movimentacoes };
}
