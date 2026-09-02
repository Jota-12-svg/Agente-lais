<script>
  import { supabase } from './supabase.js';
  import { MODE_LABEL, TRIGGER_LABEL, waitedSince, clock } from './labels.js';
  import CloseDialog from './CloseDialog.svelte';

  let { handoff, names, email, advisorName, onChanged } = $props();

  let busy = $state(false);
  let error = $state('');
  let closing = $state(false);

  const mineLabel = $derived(names[handoff.assumed_by] || handoff.assumed_by);
  const isMine = $derived(handoff.assumed_by === email);

  async function assume() {
    busy = true;
    error = '';
    const { error: e } = await supabase
      .from('handoffs')
      .update({ status: 'assumed', assumed_by: email, assumed_at: new Date().toISOString() })
      .eq('id', handoff.id);
    if (e) error = 'Não deu para assumir. Tente de novo.';
    busy = false;
    onChanged();
  }

  async function reopen() {
    busy = true;
    error = '';
    const { error: e } = await supabase
      .from('handoffs')
      .update({ status: 'pending', assumed_by: null, assumed_at: null })
      .eq('id', handoff.id);
    if (e) error = 'Não deu para devolver à fila.';
    busy = false;
    onChanged();
  }

  const phoneDigits = $derived((handoff.contact_phone || '').replace(/[^\d]/g, ''));
</script>

<div class="card">
  <div class="rowline">
    <span class="badge {handoff.status}">
      {handoff.status === 'assumed' ? 'Em atendimento' : 'Esperando'}
    </span>
    <span class="muted">espera {waitedSince(handoff.created_at)}</span>
  </div>

  <h2 style="margin-top:10px;">{handoff.contact_name || 'Sem nome'}</h2>
  <p class="summary">{handoff.summary}</p>

  <dl class="facts">
    <dt>Telefone</dt>
    <dd>
      {#if phoneDigits}
        <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer">{handoff.contact_phone}</a>
      {:else}—{/if}
    </dd>
    {#if handoff.desired_timeframe}<dt>Para quando</dt><dd>{handoff.desired_timeframe}</dd>{/if}
    {#if handoff.budget}<dt>Orçamento</dt><dd>{handoff.budget}</dd>{/if}
    <dt>Tipo</dt><dd>{MODE_LABEL[handoff.engagement_mode] ?? handoff.engagement_mode}</dd>
    <dt>Motivo</dt><dd>{TRIGGER_LABEL[handoff['trigger']] ?? handoff['trigger']}</dd>
    {#if handoff.is_returning_client}<dt>Cliente</dt><dd>Já é cliente da casa</dd>{/if}
    {#if handoff.owner_advisor}<dt>Costuma atender</dt><dd>{handoff.owner_advisor}</dd>{/if}
  </dl>

  {#if handoff.status === 'assumed'}
    <p class="muted" style="margin-top:12px;">
      {#if isMine}Você pegou{:else}<strong>{mineLabel}</strong> pegou{/if}
      às {clock(handoff.assumed_at)}.
    </p>
  {/if}

  {#if error}<div class="err" style="margin-top:12px;">{error}</div>{/if}

  <div class="actions">
    {#if handoff.status === 'pending'}
      <button class="primary" onclick={assume} disabled={busy}>Assumir</button>
    {:else}
      <button class="ghost" onclick={reopen} disabled={busy}>Devolver à fila</button>
      <button class="primary" onclick={() => (closing = true)} disabled={busy}>Fechar</button>
    {/if}
  </div>
</div>

{#if closing}
  <CloseDialog
    {handoff}
    {email}
    onDone={() => { closing = false; onChanged(); }}
    onCancel={() => (closing = false)}
  />
{/if}
