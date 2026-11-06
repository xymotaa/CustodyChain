// Autoria: Lucas Barros Mota (2026)
import { writable } from 'svelte/store';

export const avisos = writable([]);
let proximoId = 1;

/** @param {'sucesso'|'erro'|'info'} tipo */
export function avisar(tipo, mensagem) {
  const id = proximoId++;
  avisos.update((lista) => [...lista, { id, tipo, mensagem }]);
  return id;
}

export const dispensar = (id) => avisos.update((lista) => lista.filter((a) => a.id !== id));
