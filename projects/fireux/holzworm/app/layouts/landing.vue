<template>
  <div class="holzworm-layout">
    <header class="holzworm-layout__header">
      <NuxtLink to="/" aria-label="Holzworm Startseite">HOLZWORM <span>· Bern</span></NuxtLink>
      <a href="#katalog">Katalog</a>
      <a href="#anfrage">Anfrage</a>
    </header>
    <slot />
  </div>
</template>

<style>
.holzworm-layout { min-height: 100svh; background: #f7f3eb; color: #252018; font-family: var(--font-sans); }
.holzworm-layout__header { display: flex; gap: calc(var(--spacing) * 5); align-items: center; justify-content: flex-end; min-height: 4rem; padding: calc(var(--spacing) * 3) clamp(calc(var(--spacing) * 5), 5vw, calc(var(--spacing) * 20)); background: #f7f3eb; }.holzworm-layout__header a { color: inherit; font-size: .73rem; font-weight: var(--font-weight-extrabold); letter-spacing: .08em; text-decoration: none; text-transform: uppercase; }.holzworm-layout__header a:first-child { margin-right: auto; }.holzworm-layout__header span { color: #9e5b35; }
</style>
