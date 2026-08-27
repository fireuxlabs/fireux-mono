<template>
  <section
    v-if="shouldRender"
    class="landing-index-section grid min-w-0 gap-6 sm:gap-8"
  >
    <div
      class="grid min-w-0 gap-3"
      :class="variant === 'hub' ? 'max-w-3xl' : 'mx-auto max-w-2xl text-center'"
    >
      <NuxtLink
        v-if="variant === 'hub'"
        to="/"
        class="w-fit text-sm font-semibold text-primary hover:underline"
      >
        {{ appName }}
      </NuxtLink>
      <UBadge v-else color="primary" variant="soft"> Solutions </UBadge>
      <component
        :is="variant === 'hub' ? 'h1' : 'h2'"
        class="m-0 font-semibold tracking-normal text-highlighted"
        :class="
          variant === 'hub'
            ? 'text-3xl leading-tight sm:text-4xl'
            : 'text-3xl leading-tight'
        "
      >
        {{ resolvedTitle }}
      </component>
      <p v-if="resolvedSubtitle" class="m-0 text-base leading-7 text-muted">
        {{ resolvedSubtitle }}
      </p>
    </div>

    <UPageGrid v-if="displayedSolutions.length">
      <UPageCard
        v-for="solution in displayedSolutions"
        :key="solution.slug"
        :title="solution.title"
        :description="solution.description"
        :icon="solution.icon || 'i-lucide-lightbulb'"
        :to="solution.to || `/solutions/${solution.slug}`"
        :target="solution.external ? '_blank' : undefined"
        variant="subtle"
      />
    </UPageGrid>

    <UAlert
      v-else-if="variant === 'hub'"
      color="neutral"
      variant="soft"
      title="No solutions published yet"
      description="This app has not declared public solution pages."
    />

    <div
      v-if="variant === 'preview' && shouldShowMoreButton"
      class="flex justify-center"
    >
      <UButton
        to="/solutions"
        color="neutral"
        variant="soft"
        trailing-icon="i-lucide-arrow-right"
      >
        View all solutions
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import type { FireuxMetaSolution } from '../../../config/app/meta-content'

type SolutionsResponse = {
  ok: boolean
  solutions: FireuxMetaSolution[]
}

const props = withDefaults(
  defineProps<{
    variant?: 'preview' | 'hub'
    limit?: number
    title?: string
    subtitle?: string
    alwaysShowMoreButton?: boolean
  }>(),
  {
    variant: 'preview',
    limit: 4,
    title: '',
    subtitle: '',
    alwaysShowMoreButton: false,
  }
)

const fireux = useFireUXConfig()

const { data } = await useAsyncData('public-app-solutions', () =>
  $fetch<SolutionsResponse>('/api/app/solutions')
)

const allSolutions = computed<FireuxMetaSolution[]>(
  () => data.value?.solutions || []
)
const displayedSolutions = computed(() =>
  props.variant === 'hub'
    ? allSolutions.value
    : [
        ...allSolutions.value.filter((solution) => solution.featured),
        ...allSolutions.value.filter((solution) => !solution.featured),
      ].slice(0, props.limit)
)
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')
const hasMoreSolutions = computed(
  () => allSolutions.value.length > displayedSolutions.value.length
)
const shouldShowMoreButton = computed(
  () => hasMoreSolutions.value || props.alwaysShowMoreButton
)
const shouldRender = computed(() => {
  if (fireux.isTenant) return false
  if (props.variant === 'hub') return true
  return displayedSolutions.value.length > 0
})
const resolvedTitle = computed(() => {
  if (props.title) return props.title
  return props.variant === 'hub'
    ? `${appName.value} solutions`
    : 'Solutions across FireUX'
})
const resolvedSubtitle = computed(() => {
  if (props.subtitle) return props.subtitle
  if (props.variant === 'hub') return ''
  return 'FireUX, Misebox and Werkbox in one catalogue.'
})
</script>
