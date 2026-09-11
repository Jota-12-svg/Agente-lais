---
ticket: "016"
title: Número dedicado para o agente, com acesso da loja pelo app — é viável sem parceiro pago?
tipo: research
data: 2026-08-11
---

# Research — Número novo dedicado ao agente, com acesso humano em tempo real

Ticket: [016](../tickets/016-escolher-parceiro-meta.md) · Investigado em 2026-08-11 · Complementa
[research 005](005-integracao-whatsapp.md) (Coexistence é o caminho para o número atual),
[research 016](016-parceiro-meta-onboarding.md) (comparativo de parceiros pagos),
[research 022](022-alternativas-onboarding-sem-parceiro-pago.md) (número paralelo grátis, handoff
desajeitado) e [research 023](023-comunidade-whatsapp-ia-baixo-custo.md) (risco de banimento de
biblioteca não-oficial).

> **Base desta investigação.** Fontes primárias sempre que existiam: documentação oficial da Meta
> (`developers.facebook.com`), Central de Ajuda do WhatsApp (`faq.whatsapp.com`, lida via proxy de
> leitura `r.jina.ai` quando a ferramenta de fetch direta truncava a página — mesmo método usado no
> research 022), documentação oficial de parceiros já levantados (360dialog) e READMEs/issues de
> primeira mão dos projetos não-oficiais (Baileys, Evolution API). Onde só havia fonte secundária —
> blogs de operadora, revendedores de número virtual, comparativos de terceiro — isso está **marcado
> explicitamente** e tratado como indício, não como fato.

---

## Resumo executivo

**Resposta direta à pergunta que motivou este research:** dá para montar um número novo e dedicado
onde o agente vive e uma consultora tem acesso em tempo real pelo app dela, sem pagar parceiro Meta
— **mas só pela via não-oficial** (Baileys/Evolution API/WPPConnect ocupando uma vaga de dispositivo
vinculado, a consultora ocupando outra). Pela via oficial (Cloud API), não existe um caminho
"faça você mesmo": a única forma de um número na Cloud API também aparecer no app de alguém é
Coexistence, e Coexistence **sempre** exige parceiro Meta pago, é sempre iniciada a partir de um
número que **já estava no app**, e nunca ao contrário (partir do número já na Cloud API).

1. **A leitura do pedido do dono do projeto está confirmada, com um ajuste técnico.** "Agente
   hospedado ali dentro" + "dar acesso à loja" descreve exatamente o mecanismo de **dispositivos
   vinculados** do WhatsApp comum (o mesmo recurso de até 4 aparelhos — ou até 10 no Business
   Premium — que a própria loja já usa hoje no número atual, mapeado no research 022). A correção
   necessária: **qualquer que seja o número que primeiro verifica o SIM (recebe o SMS/chamada),
   esse aparelho vira o "dispositivo principal"** — e nenhuma biblioteca não-oficial documentada
   (Baileys, Evolution API, WPPConnect) cria uma conta do zero sem um aparelho real passando por
   essa verificação inicial. "O agente hospedado ali dentro" na prática significa a automação
   ocupando uma das vagas de **dispositivo vinculado** (secundário), não necessariamente a vaga de
   dispositivo principal — mas isso não muda o resultado prático: agente e consultora acabam
   dividindo o mesmo número, nenhum dos dois em Cloud API, nenhum parceiro envolvido.
2. **Pergunta 1 — sim, tecnicamente funciona, mas só com biblioteca não-oficial.** Não existe
   integração automatizada suportada pela própria Meta que ocupe uma vaga de "dispositivo
   vinculado" no app comum — só Baileys/Evolution API/WPPConnect fazem isso, via engenharia
   reversa do protocolo do WhatsApp Web. Ou seja: esta arquitetura **é**, tecnicamente, o mesmo
   caminho não-oficial já mapeado no research 023, só aplicado a um número novo e isolado em vez do
   número da loja. O risco de banimento (research 023: real, mas concentrado em disparo em massa;
   há pelo menos um relato de banimento em uso só-reativo) se mantém — o que muda é o **tamanho do
   prejuízo se acontecer**, porque o número afetado não é o principal da loja.
