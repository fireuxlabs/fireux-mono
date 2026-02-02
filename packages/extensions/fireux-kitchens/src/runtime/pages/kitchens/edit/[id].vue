<template>
  <ClientOnly>
    <UPage class="page edit-page">
      <UPageHeader :title="pageTitle" :description="pageSubtitle">
        <template #ctas>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-arrow-left"
            :to="kitchenId ? `/kitchens/${encodeURIComponent(kitchenId)}` : '/kitchens'"
          >
            Back to details
          </UButton>
        </template>
      </UPageHeader>

      <UPageBody class="pagebody">
        <UPageCard v-if="loading" variant="subtle">
          <p class="text-sm text-dimmed">Loading kitchen…</p>
        </UPageCard>

        <UAlert
          v-else-if="!kitchen"
          color="error"
          variant="soft"
          title="Kitchen not found"
          description="We could not find this kitchen. Return to the kitchens list and try again."
        />

        <div v-else class="space-y-4">
          <PlaceCardsPreview
            v-if="placePreview"
            v-bind="placePreview"
            :show-badges="false"
            :show-body="false"
          />

          <UAlert
            v-if="!canEdit"
            color="warning"
            variant="soft"
            title="Claim required"
            description="You can only edit places you’ve claimed. Ask an admin or claim this business first."
          >
            <template #actions>
              <UButton
                size="xs"
                variant="soft"
                color="primary"
                :to="kitchenId ? `/kitchens/${encodeURIComponent(kitchenId)}` : '/kitchens'"
              >
                Go to details
              </UButton>
            </template>
          </UAlert>

          <OrganismsEntitiesPlaceEdit v-if="canEdit" :place="placeObject" />
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Editing locked"
            description="Only the claiming user or an admin can edit this place."
          />
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading kitchen…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { usePlacesInterface } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import { computed } from 'vue'
import { useKitchenFetch } from '../../../composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'
import type { Kitchen } from '../../../models/objects/kitchen.model'

definePageMeta({
  layout: 'default',
  title: 'Edit Kitchen',
  description: 'Edit a saved kitchen.',
  head: { title: 'Edit Kitchen' },
  name: 'KitchensEditPage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Kitchen` })

const route = useRoute()
const raw = route.params.id
const kitchenId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { kitchen: fetchKitchen } = useKitchenFetch()
const docRef = kitchenId ? fetchKitchen(kitchenId) : null

const kitchen = computed<Kitchen | null>(() => docRef?.value ?? null)
const loading = computed(() => Boolean(kitchenId) && docRef?.value === undefined)

const { currentUser, isAdmin } = useUser()
const claimedBy = computed(() => String(kitchen.value?.claimed_by ?? '').trim())
const canEdit = computed(() => {
  if (!claimedBy.value) return Boolean(isAdmin.value)
  return Boolean(isAdmin.value || currentUser.value?.id === claimedBy.value)
})

const { preview } = usePlacesInterface()
const placePreview = computed(() => preview(kitchen.value as any))

// Pass Place-shaped object to edit organism
const placeObject = computed(() => {
  if (!kitchen.value) return null
  const {
    id, name, short_name, short_address, formatted_address, lat, lng,
    image_url, image_shade, claimed_by, source
  } = kitchen.value
  return {
    id, name, short_name, short_address, formatted_address, lat, lng,
    image_url, image_shade, claimed_by, source
  }
})

const pageTitle = computed(() => kitchen.value?.name || 'Edit kitchen')
const pageSubtitle = computed(() =>
  kitchenId ? `Kitchen: ${kitchenId}` : 'Edit a kitchen'
)

</script>
