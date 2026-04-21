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
        class="fireux-dev-note rounded-lg px-4 py-3 text-xs text-dimmed"
      >
        <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
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
import { getDemoKitchens } from '../../composables/fireux/app/utils/kitchen-demo-scenarios'
import type { KitchenSurface } from '../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { computed } from 'vue'
import KitchenCTA from '../../components/Organisms/Kitchen/CTA.vue'

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

const collection = computed<KitchenSurface[]>(() =>
  getDemoKitchens().map((kitchen) => ({
    id: kitchen.id,
    slug: kitchen.id,
    place_id: kitchen.id,
    name: kitchen.name,
    short_address: kitchen.label,
    image_url: kitchen.image_url,
  }))
)
</script>
