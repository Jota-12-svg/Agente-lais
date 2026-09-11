# Harness de teste — ticket 027

Instrumento de teste para o ticket
[027](../wayfinder/tickets/027-testar-self-hosted-no-numero-atual.md). **Não é o runtime do
agente** — a "Stack e hospedagem do runtime" segue como névoa em aberto no
[`wayfinder/map.md`](../wayfinder/map.md). Isto aqui existe só para responder, com teste real,
as cinco perguntas que os research 024/026 deixaram em aberto.

## Estado do teste (atualizar conforme avança)

- [ ] Chip de teste comprado e registrado no WhatsApp Business comum, num aparelho real
- [ ] Dispositivos extras vinculados no aparelho de teste, replicando o arranjo da loja
      (WhatsApp Web, um segundo celular, o app de Windows se possível)
- [ ] Harness implantado (Railway ou local) e rodando
- [ ] Item 1 — pareamento completou ou travou no passkey?
- [ ] Item 2 — dispositivos que já estavam vinculados sobreviveram?
- [ ] Item 3 — mensagem mandada de um companion (ex.: Windows) gerou evento aqui?
- [ ] Item 4 — apareceu erro 463 numa resposta a contato novo?
- [ ] Item 5 — algo estranho aconteceu logo após vincular (antes de qualquer mensagem)?

Quando os cinco estiverem marcados, transcrever o resultado para a seção `## Resolução` do
ticket 027 — é lá que a decisão fica registrada, não aqui.

## O que falta antes de rodar o teste (pendência física, fora do meu alcance)

1. **Comprar um chip novo** (o mais barato disponível serve).
2. **Registrar esse número no WhatsApp Business comum**, com um aparelho real — não é o
   número da loja.
3. **Vincular alguns dispositivos extras** nesse número, para reproduzir o arranjo de vários
   companions que a loja tem hoje (WhatsApp Web, um segundo celular, o app de Windows se
   possível). Isso precisa acontecer **antes** do próximo passo, porque o item 2 do teste é
   justamente ver se esses dispositivos sobrevivem à adição do Baileys.

Só depois disso faz sentido seguir para o deploy abaixo.

## Deploy no Railway

1. Criar um novo projeto no Railway a partir deste repositório (ou só desta pasta, via
   Railway CLI/`railway up` apontando para `whatsapp-self-hosted-test/`).
2. **Adicionar um volume persistente**, montado por exemplo em `/data` — sem isso, todo
   redeploy apaga a sessão do WhatsApp e obriga escanear o QR de novo. (Settings → Volumes no
   painel do serviço.)
3. Variáveis de ambiente (ver [`.env.example`](.env.example)):
   - `AUTH_DIR=/data/auth`
   - `LOG_LEVEL=trace`
   - `PORT` não precisa ser setada — o Railway injeta a própria.
4. Deploy. O Railway expõe um domínio público (`*.up.railway.app`) — gerar um se ainda não
   existir (Settings → Networking → Generate Domain).
5. Abrir `https://<seu-domínio>.up.railway.app/qr` no navegador. A página atualiza sozinha se
   você recarregar; o QR expira em ~60s e o processo gera um novo automaticamente.

## Rodando localmente em vez do Railway (mais rápido para uma primeira tentativa)

```
cd whatsapp-self-hosted-test
npm install
npm start
```

Abra `http://localhost:3000/qr` no navegador. Serve para o item 1 (pareamento trava ou não) e
para uma primeira leitura dos itens 2 e 3 — mas para deixar rodando de forma estável durante
os testes que dependem de tempo (item 4 sobretudo, que precisa do agente **online** para
responder a um contato novo) o Railway é melhor, porque não depende do seu computador ficar
ligado.

## Como escanear (importante: não é o dispositivo principal)

No aparelho de teste (o que já está logado no número de teste): **Aparelhos vinculados →
Vincular aparelho → escanear o QR** exibido em `/qr`. Isso adiciona o harness como **mais um**
dispositivo — o mesmo fluxo que vincular WhatsApp Web ou o app de Windows.

## O que observar, item por item

**Item 1 — pareamento.** Acompanhe os logs (Railway → Deployments → View Logs, ou o terminal
local). Se a tela do QR ficar reemitindo QR sem nunca conectar, ou o aparelho principal mostrar
"Continue on WhatsApp Web (Passkey)" e travar, é o bloqueio de passkey que o research 024
documentou — pare aqui e registre no ticket.

**Item 2 — dispositivos sobreviventes.** Não tem sinal automático nos logs — confira **você
mesmo**, no aparelho principal, em "Aparelhos vinculados", antes e depois de escanear. Anote os
nomes/horários de cada dispositivo antes de começar, para comparar depois.

**Item 3 — mensagem de outro companion.** Assim que a conexão abrir (log `PAREAMENTO
COMPLETO`), mande uma mensagem de dentro do WhatsApp Web ou do app de Windows vinculados a esse
número de teste (para outro contato qualquer). Se aparecer um log
`Mensagem própria vista pelo socket (fromMe: true)` com o texto batendo, o item 3 está
confirmado.

**Item 4 — erro 463 / tctoken.** Peça para um contato **que nunca falou com esse número**
mandar uma mensagem, deixe o harness responder (pode ser manual, direto pelos logs — não há
lógica de resposta automática neste harness de teste, só escuta). Procure `error`, `463` ou
`NackCallerReachoutTimelocked` nos logs em nível trace.

**Item 5 — risco no próprio ato de vincular.** Não é algo que o código detecta sozinho.
Assim que escanear o QR, preste atenção no aparelho principal por alguns minutos — qualquer
aviso de segurança, desconexão inesperada de outro dispositivo, ou notificação da Meta é sinal
para registrar, mesmo que o pareamento em si tenha "dado certo".

## Plano de reversão

Para desconectar o harness a qualquer momento: no aparelho principal, "Aparelhos vinculados" →
selecionar o dispositivo de teste (o nome aparece como "Lais Aliski Casa - Teste 027") → Sair. Ou, no
Railway, pausar/remover o serviço — a sessão para de responder, mas o vínculo só é
efetivamente removido pelo lado do WhatsApp quando alguém faz "Sair" no aparelho.

## Depois de confirmar os quatro primeiros pontos

Só faz sentido repetir o processo no número real da loja depois de um resultado positivo nos
itens 1–4 — e mesmo assim, fora do horário de atendimento, com este mesmo plano de reversão à
mão.
