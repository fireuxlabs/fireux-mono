<template>
  <div class="market-app">
    <div class="market-backdrop" aria-hidden="true">
      <img src="/img/app/background.png" alt="">
    </div>

    <header class="market-header">
      <NuxtLink to="/" class="market-brand" aria-label="Interlaken Essen">
        <span class="market-brand__mark">
          <img src="/img/app/logo.png" alt="">
        </span>
        <span>Interlaken Essen</span>
      </NuxtLink>

      <nav class="market-nav" aria-label="Hauptnavigation">
        <NuxtLink to="/choufe" exact-active-class="market-nav__link--active">
          <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
          Choufe
        </NuxtLink>
        <NuxtLink to="/Verchoufe" exact-active-class="market-nav__link--active">
          <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
          Verchoufe
        </NuxtLink>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer class="market-footer">
      <img
        src="/img/ecosystem/wordmark-light.png"
        alt="Misebox"
        class="market-footer__wordmark"
      >
      <span>Gastro-Apps us Ringgenberg, für Betrib vo hie.</span>
    </footer>
  </div>
</template>
