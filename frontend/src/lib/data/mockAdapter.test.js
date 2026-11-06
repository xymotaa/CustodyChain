// Autoria: Lucas Barros Mota (2026)
// Fluxos ponta a ponta do adaptador mock (sem navegador: armazenamento cai para memória).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as api from './mockAdapter.js';
import { SENHA_DEMO } from './seeds.js';
import { limparSessao } from '../stores/session.js';
import { dadosAncoraveis } from '../domain/vestigio.js';
import { sha256DeObjeto } from '../crypto/hash.js';
import { ESTADOS as E } from '../domain/estados.js';

api.configurarLatencia(0);

beforeEach(async () => {
  limparSessao();
  await api.reiniciarDemonstracao();
});

const entrar = (login) => api.login({ login, senha: SENHA_DEMO });

async function cadastrarComoColetor(lacre = 'LAC-9001') {
  await entrar('coletor');
  const dados = { processoId: 'proc-ipe', tipo: 'Celular', descricao: 'Aparelho de teste', lacre, anexo: null };
  const hashVestigio = await sha256DeObjeto(dadosAncoraveis(dados));
  return api.cadastrarVestigio({ ...dados, hashVestigio });
}

test('login com credenciais erradas falha com mensagem genérica', async () => {
  await assert.rejects(api.login({ login: 'coletor', senha: 'x' }), /Usuário ou senha inválidos/);
  await assert.rejects(api.login({ login: 'naoexiste', senha: SENHA_DEMO }), /Usuário ou senha inválidos/);
});

test('seeds trazem 5 vestígios, todos simulados, com 5 perfis distintos', async () => {
  const vestigios = await api.listarVestigios();
  assert.equal(vestigios.length, 5);
  assert.ok(vestigios.every((v) => v.simulado === true));
  assert.equal(new Set((await api.listarUsuarios()).map((u) => u.perfil)).size, 5);
  assert.ok((await api.listarUsuarios()).every((u) => !('senha' in u)));
});

test('cadastro gera evento #1, rótulos únicos e hash válido', async () => {
  const antes = (await api.listarVestigios()).length;
  const novo = await cadastrarComoColetor();
  const todos = await api.listarVestigios();
  assert.equal(todos.length, antes + 1);
  assert.equal(new Set(todos.map((v) => v.rotuloRE)).size, todos.length);
  const linha = await api.linhaDoTempo(novo.id);
  assert.equal(linha.length, 1);
  assert.equal(linha[0].seq, 1);
  assert.equal(novo.estado, E.COLETADO);
  assert.equal((await api.verificarIntegridade(novo.id)).integro, true);
});

test('cadastro rejeita hash que não confere e lacre duplicado', async () => {
  await entrar('coletor');
  const dados = { processoId: 'proc-ipe', tipo: 'Celular', descricao: 'x', lacre: 'LAC-9002' };
  await assert.rejects(api.cadastrarVestigio({ ...dados, hashVestigio: 'f'.repeat(64) }), /hash informado/);
  await cadastrarComoColetor('LAC-9003');
  await assert.rejects(cadastrarComoColetor('LAC-9003'), /lacre/);
});

test('perito não pode cadastrar (perfil sem permissão)', async () => {
  await entrar('perito');
  await assert.rejects(api.cadastrarVestigio({ processoId: 'proc-ipe', tipo: 'a', descricao: 'b', lacre: 'c', hashVestigio: 'x' }), /permissão/);
});

test('transferir e receber com lacre correto leva a Recebido', async () => {
  const v = await cadastrarComoColetor();
  await api.registrarEvento({ vestigioId: v.id, tipo: 'transferir', destinoId: 'u-central' });
  assert.equal((await api.obterVestigio(v.id)).estado, E.EM_TRANSPORTE);
  await entrar('central');
  await api.registrarEvento({ vestigioId: v.id, tipo: 'receber', lacreInformado: 'lac-9001' });
  const depois = await api.obterVestigio(v.id);
  assert.equal(depois.estado, E.RECEBIDO);
  assert.equal(depois.responsavelId, 'u-central');
});

test('RN21: lacre divergente leva a CustodiaComprometida e fica registrado', async () => {
  const v = await cadastrarComoColetor();
  await api.registrarEvento({ vestigioId: v.id, tipo: 'transferir', destinoId: 'u-central' });
  await entrar('central');
  await api.registrarEvento({ vestigioId: v.id, tipo: 'receber', lacreInformado: 'LAC-0000' });
  assert.equal((await api.obterVestigio(v.id)).estado, E.CUSTODIA_COMPROMETIDA);
  const ultimo = (await api.linhaDoTempo(v.id)).at(-1);
  assert.equal(ultimo.detalhes.lacreEsperado, 'LAC-9001');
  assert.equal(ultimo.detalhes.lacreInformado, 'LAC-0000');
});

