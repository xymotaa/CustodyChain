// Autoria: Lucas Barros Mota (2026)
// Espelho VISUAL da matriz de permissões (Quadro 10): decide o que cada perfil enxerga.
// Não é controle de acesso. No futuro, a API decidirá e rejeitará o que não for permitido.
import { ESTADOS } from './domain/estados.js';

export const PERFIS = Object.freeze({
  ADMINISTRADOR: 'administrador',
  CENTRAL: 'central',
  COLETOR: 'coletor',
  PERITO: 'perito',
  EXTERNO: 'externo',
});

export const ROTULO_PERFIL = Object.freeze({
  [PERFIS.ADMINISTRADOR]: 'Administrador',
  [PERFIS.CENTRAL]: 'Central de Custódia',
  [PERFIS.COLETOR]: 'Agente Coletor',
  [PERFIS.PERITO]: 'Perito',
  [PERFIS.EXTERNO]: 'Órgão externo',
});

const { ADMINISTRADOR, CENTRAL, COLETOR, PERITO, EXTERNO } = PERFIS;

export const ACOES = Object.freeze({
  cadastrar: [CENTRAL, COLETOR],
  movimentar: [CENTRAL, COLETOR],
  receber: [CENTRAL, PERITO], // receber e recusar
  iniciarPericia: [PERITO],
  emitirLaudo: [PERITO], // rompe o lacre
  armazenar: [CENTRAL],
  autorizarDestinacao: [ADMINISTRADOR, EXTERNO],
  verificar: [ADMINISTRADOR, CENTRAL, PERITO, EXTERNO],
  gerirUsuarios: [ADMINISTRADOR],
});

export const pode = (perfil, acao) => Boolean(ACOES[acao]?.includes(perfil));

/** Rotas protegidas e entradas de menu. `menu` ausente = rota sem item na barra lateral. */
export const ROTAS = Object.freeze([
  { caminho: '/painel', acao: null, menu: { rotulo: 'Painel', icone: 'dashboard' } },
  { caminho: '/vestigios/novo', acao: 'cadastrar', menu: { rotulo: 'Cadastrar vestígio', icone: 'package-plus' } },
  { caminho: '/movimentacoes', acao: 'movimentar', menu: { rotulo: 'Movimentações', icone: 'transfer' } },
  { caminho: '/recebimento', acao: 'receber', menu: { rotulo: 'Recebimento', icone: 'inbox' } },
  { caminho: '/verificador', acao: 'verificar', menu: { rotulo: 'Verificador', icone: 'shield-check' } },
  { caminho: '/verificador/:id', acao: 'verificar' },
  { caminho: '/usuarios', acao: 'gerirUsuarios', menu: { rotulo: 'Usuários', icone: 'users' } },
]);

export const permiteRota = (rota, perfil) => rota.acao === null || pode(perfil, rota.acao);

export function menuDoPerfil(perfil) {
  return ROTAS.filter((r) => r.menu && permiteRota(r, perfil)).map((r) => ({ caminho: r.caminho, ...r.menu }));
}

/**
 * Pendências exibidas no painel. Cada item aponta para a tela onde se resolve.
 * @returns {{ rotulo: string, vestigios: object[], caminho: string }[]}
 */
export function pendenciasDoPerfil(perfil, usuarioId, vestigios) {
  const minhasCustodias = (estado) =>
    vestigios.filter((v) => v.estado === estado && v.responsavelId === usuarioId);
  const todosEm = (estado) => vestigios.filter((v) => v.estado === estado);

  const regras = {
    [COLETOR]: [
      { rotulo: 'Coletados aguardando transferência', vestigios: minhasCustodias(ESTADOS.COLETADO), caminho: '/movimentacoes' },
    ],
    [CENTRAL]: [
      { rotulo: 'Em trânsito para você', vestigios: emTransitoPara(vestigios, usuarioId), caminho: '/recebimento' },
      { rotulo: 'Prontos para armazenar', vestigios: [...minhasCustodias(ESTADOS.RECEBIDO), ...minhasCustodias(ESTADOS.PERICIADO)], caminho: '/verificador' },
      { rotulo: 'Coletados aguardando transferência', vestigios: minhasCustodias(ESTADOS.COLETADO), caminho: '/movimentacoes' },
    ],
    [PERITO]: [
      { rotulo: 'Em trânsito para você', vestigios: emTransitoPara(vestigios, usuarioId), caminho: '/recebimento' },
      { rotulo: 'Aguardando perícia ou laudo', vestigios: [...minhasCustodias(ESTADOS.RECEBIDO), ...minhasCustodias(ESTADOS.EM_PERICIA)], caminho: '/verificador' },
    ],
    [ADMINISTRADOR]: [
      { rotulo: 'Custódia comprometida', vestigios: todosEm(ESTADOS.CUSTODIA_COMPROMETIDA), caminho: '/verificador' },
      { rotulo: 'Armazenados (destinação)', vestigios: todosEm(ESTADOS.ARMAZENADO), caminho: '/verificador' },
    ],
    [EXTERNO]: [
      { rotulo: 'Custódia comprometida', vestigios: todosEm(ESTADOS.CUSTODIA_COMPROMETIDA), caminho: '/verificador' },
      { rotulo: 'Armazenados (destinação)', vestigios: todosEm(ESTADOS.ARMAZENADO), caminho: '/verificador' },
    ],
  };
  return regras[perfil] ?? [];
}

export const emTransitoPara = (vestigios, usuarioId) =>
  vestigios.filter((v) => v.estado === ESTADOS.EM_TRANSPORTE && v.transferencia?.destinoId === usuarioId);

/**
 * Ações de custódia oferecidas no verificador para este vestígio, perfil e usuário.
 * Mesma regra de estado/responsável que o mock aplica; a API real é quem decidirá.
 */
export function acoesDoVestigio(perfil, usuarioId, vestigio) {
  const souResponsavel = vestigio.responsavelId === usuarioId;
  const candidatas = [
    { acao: 'iniciarPericia', estados: [ESTADOS.RECEBIDO], exigeResponsavel: true },
    { acao: 'emitirLaudo', estados: [ESTADOS.EM_PERICIA], exigeResponsavel: true },
    { acao: 'armazenar', estados: [ESTADOS.RECEBIDO, ESTADOS.PERICIADO, ESTADOS.CUSTODIA_COMPROMETIDA], exigeResponsavel: true },
    { acao: 'autorizarDestinacao', estados: [ESTADOS.ARMAZENADO], exigeResponsavel: false },
  ];
  return candidatas
    .filter((c) => pode(perfil, c.acao) && c.estados.includes(vestigio.estado) && (!c.exigeResponsavel || souResponsavel))
    .map((c) => c.acao);
}
