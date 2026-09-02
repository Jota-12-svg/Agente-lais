<script>
  import { onMount } from 'svelte';
  import { supabase } from './lib/supabase.js';
  import Login from './lib/Login.svelte';
  import NoAccess from './lib/NoAccess.svelte';
  import Queue from './lib/Queue.svelte';

  // 'loading' | 'signed-out' | 'checking-access' | 'allowed' | 'denied'
  let phase = $state('loading');
  let email = $state('');
  let advisorName = $state('');

  async function checkAccess(session) {
    if (!session?.user?.email) {
      phase = 'signed-out';
      return;
    }
    email = session.user.email;
    phase = 'checking-access';
    const { data, error } = await supabase
      .from('advisor_allowlist')
      .select('name')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      // Rede caiu ou RLS recusou — tratar como sem acesso, com opção de sair.
      phase = 'denied';
      return;
    }
    if (data) {
      advisorName = data.name;
      phase = 'allowed';
    } else {
      phase = 'denied';
    }
  }

  onMount(() => {
    supabase.auth.getSession().then(({ data }) => checkAccess(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAccess(session);
    });
    return () => sub.subscription.unsubscribe();
  });

  function signOut() {
    supabase.auth.signOut();
  }
</script>

{#if ['1', 'true'].includes(String(import.meta.env.VITE_DEMO))}
  <div style="background:#3f2f1f;color:#f6e9d8;text-align:center;font-size:0.78rem;padding:6px;border-radius:8px;margin-bottom:12px;">
    modo demonstração — dados fictícios, nada é salvo
  </div>
{/if}

{#if phase === 'loading' || phase === 'checking-access'}
  <div class="center">Carregando…</div>
{:else if phase === 'signed-out'}
  <Login />
{:else if phase === 'denied'}
  <NoAccess {email} onSignOut={signOut} />
{:else}
  <Queue {advisorName} {email} onSignOut={signOut} />
{/if}
