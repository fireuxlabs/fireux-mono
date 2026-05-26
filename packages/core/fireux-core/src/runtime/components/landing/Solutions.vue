<template>
  <section
    v-if="shouldRender"
    class="landing-index-section fx-solutions"
    :class="variant === 'hub' ? 'fx-solutions--hub' : 'fx-solutions--preview'"
  >
    <div class="fx-solutions__header">
      <NuxtLink
        v-if="variant === 'hub'"
        to="/"
        class="fx-solutions__back"
      >
        {{ appName }}
      </NuxtLink>
      <UBadge
        v-else
        color="primary"
        variant="soft"
      >
        Solutions
      </UBadge>
      <component
        :is="variant === 'hub' ? 'h1' : 'h2'"
        class="fx-solutions__title"
        :class="variant === 'hub' ? 'fx-solutions__title--hub' : 'fx-solutions__title--preview'"
      >
        {{ resolvedTitle }}
      </component>
      <p
        v-if="resolvedSubtitle"
        class="fx-solutions__subtitle"
      >
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
      class="fx-solutions__more"
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
  if (props.variant === 'hub') return ''
  return 'Start with the thing you need to make public.'
})
</script>
