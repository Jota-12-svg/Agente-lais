---
id: "016"
title: Escolher o parceiro Meta para o onboarding do WhatsApp
labels: [wayfinder:research]
status: open
assignee:
blocked-by: ["009"]
---

## Question

A decisão de caminho já está tomada — [Coexistence](005-caminho-de-integracao-com-o-whatsapp.md),
com o número seguindo no app das consultoras e o agente entrando pela Cloud API. Mas
Coexistence **exige onboarding por um Solution Partner ou Tech Provider da Meta**: não existe
caminho direto para um desenvolvedor comum. Escolher esse parceiro é a próxima decisão, e ela
tem consequência longa — é por ele que todas as mensagens do agente vão passar.

Bloqueado pelo [ticket do atendimento atual](009-como-funciona-o-atendimento-hoje.md) porque
o número de consultoras e o arranjo de aparelhos mudam o que se pede do parceiro.

O research deve comparar os candidatos relevantes no Brasil — 360dialog, Twilio, Gupshup,
Zenvia, Take Blip, Meta Cloud API via parceiros menores — em:

1. **Suporte real a Coexistence.** Nem todo parceiro implementa o *business app number
   onboarding*. Este é o filtro eliminatório: quem não suporta, sai da lista.
2. **Custo.** Quanto o parceiro cobra **por cima** da tarifa da Meta: markup por mensagem,
   mensalidade, taxa de setup. Dado que a fase 1 quase não gera mensagem tarifada, uma
   mensalidade fixa pode dominar o custo total — comparar pelo custo mensal real esperado, não
   pelo preço por mensagem.
3. **Acesso à API.** O parceiro expõe a Cloud API crua, ou obriga a passar pela plataforma
   dele? Plataforma própria costuma vir com um inbox que a loja não quer e não vai usar.
4. **Suporte no Brasil**, em português, e o que acontece quando o número tem problema.
5. **Portabilidade.** Sair depois é fácil? O número volta? O histórico vai junto? Um parceiro
   de onde não se sai é um risco de refém.
6. **Faturamento em BRL**, dado que a Meta localizou a cobrança em julho de 2026 e exige a
   migração das contas até junho de 2027.

**Resolvido quando** houver um comparativo com custo mensal estimado para o volume real da
Lais Casa e uma recomendação. A escolha final é do dono do projeto — é ele quem assina o
contrato.
