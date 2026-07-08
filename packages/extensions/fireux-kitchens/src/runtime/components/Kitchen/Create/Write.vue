<template>
  <div class="space-y-4">
    <PlaceSearchSection
      v-if="!isDirectActivation"
      type="kitchen"
      placeholder="Search by name or address"
      @confirmed="onPlaceConfirmed"
    />

    <div
      v-else
      class="flex items-center gap-3 rounded-lg border border-default bg-muted/30 px-4 py-3"
    >
      <UIcon
        :name="directActivationIcon"
        :class="directActivationIconClass"
        class="size-5 shrink-0"
      />
      <div class="min-w-0">
        <div class="text-sm font-medium">
          {{ directActivationTitle }}
        </div>
        <div class="text-xs text-dimmed">
          {{ directActivationDescription }}
        </div>
      </div>
    </div>

    <div
      v-if="cancelTo && !successResult && !existingId && !isDirectActivation"
      class="flex flex-wrap gap-2"
    >
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
        :to="publicEditTo"
      >
        Edit kitchen
      </UButton>
    </div>
    <div v-if="error" class="text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import type { ConsoleCreateMode } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePlaceCreate } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceCreate'
import { PlaceStorage, type PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { computed, ref, watch } from 'vue'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  useKitchenCreate,
  type KitchenCreateResult,
} from '../../../composables/fireux/firestore/kitchen/mutations/useKitchenCreate'
import { useChef } from '../../../composables/fireux/firestore/profiles/Chef/useChef'
import { useKitchenConsole } from '../../../composables/fireux/console/kitchen/core/useKitchenConsole'

const props = withDefaults(defineProps<{
  mode?: ConsoleCreateMode
  existingRootId?: string
  returnTo?: string
  cancelTo?: string
}>(), {
  mode: 'console',
  existingRootId: '',
  returnTo: '',
  cancelTo: '',
})

const { createKitchen, createKitchenConsole } = useKitchenCreate()
const { ensurePlaceExists } = usePlaceCreate()
const { coreProfile, updateCoreProfile } = useChef()
const { actions } = useKitchenConsole()
const { selectKitchen } = actions
const { uid, isReady } = useAuth()
const db = useFirestore()
const route = useRoute()
const router = useRouter()

