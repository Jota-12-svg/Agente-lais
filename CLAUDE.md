# CLAUDE.md — Agente de Atendimento da Lais Casa

Instruções para qualquer agente ou pessoa que trabalhe neste repositório. Leia antes de
mexer em qualquer coisa.

---

## 1. O que é este projeto

Um **agente de WhatsApp** que atende os clientes da **Lais Casa**, loja de decoração e
mobiliário. O agente faz a **qualificação inicial** do contato, responde dúvidas sobre o
negócio e sobre produtos que conhece, verifica disponibilidade de horário das consultoras e
agenda — e **escala a conversa para uma consultora humana** quando o caso exige julgamento
que ele não tem.

Junto do atendimento existe um **laço de aprendizado**: cada conversa gera registro de
resultado (venda, reunião agendada, satisfação, fracasso) que alimenta uma base a partir da
qual o agente refina os atendimentos seguintes.

### O negócio, em uma tela

- **Produtos:** decoração e mobiliário — vasos, bandejas, taças, móveis.
- **Ticket:** de R$ 2.000 a R$ 50.000. A faixa é larga de propósito; o atendimento muda com ela.
- **Dois públicos, dois fluxos:**
  - **consumidor final** — chega com uma dúvida ou um ambiente em mente;
  - **arquiteto** — chega com uma **planilha** listando vários itens de uma vez.
- **Sistemas em uso hoje:** WhatsApp Business (no celular de todas as consultoras), **Maino**
  (cotação e nota fiscal) e uma **planilha compartilhada** (uma aba por consultora com os
  clientes dela, mais uma aba de datas importantes).

### Restrições duras

Valem para toda decisão de arquitetura e de comportamento. Não são preferências.

1. **Não existe controle de estoque.** O que está à vista na loja é o estoque, conferido a
   olho pelas consultoras. **O agente não pode afirmar disponibilidade de produto.** Um
   "temos sim" errado sobre um item de R$ 30 mil custa um cliente e a credibilidade da loja.
2. **O tom das consultoras não muda.** O agente se adapta ao atendimento que já existe. O
   contrário nunca.
3. **Fase 1 é só qualificação.** Enquanto não estiver treinado, o agente coleta dados e
   escala. Não vende, não negocia, não resolve dúvida complexa. Venda direta é fase 2 e está
   fora do escopo atual.
4. **O processo da loja não se dobra ao agente.** Ele entra num fluxo em andamento.

### Projeto limpo — leia antes de acreditar em qualquer comentário antigo

O `.env` deste projeto herdou credenciais de um projeto anterior. Por decisão do dono do
projeto, **ele vale como cofre de credenciais e nada mais**. Qualquer arquitetura,
parâmetro, numeração de decisão ou referência a "plataforma multi-loja" encontrada em
comentários herdados pertence àquele projeto, **foi descartada e não é precedente**. Se um
comentário antigo contradiz este documento ou o mapa, o comentário está errado.

---

## 2. Como o trabalho é organizado

O planejamento vive em **`wayfinder/`**, um tracker local em markdown:

- **`wayfinder/map.md`** — o mapa: destino, notas, decisões tomadas, névoa (`Not yet
  specified`) e o que está fora de escopo. **Leia primeiro, toda sessão.**
- **`wayfinder/README.md`** — a fronteira: que tickets podem ser puxados agora.
- **`wayfinder/tickets/`** — um arquivo por ticket, com `status`, `labels`, `assignee` e
  `blocked-by` no frontmatter.

**Regras do tracker:**

- Um ticket está **desbloqueado** quando todos os tickets em `blocked-by` estão `closed`.
- **Reivindique antes de trabalhar:** preencha `assignee` no frontmatter como primeiro ato,
  para que sessões paralelas não colidam.
- Ao resolver: escreva a resposta sob `## Resolução` no próprio ticket, mude `status` para
  `closed`, e acrescente **uma linha** em `Decisions so far` no mapa apontando para ele.
  A decisão mora no ticket; o mapa só indexa.
- **Uma sessão resolve no máximo um ticket** — exceto tickets de research, que podem correr
  em paralelo.
- Tickets são referenciados **pelo nome**, nunca pelo número solto.

---

## 3. Git e GitHub

Remoto: **https://github.com/Jota-12-svg/Agente-lais**

### Branches

Modelo de tronco único com branches curtas. Sem `develop` — o time é pequeno e uma branch
de integração permanente só adicionaria cerimônia.

- **`main`** — sempre em estado íntegro e passível de deploy. **Não se commita direto em
  `main`.** Toda mudança entra por Pull Request.
