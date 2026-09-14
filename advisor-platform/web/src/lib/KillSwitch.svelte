<script>
  // Freio de mão global — desligar o agente em TODAS as conversas de uma vez.
  // Ticket 036. Lê/grava a linha única de `agent_settings` (id=1) via Supabase, com
  // Realtime pra refletir na hora se outra pessoa (ou outra aba) mudar o estado.
  //
  // O runtime (ticket 044) assina esta mesma tabela via Realtime e obedece a flag de
  // verdade (agente-runtime/index.js) — confirmado ao vivo em produção (046, 2026-09-14):
  // toggle daqui propaga pro processo do runtime em segundos.

  import { onMount } from 'svelte';
  import { supabase } from './supabase.js';
  import { clock } from './labels.js';

  let { email, names = {} } = $props();

  let enabled = $state(true);
  let toggledBy = $state(null);
  let toggledAt = $state(null);
  let loading = $state(true);
  let busy = $state(false);
  let error = $state('');
  let asking = $state(false);

  const toggledByLabel = $derived(names[toggledBy] || toggledBy);

  async function load() {
    const { data, error: e } = await supabase
      .from('agent_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (e) {
      error = 'Não deu para carregar o estado do agente.';
    } else if (data) {
      error = '';
      enabled = data.agent_enabled;
      toggledBy = data.toggled_by;
      toggledAt = data.toggled_at;
    }
    loading = false;
  }

  async function setEnabled(value) {
    busy = true;
    error = '';
    const { error: e } = await supabase
      .from('agent_settings')
      .update({ agent_enabled: value, toggled_by: email, toggled_at: new Date().toISOString() })
      .eq('id', 1);
    if (e) error = value ? 'Não deu para religar. Tente de novo.' : 'Não deu para desligar. Tente de novo.';
    asking = false;
    busy = false;
    // Realtime também dispara `load()`, mas não espera por ele pra a tela responder na hora.
    if (!e) load();
  }

  onMount(() => {
    load();

    const channel = supabase
      .channel('agent-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_settings' }, load)
      .subscribe();

    return () => supabase.removeChannel(channel);
  });
</script>

{#if !loading}
  <div class="ks-bar" class:off={!enabled}>
    <span class="ks-state">
      <span class="ks-dot"></span>
      {enabled ? 'Agente no ar' : 'Agente desligado'}
    </span>
    {#if enabled}
      <button class="ks-btn off" onclick={() => (asking = true)} disabled={busy}>Desligar o agente</button>
    {:else}
      <button class="ks-btn on" onclick={() => setEnabled(true)} disabled={busy}>Religar o agente</button>
    {/if}
  </div>

  {#if error}<div class="err" style="margin:8px 0;">{error}</div>{/if}

  {#if !enabled}
    <div class="ks-alert">
      <strong>O agente está desligado.</strong>
      Nenhuma conversa está recebendo resposta automática.
      {#if toggledBy}
        Desligado por <strong>{toggledByLabel}</strong>{#if toggledAt} às {clock(toggledAt)}{/if}.
      {/if}
    </div>
  {/if}
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
      <div class="actions" style="margin-top:20px;">
        <button class="ghost" onclick={() => (asking = false)} disabled={busy}>Cancelar</button>
        <button class="ks-btn off" style="flex:1;" onclick={() => setEnabled(false)} disabled={busy}>
          Desligar agora
        </button>
      </div>
    </div>
  </div>
{/if}
