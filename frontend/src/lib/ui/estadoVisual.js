// Autoria: Lucas Barros Mota (2026)
// Cor (via tokens) + ícone para cada um dos 9 estados. Nunca só cor: sempre ícone e texto.
import { ESTADOS as E } from '../domain/estados.js';

const tom = {
  neutro: 'bg-surface text-muted border-border',
  info: 'bg-surface text-info border-info/50',
  aviso: 'bg-surface text-warning border-warning/50',
  marca: 'bg-surface text-primary border-primary/50',
  ok: 'bg-surface text-success border-success/50',
  perigo: 'bg-surface text-danger border-danger/60 font-semibold',
};

export const VISUAL_ESTADO = Object.freeze({
  [E.RECONHECIDO]: { classe: tom.neutro, icone: 'eye' },
  [E.COLETADO]: { classe: tom.info, icone: 'package' },
  [E.EM_TRANSPORTE]: { classe: tom.aviso, icone: 'transfer' },
  [E.RECEBIDO]: { classe: tom.marca, icone: 'inbox' },
  [E.EM_PERICIA]: { classe: tom.marca, icone: 'flask' },
  [E.PERICIADO]: { classe: tom.ok, icone: 'clipboard-check' },
  [E.ARMAZENADO]: { classe: tom.ok, icone: 'archive' },
  [E.CUSTODIA_COMPROMETIDA]: { classe: tom.perigo, icone: 'shield-alert' },
  [E.DESCARTADO]: { classe: tom.neutro, icone: 'ban' },
});
