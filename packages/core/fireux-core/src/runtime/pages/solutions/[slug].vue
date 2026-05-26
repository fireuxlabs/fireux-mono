<template>
  <PublicSimplePage
    v-if="solution"
    :title="solution.title"
    :description="solution.description"
    eyebrow="Solution"
    back-to="/solutions"
    back-label="Solutions"
  >
    <p class="text-sm leading-7 text-muted">
      {{ solution.body || `Hello from ${solution.title}. ${solution.description}` }}
    </p>

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
import type { FireuxMetaSolution } from '../../models/system/meta-content.model'

type SolutionsResponse = {
  ok: boolean
  solutions: FireuxMetaSolution[]
}

const route = useRoute()
const requestedSlug = computed(() =>
  Array.isArray(route.params.slug) ? route.params.slug[0] : String(route.params.slug || '')
)

const { data } = await useAsyncData('public-app-solutions', () =>
  $fetch<SolutionsResponse>('/api/public/app/solutions')
)

const solution = computed(() =>
  (data.value?.solutions || []).find((entry) => entry.slug === requestedSlug.value)
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
</script>
