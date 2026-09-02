<script>
  let { email, onSignOut } = $props();
</script>

<div class="center">
  <h1>Sem acesso</h1>
  <p class="muted" style="margin: 12px 0 24px;">
    A conta <strong>{email}</strong> não está na lista de consultoras.
    Fale com a Laís para liberar, ou entre com outra conta.
  </p>
  <button class="wide" onclick={onSignOut}>Sair e trocar de conta</button>
</div>
