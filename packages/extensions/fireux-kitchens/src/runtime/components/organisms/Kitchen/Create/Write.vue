<template>
  <div class="space-y-4">
    <OrganismsPlaceSearchSection
      type="kitchen"
      placeholder="Search by name or address"
      @confirmed="onPlaceConfirmed"
    />

    <div v-if="cancelTo && !successResult && !existingId" class="flex flex-wrap gap-2">
      <UButton
        :to="cancelTo"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Cancel
      </UButton>
    </div>

    <div v-if="successResult" class="space-y-3">
      <div class="text-sm text-green-600">
        {{ successMessage }}
      </div>
      <div class="text-xs text-muted">
        Location ID: {{ successResult.id }}
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          size="xs"
          :color="isConsoleMode ? 'primary' : 'neutral'"
          :variant="isConsoleMode ? 'solid' : 'soft'"
          :to="primarySuccessTo"
        >
          {{ primarySuccessLabel }}
        </UButton>
        <UButton
          v-if="isConsoleMode"
          size="xs"
          color="neutral"
          variant="soft"
          to="/dashboard/chef/profile"
        >
          Go to profile
        </UButton>
        <UButton size="xs" color="neutral" variant="ghost" @click="createAnotherKitchen">
          {{ resetLabel }}
        </UButton>
      </div>
    </div>
    <div v-else-if="existingId" class="space-y-2 text-sm text-amber-600">
      <div>This public kitchen already exists.</div>
      <div class="text-xs text-muted">Location ID: {{ existingId }}</div>
      <UButton
        size="xs"
        variant="soft"
        color="neutral"
        :to="`/kitchens/${encodeURIComponent(existingId)}`"
      >
        View kitchen
      </UButton>
    </div>
    <div v-if="error" class="text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { doc, getDoc } from 'firebase/firestore'
import { usePlaceSave } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceSave'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { computed, ref } from 'vue'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenCreate } from '../../../../composables/fireux/firestore/kitchen/mutations/useKitchenCreate'
import { useChef } from '../../../../composables/fireux/firestore/profiles/Chef/useChef'
import { useKitchenConsole } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsole'

const props = withDefaults(defineProps<{
  mode?: ConsoleCreateMode
  returnTo?: string
  cancelTo?: string
}>(), {
  mode: 'console',
  returnTo: '',
  cancelTo: '',
})

const { createKitchen } = useKitchenCreate()
const { ensurePlaceExists } = usePlaceSave()
const { coreProfile, updateCoreProfile } = useChef()
const { selectKitchen } = useKitchenConsole()
const db = useFirestore()
const route = useRoute()
const router = useRouter()

const error = ref<string | null>(null)
const successResult = ref<ConsoleEnsureResult | null>(null)
const existingId = ref<string | null>(null)

const cancelTo = computed(() => String(props.cancelTo || '').trim())
const isConsoleMode = computed(() => props.mode === 'console')
const resolvedReturnTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit

  const queryValue = String(route.query.returnTo || '').trim()
  if (queryValue.startsWith('/')) return queryValue

  return isConsoleMode.value ? '/console/kitchen' : `/kitchens/${encodeURIComponent(successResult.value?.id || '')}`
})
const primarySuccessTo = computed(() =>
  isConsoleMode.value ? resolvedReturnTo.value : `/kitchens/${encodeURIComponent(successResult.value?.id || '')}`
)
const primarySuccessLabel = computed(() =>
  isConsoleMode.value ? 'Go to console' : 'View kitchen'
)
const resetLabel = computed(() =>
  isConsoleMode.value ? 'Activate another kitchen' : 'Create another kitchen'
)
const successMessage = computed(() => {
  const result = successResult.value
  if (!result) return ''

  if (isConsoleMode.value) {
    if (result.createdRoot && result.createdOverlay) {
      return 'Kitchen activated. You’re now managing this location.'
    }
    if (!result.createdRoot && result.createdOverlay) {
      return 'Kitchen connected. You’re now managing this location.'
    }
    return 'Kitchen ready in your console.'
  }

  return 'Kitchen created.'
})

function createAnotherKitchen() {
  error.value = null
  successResult.value = null
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
  successResult.value = null
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

    const result = await createKitchen(
      {
        id,
        place: placeForRecord,
      },
      {
        mode: props.mode,
      }
    )

    if (isConsoleMode.value) {
      await ensureKitchenLinkedToChef(result.id)
      selectKitchen(result.id, 'live')
      successResult.value = result
      if (route.path !== resolvedReturnTo.value) {
        await router.push(resolvedReturnTo.value)
      }
      return
    }

    if (!result.createdRoot) {
      existingId.value = result.id
      return
    }

    successResult.value = result
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unable to create kitchen'
  }
}
</script>
