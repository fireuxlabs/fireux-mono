<template>
  <section class="space-y-4">
    <UCard :ui="{ body: 'space-y-4' }">
      <template #header>
        <div class="space-y-1">
          <div class="font-medium">Search for your venue</div>
          <div class="text-sm text-dimmed">
            We’ll link this location to your console. Nothing is duplicated.
          </div>
        </div>
      </template>

      <!-- section consumer -->
      <PlaceSearchSection
        type="kitchen"
        placeholder="Search by name or address"
        @confirmed="onPlaceConfirmed"
      />

      <div v-if="successId" class="space-y-3">
        <div class="text-sm text-green-600">
          Kitchen activated. You’re now managing this location.
        </div>
        <div class="text-xs text-muted">
          Location ID: {{ successId }}
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton size="xs" color="neutral" variant="soft" to="/dashboard/chef/profile">
            Go to profile
          </UButton>
          <UButton size="xs" color="primary" to="/console/kitchen">
            Go to console
          </UButton>
          <UButton size="xs" color="neutral" variant="ghost" @click="createAnotherKitchen">
            Activate another kitchen
          </UButton>
        </div>
      </div>
      <div v-else-if="existingId" class="space-y-2 text-sm text-amber-600">
        <div>This kitchen is already active.</div>
        <div class="text-xs text-muted">Location ID: {{ existingId }}</div>
        <UButton
          size="xs"
          variant="soft"
          color="neutral"
          :to="`/kitchens/${encodeURIComponent(existingId)}`"
        >
          Continue to kitchen
        </UButton>
      </div>
      <div v-if="error" class="text-sm text-red-600">
        {{ error }}
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePlaceSave } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceSave'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { useKitchenCreate } from '../../../../composables/fireux/firestore/kitchen/mutations/useKitchenCreate'
import { useChef } from '../../../../composables/fireux/firestore/profiles/Chef/useChef'

const { createKitchen } = useKitchenCreate()
const { ensurePlaceExists } = usePlaceSave()
const { uid } = useAuth()
const { coreProfile, updateCoreProfile } = useChef()
const db = useFirestore()

const error = ref<string | null>(null)
const successId = ref<string | null>(null)
const existingId = ref<string | null>(null)

function createAnotherKitchen() {
  error.value = null
  successId.value = null
  existingId.value = null
}

async function ensureKitchenLinkedToChef(kitchenId: string) {
  const currentKitchenIds = Array.isArray(coreProfile.value?.kitchen_ids)
    ? coreProfile.value.kitchen_ids
    : []

  const nextKitchenIds = Array.from(
    new Set(
      [...currentKitchenIds, kitchenId]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  )

  if (nextKitchenIds.length === currentKitchenIds.length) return
  await updateCoreProfile({ kitchen_ids: nextKitchenIds })
}

async function onPlaceConfirmed(payload: { placeId: string; place: PlaceUpsertInput }) {
  error.value = null
  successId.value = null
  existingId.value = null

  try {
    const id = payload.placeId
    const place = payload.place
    let placeForRecord = place

    await ensurePlaceExists(placeForRecord)

    const placeSnap = await getDoc(doc(db, 'places', id))
    if (placeSnap.exists()) {
      const stored = placeSnap.data() as Record<string, any>
      placeForRecord = {
        ...place,
        ...stored,
        id,
      }
    }

    const existingSnap = await getDoc(doc(db, 'kitchens', id))
    if (existingSnap.exists()) {
      await ensureKitchenLinkedToChef(id)
      existingId.value = id
      return
    }

    const createdId = await createKitchen({
      id,
      place: placeForRecord,
    })

    await ensureKitchenLinkedToChef(createdId)

    successId.value = createdId
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unable to create kitchen'
  }
}
</script>
