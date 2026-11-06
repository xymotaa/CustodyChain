// Autoria: Lucas Barros Mota (2026)
// Hash router mínimo. A decisão "quem pode ver o quê" vem de fora (policy.js).
import { readable } from 'svelte/store';

export const CAMINHO_LOGIN = '/login';
export const CAMINHO_INICIAL = '/painel';

const lerCaminho = () => (globalThis.location?.hash ?? '').replace(/^#/, '') || '/';

export const caminhoAtual = readable(lerCaminho(), (set) => {
  const atualizar = () => set(lerCaminho());
  globalThis.addEventListener?.('hashchange', atualizar);
  return () => globalThis.removeEventListener?.('hashchange', atualizar);
});

export const navegar = (caminho) => {
  globalThis.location.hash = `#${caminho}`;
};

/** Casa "/verificador/:id" com "/verificador/v-001" -> { id: 'v-001' }; ou null. */
export function casar(padrao, caminho) {
  const alvo = caminho.split('/').filter(Boolean);
  const partes = padrao.split('/').filter(Boolean);
  if (alvo.length !== partes.length) return null;
  const params = {};
  for (const [i, parte] of partes.entries()) {
    if (parte.startsWith(':')) params[parte.slice(1)] = decodeURIComponent(alvo[i]);
    else if (parte !== alvo[i]) return null;
  }
  return params;
}

/**
 * @param {{ caminho: string, publica?: boolean }[]} rotas
 * @param {(rota: object) => boolean} permitida  decisão visual de acesso para o perfil atual
 * @returns {{ tipo: 'ok', rota: object, params: object } | { tipo: 'redirecionar', para: string } | { tipo: 'negado' } | { tipo: 'nao-encontrada' }}
 */
export function resolver(rotas, caminho, autenticado, permitida) {
  if (caminho === '/') return { tipo: 'redirecionar', para: autenticado ? CAMINHO_INICIAL : CAMINHO_LOGIN };
  for (const rota of rotas) {
    const params = casar(rota.caminho, caminho);
    if (!params) continue;
    if (rota.publica) return autenticado ? { tipo: 'redirecionar', para: CAMINHO_INICIAL } : { tipo: 'ok', rota, params };
    if (!autenticado) return { tipo: 'redirecionar', para: CAMINHO_LOGIN };
    return permitida(rota) ? { tipo: 'ok', rota, params } : { tipo: 'negado' };
  }
  return { tipo: 'nao-encontrada' };
}
