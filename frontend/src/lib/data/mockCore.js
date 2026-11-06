// Autoria: Lucas Barros Mota (2026)
// Regras do "backend simulado" sobre uma base em memória { db, ledger }.
// `db` representa o banco administrável (mutável por quem o administra);
// `ledger` representa o registro ancorado (só recebe hashes, nunca é reescrito).
// Sem DOM, armazenamento ou sessão: quem chama fornece ator e instante.
import { ESTADOS, transitar, estadoAposRecusa } from '../domain/estados.js';
import { dadosAncoraveis, gerarRotulos, exigirAprovadorDistinto, lacresConferem } from '../domain/vestigio.js';
import { sha256DeObjeto } from '../crypto/hash.js';
import { pode } from '../policy.js';

const HASH_INICIAL = '0'.repeat(64);
const JUSTIFICATIVA_MINIMA = 10;

export const TIPOS_EVENTO = Object.freeze({
  TRANSFERIR: 'transferir',
  RECEBER: 'receber',
  RECUSAR: 'recusar',
  INICIAR_PERICIA: 'iniciarPericia',
  EMITIR_LAUDO: 'emitirLaudo',
  ARMAZENAR: 'armazenar',
  AUTORIZAR_DESTINACAO: 'autorizarDestinacao',
});

export const hashDoVestigio = (vestigio) => sha256DeObjeto(dadosAncoraveis(vestigio));

const hashDoEvento = (evento) =>
  sha256DeObjeto({
    vestigioId: evento.vestigioId, seq: evento.seq, tipo: evento.tipo, de: evento.de, para: evento.para,
    autorId: evento.autorId, em: evento.em, detalhes: evento.detalhes, hashAnterior: evento.hashAnterior,
  });

function exigir(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem);
}

function exigirAcao(ator, acao) {
  exigir(pode(ator.perfil, acao), 'Seu perfil não tem permissão para esta ação.');
}

function exigirTexto(valor, campo) {
  exigir(typeof valor === 'string' && valor.trim().length > 0, `Informe ${campo}.`);
}

function obter(base, vestigioId) {
  const vestigio = base.db.vestigios.find((v) => v.id === vestigioId);
  exigir(vestigio, 'Vestígio não encontrado.');
  return vestigio;
}

async function anexarEvento(base, vestigio, { tipo, de, para, ator, detalhes = {}, em }) {
  const eventos = base.db.eventos[vestigio.id] ?? (base.db.eventos[vestigio.id] = []);
  const evento = {
    vestigioId: vestigio.id, seq: eventos.length + 1, tipo, de, para,
    autorId: ator.id, autorNome: ator.nome, autorPerfil: ator.perfil, em, detalhes,
    hashAnterior: eventos.at(-1)?.hash ?? HASH_INICIAL, simulado: true,
  };
  evento.hash = await hashDoEvento(evento);
  eventos.push(evento);
  base.ledger[vestigio.id].eventos.push(evento.hash);
  return evento;
}

export async function criarVestigio(base, entrada, ator, em) {
  exigirAcao(ator, 'cadastrar');
  const { processoId, tipo, descricao, lacre, anexo = null, hashVestigio } = entrada;
  exigir(base.db.processos.some((p) => p.id === processoId), 'Selecione um processo válido.');
  exigirTexto(tipo, 'o tipo do vestígio');
  exigirTexto(descricao, 'a descrição');
  exigirTexto(lacre, 'o número do lacre');
  exigir(!base.db.vestigios.some((v) => v.lacre.toUpperCase() === lacre.trim().toUpperCase()), 'Já existe vestígio com este número de lacre.');

  const rotulos = gerarRotulos(base.db.vestigios, processoId, new Date(em).getFullYear());
  const vestigio = {
    id: `v-${String(base.db.vestigios.length + 1).padStart(3, '0')}`,
    ...rotulos, processoId, tipo: tipo.trim(), descricao: descricao.trim(), lacre: lacre.trim(), anexo,
    estado: ESTADOS.RECONHECIDO, responsavelId: ator.id, transferencia: null,
    criadoPor: ator.id, criadoEm: em, simulado: true,
  };
  const hashCalculado = await hashDoVestigio(vestigio);
  exigir(hashCalculado === hashVestigio, 'O hash informado não corresponde aos dados do vestígio.');

  base.db.vestigios.push(vestigio);
  base.ledger[vestigio.id] = { hashVestigio: hashCalculado, eventos: [], ancoradoEm: em, txId: `sim-${hashCalculado.slice(0, 12)}` };
  vestigio.estado = transitar(ESTADOS.RECONHECIDO, ESTADOS.COLETADO);
  await anexarEvento(base, vestigio, { tipo: 'cadastro', de: ESTADOS.RECONHECIDO, para: ESTADOS.COLETADO, ator, em, detalhes: { hashVestigio: hashCalculado } });
  return vestigio;
}

