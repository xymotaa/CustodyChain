// Autoria: Lucas Barros Mota (2026)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ESTADOS as E, podeTransitar, transitar, estadoAposRecusa, ehTerminal, estadosSeguintes } from './estados.js';

const VALIDAS = [
  [E.RECONHECIDO, E.COLETADO],
  [E.COLETADO, E.EM_TRANSPORTE],
  [E.EM_TRANSPORTE, E.RECEBIDO],
  [E.EM_TRANSPORTE, E.CUSTODIA_COMPROMETIDA],
  [E.RECEBIDO, E.EM_PERICIA],
  [E.RECEBIDO, E.ARMAZENADO],
  [E.EM_PERICIA, E.PERICIADO],
  [E.PERICIADO, E.ARMAZENADO],
  [E.CUSTODIA_COMPROMETIDA, E.ARMAZENADO],
  [E.ARMAZENADO, E.DESCARTADO],
];

for (const [de, para] of VALIDAS) {
  test(`permite ${de} -> ${para}`, () => assert.equal(transitar(de, para), para));
}

test('rejeita todas as transições fora da tabela', () => {
  const todos = Object.values(E);
  const validas = new Set(VALIDAS.map(([a, b]) => `${a}>${b}`));
  for (const de of todos) {
    for (const para of todos) {
      if (!validas.has(`${de}>${para}`)) {
        assert.equal(podeTransitar(de, para), false, `${de} -> ${para} deveria ser inválida`);
        assert.throws(() => transitar(de, para), /Transição inválida/);
      }
    }
  }
});

test('pular etapas é inválido (Coletado direto para Recebido)', () => {
  assert.throws(() => transitar(E.COLETADO, E.RECEBIDO));
});

test('Descartado é terminal e nenhum estado leva a remoção do vestígio', () => {
  assert.equal(ehTerminal(E.DESCARTADO), true);
  assert.equal(Object.values(E).filter(ehTerminal).length, 1);
});

test('estado desconhecido falha cedo', () => {
  assert.throws(() => estadosSeguintes('Inexistente'), /Estado desconhecido/);
});

test('RN19: recusa em trânsito reverte para Coletado; fora de trânsito é erro', () => {
  assert.equal(estadoAposRecusa(E.EM_TRANSPORTE), E.COLETADO);
  assert.throws(() => estadoAposRecusa(E.RECEBIDO));
});
