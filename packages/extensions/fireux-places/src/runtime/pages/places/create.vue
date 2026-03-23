<template>
  <UPage>
    <UPageHeader
      title="Create Place"
      description="Create a place from Google if it is not in our database."
    />

    <UPageBody class="pagebody">
      <PlaceCreateSystem
        :type="placeType"
        @created="onCreated"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRoute, useRouter } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { normalizePlaceType } from '../../composables/fireux/firestore/place/utils/useNormalizePlace'

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

async function onCreated(payload: { id: string }) {
  const id = payload?.id
  if (!id) return
  await router.push(`/places/${encodeURIComponent(id)}`)
}
</script>