const comandos = {
  async [TIPOS_EVENTO.TRANSFERIR](base, vestigio, ator, { destinoId }, em) {
    exigirAcao(ator, 'movimentar');
    exigir(vestigio.responsavelId === ator.id, 'Só o responsável pela custódia pode transferir o vestígio.');
    const destino = base.db.usuarios.find((u) => u.id === destinoId);
    exigir(destino, 'Selecione o destinatário.');
    exigir(destino.id !== ator.id, 'O destino deve ser diferente da origem.');
    exigir(pode(destino.perfil, 'receber'), 'O destinatário precisa ter perfil de recebimento.');
    const novoEstado = transitar(vestigio.estado, ESTADOS.EM_TRANSPORTE);
    const transferencia = { origemId: ator.id, destinoId, registradaPor: ator.id, em, estadoAnterior: vestigio.estado };
    return { novoEstado, transferencia, detalhes: { origemId: ator.id, destinoId } };
  },

  async [TIPOS_EVENTO.RECEBER](base, vestigio, ator, { lacreInformado }, em) {
    const { transferencia } = exigirTransferenciaParaMim(vestigio, ator);
    exigirTexto(lacreInformado, 'o número do lacre conferido');
    if (lacresConferem(vestigio.lacre, lacreInformado)) {
      return { novoEstado: transitar(vestigio.estado, ESTADOS.RECEBIDO), responsavelId: ator.id, transferencia: null, detalhes: { origemId: transferencia.origemId, lacreConferido: true } };
    }
    // RN21: divergência fica registrada e não é revertida silenciosamente.
    return {
      novoEstado: transitar(vestigio.estado, ESTADOS.CUSTODIA_COMPROMETIDA), responsavelId: ator.id, transferencia: null,
      detalhes: { origemId: transferencia.origemId, lacreConferido: false, lacreEsperado: vestigio.lacre, lacreInformado: lacreInformado.trim() },
    };
  },

  async [TIPOS_EVENTO.RECUSAR](base, vestigio, ator, { justificativa }) {
    const { transferencia } = exigirTransferenciaParaMim(vestigio, ator);
    exigir(typeof justificativa === 'string' && justificativa.trim().length >= JUSTIFICATIVA_MINIMA, `Informe uma justificativa com pelo menos ${JUSTIFICATIVA_MINIMA} caracteres.`);
    return { novoEstado: estadoAposRecusa(vestigio.estado), responsavelId: transferencia.origemId, transferencia: null, detalhes: { justificativa: justificativa.trim(), origemId: transferencia.origemId } };
  },

  async [TIPOS_EVENTO.INICIAR_PERICIA](base, vestigio, ator) {
    exigirAcao(ator, 'iniciarPericia');
    exigirResponsavel(vestigio, ator);
    return { novoEstado: transitar(vestigio.estado, ESTADOS.EM_PERICIA), detalhes: {} };
  },

  async [TIPOS_EVENTO.EMITIR_LAUDO](base, vestigio, ator, { conclusao }) {
    exigirAcao(ator, 'emitirLaudo');
    exigirResponsavel(vestigio, ator);
    exigirTexto(conclusao, 'a conclusão do laudo');
    return { novoEstado: transitar(vestigio.estado, ESTADOS.PERICIADO), detalhes: { lacreRompido: true, conclusao: conclusao.trim() } };
  },

  async [TIPOS_EVENTO.ARMAZENAR](base, vestigio, ator) {
    exigirAcao(ator, 'armazenar');
    exigirResponsavel(vestigio, ator);
    return { novoEstado: transitar(vestigio.estado, ESTADOS.ARMAZENADO), detalhes: {} };
  },

  async [TIPOS_EVENTO.AUTORIZAR_DESTINACAO](base, vestigio, ator, { numeroAutorizacao }) {
    exigirAcao(ator, 'autorizarDestinacao');
    exigirTexto(numeroAutorizacao, 'a referência da autorização judicial');
    return { novoEstado: transitar(vestigio.estado, ESTADOS.DESCARTADO), detalhes: { autorizacao: numeroAutorizacao.trim() } };
  },
};

