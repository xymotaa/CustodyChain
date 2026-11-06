// Autoria: Lucas Barros Mota (2026)
// STUB do adaptador real (API Node + MySQL + chaincode `custodychain`).
// Cada função falha de forma explícita: nunca finge sucesso.
const naoImplementado = (operacao) => async () => {
  throw new Error(`Modo "api": ${operacao} não implementado nesta etapa. Use VITE_DATA_MODE=mock.`);
};

export const login = naoImplementado('login');
export const logout = naoImplementado('logout');
export const listarProcessos = naoImplementado('listarProcessos');
export const listarVestigios = naoImplementado('listarVestigios');
export const obterVestigio = naoImplementado('obterVestigio');
export const cadastrarVestigio = naoImplementado('cadastrarVestigio');
export const registrarEvento = naoImplementado('registrarEvento');
export const linhaDoTempo = naoImplementado('linhaDoTempo');
export const verificarIntegridade = naoImplementado('verificarIntegridade');
export const listarUsuarios = naoImplementado('listarUsuarios');
export const criarUsuario = naoImplementado('criarUsuario');