3. **Pergunta 2 — o mercado de "número dedicado para automação" existe, mas o que funciona de
   verdade para registrar WhatsApp é o mais simples e o mais barato: chip físico pré-pago de
   operadora brasileira, ~R$15–30/mês, ou linha fixa com verificação por chamada de voz.** A
   documentação oficial do WhatsApp (Central de Ajuda) confirma que **números VoIP não são
   suportados para registro** em nenhuma modalidade — o que descarta de saída boa parte dos
   "serviços de número virtual para automação/chatbot" encontrados no mercado, cuja proposta de
   valor é exatamente ser VoIP. Fontes secundárias convergem em apontar número virtual/VoIP
   "reciclado" como um dos sinais de maior risco de banimento — o oposto do que um número dedicado
   deveria buscar.
4. **Pergunta 3 — não existe caminho "faça você mesmo" de Cloud API oficial + app comum vinculado,
   nem para número novo nem para número antigo.** A documentação da própria 360dialog, ao descrever
   Coexistence, é explícita: **"this process only works for numbers registered in the App. If the
   number is connected to the WhatsApp API, this Coexistence Onboarding won't work."** A via é
   sempre App → Cloud API, mediada por parceiro; nunca Cloud API → App. Se o dono do projeto quiser
   a versão "oficial" desta arquitetura (agente na Cloud API de verdade, consultora com acesso pelo
   app), o caminho é: registrar o número novo no app comum primeiro, e então fazer Coexistence nele
   através de um parceiro pago — ou seja, **o mesmo custo do research 016 (~R$300/mês, 360dialog
   ≈€49/mês), só que aplicado a um número novo em vez do número atual da loja.** Isso não economiza
   dinheiro; só isola o risco (se der problema, não é o número principal). Vale registrar
   explicitamente: **investiguei se colocar um número na Cloud API via Get Started padrão
   desconecta o app automaticamente — confirmado que sim** (mesmo efeito documentado da migração
   direta do research 005): uma vez que o número está "puro" na Cloud API, ele não aceita mais o
   app sem passar pelo fluxo de Coexistence mediado por parceiro.
5. **Pergunta 5 — custo total estimado da versão viável (não-oficial):** chip (~R$15–30/mês) + VPS
   para hospedar Baileys/Evolution API/WPPConnect (~R$40–100/mês) = **~R$55–130/mês**, sem
   mensalidade de parceiro Meta, contra os ~R$300/mês de Coexistence pago (research 016) e os
   ~R$0/mês do número paralelo "puro" sem acesso humano (research 022). É mais caro que o número
   paralelo puro (que não tem custo de VPS porque o agente fala direto com a Meta, sem
   intermediário rodando 24/7) e mais barato que Coexistence pago — mas carrega o risco de
   banimento que nem o número paralelo puro nem o Coexistence pago carregam.

**O maior risco desta arquitetura não é o custo, é o mesmo risco do research 023 aplicado a um novo
número: banimento por engenharia reversa não sancionada pela Meta — só que agora combinado com o
esforço extra de administrar dispositivos vinculados compartilhados entre bot e humano, um padrão de
uso que esta pesquisa não encontrou ninguém documentando como prática deliberada.**

---

## Confirmação da leitura do pedido

A leitura proposta na tarefa está correta, com uma nuance técnica que vale registrar antes de
qualquer coisa: **não existe "o número nasce sendo do agente" como um estado técnico diferente de
"o número nasce sendo de um humano".** No mundo do WhatsApp comum (app, não Cloud API), todo número
precisa de **um aparelho físico (ou emulador) rodando o app de verdade** para completar a verificação
inicial por SMS ou chamada — isso é sempre o "dispositivo principal", goste ou não. Depois disso,
até quatro (grátis) ou até dez (Business Premium) **dispositivos vinculados** podem se conectar,
sem distinção técnica entre "vinculado humano" e "vinculado automação": é a mesma vaga, o mesmo
protocolo, e o WhatsApp não sabe (nem se importa) se quem está do outro lado é uma pessoa abrindo o
app ou uma biblioteca como Baileys se passando por um cliente do WhatsApp Web.

