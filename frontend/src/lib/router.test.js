// Autoria: Lucas Barros Mota (2026)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { casar, resolver } from './router.js';

const rotas = [
  { caminho: '/login', publica: true },
  { caminho: '/painel' },
  { caminho: '/verificador/:id' },
];
const liberada = () => true;

test('casar extrai parâmetros', () => {
  assert.deepEqual(casar('/verificador/:id', '/verificador/v-001'), { id: 'v-001' });
  assert.equal(casar('/verificador/:id', '/verificador'), null);
});

test('sem sessão, rota protegida redireciona para login', () => {
  assert.deepEqual(resolver(rotas, '/painel', false, liberada), { tipo: 'redirecionar', para: '/login' });
});

test('com sessão, login redireciona ao painel', () => {
  assert.deepEqual(resolver(rotas, '/login', true, liberada), { tipo: 'redirecionar', para: '/painel' });
});

test('perfil sem permissão recebe "negado"', () => {
  assert.deepEqual(resolver(rotas, '/painel', true, () => false), { tipo: 'negado' });
});

test('rota inexistente e raiz', () => {
  assert.equal(resolver(rotas, '/x', true, liberada).tipo, 'nao-encontrada');
  assert.deepEqual(resolver(rotas, '/', false, liberada), { tipo: 'redirecionar', para: '/login' });
});
