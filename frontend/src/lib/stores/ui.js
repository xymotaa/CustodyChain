// Autoria: Lucas Barros Mota (2026)
// Preferências de interface: tema, barra lateral recolhida, gaveta móvel.
import { writable, readable } from 'svelte/store';
import { ler, gravar } from '../data/armazenamento.js';

const CHAVE_TEMA = 'cc.tema';
const CHAVE_MENU = 'cc.sidebar';
const consultaMovel = '(max-width: 767px)';

function temaInicial() {
  const salvo = ler(CHAVE_TEMA);
  if (salvo) return salvo;
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

export const tema = writable(temaInicial());
tema.subscribe((valor) => {
  gravar(CHAVE_TEMA, valor);
  globalThis.document?.documentElement.classList.toggle('dark', valor === 'escuro');
});
export const alternarTema = () => tema.update((t) => (t === 'escuro' ? 'claro' : 'escuro'));

export const menuRecolhido = writable(ler(CHAVE_MENU) === true);
menuRecolhido.subscribe((valor) => gravar(CHAVE_MENU, valor));
export const alternarMenu = () => menuRecolhido.update((v) => !v);

export const gavetaAberta = writable(false);

export const ehMovel = readable(false, (set) => {
  const consulta = globalThis.matchMedia?.(consultaMovel);
  if (!consulta) return;
  const atualizar = () => set(consulta.matches);
  atualizar();
  consulta.addEventListener('change', atualizar);
  return () => consulta.removeEventListener('change', atualizar);
});