function exigirTransferenciaParaMim(vestigio, ator) {
  exigir(pode(ator.perfil, 'receber'), 'Seu perfil não tem permissão para esta ação.');
  exigir(vestigio.estado === ESTADOS.EM_TRANSPORTE && vestigio.transferencia, 'Este vestígio não está em trânsito.');
  exigir(vestigio.transferencia.destinoId === ator.id, 'Este vestígio foi enviado a outro responsável.');
  exigirAprovadorDistinto(vestigio.transferencia.registradaPor, ator.id);
  return vestigio;
}

function exigirResponsavel(vestigio, ator) {
  exigir(vestigio.responsavelId === ator.id, 'Só o responsável pela custódia pode executar esta ação.');
}

export async function aplicarEvento(base, { vestigioId, tipo, ...parametros }, ator, em) {
  const vestigio = obter(base, vestigioId);
  const comando = comandos[tipo];
  exigir(comando, `Evento desconhecido: ${tipo}`);
  const de = vestigio.estado;
  const resultado = await comando(base, vestigio, ator, parametros, em);

  vestigio.estado = resultado.novoEstado;
  if ('responsavelId' in resultado) vestigio.responsavelId = resultado.responsavelId;
  if ('transferencia' in resultado) vestigio.transferencia = resultado.transferencia;
  return anexarEvento(base, vestigio, { tipo, de, para: resultado.novoEstado, ator, detalhes: resultado.detalhes, em });
}

export async function verificar(base, vestigioId) {
  const vestigio = obter(base, vestigioId);
  const ancorado = base.ledger[vestigioId];
  const hashRecalculado = await hashDoVestigio(vestigio);
  const eventos = base.db.eventos[vestigioId] ?? [];

  let hashAnterior = HASH_INICIAL;
  const resultadoEventos = [];
  for (const [i, evento] of eventos.entries()) {
    const recalculado = await hashDoEvento({ ...evento, hashAnterior });
    resultadoEventos.push({ seq: evento.seq, ok: recalculado === ancorado.eventos[i] });
    hashAnterior = recalculado;
  }
  const eventosIntegros = resultadoEventos.every((e) => e.ok) && eventos.length === ancorado.eventos.length;
  return {
    vestigioId, simulado: true, integro: hashRecalculado === ancorado.hashVestigio && eventosIntegros,
    hashRegistrado: ancorado.hashVestigio, hashRecalculado, eventos: resultadoEventos,
    ancoradoEm: ancorado.ancoradoEm, txId: ancorado.txId,
  };
}

/** Simula um administrador de banco alterando o dado sem passar pelo ledger. */
export function adulterarNoBanco(base, vestigioId) {
  const vestigio = obter(base, vestigioId);
  vestigio.descricao = `${vestigio.descricao} (alterada diretamente no banco)`;
  return vestigio;
}
