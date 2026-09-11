<script>
  import { onMount } from 'svelte';
  import { supabase } from './supabase.js';
  import HandoffCard from './HandoffCard.svelte';
  import KillSwitch from './KillSwitch.svelte';

  let { advisorName, email, onSignOut } = $props();

  let handoffs = $state([]);
  let names = $state({}); // email -> nome, para "FULANA pegou"
  let loading = $state(true);
  let error = $state('');
  let tick = $state(0); // força recálculo do "espera há X" a cada minuto

  async function load() {
    const { data, error: e } = await supabase
      .from('handoffs')
      .select('*')
      .in('status', ['pending', 'assumed'])
      .order('created_at', { ascending: true });
    if (e) {
      error = 'Não deu para carregar a fila. Puxe para atualizar.';
    } else {
      error = '';
      handoffs = data;
    }
    loading = false;
  }

  async function loadNames() {
    const { data } = await supabase.from('advisor_allowlist').select('email, name');
    if (data) names = Object.fromEntries(data.map((r) => [r.email, r.name]));
  }

  onMount(() => {
    loadNames();
    load();

    const channel = supabase
      .channel('handoffs-queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'handoffs' }, load)
      .subscribe();

    const minute = setInterval(() => (tick += 1), 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(minute);
    };
  });

  // Reordena para tirar da tela quem já fechou, mantém pending/assumed por tempo de espera.
  const visible = $derived(
    handoffs.filter((h) => h.status === 'pending' || h.status === 'assumed'),
  );
</script>

<div class="topbar">
  <h1>Fila</h1>
  <div class="who">
    {advisorName}
    <br />
    <button class="ghost" style="min-height:auto;padding:2px 0;border:0;text-decoration:underline;font-size:0.8rem;" onclick={onSignOut}>
      sair
    </button>
  </div>
</div>

<KillSwitch />

{#if error}<div class="err">{error}</div>{/if}

{#if loading}
  <div class="center">Carregando a fila…</div>
{:else if visible.length === 0}
  <div class="center">
    <p style="font-size:1.1rem;">Nenhum chamado agora.</p>
    <p class="muted" style="margin-top:8px;">Quando o agente passar um atendimento, ele aparece aqui na hora.</p>
  </div>
{:else}
  {#key tick}
    {#each visible as h (h.id)}
      <HandoffCard handoff={h} {names} {email} {advisorName} onChanged={load} />
    {/each}
  {/key}
{/if}
