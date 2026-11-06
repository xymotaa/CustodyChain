// Autoria: Lucas Barros Mota (2026)
// SHA-256 real via WebCrypto (navegador e Node) sobre JSON canônico.

/** JSON determinístico: chaves ordenadas recursivamente, sem espaços. */
export function jsonCanonico(valor) {
  if (valor === null || typeof valor !== 'object') return JSON.stringify(valor);
  if (Array.isArray(valor)) return `[${valor.map(jsonCanonico).join(',')}]`;
  const chaves = Object.keys(valor).filter((k) => valor[k] !== undefined).sort();
  return `{${chaves.map((k) => `${JSON.stringify(k)}:${jsonCanonico(valor[k])}`).join(',')}}`;
}

function paraHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** @param {string | ArrayBuffer | Uint8Array} entrada */
export async function sha256Hex(entrada) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    // WebCrypto só existe em contexto seguro (https ou http://localhost).
    throw new Error('Este navegador não oferece SHA-256 neste endereço. Abra a demonstração em http://localhost:5173.');
  }
  const bytes = typeof entrada === 'string' ? new TextEncoder().encode(entrada) : entrada;
  return paraHex(await subtle.digest('SHA-256', bytes));
}

export const sha256DeObjeto = (objeto) => sha256Hex(jsonCanonico(objeto));

/** @param {Blob} arquivo */
export async function sha256DeArquivo(arquivo) {
  return sha256Hex(await arquivo.arrayBuffer());
}
