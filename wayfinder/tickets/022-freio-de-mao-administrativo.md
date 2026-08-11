---
id: "022"
title: Construir o freio de mão administrativo (desligamento geral do agente)
labels: [wayfinder:task]
status: open
assignee:
blocked-by: ["012"]
---

## Question

Decidido no grilling do ticket [012](012-quando-e-como-o-agente-escala.md): o freio de mão
**por conversa** já existe de graça, pelo próprio mecanismo de detecção do handoff — qualquer
mensagem humana na conversa já é o sinal de que alguém assumiu, e o agente fica em silêncio
ali, sem precisar de comando dedicado.

O que falta é um freio de mão **global**: um jeito de desligar o agente inteiro, em todas as
conversas de uma vez, para o caso de mau funcionamento (respondendo errado, "alucinando"
preço, etc.). Isso não é decisão de design que dependa de preferência da loja — é
responsabilidade de implementação: todo serviço em produção precisa de um desligamento de
emergência. Ticket registrado aqui para que a construção não se perca quando a fase de
implementação do agente começar.

### O que fazer

- Definir o mecanismo técnico (variável de ambiente, painel admin, endpoint protegido — a
  escolha é livre, cabe a quem implementar).
- O desligamento deve ser **imediato** e **atingir todas as conversas em andamento**, não só
  as novas mensagens que chegarem depois.
- Definir quem aciona — dono do projeto e/ou consultoras com acesso — na implementação; não é
  um botão que o cliente final vê.

**Resolvido quando** existir um jeito comprovado de desligar o agente inteiro, testado e
documentado (onde fica, quem tem acesso).
