# CustodyChain: frontend

Svelte 5 (runes), Vite 5 e Tailwind 3 com tokens de cor em variáveis CSS (`src/app.css`).

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento (modo de dados padrão: mock) |
| `npm run dev:demo` | idem, carregando `.env.demo` |
| `npm run build` | build de produção em `dist/` |
| `npm test` | testes unitários com `node:test` (domínio, hash, roteador, política, adaptador mock) |

## Modos de dados

`VITE_DATA_MODE=mock|api` (padrão `mock`). Todas as telas falam só com `src/lib/data/index.js`.
O modo `mock` guarda tudo em `localStorage` e marca cada registro como `simulado: true`.
O modo `api` é um stub: falha com mensagem clara até a API real existir.

## Estrutura

`src/lib/domain` (máquina de estados, regras puras), `src/lib/data` (adaptadores), `src/lib/policy.js`
(espelho visual das permissões), `src/lib/ui` (componentes), `src/lib/layout` (shell), `src/routes` (telas).