- **Branches de trabalho**, curtas (horas ou dias, não semanas), nomeadas
  `<tipo>/<descrição-em-kebab-case>`:

  | Prefixo | Uso |
  |---|---|
  | `feat/` | funcionalidade nova |
  | `fix/` | correção de bug |
  | `docs/` | documentação, handover, CLAUDE.md |
  | `chore/` | configuração, dependências, tooling |
  | `refactor/` | mudança interna sem alterar comportamento |
  | `research/` | investigação de ticket de research; descartável após o merge |
  | `wayfinder/` | resolução de ticket de planejamento |

  Exemplos: `research/integracao-whatsapp`, `feat/qualificacao-inicial`,
  `wayfinder/atendimento-hoje`.

- Branch de ticket **carrega o número no corpo do PR**, não no nome.
- Depois do merge, a branch é apagada.

### Commits

**Conventional Commits**, assunto em **português**, no imperativo, minúsculo, sem ponto
final, até ~72 caracteres:

```
<tipo>(<escopo opcional>): <assunto>

<corpo opcional: o porquê, não o quê — o diff já diz o quê>
```

Tipos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`.

```
docs(wayfinder): resolver ticket do atendimento atual
feat(qualificacao): extrair nome e contato da conversa
fix(whatsapp): tratar áudio sem transcrição
```

**Regras que não se negociam:**

- **Nunca commitar segredo.** `.env` está no `.gitignore`; confira `git status` antes de
  `git add`. Não use `git add .` sem olhar o que entrou.
- **Nunca commitar dado de cliente** — conversas exportadas, planilhas com nome e telefone.
  Ficam fora do repositório (`/dados/`, `/conversas/` estão ignorados). Isso é LGPD.
- **Nunca usar `--no-verify`** nem pular hooks.
- Commits pequenos e coesos. Um commit que mistura três assuntos não é revisável.

### Pull Requests

- Título no mesmo formato do commit.
- Corpo responde: **o que muda**, **por quê**, e **qual ticket do mapa** isso resolve
  (link para o arquivo em `wayfinder/tickets/`).
- PR que fecha um ticket inclui, no mesmo PR, a atualização do ticket e do mapa.
- Revisão do parceiro antes do merge, sempre que houver alguém para revisar.
- Merge por **squash**, para manter o histórico de `main` legível.

### Handover

Um documento por dia, em `handover/handover-AAAA-MM-DD.md`. **Vai versionado junto com o
trabalho**, no mesmo PR — é assim que o parceiro acompanha o andamento pelo GitHub. O topo
do documento é reescrito a cada atualização; a seção "Sessões do dia" acumula.

---

## 4. Segredos e dados sensíveis

- **`.env`** contém credenciais reais e **nunca** entra no git.
- **`.env.example`** é versionado e contém **apenas nomes de variáveis**, jamais valores.
  Os nomes são propositalmente parecidos: se você está colando uma senha e o arquivo tem
  "example" no nome, pare.
- **Não cole credencial em chat, em PR, em issue ou em log.** Uma credencial que apareceu
  em texto está comprometida e precisa ser rotacionada.
- O `SUPABASE_ACCESS_TOKEN` alcança **todos** os projetos Supabase da conta, não só este.
  Trate-o como a chave mais perigosa do arquivo.
- **A secret key do Supabase (`sb_secret_...`) não é usada neste projeto.** Ela ignora RLS
  por completo. Se algum dia parecer necessária, isso é sinal de que o modelo de acesso está
  errado — discuta antes de introduzi-la.
- **Conversas de clientes são dado pessoal.** Ficam fora do repositório, com acesso restrito,
  e anonimizadas sempre que o uso permitir.

---

## 5. Convenções de código e escrita

- **Documentação, tickets, handover, commits e PRs: português.**
- **Código, nomes de variáveis, funções e schema de banco: inglês.**
- Comentário explica **por que**, não o que. Comentário que narra o código é ruído.
- Não deixe comentário desatualizado: comentário que mente é pior que comentário ausente.

---

## 6. Antes de começar qualquer sessão

1. Leia `wayfinder/map.md` — destino, restrições e o que já foi decidido.
2. Leia o handover do dia mais recente em `handover/`.
3. Escolha um ticket da fronteira em `wayfinder/README.md` e **reivindique**.
4. Crie a branch de trabalho a partir de `main` atualizado.

E o de sempre: **não invente decisão que o mapa ainda não tomou.** Se a resposta não está no
mapa nem no ticket, ela é uma pergunta para o dono do projeto — não um chute a ser
codificado.
