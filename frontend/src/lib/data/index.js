// Autoria: Lucas Barros Mota (2026)
// Única fronteira de dados das telas. VITE_DATA_MODE=mock|api (padrão: mock).
//
// Contrato (todas assíncronas):
//   login({ login, senha })            -> usuário (sem senha); define a sessão
//   logout()
//   listarProcessos()                  -> [{ id, pseudonimo }]
//   listarVestigios() / obterVestigio(id)
//   cadastrarVestigio({ processoId, tipo, descricao, lacre, anexo, hashVestigio })
//   registrarEvento({ vestigioId, tipo, ...parametros })   (ver TIPOS_EVENTO)
//   linhaDoTempo(vestigioId)           -> eventos em ordem
//   verificarIntegridade(vestigioId)   -> { integro, hashRegistrado, hashRecalculado, ... }
//   listarUsuarios() / criarUsuario({ nome, login, senha, perfil })
// Extras só do mock (ausentes no modo api): simularAdulteracao, reiniciarDemonstracao.
import * as mock from './mockAdapter.js';
import * as http from './httpAdapter.js';

export const MODO_DADOS = import.meta.env?.VITE_DATA_MODE === 'api' ? 'api' : 'mock';

const CONTRATO = ['login', 'logout', 'listarProcessos', 'listarVestigios', 'obterVestigio', 'cadastrarVestigio',
  'registrarEvento', 'linhaDoTempo', 'verificarIntegridade', 'listarUsuarios', 'criarUsuario'];

const adaptador = MODO_DADOS === 'api' ? http : mock;

for (const operacao of CONTRATO) {
  if (typeof adaptador[operacao] !== 'function') {
    throw new Error(`Adaptador de dados "${MODO_DADOS}" não implementa ${operacao}.`);
  }
}

export const ehSimulado = MODO_DADOS === 'mock';

export const {
  login, logout, listarProcessos, listarVestigios, obterVestigio, cadastrarVestigio,
  registrarEvento, linhaDoTempo, verificarIntegridade, listarUsuarios, criarUsuario,
} = adaptador;

export const simularAdulteracao = adaptador.simularAdulteracao;
export const reiniciarDemonstracao = adaptador.reiniciarDemonstracao;
