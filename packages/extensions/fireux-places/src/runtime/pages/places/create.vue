<template>
  <UPage>
    <UPageHeader
      title="Create Place"
      description="Search a place, confirm it, and store the canonical record for this runtime."
    />

    <!-- section consumer -->
    <UPageBody class="pagebody space-y-6">
      <PlaceSearchSection
        :type="placeType"
        @confirmed="onConfirmed"
      />

      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-info"
        title="Tip"
        description="After confirmation, you’ll be redirected to the place detail page."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRoute, useRouter } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { normalizePlaceType } from '../../composables/fireux/firestore/objects/place/utils/placeCollections'

definePageMeta({
  layout: 'default',
  title: 'Create Place',
  description: 'Confirm a canonical place for this runtime.',
  nav: {
    key: 'places-create',
    label: 'Create place',
    icon: 'i-lucide-plus',
    order: 26,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  head: { title: 'Create Place' },
  name: 'PlacesCreatePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Create Place` })

const route = useRoute()
const router = useRouter()

const placeType = computed<string | null>(() =>
  normalizePlaceType(route.query.type)
)

async function onConfirmed(payload: { placeId: string }) {
  const id = payload?.placeId
  if (!id) return
  await router.push(`/places/${encodeURIComponent(id)}`)
}
</script>
