// Autoria: Lucas Barros Mota (2026)
// Máquina de estados do vestígio. Módulo puro: sem DOM, sem armazenamento.
// Nenhuma transição remove o vestígio: "Descartado" é um estado terminal registrado.

export const ESTADOS = Object.freeze({
  RECONHECIDO: 'Reconhecido',
  COLETADO: 'Coletado',
  EM_TRANSPORTE: 'EmTransporte',
  RECEBIDO: 'Recebido',
  EM_PERICIA: 'EmPericia',
  PERICIADO: 'Periciado',
  ARMAZENADO: 'Armazenado',
  CUSTODIA_COMPROMETIDA: 'CustodiaComprometida',
  DESCARTADO: 'Descartado',
});

export const ROTULO_ESTADO = Object.freeze({
  [ESTADOS.RECONHECIDO]: 'Reconhecido',
  [ESTADOS.COLETADO]: 'Coletado',
  [ESTADOS.EM_TRANSPORTE]: 'Em transporte',
  [ESTADOS.RECEBIDO]: 'Recebido',
  [ESTADOS.EM_PERICIA]: 'Em perícia',
  [ESTADOS.PERICIADO]: 'Periciado',
  [ESTADOS.ARMAZENADO]: 'Armazenado',
  [ESTADOS.CUSTODIA_COMPROMETIDA]: 'Custódia comprometida',
  [ESTADOS.DESCARTADO]: 'Descartado',
});

const TRANSICOES = Object.freeze({
  [ESTADOS.RECONHECIDO]: [ESTADOS.COLETADO],
  [ESTADOS.COLETADO]: [ESTADOS.EM_TRANSPORTE],
  // Divergência de lacre na conferência leva a CustodiaComprometida (RN21).
  [ESTADOS.EM_TRANSPORTE]: [ESTADOS.RECEBIDO, ESTADOS.CUSTODIA_COMPROMETIDA],
  [ESTADOS.RECEBIDO]: [ESTADOS.EM_PERICIA, ESTADOS.ARMAZENADO],
  [ESTADOS.EM_PERICIA]: [ESTADOS.PERICIADO],
  [ESTADOS.PERICIADO]: [ESTADOS.ARMAZENADO],
  [ESTADOS.CUSTODIA_COMPROMETIDA]: [ESTADOS.ARMAZENADO],
  [ESTADOS.ARMAZENADO]: [ESTADOS.DESCARTADO], // exige autorização judicial
  [ESTADOS.DESCARTADO]: [],
});

// RN19: a recusa reverte ao estado anterior ao transporte, nunca a um estado indefinido.
const REVERSOES = Object.freeze({
  [ESTADOS.EM_TRANSPORTE]: ESTADOS.COLETADO,
});

export function estadosSeguintes(estado) {
  assertEstadoConhecido(estado);
  return TRANSICOES[estado];
}

export function podeTransitar(de, para) {
  return estadosSeguintes(de).includes(para);
}

/** Devolve o novo estado ou lança erro: a transição inválida nunca passa em silêncio. */
export function transitar(de, para) {
  if (!podeTransitar(de, para)) {
    throw new Error(`Transição inválida: ${de} -> ${para}`);
  }
  return para;
}

export function estadoAposRecusa(estadoAtual) {
  const anterior = REVERSOES[estadoAtual];
  if (!anterior) throw new Error(`Recusa não se aplica ao estado ${estadoAtual}`);
  return anterior;
}

export function ehTerminal(estado) {
  return estadosSeguintes(estado).length === 0;
}

function assertEstadoConhecido(estado) {
  if (!(estado in TRANSICOES)) throw new Error(`Estado desconhecido: ${estado}`);
}
