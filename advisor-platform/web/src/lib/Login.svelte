<script>
  import { supabase } from './supabase.js';

  let busy = $state(false);
  let error = $state('');

  async function enter() {
    busy = true;
    error = '';
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (e) {
      error = 'Não deu para abrir o login do Google. Tente de novo.';
      busy = false;
    }
  }
</script>

<div class="center">
  <h1>Fila da Lais Casa</h1>
  <p class="muted" style="margin: 12px 0 28px;">
    Os atendimentos que o agente passou para uma consultora aparecem aqui.
  </p>
  {#if error}<div class="err">{error}</div>{/if}
  <button class="primary wide" onclick={enter} disabled={busy}>
    {busy ? 'Abrindo…' : 'Entrar com o Google'}
  </button>
  <p class="muted" style="margin-top: 16px; font-size: 0.82rem;">
    Use a mesma conta Google do seu celular.
  </p>
</div>
