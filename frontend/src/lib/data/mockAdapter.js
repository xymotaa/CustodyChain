// Autoria: Lucas Barros Mota (2026)
// Adaptador MOCK: persiste em localStorage e rotula tudo como simulado.
// Implementa o mesmo contrato de lib/data/index.js que a API real implementará.
import { ler, gravar } from './armazenamento.js';
import { construirSeeds } from './seeds.js';
import { aplicarEvento, criarVestigio, verificar, adulterarNoBanco } from './mockCore.js';
import { definirSessao, limparSessao, usuarioLogado } from '../stores/session.js';
import { pode } from '../policy.js';

const CHAVE_BASE = 'cc.mock.base';
let latenciaMs = 300; // deixa os estados de carregamento visíveis na demonstração

export const configurarLatencia = (ms) => {
  latenciaMs = ms;
};

const esperar = () => (latenciaMs > 0 ? new Promise((r) => setTimeout(r, latenciaMs)) : Promise.resolve());
const clonar = (valor) => structuredClone(valor);
// Entradas passam por serialização, como passariam pela rede (aceita proxies de $state).
const viaRede = (valor) => JSON.parse(JSON.stringify(valor));
const agora = () => new Date().toISOString();

const carregarBase = async () => ler(CHAVE_BASE) ?? (await construirSeeds());

const persistir = (base) => gravar(CHAVE_BASE, base);

/** Executa uma operação sobre a base e persiste só se ela terminar sem erro. */
async function comBase(operacao) {
  await esperar();
  const base = await carregarBase();
  const resultado = await operacao(base);
  persistir(base);
  return clonar(resultado);
}

const semSenha = ({ senha, ...usuario }) => usuario;

export async function login({ login: nomeLogin, senha }) {
  await esperar();
  const base = await carregarBase();
  const usuario = base.db.usuarios.find((u) => u.login === nomeLogin?.trim() && u.senha === senha);
  if (!usuario) throw new Error('Usuário ou senha inválidos.');
  definirSessao(usuario);
  return semSenha(usuario);
}

export async function logout() {
  limparSessao();
}

export const listarProcessos = () => comBase((b) => b.db.processos);

export const listarVestigios = () => comBase((b) => b.db.vestigios);

export const obterVestigio = (id) =>
  comBase((b) => {
    const vestigio = b.db.vestigios.find((v) => v.id === id);
    if (!vestigio) throw new Error('Vestígio não encontrado.');
    return vestigio;
  });

export const cadastrarVestigio = (entrada) => comBase((b) => criarVestigio(b, viaRede(entrada), usuarioLogado(), agora()));

export const registrarEvento = (comando) => comBase((b) => aplicarEvento(b, viaRede(comando), usuarioLogado(), agora()));

export const linhaDoTempo = (vestigioId) => comBase((b) => b.db.eventos[vestigioId] ?? []);

export const verificarIntegridade = (vestigioId) => comBase((b) => verificar(b, vestigioId));

export const listarUsuarios = () => comBase((b) => b.db.usuarios.map(semSenha));

export const criarUsuario = ({ nome, login: nomeLogin, senha, perfil }) =>
  comBase((b) => {
    const ator = usuarioLogado();
    if (!pode(ator.perfil, 'gerirUsuarios')) throw new Error('Somente o administrador gerencia usuários.');
    if (![nome, nomeLogin, senha].every((t) => t?.trim())) throw new Error('Preencha nome, login e senha.');
    if (b.db.usuarios.some((u) => u.login === nomeLogin.trim())) throw new Error('Este login já está em uso.');
    const usuario = { id: `u-${b.db.usuarios.length + 1}-${Date.now().toString(36)}`, nome: nome.trim(), login: nomeLogin.trim(), senha, perfil };
    b.db.usuarios.push(usuario);
    return semSenha(usuario);
  });

// Operações exclusivas da demonstração (não existem no contrato da API real).

export const simularAdulteracao = (vestigioId) => comBase((b) => adulterarNoBanco(b, vestigioId));

export async function reiniciarDemonstracao() {
  await esperar();
  const base = await construirSeeds();
  persistir(base);
  const atual = ler('cc.sessao');
  if (atual && !base.db.usuarios.some((u) => u.id === atual.id)) limparSessao();
}
