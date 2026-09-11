<script>
  // Freio de mão global — desligar o agente em TODAS as conversas de uma vez.
  // Ticket 036. AINDA NÃO CONECTADO: por enquanto isto só muda o visual da tela,
  // para demonstrar onde o controle vai ficar e como ele avisa. O mecanismo real
  // (flag no Supabase lida pelo runtime a cada mensagem) espera a stack do agente.

  const KEY = 'demo-agent-off';

  function readStored() {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  }

  let off = $state(readStored());
  let asking = $state(false);

  function setOff(value) {
    off = value;
    asking = false;
    try {
      localStorage.setItem(KEY, value ? '1' : '0');
    } catch {
      /* modo privado / storage bloqueado — segue só em memória */
    }
  }
</script>

<div class="ks-bar" class:off>
  <span class="ks-state">
    <span class="ks-dot"></span>
    {off ? 'Agente desligado' : 'Agente no ar'}
  </span>
  {#if off}
    <button class="ks-btn on" onclick={() => setOff(false)}>Religar o agente</button>
  {:else}
    <button class="ks-btn off" onclick={() => (asking = true)}>Desligar o agente</button>
  {/if}
</div>

{#if off}
  <div class="ks-alert">
    <strong>O agente está desligado.</strong>
    Nenhuma conversa está recebendo resposta automática. Os contatos que escreverem
    agora ficam esperando até alguém religar ou responder na mão.
  </div>
{/if}

{#if asking}
  <div class="overlay" role="presentation" onclick={(e) => e.target === e.currentTarget && (asking = false)}>
    <div class="sheet" role="dialog" tabindex="-1" aria-modal="true" aria-label="Desligar o agente">
      <h2>Desligar o agente?</h2>
      <p style="margin:10px 0 0;">
        Isso cala o agente <strong>em todas as conversas ao mesmo tempo</strong>, na hora.
        Ninguém recebe resposta automática até você religar.
      </p>
      <p class="muted" style="margin:12px 0 0;font-size:0.85rem;">
        Use quando o agente estiver respondendo errado (preço inventado, dizendo que tem
        um produto, travado). Para sair de <em>uma</em> conversa só, é só assumir o chamado.
      </p>
      <p class="muted" style="margin:12px 0 0;font-size:0.8rem;">
        Demonstração — este botão ainda não está ligado ao agente (ticket 036).
      </p>
      <div class="actions" style="margin-top:20px;">
        <button class="ghost" onclick={() => (asking = false)}>Cancelar</button>
        <button class="ks-btn off" style="flex:1;" onclick={() => setOff(true)}>Desligar agora</button>
      </div>
    </div>
  </div>
{/if}
