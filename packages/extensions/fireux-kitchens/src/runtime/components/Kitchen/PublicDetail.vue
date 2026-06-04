<template>
  <ClientOnly>
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
import { computed } from 'vue'
import {
  useKitchenFetch,
  useKitchenInterface,
  useKitchenSeo,
} from '../../composables/fireux/firestore/kitchen/useKitchen'

const props = defineProps<{
  slug: string
}>()

const routeSlug = computed(() => String(props.slug || '').trim())

const { kitchen, pending } = useKitchenFetch(routeSlug)
const { profile } = useKitchenInterface()
const profileCard = computed(() => profile(kitchen.value))

const pageTitle = computed(() =>
  profileCard.value?.title || routeSlug.value || 'Kitchen'
)
const pageDescription = computed(() =>
  profileCard.value?.subtitle || 'Kitchen details.'
)
const isDev = import.meta.dev

useKitchenSeo(kitchen)
</script>
