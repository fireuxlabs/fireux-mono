<template>
  <header class="menu-discovery-hero">
    <p class="menu-discovery-hero__eyebrow">
      <UIcon name="i-lucide-utensils" /> A little local discovery
    </p>
    <h1>What are you<br /><span>in the mood for?</span></h1>
    <p class="menu-discovery-hero__description">
      Find your next meal, a drink, or somewhere new. Explore menus and see what
      catches your eye.
    </p>
  </header>
</template>
<style scoped>
.menu-discovery-hero {
  padding: 2rem 0 0.5rem;
  max-width: 48rem;
}
.menu-discovery-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ui-primary);
  margin: 0 0 1.25rem;
}
h1 {
  font-size: clamp(2.5rem, 5vw, 3.8rem);
  font-weight: 750;
  line-height: 1.06;
  letter-spacing: -0.055em;
  color: var(--ui-text-highlighted);
  margin: 0;
}
h1 span {
  color: var(--ui-primary);
}
.menu-discovery-hero__description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--ui-text-muted);
  max-width: 36rem;
  margin: 1.5rem 0 0;
}
@media (max-width: 640px) {
  .menu-discovery-hero {
    padding-top: 2rem;
  }
}
</style>
