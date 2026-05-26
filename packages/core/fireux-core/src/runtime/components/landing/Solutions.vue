<template>
  <section
    v-if="shouldRender"
    class="landing-index-section space-y-6 lg:space-y-8"
  >
    <div
      class="space-y-3"
      :class="variant === 'hub' ? 'max-w-3xl' : 'mx-auto max-w-2xl text-center'"
    >
      <UBadge color="primary" variant="soft">Solutions</UBadge>
      <component
        :is="variant === 'hub' ? 'h1' : 'h2'"
        class="font-semibold tracking-normal text-highlighted"
        :class="variant === 'hub' ? 'text-3xl sm:text-4xl' : 'text-3xl'"
      >
        {{ resolvedTitle }}
      </component>
      <p class="text-base leading-7 text-muted">
        {{ resolvedSubtitle }}
      </p>
    </div>

    <PublicSolutionsGrid
      v-if="displayedSolutions.length"
      :solutions="displayedSolutions"
    />

    <UAlert
      v-else-if="variant === 'hub'"
      color="neutral"
      variant="soft"
      title="No solutions published yet"
      description="This app has not declared public solution pages."
    />

    <div
      v-if="variant === 'preview' && hasMoreSolutions"
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
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import type { FireuxMetaSolution } from '../../models/system/meta-content.model'

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
  }>(),
  {
    variant: 'preview',
    limit: 4,
    title: '',
    subtitle: '',
  }
)

const fireux = useFireUXConfig()

const { data } = await useAsyncData('public-app-solutions', () =>
  $fetch<SolutionsResponse>('/api/public/app/solutions')
)

const allSolutions = computed(() => data.value?.solutions || [])
const displayedSolutions = computed(() =>
  props.variant === 'hub'
    ? allSolutions.value
    : allSolutions.value.slice(0, props.limit)
)
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')
const hasMoreSolutions = computed(
  () => allSolutions.value.length > displayedSolutions.value.length
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
    : `Ways to use ${appName.value}`
})
const resolvedSubtitle = computed(() => {
  if (props.subtitle) return props.subtitle
  return props.variant === 'hub'
    ? 'Practical entry points for the jobs this app helps with.'
    : 'Practical starting points for this app.'
})
</script>
