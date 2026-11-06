// Autoria: Lucas Barros Mota (2026)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PERFIS as P, menuDoPerfil, pode } from './policy.js';

const caminhos = (perfil) => menuDoPerfil(perfil).map((i) => i.caminho);

test('matriz de permissões do doc', () => {
  assert.equal(pode(P.COLETOR, 'cadastrar'), true);
  assert.equal(pode(P.PERITO, 'cadastrar'), false);
  assert.equal(pode(P.PERITO, 'emitirLaudo'), true);
  assert.equal(pode(P.CENTRAL, 'emitirLaudo'), false);
  assert.equal(pode(P.CENTRAL, 'armazenar'), true);
  assert.equal(pode(P.EXTERNO, 'autorizarDestinacao'), true);
  assert.equal(pode(P.COLETOR, 'receber'), false);
  assert.equal(pode(P.ADMINISTRADOR, 'gerirUsuarios'), true);
});

test('ninguém tem ação de excluir ou alterar registros', () => {
  assert.equal(pode(P.ADMINISTRADOR, 'excluir'), false);
  assert.equal(pode(P.ADMINISTRADOR, 'alterar'), false);
});

test('menu varia por perfil', () => {
  assert.deepEqual(caminhos(P.COLETOR), ['/painel', '/vestigios/novo', '/movimentacoes']);
  assert.ok(caminhos(P.ADMINISTRADOR).includes('/usuarios'));
  assert.ok(!caminhos(P.EXTERNO).includes('/usuarios'));
  assert.ok(caminhos(P.PERITO).includes('/recebimento'));
});

test('ações do vestígio dependem de perfil, estado e responsável', async () => {
  const { acoesDoVestigio } = await import('./policy.js');
  const emPericia = { estado: 'EmPericia', responsavelId: 'u-perito' };
  assert.deepEqual(acoesDoVestigio(P.PERITO, 'u-perito', emPericia), ['emitirLaudo']);
  assert.deepEqual(acoesDoVestigio(P.PERITO, 'outro', emPericia), []);
  assert.deepEqual(acoesDoVestigio(P.CENTRAL, 'u-central', { estado: 'Recebido', responsavelId: 'u-central' }), ['armazenar']);
  assert.deepEqual(acoesDoVestigio(P.EXTERNO, 'u-externo', { estado: 'Armazenado', responsavelId: 'u-central' }), ['autorizarDestinacao']);
});
