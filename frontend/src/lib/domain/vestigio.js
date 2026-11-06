// Autoria: Lucas Barros Mota (2026)
// Regras puras sobre o vestígio: dados que entram no hash, rótulos RE/RC e RN16.

/** Conjunto de campos (já aparados) cujo hash é ancorado. Mudar este recorte invalida hashes antigos. */
export function dadosAncoraveis({ processoId, tipo, descricao, lacre, anexo }) {
  return {
    processoId,
    tipo: tipo.trim(),
    descricao: descricao.trim(),
    lacre: lacre.trim(),
    anexoSha256: anexo?.sha256 ?? null,
  };
}

const prefixoRE = (ano) => `RE-${ano}-`;

/**
 * Gera rótulos únicos. RE (evidência) é sequencial por ano; RC (conjunto) é um por processo,
 * reaproveitado pelos vestígios do mesmo processo.
 */
export function gerarRotulos(vestigiosExistentes, processoId, ano = new Date().getFullYear()) {
  const usados = vestigiosExistentes
    .map((v) => v.rotuloRE)
    .filter((r) => r.startsWith(prefixoRE(ano)))
    .map((r) => Number(r.slice(prefixoRE(ano).length)));
  const proximo = Math.max(0, ...usados) + 1;

  const doMesmoProcesso = vestigiosExistentes.find((v) => v.processoId === processoId);
  const conjuntos = new Set(vestigiosExistentes.map((v) => v.rotuloRC));
  const rotuloRC = doMesmoProcesso?.rotuloRC ?? `RC-${ano}-${String(conjuntos.size + 1).padStart(3, '0')}`;

  return { rotuloRE: `${prefixoRE(ano)}${String(proximo).padStart(4, '0')}`, rotuloRC };
}

/** RN16: quem cria o registro não o aprova. */
export function exigirAprovadorDistinto(autorDoRegistroId, aprovadorId) {
  if (autorDoRegistroId === aprovadorId) {
    throw new Error('RN16: quem criou o registro não pode aprová-lo.');
  }
}

export function lacresConferem(esperado, informado) {
  return esperado.trim().toUpperCase() === informado.trim().toUpperCase();
}
