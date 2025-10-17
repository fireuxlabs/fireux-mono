<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="hero-title">
        <strong>{{ titleMain }}</strong>
        <span v-if="titlePrefix"> {{ titlePrefix }}</span>
      </h1>
      <h1 class="hero-title hero-title--accent">{{ titleAccent }}</h1>
    </div>

    <p
      class="text-base lg:text-xl leading-relaxed max-w-prose"
      v-html="paragraph"
    ></p>

    <div v-if="badges?.length" class="flex items-center gap-6 pt-2">
      <img
        v-for="badge in badges"
        :key="badge.alt"
        :src="badge.src"
        :alt="badge.alt"
        class="h-10 opacity-80"
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
export interface LandingHeroProps {
  titleMain: string
  titlePrefix?: string
  titleAccent: string
  paragraph: string
  badges?: Array<{ src: string; alt: string }>
  primary: { label: string; to: string }
  secondary: { label: string; to: string }
  tertiary?: { label: string; to: string }
  bullets: Array<{ icon: string; text: string }>
}

defineProps<LandingHeroProps>()
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
