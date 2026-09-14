<script>
  // Histórico de problemas reportados — visível SÓ pro admin (RLS gateia por email na tabela
  // `advisor_allowlist.is_admin`; este componente só é renderizado quando App.svelte já sabe
  // que o usuário logado é admin, mas a proteção de verdade é a RLS, não esta tela). Ticket
  // 038, addendum 2026-09-14: pedido explícito do dono, no lugar (ou além) de só e-mail.

  import { onMount } from 'svelte';
  import { supabase } from './supabase.js';
  import { dateTime } from './labels.js';

  let { names = {} } = $props();

  let reports = $state([]);
  let loading = $state(true);
  let error = $state('');
  let open = $state(false);

  async function load() {
    const { data, error: e } = await supabase
      .from('problem_reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (e) {
      error = 'Não deu para carregar o histórico.';
    } else {
      error = '';
      reports = data;
    }
    loading = false;
  }

  onMount(() => {
    load();
    const channel = supabase
      .channel('problem-reports-history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'problem_reports' }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  });
</script>

<button class="ghost wide" style="margin-top:8px;" onclick={() => (open = !open)}>
  {open ? 'Esconder' : 'Ver'} histórico de problemas reportados{loading ? '' : ` (${reports.length})`}
</button>

{#if open}
  {#if error}<div class="err" style="margin-top:8px;">{error}</div>{/if}
  {#if loading}
    <div class="center">Carregando…</div>
  {:else if reports.length === 0}
    <p class="muted" style="margin-top:10px;">Nenhum problema reportado ainda.</p>
  {:else}
    {#each reports as r (r.id)}
      <div class="card" style="margin-top:10px;">
        <div class="rowline">
          <strong>{names[r.reported_by] || r.reported_by}</strong>
          <span class="muted">{dateTime(r.created_at)}</span>
        </div>
        {#if r.contact_reference}<p class="muted" style="margin-top:4px;">{r.contact_reference}</p>{/if}
        <p style="margin-top:8px;">{r.description}</p>
      </div>
    {/each}
  {/if}
{/if}
