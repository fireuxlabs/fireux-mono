<template>
  <div class="fx-platform-footer">
    <nav aria-label="FireUX platform information">
      <NuxtLink to="/legal">Legal</NuxtLink>
    </nav>
    <a
      href="https://fireux.app"
      target="_blank"
      rel="noopener noreferrer"
      class="fx-platform-footer__credit"
    >
      <img src="/img/core/brand/logo.svg" alt="" width="20" height="20" />
      <span>Built by FireUX</span>
    </a>
  </div>
</template>

<style scoped>
.fx-platform-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  font-size: var(--text-sm);
  color: var(--ui-text);
}
.fx-platform-footer nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(var(--spacing) * 4);
}
.fx-platform-footer a:hover {
  text-decoration: underline;
}
.fx-platform-footer__credit {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}
@media (min-width: 40rem) {
  .fx-platform-footer {
    flex-direction: row;
  }
}
</style>
