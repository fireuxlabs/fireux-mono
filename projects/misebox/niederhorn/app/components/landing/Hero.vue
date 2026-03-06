<template>
  <section class="hero">
    <header class="hero__heading">
      <p v-if="title" class="hero__title">{{ title }}</p>
      <p v-if="accent" class="hero__accent">{{ accent }}</p>
    </header>

    <p class="hero__paragraph" v-html="paragraph"></p>

    <ul v-if="badges?.length" class="hero__badges">
      <li v-for="badge in badges" :key="badge.alt">
        <img :src="badge.src" :alt="badge.alt" />
      </li>
    </ul>

    <div class="hero__actions">
      <UButton variant="solid" size="lg" :to="primary.to">
        {{ primary.label }}
      </UButton>
      <UButton variant="outline" size="lg" :to="secondary.to">
        {{ secondary.label }}
      </UButton>
      <UButton
        v-if="hasConsoleRoute"
        variant="soft"
        color="neutral"
        size="lg"
        to="/console"
        icon="i-lucide-terminal"
      >
        Go to console
      </UButton>
    </div>

    <ul class="hero__bullets">
      <li v-for="bullet in bullets" :key="bullet.text">
        <UIcon :name="bullet.icon" />
        <span v-html="bullet.text" />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useConsoleEntryCta } from 'fireux-core/runtime/composables/fireux/app/routing/useConsoleEntryCta'

export interface HeroBadge {
  src: string
  alt: string
}

export interface HeroLink {
  label: string
  to: string
}

export interface HeroBullet {
  icon: string
  text: string
}

defineProps<{
  title: string
  accent?: string
  paragraph: string
  badges?: HeroBadge[]
  primary: HeroLink
  secondary: HeroLink
  bullets: HeroBullet[]
}>()

const { hasConsoleRoute } = useConsoleEntryCta()

defineOptions({ name: 'NiederhornLandingHero' })
</script>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 3vw, 1.75rem);
}

.hero__heading {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.hero__title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
}

.hero__accent {
  font-size: clamp(2.25rem, 4.5vw, 3.25rem);
  font-weight: 700;
  color: #b45309;
}

.hero__paragraph {
  color: var(--ui-text-muted);
  font-size: clamp(1rem, 2.4vw, 1.125rem);
  line-height: 1.6;
}

.hero__badges {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.hero__badges img {
  height: 42px;
  border-radius: 0.75rem;
  box-shadow: var(--ui-shadow-sm);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero__bullets {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  color: var(--ui-text-muted);
  font-size: 0.95rem;
}

.hero__bullets li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hero__bullets i,
.hero__bullets svg {
  color: #b45309;
}
</style>
