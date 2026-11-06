// Autoria: Lucas Barros Mota (2026)
// localStorage com fallback em memória (modo privado, SSR e testes em Node).
const memoria = new Map();

function localStorageDisponivel() {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null && typeof localStorage.getItem === 'function';
  } catch {
    return false;
  }
}

export function ler(chave) {
  try {
    const bruto = localStorageDisponivel() ? localStorage.getItem(chave) : memoria.get(chave);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export function gravar(chave, valor) {
  const bruto = JSON.stringify(valor);
  try {
    if (localStorageDisponivel()) localStorage.setItem(chave, bruto);
    else memoria.set(chave, bruto);
  } catch {
    memoria.set(chave, bruto);
  }
}

export function remover(chave) {
  memoria.delete(chave);
  try {
    if (localStorageDisponivel()) localStorage.removeItem(chave);
  } catch {
    /* sem armazenamento: nada a remover */
  }
}
