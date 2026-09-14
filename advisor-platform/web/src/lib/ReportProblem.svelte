<script>
  // "Reportar problema" — canal de aviso de erro do piloto, standalone (não amarrado a um
  // chamado — o erro pode acontecer antes de o agente escalar). Ticket 038, addendum
  // 2026-09-14. Qualquer consultora registra; só o admin lê (ver ProblemHistory.svelte).

  import { supabase } from './supabase.js';

  let { email } = $props();

  let open = $state(false);
  let contactReference = $state('');
  let description = $state('');
  let productClaim = $state(false);
  let busy = $state(false);
  let error = $state('');
  let sent = $state(false);

  async function submit() {
    if (!description.trim()) {
      error = 'Conta o que aconteceu.';
      return;
    }
    busy = true;
    error = '';
    const { error: e } = await supabase.from('problem_reports').insert({
      reported_by: email,
      contact_reference: contactReference.trim() || null,
      description: description.trim(),
      product_claim: productClaim,
    });
    busy = false;
    if (e) {
      error = 'Não deu para enviar. Tente de novo.';
      return;
    }
    sent = true;
  }

  function close() {
    open = false;
    contactReference = '';
    description = '';
    productClaim = false;
    error = '';
    sent = false;
  }
</script>

<button class="ghost wide" onclick={() => (open = true)}>Reportar problema</button>

{#if open}
  <div class="overlay" role="presentation" onclick={(e) => e.target === e.currentTarget && close()}>
    <div class="sheet" role="dialog" tabindex="-1" aria-modal="true" aria-label="Reportar problema">
      {#if sent}
        <h2>Reportado!</h2>
        <p style="margin-top:10px;">Registrado — o dono do projeto vai ver isso.</p>
        <div class="actions" style="margin-top:20px;">
          <button class="primary wide" onclick={close}>Fechar</button>
        </div>
      {:else}
        <h2>Reportar problema</h2>
        <p class="muted" style="margin-top:4px;">
          O agente falou besteira? Conta aqui — não precisa estar ligado a um chamado específico.
        </p>

        {#if error}<div class="err" style="margin-top:12px;">{error}</div>{/if}

        <fieldset>
          <legend>Qual conversa? <span class="muted">(opcional)</span></legend>
          <input type="text" bind:value={contactReference} placeholder="Nome ou telefone do cliente" />
        </fieldset>

        <fieldset>
          <legend>O que aconteceu?</legend>
          <textarea
            bind:value={description}
            placeholder="Ex: disse que a loja tinha o vaso azul disponível — a gente não afirma isso pro cliente"
          ></textarea>
        </fieldset>

        <fieldset>
          <label class="opt">
            <input type="checkbox" bind:checked={productClaim} />
            O agente afirmou preço ou disponibilidade de um produto
          </label>
        </fieldset>

        <div class="actions" style="margin-top:20px;">
          <button class="ghost" onclick={close} disabled={busy}>Cancelar</button>
          <button class="primary" onclick={submit} disabled={busy}>{busy ? 'Enviando…' : 'Enviar'}</button>
        </div>
      {/if}
    </div>
  </div>
{/if}
