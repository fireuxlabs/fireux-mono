<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />
    <UPageBody class="pagebody">
      <KitchenCTA :count="kitchens.length" />

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
            Kitchens:
            <code>{{ devKitchenCount }}</code>
          </li>
          <li v-if="sourceMode === 'test'">
            Test probe:
            <code>{{ devTestProbe }}</code>
          </li>
        </ul>
      </div>

      <UCard v-if="pending">
        <p>Loading kitchens…</p>
      </UCard>

      <KitchenCollectionManager
        v-else
        :collection="kitchens"
        :source-mode="sourceMode"
        :show-source-toggle="true"
        @update:source-mode="setSourceMode"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useKitchens } from '../../composables/fireux/app/kitchens/useKitchens'

definePageMeta({
  tag: 'kitchens',
  nav: {
    key: 'kitchens',
    label: 'Kitchens',
    icon: 'i-lucide-chef-hat',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Kitchens',
  description: 'Browse kitchens.',
  layout: 'default',
  name: 'KitchensIndexPage',
  alias: ['/kitchens.demo', '/kitchens.test'],
})

const {
  pageTitle,
  pageDescription,
  sourceMode,
  kitchens,
  pending,
  showDevNotes,
  routePath,
  devSourceLabel,
  devKitchenCount,
  devTestProbe,
  setSourceMode,
} = useKitchens()
</script>
