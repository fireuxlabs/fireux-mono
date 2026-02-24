<template>
  <div class="landing-hero__body">
    <p class="landing-hero__paragraph" v-html="paragraph"></p>

    <div v-if="badges.length" class="landing-hero__badges">
      <img
        v-for="badge in badges"
        :key="badge.alt"
        :src="badge.src"
        :alt="badge.alt"
        class="landing-hero__badge"
      />
    </div>

    <div class="landing-hero__actions">
      <UButton
        variant="solid"
        size="lg"
        :to="primary.to"
        :class="buttonClass(primary)"
      >
        <span v-if="primary.icon" class="landing-hero__button-label">
          {{ primary.label }}
        </span>
        <template v-else>{{ primary.label }}</template>
        <UIcon
          v-if="primary.icon"
          :name="primary.icon"
          class="landing-hero__button-icon"
        />
      </UButton>

      <UButton
        variant="outline"
        size="lg"
        :to="secondary.to"
        :class="buttonClass(secondary)"
      >
        <span v-if="secondary.icon" class="landing-hero__button-label">
          {{ secondary.label }}
        </span>
        <template v-else>{{ secondary.label }}</template>
        <UIcon
          v-if="secondary.icon"
          :name="secondary.icon"
          class="landing-hero__button-icon"
        />
      </UButton>

      <UButton v-if="tertiary" variant="ghost" size="lg" :to="tertiary.to">
        {{ tertiary.label }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
type HeroAction = {
  label: string
  to: string
  icon?: string
}

const paragraph =
  'Coordinate crews, quality checks, and billing from one dashboard. Cleanbox keeps every service <span class="text-primary">scheduled</span>, <span class="text-primary">verified</span>, and <span class="text-primary">client-ready</span>.'

const badges = [
  { src: '/img/app/wordmark-light.png', alt: 'Cleanbox wordmark' },
  { src: '/img/app/logo.png', alt: 'Cleanbox emblem' },
]

const primary: HeroAction = { label: 'Get Started', to: '/get-started' }
const secondary: HeroAction = {
  label: 'Explore Crews',
  to: '/crews',
  icon: 'i-heroicons-arrow-right',
}
const tertiary: HeroAction | undefined = undefined

const buttonClass = (action: HeroAction) =>
  action.icon ? 'landing-hero__button--spread' : undefined
</script>
