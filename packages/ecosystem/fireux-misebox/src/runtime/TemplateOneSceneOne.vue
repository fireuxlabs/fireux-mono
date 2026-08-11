<template>
  <section
    class="template-one-scene-one"
    :style="themeStyle"
    :aria-labelledby="titleId"
    :data-presentation="present"
    data-landing-scene="hero"
  >
    <header class="template-one-scene-one__header">
      <NuxtLink :to="homeTo" :aria-label="`${name} home`">
        <AppBrandWordmark
          v-if="wordmarkSrc"
          :light-src="wordmarkSrc"
          :dark-src="wordmarkSrc"
          :alt="name"
          size="medium"
          loading="eager"
        />
        <span v-else class="template-one-scene-one__missing">Wordmark required</span>
      </NuxtLink>
      <nav aria-label="Primary navigation">
        <NuxtLink :to="authTo">Sign in</NuxtLink>
        <NuxtLink class="template-one-scene-one__menu-link" :to="menuTo">
          View menu
        </NuxtLink>
        <details>
          <summary aria-label="Open navigation menu">
            <UIcon name="i-lucide-menu" aria-hidden="true" />
          </summary>
          <nav aria-label="Menu navigation">
            <NuxtLink :to="menuTo">Menu</NuxtLink>
          </nav>
        </details>
      </nav>
    </header>

    <div class="template-one-scene-one__background" data-scene-layer="background" />
    <div class="template-one-scene-one__content" data-scene-layer="content">
      <h1 :id="titleId" class="sr-only">{{ name }}</h1>
      <AppBrandWordmark
        v-if="wordmarkSrc"
        class="template-one-scene-one__wordmark"
        :light-src="wordmarkSrc"
        :dark-src="wordmarkSrc"
        :alt="name"
        size="hero"
        loading="eager"
      />
      <p v-else>Canonical wordmark asset required</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  wordmarkSrc?: string
  placePrimaryColor: string
  present?: 'wordmark'
  identityAlignment?: 'left' | 'center'
  homeTo?: string
  authTo?: string
  menuTo?: string
}>(), {
  wordmarkSrc: '',
  homeTo: '/',
  authTo: '/auth',
  menuTo: '/menus',
  identityAlignment: 'left',
  present: 'wordmark',
})

const titleId = computed(() =>
  `template-one-${props.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
)
const themeStyle = computed(() => ({
  '--template-one-primary': props.placePrimaryColor,
  '--template-one-identity-margin': props.identityAlignment === 'center' ? 'auto' : '0',
  '--template-one-identity-position': props.identityAlignment,
}))
</script>

<style scoped>
.template-one-scene-one {
  --template-one-canvas: #f3e9d2;
  --template-one-accent: #d99a22;

  position: relative;
  min-height: 100svh;
  color: var(--template-one-canvas);
  background: var(--template-one-primary);
  isolation: isolate;
  overflow: clip;
}
.template-one-scene-one::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(
    ellipse at 50% 48%,
    color-mix(in srgb, var(--template-one-accent) 22%, transparent),
    transparent 42%
  );
  content: '';
  pointer-events: none;
}
.template-one-scene-one__header {
  position: absolute;
  inset: 0 0 auto;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4.5rem;
  padding-inline: calc(var(--spacing) * 4);
  border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
}
.template-one-scene-one__header > a {
  width: 5.5rem;
}
.template-one-scene-one__header :deep(.fx-brand-wordmark) {
  width: 100%;
  max-width: none;
}
.template-one-scene-one__header > nav {
  display: flex;
  gap: calc(var(--spacing) * 2.2);
  align-items: center;
}
.template-one-scene-one__header nav a,
.template-one-scene-one__header summary {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.template-one-scene-one__header > nav > a:first-child {
  display: none;
}
.template-one-scene-one__menu-link {
  padding: calc(var(--spacing) * 2.8) calc(var(--spacing) * 3.4);
  color: var(--template-one-accent);
  border: 1px solid currentColor;
}
.template-one-scene-one details {
  position: relative;
}
.template-one-scene-one summary {
  display: grid;
  width: calc(var(--spacing) * 11);
  height: calc(var(--spacing) * 11);
  cursor: pointer;
  list-style: none;
  color: var(--template-one-accent);
  border: 1px solid currentColor;
  border-radius: 50%;
  place-items: center;
}
.template-one-scene-one summary::-webkit-details-marker {
  display: none;
}
.template-one-scene-one details nav {
  position: absolute;
  top: calc(100% + (var(--spacing) * 3));
  right: 0;
  padding: calc(var(--spacing) * 4);
  background: var(--template-one-primary);
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
}
.template-one-scene-one__background {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: url('/img/template-one/charcoal-texture.webp');
  background-position: center;
  background-size: cover;
  mix-blend-mode: soft-light;
  opacity: 0.5;
}
.template-one-scene-one__content {
  position: absolute;
  top: 50%;
  right: calc(var(--spacing) * 4);
  left: calc(var(--spacing) * 4);
  z-index: 1;
  transform: translateY(-50%);
}
.template-one-scene-one__content :deep(.template-one-scene-one__wordmark.fx-brand-wordmark) {
  width: 100%;
  max-width: none;
  max-height: 54svh;
  height: auto;
  margin-inline: var(--template-one-identity-margin);
  object-fit: contain;
  object-position: var(--template-one-identity-position) center;
}
.template-one-scene-one__content p,
.template-one-scene-one__missing {
  color: color-mix(in srgb, currentColor 70%, transparent);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
@media (min-width: 40.0625rem) {
  .template-one-scene-one::before {
    background: radial-gradient(
      ellipse at 58% 42%,
      color-mix(in srgb, var(--template-one-accent) 22%, transparent),
      transparent 42%
    );
  }
  .template-one-scene-one__header {
    min-height: 6.25rem;
    padding-inline: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 12));
  }
  .template-one-scene-one__header > a {
    width: clamp(7.5rem, 11vw, 9rem);
  }
  .template-one-scene-one__header > nav {
    gap: clamp(calc(var(--spacing) * 3), 2vw, calc(var(--spacing) * 7));
  }
  .template-one-scene-one__header > nav > a:first-child {
    display: inline;
  }
  .template-one-scene-one__menu-link {
    padding: calc(var(--spacing) * 3.4) calc(var(--spacing) * 7);
  }
  .template-one-scene-one__content {
    right: 5.75vw;
    left: 2.75vw;
  }
  .template-one-scene-one__content :deep(.template-one-scene-one__wordmark.fx-brand-wordmark) {
    width: min(100%, 83vw, 124.5svh);
    max-height: 62svh;
  }
}
</style>
