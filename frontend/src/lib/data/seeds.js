// Autoria: Lucas Barros Mota (2026)
// Dados sintéticos de demonstração. Processos identificados só por pseudônimo.
// Senha fixa de demo é exibida no login e NÃO é credencial real.
import { aplicarEvento, criarVestigio, hashDoVestigio, TIPOS_EVENTO } from './mockCore.js';
import { PERFIS } from '../policy.js';
import { sha256Hex } from '../crypto/hash.js';

export const SENHA_DEMO = 'demo2026';

export const USUARIOS_SEED = [
  { id: 'u-admin', nome: 'Ana Administradora', login: 'admin', perfil: PERFIS.ADMINISTRADOR },
  { id: 'u-central', nome: 'Carlos da Central', login: 'central', perfil: PERFIS.CENTRAL },
  { id: 'u-coletor', nome: 'Clara Coletora', login: 'coletor', perfil: PERFIS.COLETOR },
  { id: 'u-perito', nome: 'Paulo Perito', login: 'perito', perfil: PERFIS.PERITO },
  { id: 'u-externo', nome: 'Elisa do Órgão Externo', login: 'externo', perfil: PERFIS.EXTERNO },
].map((u) => ({ ...u, senha: SENHA_DEMO }));

export const PROCESSOS_SEED = [
  { id: 'proc-ipe', pseudonimo: 'Caso Ipê' },
  { id: 'proc-jatoba', pseudonimo: 'Caso Jatobá' },
  { id: 'proc-buriti', pseudonimo: 'Caso Buriti' },
];

const hora = (diaHora) => `2026-10-${diaHora}:00.000Z`;

const VESTIGIOS_SEED = [
  { processoId: 'proc-ipe', tipo: 'Aparelho celular', descricao: 'Smartphone preto, tela trincada, sem cartão SIM.', lacre: 'LAC-1001', coletor: 'u-coletor', em: hora('06T09:10'), ate: 'coletado' },
  { processoId: 'proc-ipe', tipo: 'Documento', descricao: 'Envelope pardo com três folhas manuscritas.', lacre: 'LAC-1002', coletor: 'u-coletor', em: hora('06T09:40'), ate: 'emTransito' },
  { processoId: 'proc-jatoba', tipo: 'Mídia de armazenamento', descricao: 'Pen drive de 32 GB encontrado em gaveta.', lacre: 'LAC-1003', coletor: 'u-coletor', em: hora('07T14:05'), ate: 'recebido' },
  { processoId: 'proc-jatoba', tipo: 'Computador', descricao: 'Notebook cinza com adesivos na tampa.', lacre: 'LAC-1004', coletor: 'u-coletor', em: hora('08T10:20'), ate: 'emPericia' },
  { processoId: 'proc-buriti', tipo: 'Material biológico', descricao: 'Amostra em tubo coletor, identificada por lacre.', lacre: 'LAC-1005', coletor: 'u-coletor', em: hora('09T16:30'), ate: 'armazenado' },
];

const ETAPAS = ['coletado', 'emTransito', 'recebido', 'emPericia', 'armazenado'];
const alcanca = (alvo, etapa) => ETAPAS.indexOf(alvo) >= ETAPAS.indexOf(etapa);

function criarBaseVazia() {
  return {
    db: { usuarios: USUARIOS_SEED.map((u) => ({ ...u })), processos: PROCESSOS_SEED.map((p) => ({ ...p })), vestigios: [], eventos: {} },
    ledger: {},
  };
}

async function avancar(base, vestigioId, ate, em) {
  const por = (id) => base.db.usuarios.find((u) => u.id === id);
  const vestigio = base.db.vestigios.find((v) => v.id === vestigioId);
  const origem = por(vestigio.criadoPor);
  const destino = por(ate === 'emPericia' ? 'u-perito' : 'u-central');
  const passo = (n) => new Date(Date.parse(em) + n * 3_600_000).toISOString();

  if (alcanca(ate, 'emTransito')) await aplicarEvento(base, { vestigioId, tipo: TIPOS_EVENTO.TRANSFERIR, destinoId: destino.id }, origem, passo(1));
  if (alcanca(ate, 'recebido')) await aplicarEvento(base, { vestigioId, tipo: TIPOS_EVENTO.RECEBER, lacreInformado: vestigio.lacre }, destino, passo(2));
  if (ate === 'emPericia') await aplicarEvento(base, { vestigioId, tipo: TIPOS_EVENTO.INICIAR_PERICIA }, destino, passo(3));
  if (ate === 'armazenado') await aplicarEvento(base, { vestigioId, tipo: TIPOS_EVENTO.ARMAZENAR }, destino, passo(3));
}

/** Constrói a base inicial usando as mesmas regras do adaptador (hashes e eventos reais). */
export async function construirSeeds() {
  const base = criarBaseVazia();
  for (const seed of VESTIGIOS_SEED) {
    const coletor = base.db.usuarios.find((u) => u.id === seed.coletor);
    const anexo = { nome: 'registro-fotografico.jpg', tamanho: 1024, sha256: await sha256Hex(`anexo-sintetico-${seed.lacre}`) };
    const entrada = { ...seed, anexo };
    const hashVestigio = await hashDoVestigio(entrada);
    const vestigio = await criarVestigio(base, { ...entrada, hashVestigio }, coletor, seed.em);
    await avancar(base, vestigio.id, seed.ate, seed.em);
  }
  return base;
}