const error = ref<string | null>(null)
const successResult = ref<KitchenCreateResult | null>(null)
const existingId = ref<string | null>(null)
const existingEditLocator = ref<string | null>(null)
const activatingExisting = ref(false)
const directActivationComplete = ref(false)
const directActivationStartedId = ref('')
const cancelTo = computed(() => String(props.cancelTo || '').trim())
const isConsoleMode = computed(() => props.mode === 'console')
const existingRootId = computed(() =>
  String(props.existingRootId || route.query.existingRootId || '').trim()
)
const isDirectActivation = computed(() =>
  isConsoleMode.value && Boolean(existingRootId.value)
)
const kitchenEditTo = (target: { id?: string; slug?: string } | null | undefined) => {
  const locator = String(target?.slug || target?.id || '').trim()
  return locator ? `/kitchens/${encodeURIComponent(locator)}/edit` : '/kitchens'
}
const publicEditTo = computed(() =>
  kitchenEditTo(
    successResult.value ||
      (existingId.value
        ? { id: existingId.value, slug: existingEditLocator.value || undefined }
        : null)
  )
)
const resolvedReturnTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit

  const queryValue = String(route.query.returnTo || '').trim()
  if (queryValue.startsWith('/')) return queryValue

  return isConsoleMode.value ? '/console/kitchen' : publicEditTo.value
})
const primarySuccessTo = computed(() =>
  isConsoleMode.value ? resolvedReturnTo.value : publicEditTo.value
)
const primarySuccessLabel = computed(() =>
  isConsoleMode.value ? 'Go to console' : 'Edit kitchen'
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
const directActivationTitle = computed(() => {
  if (error.value) return 'Console activation failed'
  if (directActivationComplete.value) return 'Console ready'
  if (activatingExisting.value) return 'Creating console'
  return 'Preparing console'
})
const directActivationDescription = computed(() => {
  if (error.value) return 'Check the kitchen still exists, then try again.'
  if (directActivationComplete.value) return 'Opening the kitchen overview.'
  if (!isReady.value) return 'Checking your signed-in session.'
  return 'Connecting this kitchen to your console.'
})
const directActivationIcon = computed(() =>
  error.value
    ? 'i-lucide-circle-alert'
    : directActivationComplete.value
      ? 'i-lucide-circle-check'
      : 'i-lucide-loader-circle'
)
const directActivationIconClass = computed(() =>
  !error.value && !directActivationComplete.value ? 'animate-spin text-primary' : ''
)

function createAnotherKitchen() {
  error.value = null
  successResult.value = null
  existingId.value = null
  existingEditLocator.value = null
  directActivationComplete.value = false
  directActivationStartedId.value = ''
}

async function linkKitchenToChef(kitchenId: string) {
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

async function activateExistingKitchenConsole(rootId: string) {
  const id = String(rootId || '').trim()
  if (!id || activatingExisting.value) return
  if (directActivationStartedId.value === id) return

  error.value = null
  successResult.value = null
  existingId.value = null
  existingEditLocator.value = null
  activatingExisting.value = true
  directActivationComplete.value = false
  directActivationStartedId.value = id

  try {
    const result = await createKitchenConsole({ id }, { existingRootId: id })
    await linkKitchenToChef(result.id)
    selectKitchen(result.id)
    successResult.value = result
    directActivationComplete.value = true

    if (route.path !== resolvedReturnTo.value) {
      await router.push(resolvedReturnTo.value)
    }
  } catch (e) {
    directActivationStartedId.value = ''
    error.value = e instanceof Error ? e.message : 'Unable to create kitchen console'
  } finally {
    activatingExisting.value = false
  }
}

watch(
  [isDirectActivation, existingRootId, isReady, uid],
  ([shouldActivate, rootId, ready, currentUid]: [
    boolean,
    string,
    boolean,
    string | null,
  ]) => {
    if (!import.meta.client || !shouldActivate) return
    if (!ready) return
    if (!currentUid) {
      error.value = 'Sign in to create a kitchen console'
      return
    }

    void activateExistingKitchenConsole(rootId)
  },
  { immediate: true }
)

async function onPlaceConfirmed(payload: { placeId: string; place: PlaceUpsertInput }) {
  error.value = null
  successResult.value = null
  existingId.value = null
  existingEditLocator.value = null

  try {
    const id = payload.placeId
    const place = payload.place
    let placeForRecord = place

    await ensurePlaceExists(placeForRecord)

    const placeSnap = await getDoc(doc(db, PlaceStorage.collection, id))
    if (placeSnap.exists()) {
      const stored = placeSnap.data() as Record<string, any>
      placeForRecord = {
        ...place,
        ...stored,
        id,
      }
    }

    const create = isConsoleMode.value ? createKitchenConsole : createKitchen
    const result = await create({
      id,
      place: placeForRecord,
    })

    if (isConsoleMode.value) {
      await linkKitchenToChef(result.id)
      selectKitchen(result.id)
      successResult.value = result
      if (route.path !== resolvedReturnTo.value) {
        await router.push(resolvedReturnTo.value)
      }
      return
    }

    if (!result.createdRoot) {
      existingId.value = result.id
      existingEditLocator.value = result.slug || result.id
      const editTo = kitchenEditTo(result)
      if (route.path !== editTo) {
        await router.push(editTo)
      }
      return
    }

    successResult.value = result
    const editTo = kitchenEditTo(result)
    if (route.path !== editTo) {
      await router.push(editTo)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unable to create kitchen'
  }
}
</script>
