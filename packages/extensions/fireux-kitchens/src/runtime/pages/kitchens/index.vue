<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />
    <UPageBody class="pagebody">
      <KitchenCTA />

      <div
        v-if="showDevNotes"
        data-dev-note="true"
        data-dev-note-title="Collection"
        class="rounded-lg border border-default/60 bg-elevated/50 px-4 py-3 text-xs text-dimmed"
      >
        <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Developer Note
        </p>
        <ul data-dev-note-body class="list-disc space-y-1 pl-4">
          <li>Public browsing layer.</li>
          <li>
            Cards route to
            <code>/kitchens/:slug</code>
            or
            <code>/kitchens/:id</code>.
          </li>
          <li>Does not enter the console.</li>
        </ul>
      </div>

      <KitchenCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import { computed } from 'vue'
import KitchenCTA from '../../components/organisms/Kitchen/CTA.vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'

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
})

const pageTitle = 'Kitchens'
const pageDescription = 'Choose a kitchen surface for this runtime.'
const { notesVisible } = useDevUi()
const showDevNotes = computed(() => import.meta.dev && notesVisible.value)

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { kitchens } = useKitchenFetch()
const collection = computed(() => kitchens.value ?? [])
</script>