Na prática, portanto, a frase do dono do projeto — "hospedar o agente ali dentro e dar acesso à loja
a esse número" — descreve corretamente o **resultado** (agente e consultora convivendo no mesmo
número novo, sem o número atual ser tocado), mas o **meio técnico** de chegar lá é sempre o mesmo
mecanismo de dispositivos vinculados que a loja já usa hoje informalmente no número principal
(mapeado no research 022) — só que replicado num número separado, com uma automação não-oficial
ocupando uma das vagas em vez de um sexto celular de consultora.

---

## Pergunta 1 — Agente como "principal"/automação + consultora vinculada, no app comum

**Sim, é tecnicamente possível — mas só com biblioteca não-oficial, porque o app comum não tem
nenhuma automação suportada pela Meta que ocupe uma vaga de dispositivo vinculado.**

O que a pesquisa confirma:

- O teto documentado é **um dispositivo principal + até quatro vinculados** no plano gratuito
  ([faq.whatsapp.com/647349420360876](https://faq.whatsapp.com/647349420360876), já citado em
  research 022), subindo para até dez vinculados no **WhatsApp Business Premium**
  (assinatura de ~US$4,99/mês ou ~R$25–250/mês conforme a fonte, cobrada via loja de apps — fontes
  secundárias convergentes, sem confirmação de página oficial com número exato e preço).
- Bibliotecas não-oficiais conectam **exatamente pela mesma porta que qualquer dispositivo
  vinculado usa** — QR code ou pairing code, o mesmo fluxo de "Aparelhos conectados" do app.
  Confirmado tanto na documentação da própria Baileys
  ([baileys.wiki/authentication/pairing-code](https://baileys.wiki/authentication/pairing-code))
  quanto em tutoriais de Evolution API, que descrevem literalmente "autenticação feita escaneando o
  QR Code com o dispositivo que se quer automatizar" — ou seja, do ponto de vista do protocolo, o
  bot **é** um dispositivo vinculado como outro qualquer.
- **Quem detém o papel de "dispositivo principal" precisa ter passado, em algum momento, pela
  verificação de SMS/chamada com um app real rodando.** Uma busca específica sobre o modo "pairing
  code" da Baileys (que dispensa QR e permite digitar um código de 8 dígitos) confirmou que mesmo
  esse modo **ainda exige um aparelho com o app já registrado** — a Baileys entra como dispositivo
  **secundário**, nunca substitui a etapa de registro original. Fonte:
  [baileys.wiki](https://baileys.wiki/authentication/pairing-code) e a issue
  [WhiskeySockets/Baileys #2488](https://github.com/WhiskeySockets/Baileys/issues/2488), que
  descreve o processo de pareamento como dependente do telefone confirmando o link.

**Consequência prática para o desenho da Lais Aliski Casa:** a forma mais simples e mais bem documentada de
montar essa arquitetura é a consultora (ou um celular dedicado da loja) ser o **dispositivo
principal** — instala o WhatsApp Business normalmente, verifica o número novo com um chip — e a
automação (Baileys/Evolution API/WPPConnect, rodando num VPS) entra depois como um dos **dispositivos
vinculados**. Isso não é diferente, em termos de mecanismo, de como a própria loja já opera hoje no
número principal (research 022, "6 dispositivos"). A alternativa — o bot como principal e a
consultora entrando depois como vinculada — é tecnicamente possível também (qualquer papel pode ser
ocupado por qualquer cliente compatível com o protocolo), mas exige que a biblioteca não-oficial seja
capaz de **originar** um convite de vínculo a partir de si mesma, uma funcionalidade que esta
pesquisa não confirmou estar exposta de forma estável em nenhuma das bibliotecas investigadas —
ver Lacunas.

---

## Pergunta 2 — Que "número próprio contratado" existe no mercado

A pesquisa distingue três categorias, e a documentação oficial da Meta elimina uma delas de saída.

### O que a própria Meta aceita para registro

Fonte primária (Central de Ajuda do WhatsApp, lida via proxy porque a ferramenta de fetch direta
trunca a página):

> "Unsupported phone numbers include: VoIP, toll-free numbers, paid premium numbers, universal
> access numbers (UAN), and landlines (landlines are only supported on the WhatsApp Business app)."
>
> — [faq.whatsapp.com/684051319521343](https://faq.whatsapp.com/684051319521343)

Ou seja: **número VoIP não é aceito para registro em nenhuma modalidade do WhatsApp**, comum ou
Business. A única exceção documentada é **linha fixa**, aceita **especificamente no WhatsApp
Business**, verificada por chamada de voz (confirmado também por fontes secundárias de tutorial —
[Octadesk](https://www.octadesk.com/blog/numero-fixo-no-whatsapp-business),
[Canaltech](https://canaltech.com.br/apps/como-usar-o-whatsapp-business-com-um-numero-de-telefone-fixo/)
— convergentes e consistentes com a regra oficial).

### O que isso descarta

A maior parte do que aparece numa busca por "número virtual para WhatsApp Business" no Brasil —
serviços de eSIM avulso, apps tipo Wabi/wNum, provedores de "número virtual" genéricos — se
posiciona/opera sobre infraestrutura VoIP. Uma fonte secundária resume bem o próprio risco que o
mercado reconhece:

> "Os apps convencionais do WhatsApp não aceitam números VoIP ou virtuais para verificação [...]
> risco altíssimo de banimento imediato e irreversível [...] números 'sujos' [...] anteriormente
> usados para spam."
>
> — [chatsac.com/blog/numero-virtual-para-whatsapp-business-gratis](https://chatsac.com/blog/numero-virtual-para-whatsapp-business-gratis/)
> (**secundária**, blog de uma empresa que vende automação de WhatsApp — mas o achado bate com a
> regra oficial da Meta acima, então trato como reforço, não como fonte isolada).

### O que sobra — e é, coincidentemente, o mais barato

1. **Chip pré-pago físico de operadora brasileira** (TIM, Claro, Vivo): recarga a partir de
   **R$15–17** por ciclo de 15 dias, o que dá algo como **R$30–35/mês** para manter a linha ativa
   ([comocomprar.com.br](https://comocomprar.com.br/como-comprar-chip-celular-2026-tim-vivo-claro-onde-cpf/),
   **secundária**, agregador de planos — mas os valores batem com o que as próprias operadoras
   anunciam publicamente). É a opção mais barata, mais estável e a que melhor evita o sinal de
   risco "número novo/VoIP" que o research 023 já havia identificado como fator de banimento.
2. **Linha fixa**, verificada por chamada de voz — não encontrei preço específico de uma linha fixa
   avulsa contratada só para esse fim; planos empresariais de telefonia fixa variam amplamente. Fica
   como opção válida, mas sem número de custo confiável levantado nesta pesquisa.
3. **eSIM empresarial de operadora** (TIM Empresas, Vivo Empresas): existe, mas fontes secundárias
   indicam disponibilidade **limitada por região** e não encontrei tabela de preço isolada para uma
   linha eSIM avulsa fora de um plano corporativo maior — provavelmente não compensa para uma única
   linha dedicada a automação.
4. **Serviços de "número virtual para automação/chatbot"** (ex.: Tallk.me, BR DID): existem e se
   anunciam para esse uso específico, mas cobram taxa de ativação + mensalidade + assinatura de
   plataforma de gestão, sem preço público exato encontrado, e **estruturalmente são a categoria que
   a própria documentação da Meta desaconselha** (número não é um chip físico de operadora — é
   infraestrutura VoIP ou similar por trás). Não recomendo esta categoria para este projeto.

**Conclusão da pergunta 2:** o "número próprio contratado" que realmente atende ao requisito de
"registrar uma conta de WhatsApp Business válida e estável" não é um produto de nicho — é o mesmo
chip pré-pago de operadora que qualquer pessoa compraria para uso pessoal, só dedicado só a essa
função. Isso é uma boa notícia de custo (mais barato que qualquer serviço especializado) e uma
confirmação do que o research 023 já havia apontado por outro caminho (evitar VoIP reduz risco).

---

## Pergunta 3 — Cloud API oficial + app comum vinculado, sem parceiro: existe?

**Não. A documentação confirma que essa combinação, feita sem parceiro, não existe em nenhuma
direção — nem para número novo, nem para número antigo.**

- A documentação da 360dialog sobre Coexistence, que já havia sido citada no research 016, é
  explícita quanto à direção obrigatória do processo:

  > "This process only works for numbers registered in the App. If the number is connected to the
  > WhatsApp API, this Coexistence Onboarding won't work."
  >
  > — achado consolidado a partir de múltiplas páginas oficiais da 360dialog sobre onboarding de
  > Coexistence ([docs.360dialog.com/partner/onboarding/whatsapp-coexistence](https://docs.360dialog.com/partner/onboarding/whatsapp-coexistence),
  > [docs.360dialog.com/partner/onboarding/whatsapp-coexistence/coexistence-onboarding](https://docs.360dialog.com/partner/onboarding/whatsapp-coexistence/coexistence-onboarding))

- A mesma direcionalidade aparece de forma consistente em fontes secundárias de plataformas que
  implementam Coexistence sobre a Cloud API — ex.: um artigo de ajuda de terceiro descreve
  literalmente "Using a phone number already in use with WhatsApp App" como pré-requisito de
  Coexistence, e trata o caminho inverso como erro ("this number is already registered with the
  Business API" ao tentar o caminho contrário) — consistente, mas **secundária**
  ([docs.rapidbott.com](https://docs.rapidbott.com/help-center/platform/whatsapp-channel/connect-with-whatsapp-cloud-api/using-a-phone-number-already-in-use-with-whatsapp-app)).
- O requisito de parceiro em si — já estabelecido nos research 005 e 022 — não muda: a página
  oficial da Meta sobre onboarding de usuários do app ("Onboard WhatsApp Business app users") exige
  literalmente **"You must already be a Solution Partner or Tech Provider"**
  ([developers.facebook.com](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)),
  sem exceção para número novo, dono do próprio agente, ou qualquer outro atalho.
- E, confirmando a pergunta específica sobre migração direta desconectar o app: sim — o fluxo
  padrão de "Get Started" da Cloud API, aplicado a um número que estava no app, **desliga o app**
  (mesmo comportamento já documentado no research 005 para a migração direta); e um número que
  nasce **puro** na Cloud API (sem nunca ter passado pelo app) simplesmente não tem "app" para
  desligar — ele nunca esteve lá. Não há atalho técnico para inserir o app depois, fora de
  Coexistence mediada por parceiro.

**O que isso significa na prática para a arquitetura descrita:** se o dono do projeto quiser a
versão "oficial" (agente de verdade na Cloud API, sem gambiarra de engenharia reversa) **e** quiser
que uma consultora tenha acesso pelo app no mesmo número novo, o caminho é:

1. Comprar o chip (pergunta 2).
2. Registrar o número normalmente no WhatsApp Business app primeiro (vira um número comum do app,
   igual qualquer outro).
3. Contratar um parceiro Meta (research 016 — 360dialog é o mais barato verificado, ≈€49/mês) para
   fazer o onboarding de Coexistence **nesse número novo**.

Isso tem o mesmo custo de parceiro do research 016 — **não economiza dinheiro**, só isola o risco
operacional (se o número tiver problema, não é o número principal da loja que sofre). Não é uma
arquitetura nova em termos de custo; é a arquitetura já recomendada no research 016, aplicada a um
número diferente.

---

## Pergunta 4 — Biblioteca não-oficial + consultora vinculada: funciona? Existe relato?

**Funciona tecnicamente pelo mesmo mecanismo da pergunta 1 — mas não encontrei nenhum relato de
alguém descrevendo isso como um padrão deliberado de "bot e humano dividindo o mesmo número em
tempo real".**

O que a pesquisa confirma sobre o mecanismo:

- Evolution API descreve o próprio funcionamento em termos que já preveem convivência com o
  dispositivo original: "quando conectado, o WhatsApp Web daquele número permanece vinculado à
  API" — implicando que a automação **não substitui** o app, ela se soma a ele, contanto que o
  número já tenha sido registrado por um dispositivo real primeiro
  ([blog.agenciacafeonline.com.br](https://blog.agenciacafeonline.com.br/blog/evolution-api-tutorial-completo/),
  **secundária**, mas descreve o comportamento observado do software, que é consistente com o
  protocolo).
- A mesma fonte confirma o inverso também documentado no research 022/023: **usar um número já
  ativo em outro app/telefone desconecta esse telefone** — ou seja, a convivência só é estável
  quando a automação entra como um dispositivo **adicional**, não substituindo o principal.
- Nenhuma das buscas realizadas (Baileys, WPPConnect, Evolution API, GitHub issues, fóruns) trouxe
  um relato de primeira mão de alguém rodando **um bot e um humano simultaneamente, dividindo
  atendimento em tempo real no mesmo número, cada um respondendo parte das conversas**. O que existe
  em abundância é o padrão oposto: tutoriais que conectam **todo** o tráfego de um número só ao
  bot, com a "vantagem" de manter o WhatsApp Web/app tecnicamente disponível como modo de
  supervisão passiva, não como um segundo atendente ativo dividindo a fila.
- Isso não significa que não funcione — o protocolo não distingue "vaga de humano" de "vaga de
  bot", e os dois já compartilham a mesma caixa de entrada (research 022 já descreve essa limitação
  mesmo para uso 100% humano: "quem abrir vê a mesma caixa única, sem conceito de conta de agente
  separada, sem como atribuir conversa a uma pessoa específica"). Significa que **é uma combinação
  não testada publicamente** que este research encontrou — o risco operacional (dois atendentes,
  bot e humano, respondendo ao mesmo cliente sem coordenação, como o research já descreve acontecer
  mesmo entre humanos) se soma ao risco de banimento (research 023) sem nenhum relato de terceiro
  para calibrar expectativa.

---

## Pergunta 5 — Custo total estimado

| Item | Via não-oficial (Baileys/Evolution/WPPConnect) | Via oficial (Cloud API + Coexistence via parceiro) |
|---|---|---|
| Chip/linha dedicada | R$15–30/mês (pré-pago) | R$15–30/mês (pré-pago) |
| Hospedagem do agente (VPS) | R$40–100/mês (Hostinger KVM ~R$39–55; especializado tipo HypeHost ~R$99) | Não se aplica da mesma forma — o agente já roda em algum servidor do próprio projeto, sem exigência de VPS dedicado ao WhatsApp em si |
| Mensalidade de parceiro Meta | R$0 | ≈R$300/mês (360dialog ≈€49/mês, research 016) |
| **Total estimado** | **~R$55–130/mês** | **~R$315–330/mês** |
| Risco de banimento vindo da própria Meta | Real, não eliminável (research 023) | Nenhum |
| Handoff cliente↔consultora | Em tempo real, mesma conversa (se o mecanismo de dispositivo vinculado funcionar como esperado) | Em tempo real, mesma conversa (Coexistence espelha automaticamente) |
| Precisa divulgar número novo | Sim | Sim |

Fontes de custo de VPS: [Hostinger](https://www.hostinger.com/applications/evolution-api),
[HypeHost](https://hypehost.com.br/vps-evolution) (**secundárias**, páginas comerciais de
hospedagem — preços sujeitos a mudança e a planos promocionais). Fonte de custo de chip:
[comocomprar.com.br](https://comocomprar.com.br/como-comprar-chip-celular-2026-tim-vivo-claro-onde-cpf/)
(**secundária**, agregador).

**Comparação com o que já estava mapeado:**

- Coexistence pago no número atual (research 016): ~R$300/mês, zero risco de banimento, zero
  handoff (é o mesmo número de sempre).
- Número paralelo puro, sem acesso humano (research 022): ~R$0/mês, zero risco de banimento (usa
  Cloud API oficial), handoff desajeitado (cliente muda de conversa).
- **Esta arquitetura (número dedicado + acesso da loja, via não-oficial): ~R$55–130/mês, risco de
  banimento real, handoff em tempo real (teoricamente melhor que o número paralelo puro) — mas
  sobre um número que não é o principal da loja, então o pior cenário (banimento) não é
  catastrófico como seria no número principal, só descarta esse número e obriga recomeçar.**
- **A mesma arquitetura pela via oficial (Cloud API real + Coexistence via parceiro num número
  novo): ~R$315–330/mês** — não economiza nada sobre o research 016, só troca "qual número corre o
  risco operacional" (nenhum, porque não há risco de banimento pela via oficial) por "isolamento do
  número principal da loja", que já não corre risco nenhum de qualquer forma nessa variante.

---

## Lacunas que a documentação não fecha

1. **Se uma biblioteca não-oficial consegue originar, a partir de si mesma, um convite de vínculo
   para um segundo dispositivo** (cenário "bot é o principal, consultora entra depois como
   vinculada"). Não encontrei confirmação de que Baileys/Evolution API/WPPConnect exponham essa
   funcionalidade de forma estável — a via testada e documentada é sempre "aparelho real vira
   principal primeiro, bot entra depois como vinculado", não o inverso.
2. **Nenhum relato de terceiro de bot e humano dividindo atendimento em tempo real no mesmo número
   via dispositivos vinculados.** A pergunta 4 fica sem validação empírica — é inferência de
   protocolo, não prática documentada.
3. **Se a Meta trata um número que só tem tráfego reativo, de baixo volume, hospedado numa
   biblioteca não-oficial, de forma diferente por estar "isolado" da operação principal.** Não há
   evidência de que a Meta sequer saiba, ou se importe, que um número é ou não o "principal" de uma
   loja — o mecanismo de detecção (research 023) opera por número, não por contexto de negócio.
4. **Preço exato de linha fixa dedicada avulsa** para verificação por chamada de voz — não
   encontrado nesta pesquisa; só o mecanismo (chamada de voz) foi confirmado.
5. **Se o WhatsApp Business Premium (até 10 dispositivos) muda a viabilidade prática** desta
   arquitetura — mais vagas de dispositivo vinculado poderiam, em tese, acomodar bot + múltiplas
   consultoras no mesmo número novo sem esbarrar no teto de 4. Não investigado a fundo: preço exato
   e disponibilidade no Brasil continuam com fonte só secundária (mesma lacuna já registrada no
   research 022).
6. **Confirmação viva de preço** de chip pré-pago e VPS — como em todo research de preço, valores
   datados de agosto de 2026, sujeitos a mudança.

---

## Recomendação (não-vinculante — a decisão é do dono do projeto)

Esta arquitetura **não é uma alternativa nova e melhor** às três já mapeadas — é uma **variação da
via não-oficial (research 023) aplicada a um número isolado**, com um custo pequeno adicional de VPS
e chip (~R$55–130/mês) em troca de handoff em tempo real em vez do handoff desajeitado do número
paralelo puro. O trade-off central:

- Contra o **número paralelo puro** (research 022, ~R$0/mês): esta arquitetura custa mais e
  introduz risco de banimento que o paralelo puro não tem, em troca de um handoff melhor (se o
  mecanismo de dispositivo vinculado compartilhado funcionar bem na prática — o que não está
  validado por nenhum relato de terceiro encontrado).
- Contra o **Coexistence pago no número atual** (research 016, ~R$300/mês): esta arquitetura é bem
  mais barata e isola o número principal de qualquer risco, mas troca "zero risco de banimento" por
  "risco real, não eliminável", e ainda exige divulgar um número novo — o mesmo custo de fricção
  operacional que o research 022 já havia identificado como o preço de qualquer caminho que não seja
  o número atual da loja.
- **Se a prioridade for oficialidade (zero risco de banimento) com um número novo isolado**, o
  caminho é registrar o número no app e depois pagar Coexistence via parceiro nele — que custa
  praticamente o mesmo que já pagar Coexistence no número atual (research 016), então essa variante
  só faz sentido se houver um motivo de negócio para não tocar no número atual em hipótese alguma.

**Minha leitura, para decisão do dono do projeto:** dado que o `CLAUDE.md` do projeto trata o
WhatsApp como "não é um canal da loja, é o canal", e que o research 023 já havia concluído que o
caminho não-oficial não compensa o risco quando o valor em jogo é desproporcional — essa mesma lógica
se aplica aqui, só que atenuada pelo isolamento do número. Um número **novo e descartável** ocupado
por uma biblioteca não-oficial é uma aposta mais defensável do que a mesma biblioteca no número
principal, porque o pior cenário (banimento) custa recomeçar a divulgação, não perder a operação. Mas
ainda é uma aposta com um risco não-quantificável (research 023) e sem nenhum relato encontrado de
alguém tendo validado especificamente o padrão "bot + humano dividindo atendimento no mesmo número
vinculado" — o que esta arquitetura, especificamente, teria que descobrir na prática, não copiar de
um caso já resolvido por outra empresa.
