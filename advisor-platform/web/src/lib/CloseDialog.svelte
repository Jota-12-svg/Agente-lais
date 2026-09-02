<script>
  import { supabase } from './supabase.js';
  import { OUTCOME_OPTIONS, VERDICT_OPTIONS } from './labels.js';

  let { handoff, email, onDone, onCancel } = $props();

  let outcome = $state('');
  let verdict = $state('');
  let note = $state('');
  let busy = $state(false);
  let error = $state('');

  async function submit() {
    if (!outcome) {
      error = 'Escolha o que aconteceu com o atendimento.';
      return;
    }
    busy = true;
    error = '';
    const { error: e } = await supabase
      .from('handoffs')
      .update({
        status: 'closed',
        closed_by: email,
        closed_at: new Date().toISOString(),
        business_outcome: outcome,
        advisor_verdict: verdict || null,
        advisor_verdict_note: note.trim() || null,
      })
      .eq('id', handoff.id);
    if (e) {
      error = 'Não deu para fechar. Tente de novo.';
      busy = false;
      return;
    }
    onDone();
  }

  function onOverlay(e) {
    if (e.target === e.currentTarget) onCancel();
  }
  function onKey(e) {
    if (e.key === 'Escape') onCancel();
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="overlay" onclick={onOverlay} role="presentation">
  <div class="sheet" role="dialog" tabindex="-1" aria-modal="true" aria-label="Fechar chamado">
    <h2>Fechar — {handoff.contact_name || handoff.contact_phone}</h2>

    {#if error}<div class="err" style="margin-top:12px;">{error}</div>{/if}

    <fieldset>
      <legend>O que aconteceu?</legend>
      {#each OUTCOME_OPTIONS as o}
        <label class="opt">
          <input type="radio" name="outcome" value={o.value} bind:group={outcome} />
          {o.label}
        </label>
      {/each}
    </fieldset>

    <fieldset>
      <legend>O agente ajudou?</legend>
      {#each VERDICT_OPTIONS as v}
        <label class="opt">
          <input type="radio" name="verdict" value={v.value} bind:group={verdict} />
          {v.label}
        </label>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Quer contar mais? <span class="muted">(opcional)</span></legend>
      <textarea bind:value={note} placeholder="Ex: o agente já tinha o orçamento certinho, só assumi."></textarea>
    </fieldset>

    <div class="actions" style="margin-top:20px;">
      <button class="ghost" onclick={onCancel} disabled={busy}>Cancelar</button>
      <button class="primary" onclick={submit} disabled={busy}>{busy ? 'Salvando…' : 'Fechar chamado'}</button>
    </div>
  </div>
</div>
