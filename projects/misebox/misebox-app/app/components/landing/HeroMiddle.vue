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
  'Recruit <a href="/professionals"><strong>professionals</strong></a> for your <a href="/kitchens"><strong>kitchen</strong></a>. Post <a href="/jobs"><strong>positions</strong></a>, preview candidates, and manage hiring in one place.'

const badges: Array<{ src: string; alt: string }> = []

const primary: HeroAction = {
  label: 'Post a job',
  to: '/jobs',
  icon: 'i-lucide-briefcase',
}
const secondary: HeroAction = {
  label: 'Browse professionals',
  to: '/professionals',
  icon: 'i-heroicons-arrow-right',
}
const tertiary: HeroAction | undefined = undefined

const buttonClass = (action: HeroAction) =>
  action.icon ? 'landing-hero__button--spread' : undefined
</script>
