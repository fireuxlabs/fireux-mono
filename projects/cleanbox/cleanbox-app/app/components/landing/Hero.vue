<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="hero-title">
        <strong>{{ titleText }}</strong>
      </h1>
      <h1 v-if="accentText" class="hero-title hero-title--accent">
        {{ accentText }}
      </h1>
    </div>

    <div class="space-y-4">
      <p
        class="text-base lg:text-xl leading-relaxed max-w-prose"
        v-html="paragraph"
      ></p>

      <div v-if="badges?.length" class="flex flex-col items-start gap-3 pt-2">
        <img
          v-for="badge in badges"
          :key="badge.alt"
          :src="badge.src"
          :alt="badge.alt"
          :class="badgeImageClass(badge)"
        />
      </div>

      <div class="flex flex-col sm:flex-row gap-4 pt-6">
        <UButton variant="solid" size="lg" :to="primary.to">
          {{ primary.label }}
        </UButton>
        <UButton
          variant="outline"
          size="lg"
          :to="secondary.to"
          trailing-icon="i-heroicons-arrow-right"
        >
          {{ secondary.label }}
        </UButton>
        <UButton v-if="tertiary" variant="ghost" size="lg" :to="tertiary.to">
          {{ tertiary.label }}
        </UButton>
      </div>
    </div>

    <ul class="grid gap-3 sm:grid-cols-2 pt-4">
      <li
        v-for="(bullet, index) in bullets"
        :key="index"
        class="flex items-center gap-2 text-sm"
      >
        <UIcon :name="bullet.icon" class="shrink-0" />
        <span v-html="bullet.text" />
      </li>
    </ul>

    <slot name="extra" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface LandingHeroProps {
  title?: string
  accent?: string
  titleMain?: string
  titlePrefix?: string
  titleAccent?: string
  paragraph: string
  badges?: Array<{ src: string; alt: string }>
  primary: { label: string; to: string }
  secondary: { label: string; to: string }
  tertiary?: { label: string; to: string }
  bullets: Array<{ icon: string; text: string }>
}

const props = defineProps<LandingHeroProps>()

const badgeImageClass = (badge: { src: string; alt: string }) => {
  const badgeId = `${badge.alt} ${badge.src}`.toLowerCase()
  const isLogo = badgeId.includes('logo') || badgeId.includes('emblem')
  return isLogo
    ? 'h-14 w-14 rounded-full object-cover opacity-90'
    : 'h-10 w-auto opacity-80'
}

const titleText = computed(() => {
  if (props.title) return props.title
  const segments = [props.titleMain, props.titlePrefix]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim())
  return segments.join(' ').trim()
})

const accentText = computed(() => props.accent ?? props.titleAccent ?? '')
</script>

<style scoped>
.hero-title {
  font-weight: var(--font-weight-black);
  font-size: clamp(2.75rem, 6vw, 4.5rem);
  line-height: 1.15;
  color: var(--ui-text);
}
.hero-title strong {
  font-weight: inherit;
}
.hero-title--accent {
  color: var(--color-primary-500);
}
</style>
