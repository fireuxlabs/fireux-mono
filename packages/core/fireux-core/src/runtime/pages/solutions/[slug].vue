<template>
  <main v-if="solution">
    <UContainer>
      <UPage>
        <UButton to="/solutions" variant="link"> Solutions </UButton>
        <UPageHeader
          :title="solution.title"
          :description="solution.description"
        />
        <UPageBody>
          <div>
            <p>
              {{ solution.body || solution.description }}
            </p>

            <UCard v-if="solution.steps?.length" variant="subtle">
              <template #header>
                <h2>How this comes to life</h2>
              </template>

              <ol>
                <li
                  v-for="(step, index) in solution.steps"
                  :key="`${index}-${step}`"
                >
                  <span>
                    {{ index + 1 }}
                  </span>
                  <span>{{ step }}</span>
                </li>
              </ol>
            </UCard>

            <UCard v-if="solution.relatedApp" variant="subtle">
              <template #header>
                <h2>Related FireUX app</h2>
              </template>

              <div>
                <p>
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
                <h2>Related operations</h2>
              </template>

              <div>
                <NuxtLink
                  v-for="operation in relatedOperations"
                  :key="operation.id"
                  :to="`/operations/${operation.slug}`"
                >
                  <span>
                    {{ operation.title }}
                  </span>
                  <span>
                    {{ operation.description }}
                  </span>
                </NuxtLink>
              </div>
            </UCard>

            <UCard v-if="isAdmin && hasAdminPlanning" variant="subtle">
              <template #header>
                <div>
                  <h2>Admin planning</h2>
                  <UBadge color="neutral" variant="soft"> Internal </UBadge>
                </div>
              </template>

              <div>
                <p v-if="solution.businessCase">
                  {{ solution.businessCase }}
                </p>

                <div v-if="solution.keywords?.length">
                  <h3>Search intent</h3>
                  <div>
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

                <div v-if="solution.provisioning?.length">
                  <h3>Provisioning</h3>
                  <ul>
                    <li v-for="item in solution.provisioning" :key="item">
                      {{ item }}
                    </li>
                  </ul>
                </div>

                <div v-if="solution.checklist?.length">
                  <h3>Checklist</h3>
                  <ul>
                    <li v-for="item in solution.checklist" :key="item.label">
                      <UIcon
                        :name="
                          item.done
                            ? 'i-lucide-square-check'
                            : 'i-lucide-square'
                        "
                      />
                      <span>{{ item.label }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </UCard>
          </div>

          <div class="fx-card__actions">
            <UButton
              v-if="solution.cta"
              :to="solution.cta.to"
              :target="solution.cta.external ? '_blank' : undefined"
              :icon="solution.cta.icon"
              color="primary"
            >
              {{ solution.cta.label }}
            </UButton>
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useUserSession } from '../../user/composables/session/useUserSession'
import { computed } from 'vue'
import { createError, navigateTo, useAsyncData, useRoute } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import {
  buildPublicPageJsonLd,
  useSeo,
} from '../../composables/fireux/seo/useSeo'
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
const { isAdmin } = useUserSession()
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
