<template>
  <UPage>
    <UPageHeader
      title="Operations"
      :description="`Operations across ${appName} workspaces.`"
    >
      <template #headline>
        <ULink to="/">{{ appName }}</ULink>
      </template>
      <template v-if="operationGroups.length > 1" #links>
        <nav aria-label="Workspace operations" class="operations-index__nav">
          <UButton
            v-for="group in operationGroups"
            :key="group.id"
            :to="`#${group.id}`"
            color="neutral"
            variant="soft"
            size="sm"
          >
            {{ group.name }}
          </UButton>
        </nav>
      </template>
    </UPageHeader>

    <UPageBody>
      <UPageSection
        v-for="group in operationGroups"
        :id="group.id"
        :key="group.id"
        :title="group.name"
      >
        <template #links>
          <UButton
            :to="group.to"
            variant="link"
            trailing-icon="i-lucide-arrow-up-right"
          >
            Open workspace
          </UButton>
        </template>
        <UPageGrid>
          <UPageCard
            v-for="operation in group.operations"
            :key="operation.id"
            :title="operation.title"
            :description="operation.description"
            :icon="operation.icon || 'i-lucide-circle-dot'"
            :to="
              operation.slug ? `/operations/${operation.slug}` : operation.to
            "
            variant="subtle"
          />
        </UPageGrid>
      </UPageSection>

      <UAlert
        v-if="!operations.length"
        color="neutral"
        variant="soft"
        title="No operations published yet"
        description="This app has not declared any Workspace Operations."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import {
  buildPublicPageJsonLd,
  useSeo,
} from '../../composables/fireux/seo/useSeo'
import type { FireuxMetaOperation } from '../../app/models/meta-content'

type OperationsResponse = {
  ok: boolean
  operations: FireuxMetaOperation[]
}

const fireux = useFireUXConfig()
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')
const { data } = await useAsyncData('public-app-operations', () =>
  $fetch<OperationsResponse>('/api/app/operations')
)
const operations = computed(() => data.value?.operations || [])
const operationGroups = computed(() => {
  const groups = new Map<
    string,
    { id: string; name: string; to: string; operations: FireuxMetaOperation[] }
  >()
  for (const operation of operations.value) {
    const existing = groups.get(operation.workspace.id)
    if (existing) {
      existing.operations.push(operation)
      continue
    }
    groups.set(operation.workspace.id, {
      ...operation.workspace,
      operations: [operation],
    })
  }
  return Array.from(groups.values())
})

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'operations',
    label: 'Operations',
    icon: 'i-lucide-list-checks',
    order: 27,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
    visibility: {
      appRoles: ['global', 'standalone'],
    },
  },
})

const pageTitle = computed(() => `Operations - ${appName.value}`)
const pageDescription = computed(
  () => `Operations across ${appName.value} workspaces.`
)

useSeo({
  title: pageTitle,
  description: pageDescription,
  path: '/operations',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
      items: operations.value
        .filter((operation) => operation.slug)
        .map((operation) => ({
          name: operation.title,
          url: context.absoluteUrl(`/operations/${operation.slug}`),
        })),
    }),
})
</script>

<style scoped>
.operations-index__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
