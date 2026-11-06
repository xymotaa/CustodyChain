// Autoria: Lucas Barros Mota (2026)
// Usuário logado e perfil. Guarda só dados de exibição (nunca senha).
import { writable, derived, get } from 'svelte/store';
import { ler, gravar, remover } from '../data/armazenamento.js';

const CHAVE = 'cc.sessao';

export const sessao = writable(ler(CHAVE));
export const perfilAtual = derived(sessao, ($sessao) => $sessao?.perfil ?? null);

export function definirSessao(usuario) {
  const { id, nome, login, perfil } = usuario;
  const dados = { id, nome, login, perfil };
  gravar(CHAVE, dados);
  sessao.set(dados);
}

export function limparSessao() {
  remover(CHAVE);
  sessao.set(null);
}

export function usuarioLogado() {
  const usuario = get(sessao);
  if (!usuario) throw new Error('Sessão encerrada. Entre novamente.');
  return usuario;
}
