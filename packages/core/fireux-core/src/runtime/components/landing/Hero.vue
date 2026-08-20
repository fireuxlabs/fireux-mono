<template>
  <section class="hero">
    <header class="hero__heading">
      <p v-if="title" class="hero__title">{{ title }}</p>
      <p v-if="accent" class="hero__accent">{{ accent }}</p>
    </header>

    <p class="hero__paragraph" v-html="paragraph"></p>

    <ul v-if="badges.length" class="hero__badges">
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
        v-if="hasWorkspaceEntry"
        variant="soft"
        color="neutral"
        size="lg"
        :to="workspaceEntryPath"
        icon="i-lucide-terminal"
      >
        Go to workspace
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
import { computed } from 'vue'
import { useWorkspaceEntryCta } from '../../composables/fireux/workspace/useWorkspaceEntryCta'

type HeroBadge = {
  src: string
  alt: string
}

type HeroLink = {
  label: string
  to: string
}

type HeroBullet = {
  icon: string
  text: string
}

const props = defineProps<{
  title: string
  accent?: string
  paragraph: string
  badges?: HeroBadge[]
  primary: HeroLink
  secondary: HeroLink
  bullets?: HeroBullet[]
}>()

const { hasWorkspaceEntry, workspaceEntryPath } = useWorkspaceEntryCta()
const badges = computed(() => props.badges || [])
const bullets = computed(() => props.bullets || [])
</script>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  gap: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 7));
}

.hero__heading {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.hero__title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: var(--font-weight-bold);
}

.hero__accent {
  font-size: clamp(var(--text-4xl), 4.5vw, 3.25rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-500);
}

.hero__paragraph {
  color: var(--ui-text-muted);
  font-size: clamp(var(--text-base), 2.4vw, var(--text-lg));
  line-height: var(--leading-relaxed);
}

.hero__badges {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 6);
}

.hero__badges img {
  height: 40px;
  opacity: 0.85;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
}

.hero__bullets {
  display: grid;
  gap: calc(var(--spacing) * 3);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  color: var(--ui-text-muted);
  font-size: var(--text-base);
}

.hero__bullets li {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.hero__bullets i,
.hero__bullets svg {
  color: var(--color-primary-500);
}
</style>
