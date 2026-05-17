<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody class="pagebody">
      <div
        v-if="showDevNotes"
        data-dev-note="true"
        data-dev-note-title="Collection"
        class="fireux-dev-note rounded-lg px-4 py-3 text-xs text-dimmed"
      >
        <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
          Developer Note
        </p>
        <ul data-dev-note-body class="list-disc space-y-1 pl-4">
          <li>
            Source mode:
            <code>{{ sourceMode }}</code>
          </li>
          <li>
            Source:
            <code>{{ devSourceLabel }}</code>
          </li>
          <li>
            Route:
            <code>{{ routePath }}</code>
          </li>
          <li>
            Pending:
            <code>{{ String(pending) }}</code>
          </li>
          <li>
            Properties:
            <code>{{ devPropertyCount }}</code>
          </li>
        </ul>
      </div>

      <UCard v-if="pending">
        <p>Loading properties...</p>
      </UCard>

      <PropertyCollectionManager
        v-else
        :collection="properties"
        :source-mode="sourceMode"
        :show-source-toggle="true"
        @update:source-mode="setSourceMode"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import PropertyCollectionManager from '../../components/organisms/Property/Collection/Manager.vue'
import { useProperties } from '../../composables/fireux/app/properties/useProperties'

definePageMeta({
  tag: 'properties',
  nav: {
    key: 'properties',
    label: 'Properties',
    icon: 'i-lucide-building',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
    visibility: {
      apps: ['buenohost'],
    },
  },
  title: 'Properties',
  description: 'Browse properties.',
  layout: 'default',
  name: 'PropertiesIndexPage',
  alias: ['/properties.demo', '/properties.test'],
})

const {
  pageTitle,
  pageDescription,
  sourceMode,
  properties,
  pending,
  showDevNotes,
  routePath,
  devSourceLabel,
  devPropertyCount,
  setSourceMode,
} = useProperties()
</script>
