// Autoria: Lucas Barros Mota (2026)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jsonCanonico, sha256Hex, sha256DeObjeto } from './hash.js';

test('SHA-256 conhecido de "abc"', async () => {
  assert.equal(await sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('JSON canônico ordena chaves recursivamente e ignora undefined', () => {
  assert.equal(jsonCanonico({ b: 1, a: { d: [2, { y: 1, x: 2 }], c: undefined } }), '{"a":{"d":[2,{"x":2,"y":1}]},"b":1}');
});

test('objetos equivalentes em ordens diferentes geram o mesmo hash', async () => {
  assert.equal(await sha256DeObjeto({ a: 1, b: 2 }), await sha256DeObjeto({ b: 2, a: 1 }));
});

test('qualquer alteração muda o hash', async () => {
  assert.notEqual(await sha256DeObjeto({ a: 1 }), await sha256DeObjeto({ a: 2 }));
});
