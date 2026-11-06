# Roteiro da demonstração (5 min)

Preparação: `cd frontend && npm run dev:demo`, abrir http://localhost:5173 e usar "Reiniciar demonstração" (barra lateral) para partir dos dados iniciais. Senha de todas as contas de demonstração: `demo2026` (botão "Usar" no login).

## O que é real e o que é simulado

| Real (executa de verdade no navegador) | Simulado (mock) |
| --- | --- |
| SHA-256 do vestígio e do anexo (WebCrypto) sobre JSON canônico | Banco de dados e "ledger" (ambos em `localStorage`) |
| Recálculo e comparação do hash na verificação | Ancoragem (o `txId` é fictício, não há blockchain) |
| Encadeamento por hash dos eventos da linha do tempo | Login e senha (conta fixa de demonstração) |
| Máquina de estados (9 estados) e regras RN16, RN19, RN21 | Perfis e permissões (espelho visual; a API futura decidirá) |
| Validações e rótulos RE/RC únicos | Processos, pessoas e vestígios (todos sintéticos) |

Tudo que é simulado traz o selo "Simulado" e o banner "Ambiente de demonstração: dados simulados".

## Sequência

1. **Login como Agente Coletor** (Clara). Mostrar que o menu só traz Painel, Cadastrar vestígio e Movimentações.
2. **T-03 Cadastrar vestígio**: processo "Caso Ipê", tipo, descrição, lacre `LAC-2001` e um anexo qualquer. Mostrar o hash SHA-256 calculado na hora (real). Registrar e mostrar os rótulos RE/RC e o evento #1 na linha do tempo.
3. **T-05 Movimentações**: transferir o vestígio novo para a Central de Custódia (origem = você). Ele fica "Em transporte".
4. **Sair e login como Central de Custódia** (Carlos). **T-04 Recebimento**:
   - Recusar o item novo com justificativa (primeiro tentar sem: bloqueia). Ele volta a "Coletado" com o coletor (RN19).
   - Aceitar o outro item (`LAC-1002`) digitando um lacre errado, por exemplo `LAC-9999`: custódia comprometida, registrada e não revertida (RN21). Se quiser mostrar o caminho feliz, reinicie e digite `LAC-1002`.
5. **Sair e login como Órgão externo** (ou Perito). **T-11 Verificador**: abrir `RE-2026-0001`, mostrar a linha do tempo e o resultado **Íntegro** (hash registrado igual ao recalculado).
6. Clicar em **Simular adulteração do banco** e confirmar. O dado do banco muda, o hash registrado não, e o resultado vira **Divergente**. Mensagem: no modelo híbrido, quem administra o banco não consegue alterar o registro sem ser detectado.
7. Opcional: alternar tema claro/escuro, recolher a barra lateral e abrir a tela em largura de celular.

## Se algo sair do roteiro

"Reiniciar demonstração" (barra lateral) restaura todos os dados iniciais. Nenhum perfil tem opção de excluir ou alterar registros.
