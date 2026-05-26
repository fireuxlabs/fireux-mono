<template>
  <PublicSimplePage
    v-if="solution"
    :title="solution.title"
    :description="solution.description"
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="fx-solution-detail">
      <UBadge
        v-if="solution.status"
        color="primary"
        variant="soft"
      >
        {{ statusLabel(solution.status) }}
      </UBadge>

      <p class="fx-solution-detail__body">
        {{ solution.body || solution.description }}
      </p>

      <UCard
        v-if="solution.steps?.length"
        variant="subtle"
      >
        <template #header>
          <h2 class="fx-solution-panel__title">
            How this comes to life
          </h2>
        </template>

        <ol class="fx-solution-steps">
          <li
            v-for="(step, index) in solution.steps"
            :key="`${index}-${step}`"
            class="fx-solution-step"
          >
            <span class="fx-solution-step__number">
              {{ index + 1 }}
            </span>
            <span>{{ step }}</span>
          </li>
        </ol>
      </UCard>

      <UCard
        v-if="solution.relatedApp"
        variant="subtle"
      >
        <template #header>
          <h2 class="fx-solution-panel__title">
            Related FireUX app
          </h2>
        </template>

        <div class="fx-solution-related">
          <p class="fx-solution-related__description">
            {{ solution.relatedApp.description || `${solution.relatedApp.name} owns the deeper workflow for this solution.` }}
          </p>
          <UButton
            :to="solution.relatedApp.to"
            :target="solution.relatedApp.external ? '_blank' : undefined"
            color="neutral"
            variant="soft"
            trailing-icon="i-lucide-arrow-right"
          >
            Open {{ solution.relatedApp.name }}
          </UButton>
        </div>
      </UCard>

      <UCard
        v-if="isAdmin && hasAdminPlanning"
        variant="subtle"
      >
        <template #header>
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="fx-solution-panel__title">
              Admin planning
            </h2>
            <UBadge color="neutral" variant="soft">
              Internal
            </UBadge>
          </div>
        </template>

        <div class="fx-solution-admin">
          <p
            v-if="solution.businessCase"
            class="fx-solution-admin__text"
          >
            {{ solution.businessCase }}
          </p>

          <div
            v-if="solution.keywords?.length"
            class="fx-solution-admin__block"
          >
            <h3 class="fx-solution-admin__title">
              Search intent
            </h3>
            <div class="fx-solution-admin__chips">
              <UBadge
                v-for="keyword in solution.keywords"
                :key="keyword"
                color="neutral"
                variant="soft"
              >
                {{ keyword }}
              </UBadge>
            </div>
          </div>

          <div
            v-if="solution.provisioning?.length"
            class="fx-solution-admin__block"
          >
            <h3 class="fx-solution-admin__title">
              Provisioning
            </h3>
            <ul class="fx-solution-admin__list">
              <li
                v-for="item in solution.provisioning"
                :key="item"
              >
                {{ item }}
              </li>
            </ul>
          </div>

          <div
            v-if="solution.checklist?.length"
            class="fx-solution-admin__block"
          >
            <h3 class="fx-solution-admin__title">
              Checklist
            </h3>
            <ul class="fx-solution-admin__checklist">
              <li
                v-for="item in solution.checklist"
                :key="item"
              >
                <span class="fx-solution-admin__checkbox" aria-hidden="true" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </UCard>
    </div>

    <template #actions>
      <UButton
        v-if="solution.cta"
        :to="solution.cta.to"
        :target="solution.cta.external ? '_blank' : undefined"
        :icon="solution.cta.icon"
        color="primary"
      >
        {{ solution.cta.label }}
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createError, useAsyncData, useRoute, useSeoMeta } from '#imports'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import type { FireuxMetaSolution } from '../../models/system/meta-content.model'

type SolutionsResponse = {
  ok: boolean
  solutions: FireuxMetaSolution[]
}

const route = useRoute()
const { isAdmin } = useUser()
const requestedSlug = computed(() =>
  Array.isArray(route.params.slug) ? route.params.slug[0] : String(route.params.slug || '')
)

const { data } = await useAsyncData('public-app-solutions', () =>
  $fetch<SolutionsResponse>('/api/public/app/solutions')
)

const solution = computed(() =>
  (data.value?.solutions || []).find((entry) => entry.slug === requestedSlug.value)
)
const hasAdminPlanning = computed(() =>
  Boolean(
      solution.value?.businessCase ||
      solution.value?.keywords?.length ||
      solution.value?.provisioning?.length ||
      solution.value?.checklist?.length
  )
)

if (!solution.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Solution not found: ${requestedSlug.value}`,
  })
}

useSeoMeta({
  title: () => `${solution.value?.title || 'Solution'}`,
  ogTitle: () => `${solution.value?.title || 'Solution'}`,
  twitterTitle: () => `${solution.value?.title || 'Solution'}`,
  description: () => solution.value?.description || '',
  ogDescription: () => solution.value?.description || '',
  twitterDescription: () => solution.value?.description || '',
})

function statusLabel(status: string): string {
  switch (status) {
    case 'live':
      return 'Live'
    case 'very-easy':
      return 'Very easy'
    case 'coming-soon':
      return 'Coming soon'
    case 'bridge':
      return 'Bridge'
    case 'planned':
      return 'Planned'
    case 'later':
      return 'Later'
    default:
      return status
  }
}
</script>
