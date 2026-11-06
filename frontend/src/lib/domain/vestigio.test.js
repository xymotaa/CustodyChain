// Autoria: Lucas Barros Mota (2026)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gerarRotulos, exigirAprovadorDistinto, lacresConferem, dadosAncoraveis } from './vestigio.js';

test('RE é sequencial e RC é reaproveitado no mesmo processo', () => {
  const existentes = [{ rotuloRE: 'RE-2026-0001', rotuloRC: 'RC-2026-001', processoId: 'p1' }];
  assert.deepEqual(gerarRotulos(existentes, 'p1', 2026), { rotuloRE: 'RE-2026-0002', rotuloRC: 'RC-2026-001' });
  assert.deepEqual(gerarRotulos(existentes, 'p2', 2026), { rotuloRE: 'RE-2026-0002', rotuloRC: 'RC-2026-002' });
});

test('primeiro vestígio recebe RE-0001 e RC-001', () => {
  assert.deepEqual(gerarRotulos([], 'p1', 2026), { rotuloRE: 'RE-2026-0001', rotuloRC: 'RC-2026-001' });
});

test('RN16 impede o autor de aprovar o próprio registro', () => {
  assert.throws(() => exigirAprovadorDistinto('u1', 'u1'), /RN16/);
  assert.doesNotThrow(() => exigirAprovadorDistinto('u1', 'u2'));
});

test('lacres comparam sem diferenciar caixa e espaços nas pontas', () => {
  assert.equal(lacresConferem('LAC-1', ' lac-1 '), true);
  assert.equal(lacresConferem('LAC-1', 'LAC-2'), false);
});

test('dados ancoráveis aparam textos e incluem o hash do anexo', () => {
  const d = dadosAncoraveis({ processoId: 'p', tipo: ' t ', descricao: 'd ', lacre: ' l', anexo: { sha256: 'abc', nome: 'x' } });
  assert.deepEqual(d, { processoId: 'p', tipo: 't', descricao: 'd', lacre: 'l', anexoSha256: 'abc' });
});