test('RN19: recusa exige justificativa e devolve ao estado e responsável anteriores', async () => {
  const v = await cadastrarComoColetor();
  await api.registrarEvento({ vestigioId: v.id, tipo: 'transferir', destinoId: 'u-central' });
  await entrar('central');
  await assert.rejects(api.registrarEvento({ vestigioId: v.id, tipo: 'recusar', justificativa: '  ' }), /justificativa/);
  await api.registrarEvento({ vestigioId: v.id, tipo: 'recusar', justificativa: 'Embalagem violada na chegada.' });
  const depois = await api.obterVestigio(v.id);
  assert.equal(depois.estado, E.COLETADO);
  assert.equal(depois.responsavelId, 'u-coletor');
  assert.equal(depois.transferencia, null);
});

test('RN16: o autor da transferência não recebe o próprio envio; destino precisa ser diferente', async () => {
  const v = await cadastrarComoColetor();
  await assert.rejects(api.registrarEvento({ vestigioId: v.id, tipo: 'transferir', destinoId: 'u-coletor' }), /diferente da origem/);
  await assert.rejects(api.registrarEvento({ vestigioId: v.id, tipo: 'transferir', destinoId: 'u-admin' }), /perfil de recebimento/);
  await api.registrarEvento({ vestigioId: v.id, tipo: 'transferir', destinoId: 'u-central' });
  await assert.rejects(api.registrarEvento({ vestigioId: v.id, tipo: 'receber', lacreInformado: 'LAC-9001' }), /permissão/);
});

test('transição inválida é rejeitada e não altera o estado', async () => {
  const v = await cadastrarComoColetor();
  await assert.rejects(api.registrarEvento({ vestigioId: v.id, tipo: 'armazenar' }), /permissão/);
  await entrar('central');
  await assert.rejects(api.registrarEvento({ vestigioId: v.id, tipo: 'iniciarPericia' }), /permissão/);
  assert.equal((await api.obterVestigio(v.id)).estado, E.COLETADO);
});

test('só perito emite laudo e só admin/externo autorizam descarte', async () => {
  await entrar('perito');
  const emPericia = (await api.listarVestigios()).find((v) => v.estado === E.EM_PERICIA);
  await api.registrarEvento({ vestigioId: emPericia.id, tipo: 'emitirLaudo', conclusao: 'Sem indícios de violação.' });
  assert.equal((await api.obterVestigio(emPericia.id)).estado, E.PERICIADO);

  const armazenado = (await api.listarVestigios()).find((v) => v.estado === E.ARMAZENADO);
  await assert.rejects(api.registrarEvento({ vestigioId: armazenado.id, tipo: 'autorizarDestinacao', numeroAutorizacao: 'X' }), /permissão/);
  await entrar('externo');
  await api.registrarEvento({ vestigioId: armazenado.id, tipo: 'autorizarDestinacao', numeroAutorizacao: 'Ofício sintético 1/2026' });
  assert.equal((await api.obterVestigio(armazenado.id)).estado, E.DESCARTADO);
  assert.ok((await api.listarVestigios()).some((v) => v.id === armazenado.id), 'vestígio permanece registrado');
});

test('simular adulteração do banco torna a verificação Divergente; o hash registrado permanece', async () => {
  await entrar('admin');
  const [v] = await api.listarVestigios();
  const antes = await api.verificarIntegridade(v.id);
  assert.equal(antes.integro, true);
  await api.simularAdulteracao(v.id);
  const depois = await api.verificarIntegridade(v.id);
  assert.equal(depois.integro, false);
  assert.equal(depois.hashRegistrado, antes.hashRegistrado);
  assert.notEqual(depois.hashRecalculado, depois.hashRegistrado);
});

test('seeds têm todas as linhas do tempo íntegras', async () => {
  for (const v of await api.listarVestigios()) {
    assert.equal((await api.verificarIntegridade(v.id)).integro, true, v.id);
  }
});

test('reiniciar demonstração restaura os seeds', async () => {
  await cadastrarComoColetor();
  await api.reiniciarDemonstracao();
  assert.equal((await api.listarVestigios()).length, 5);
});

test('admin cria usuário; outros perfis não', async () => {
  await entrar('coletor');
  await assert.rejects(api.criarUsuario({ nome: 'X', login: 'x', senha: 'y', perfil: 'perito' }), /administrador/);
  await entrar('admin');
  const criado = await api.criarUsuario({ nome: 'Novo Perito', login: 'perito2', senha: 'demo', perfil: 'perito' });
  assert.equal('senha' in criado, false);
  await assert.rejects(api.criarUsuario({ nome: 'Dup', login: 'perito2', senha: 'demo', perfil: 'perito' }), /em uso/);
});
