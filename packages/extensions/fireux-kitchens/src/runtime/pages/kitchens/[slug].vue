<template>
  <NuxtPage v-if="hasChildRoute" />

  <ClientOnly v-else>
    <UPage>
      <UPageHeader
        class="pageheader"
        :title="pageTitle"
        :description="pageDescription"
      />

      <UPageBody class="pagebody">
        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading kitchen…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!kitchen"
          title="Kitchen not found"
          description="This kitchen does not exist or is not public-ready."
          variant="subtle"
        />

        <div v-else class="space-y-4">
          <!-- place -->
          <KitchenPublicPlace :kitchen="kitchen" />

          <!-- profile -->
          <KitchenCardsProfile
            v-if="profileCard"
            :card="profileCard"
          />

          <!-- main -->
          <KitchenPublicMenus :kitchen="kitchen" />

          <!-- operator -->
          <KitchenPublicOperator />

          <!-- dev -->
          <DevJson
            v-if="isDev && kitchen"
            :title="'Kitchen (Doc)'"
            context="Kitchen detail page · kitchens/[slug] · hydrated kitchen doc"
            :data="kitchen"
            :default-open="false"
          />
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <UPage>
        <UPageHeader
          class="pageheader"
          :title="pageTitle"
          description="Kitchen details."
        />

        <UPageBody class="pagebody">
          <UPageCard variant="subtle">
            <p class="text-sm text-dimmed">Loading kitchen…</p>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import { useKitchenCollection } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenInterface } from '../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenSeo } from '../../composables/fireux/firestore/kitchen/utils/useKitchenSeo'
import type { Kitchen } from '../../models/kitchen.model'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  name: 'KitchensDetailPage',
})

const route = useRoute()
const hasChildRoute = computed(() => {
  const path = String(route.path || '').trim()
  return /\/kitchens\/[^/]+\/menus?(?:\/|$)/.test(path)
})

const routeKey = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})

const { kitchens, pending: kitchensPending } = useKitchenCollection()
const kitchen = computed<Kitchen | null>(() => {
  const slugKey = routeKey.value.toLowerCase()
  if (!slugKey) return null
  const list = kitchens.value ?? []
  const found = list.find((entry) => {
    const slug = String((entry as any)?.slug ?? '').trim().toLowerCase()
    return slug.length > 0 && slug === slugKey
  })
  return (found as unknown as Kitchen) ?? null
})

const pending = computed(() => Boolean(routeKey.value) && kitchensPending.value)
const { profile } = useKitchenInterface()
const profileCard = computed(() => profile(kitchen.value))

const pageTitle = computed(() =>
  profileCard.value?.title || routeKey.value || 'Kitchen'
)
const pageDescription = computed(() =>
  profileCard.value?.subtitle || 'Kitchen details.'
)
const isDev = import.meta.dev

useKitchenSeo(kitchen)
</script>
