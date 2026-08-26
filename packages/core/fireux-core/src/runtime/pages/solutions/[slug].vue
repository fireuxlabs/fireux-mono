<template>
  <PublicSimplePage
    v-if="solution"
    :title="solution.title"
    :description="solution.description"
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="grid min-w-0 gap-5">
      <p class="m-0 whitespace-pre-line text-sm leading-7 text-muted">
        {{ solution.body || solution.description }}
      </p>

      <UCard v-if="solution.steps?.length" variant="subtle">
        <template #header>
          <h2 class="m-0 text-base font-semibold text-highlighted">
            How this comes to life
          </h2>
        </template>

        <ol class="grid gap-3 p-0">
          <li
            v-for="(step, index) in solution.steps"
            :key="`${index}-${step}`"
            class="flex min-w-0 gap-3 text-sm leading-6 text-muted"
          >
            <span
              class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold leading-none text-primary"
            >
              {{ index + 1 }}
            </span>
            <span>{{ step }}</span>
          </li>
        </ol>
      </UCard>

      <UCard v-if="solution.relatedApp" variant="subtle">
        <template #header>
          <h2 class="m-0 text-base font-semibold text-highlighted">
            Related FireUX app
          </h2>
        </template>

        <div class="grid min-w-0 gap-3">
          <p class="m-0 text-sm leading-6 text-muted">
            {{
              solution.relatedApp.description ||
              `${solution.relatedApp.name} owns the deeper workflow for this solution.`
            }}
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

      <UCard v-if="relatedOperations.length" variant="subtle">
        <template #header>
          <h2 class="m-0 text-base font-semibold text-highlighted">
            Related operations
          </h2>
        </template>

        <div class="grid gap-3 sm:grid-cols-2">
          <NuxtLink
            v-for="operation in relatedOperations"
            :key="operation.id"
            :to="`/operations/${operation.slug}`"
            class="grid gap-1 rounded-lg p-3 hover:bg-elevated"
          >
            <span class="font-semibold text-highlighted">
              {{ operation.title }}
            </span>
            <span class="text-sm leading-6 text-muted">
              {{ operation.description }}
            </span>
          </NuxtLink>
        </div>
      </UCard>

      <UCard v-if="isAdmin && hasAdminPlanning" variant="subtle">
        <template #header>
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="m-0 text-base font-semibold text-highlighted">
              Admin planning
            </h2>
            <UBadge color="neutral" variant="soft"> Internal </UBadge>
          </div>
        </template>

        <div class="grid min-w-0 gap-4">
          <p
            v-if="solution.businessCase"
            class="m-0 whitespace-pre-line text-sm leading-6 text-muted"
          >
            {{ solution.businessCase }}
          </p>

          <div v-if="solution.keywords?.length" class="grid min-w-0 gap-2">
            <h3 class="m-0 text-sm font-semibold text-highlighted">
              Search intent
            </h3>
            <div class="flex flex-wrap gap-1.5">
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

          <div v-if="solution.provisioning?.length" class="grid min-w-0 gap-2">
            <h3 class="m-0 text-sm font-semibold text-highlighted">
              Provisioning
            </h3>
            <ul class="m-0 grid gap-1.5 pl-4 text-sm leading-6 text-muted">
              <li v-for="item in solution.provisioning" :key="item">
                {{ item }}
              </li>
            </ul>
          </div>

          <div v-if="solution.checklist?.length" class="grid min-w-0 gap-2">
            <h3 class="m-0 text-sm font-semibold text-highlighted">
              Checklist
            </h3>
            <ul
              class="m-0 grid list-none gap-2 p-0 text-sm leading-6 text-muted"
            >
              <li
                v-for="item in solution.checklist"
                :key="item.label"
                class="flex min-w-0 gap-2.5"
              >
                <UIcon
                  :name="
                    item.done ? 'i-lucide-square-check' : 'i-lucide-square'
                  "
                  class="mt-1 size-4 shrink-0"
                  :class="item.done ? 'text-primary' : 'text-muted'"
                />
                <span>{{ item.label }}</span>
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
import { createError, navigateTo, useAsyncData, useRoute } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import {
  buildPublicPageJsonLd,
  useSeo,
} from '../../composables/fireux/seo/useSeo'
import { useUser } from '../../user/composables/useUser'
import type {
  FireuxMetaOperation,
  FireuxMetaSolution,
} from '../../../config/app/meta-content'

type SolutionsResponse = {
  ok: boolean
  solutions: FireuxMetaSolution[]
}

type OperationsResponse = {
  ok: boolean
  operations: FireuxMetaOperation[]
}

const route = useRoute()
const fireux = useFireUXConfig()
const { isAdmin } = useUser()
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')
const requestedSlug = computed(() =>
  Array.isArray(route.params.slug)
    ? route.params.slug[0]
    : String(route.params.slug || '')
)

const { data } = await useAsyncData('public-app-solutions', () =>
  $fetch<SolutionsResponse>('/api/app/solutions')
)
const { data: operationsData } = await useAsyncData(
  'public-app-operations',
  () => $fetch<OperationsResponse>('/api/app/operations')
)

const solution = computed(() =>
  (data.value?.solutions || []).find(
    (entry) => entry.slug === requestedSlug.value
  )
)
const relatedOperations = computed(() => {
  const slugs = new Set(solution.value?.operationSlugs || [])
  return (operationsData.value?.operations || []).filter(
    (operation) => operation.slug && slugs.has(operation.slug)
  )
})
const solutionPath = computed(() =>
  requestedSlug.value
    ? `/solutions/${encodeURIComponent(requestedSlug.value)}`
    : ''
)
const canonicalDestination = computed(() =>
  String(solution.value?.to || '').trim()
)
const isExternalDestination = computed(
  () =>
    solution.value?.external === true ||
    /^https?:\/\//i.test(canonicalDestination.value)
)
const isIndexable = computed(
  () =>
    !['coming-soon', 'planned', 'later'].includes(
      String(solution.value?.status || '')
    )
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

if (
  canonicalDestination.value &&
  canonicalDestination.value !== solutionPath.value
) {
  await navigateTo(canonicalDestination.value, {
    external: isExternalDestination.value,
    redirectCode: 301,
  })
}

useSeo({
  title: computed(
    () => `${solution.value?.title || 'Solution'} - ${appName.value}`
  ),
  description: () => solution.value?.description || '',
  path: solutionPath,
  image: '/img/app/cover.png',
  robots: computed(() =>
    isIndexable.value ? 'index, follow' : 'noindex, nofollow'
  ),
  jsonLdBuilder: (context) =>
    isIndexable.value
      ? buildPublicPageJsonLd({
          canonicalUrl: context.canonicalUrl,
          description: context.description,
          image: context.image,
          items: relatedOperations.value.map((operation) => ({
            name: operation.title,
            url: context.absoluteUrl(`/operations/${operation.slug}`),
          })),
          title: context.title,
        })
      : null,
})
</script>
