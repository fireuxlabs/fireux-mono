<template>
  <ConsoleEntityCTA
    title="Kitchen console"
    entity="kitchen"
    console-to="/console/kitchen/overview"
    my-label="My Kitchen Consoles"
    test-label="Test Kitchen"
    read-only-label="Read-only Kitchens"
    learn-more-to="/kitchens/learn-more"
  >
    <template #myNote>
      <li>The live list only includes kitchens you can operate.</li>
      <li>
        {{ createActionLabel }} ensures a Chef profile, then routes to
        <code>{{ createPath }}</code>.
      </li>
      <li>{{ createActionMeaning }}</li>
    </template>

    <template #testNote>
      <li>Uses the shared kitchen test runtime instead of a live kitchen you operate.</li>
    </template>

    <template #my>
      <div class="space-y-2">
        <KitchenCardsPill
          v-for="item in liveKitchenPills"
          v-if="liveKitchenPills.length"
          :key="item.id"
          v-bind="item"
          :link="false"
          :action="true"
          :show-badges="false"
          class="cursor-pointer"
          @action="goToKitchen('live', item.id)"
        />
        <p v-else class="text-sm text-dimmed">
          No kitchen consoles yet.
        </p>
        <UButton
          block
          variant="subtle"
          color="primary"
          icon="i-lucide-plus"
          :loading="isEnsuringLiveKitchen"
          @click="createKitchen"
        >
          {{ createActionLabel }}
        </UButton>
      </div>
    </template>

    <template #test>
          <KitchenCardsPill
            v-bind="testKitchenPill"
            :link="false"
            :action="true"
            :show-badges="false"
            class="cursor-pointer"
            @action="goToKitchen('test')"
          />
    </template>

    <template #readOnly>
          <div v-if="readOnlyPills.length" class="space-y-2">
            <KitchenCardsPill
              v-for="item in readOnlyPills"
              :key="item.id"
              v-bind="item"
              :link="false"
              :action="true"
              :show-badges="false"
              class="cursor-pointer"
              @action="goToKitchen('read-only', item.id)"
            />
          </div>
          <p v-else class="text-sm text-dimmed">
            No read-only kitchens.
          </p>
    </template>

    <template #readOnlyNote>
      <li>Uses a selected read-only scenario id.</li>
      <li>Scenarios do not require live kitchen console authority.</li>
    </template>

    <template #default>
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="Kitchen"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      />
    </template>
  </ConsoleEntityCTA>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import { computed, ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import ConsoleEntityCTA from 'fireux-core/runtime/components/entities/console/ConsoleEntityCTA.vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { getReadOnlyKitchenScenarioList } from '../../../composables/fireux/app/kitchen-runtime/read-only-scenarios'
import type { RuntimeKitchenMode } from '../../../composables/fireux/app/kitchen-runtime/shared'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useChefCreate } from '../../../composables/fireux/firestore/profiles/Chef/main/useChefCreate'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenApp } from '../../../models/kitchen.model'
import KitchenCardsPill from './Cards/Pill.vue'

const props = withDefaults(defineProps<{
  createSurface?: 'public' | 'console'
}>(), {
  createSurface: 'public',
})

const { kitchens } = useKitchenFetch()
const { pill: kitchenPill } = useKitchenInterface()
const { currentUser, avatarSrc } = useUser()
const { uid } = useAuth()
const { appId } = useFireUXConfig()
const { firestoreFetchCollection } = useFirestoreRead()

const kitchenOverlays = appId
  ? firestoreFetchCollection<KitchenApp>(`apps/${appId}/kitchens`)
  : null

const testChefName = computed(() => String(currentUser.value?.display_name || '').trim())

const testKitchenTitle = computed(() => {
  const name = testChefName.value
  if (!name) return 'Test Kitchen'
  return /s$/i.test(name) ? `${name}' Test Kitchen` : `${name}'s Test Kitchen`
})

const testKitchenPill = computed(() => ({
  id: 'test-kitchen',
  to: '',
  title: testKitchenTitle.value,
  subtitle: 'Experimental kitchen stack',
  imageUrl: avatarSrc.value || '',
}))

const accessibleKitchenIds = computed(() => {
  const currentUid = String(uid.value || '').trim()
  if (!currentUid) return new Set<string>()

  const ids = new Set<string>()

  for (const overlay of kitchenOverlays?.value ?? []) {
    const id = String((overlay as any)?.id || '').trim()
    if (!id) continue
    if ((overlay as any)?.console_enabled === false) continue

    const adminIds = Array.isArray((overlay as any)?.admin_ids)
      ? (overlay as any).admin_ids
          .map((value: unknown) => String(value || '').trim())
          .filter(Boolean)
      : []

    if (adminIds.includes(currentUid)) {
      ids.add(id)
    }
  }

  for (const kitchen of kitchens.value ?? []) {
    const id = String((kitchen as any)?.id || '').trim()
    const claimedBy = String((kitchen as any)?.claimed_by || '').trim()
    if (id && claimedBy === currentUid) {
      ids.add(id)
    }
  }

  return ids
})

const liveKitchenPills = computed(() =>
  (kitchens.value ?? [])
    .filter((entry) =>
      accessibleKitchenIds.value.has(String((entry as any)?.id || '').trim())
    )
    .map((entry) => kitchenPill(entry))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
)

const readOnlyScenarios = computed(() =>
  getReadOnlyKitchenScenarioList()
    .map((entry) => ({
      id: String(entry.id || '').trim(),
      name: String(entry.name || '').trim(),
      subtitle: String(entry.address_label || '').trim(),
      imageUrl: String(entry.image_url || '').trim(),
    }))
    .filter((entry) => Boolean(entry.id))
)

const readOnlyPills = computed(() =>
  readOnlyScenarios.value.map((entry) => ({
    id: entry.id,
    to: '',
    title: entry.name,
    subtitle: entry.subtitle,
    imageUrl: entry.imageUrl,
  }))
)

const router = useRouter()
const route = useRoute()
const { runtimeKitchenId, setRuntimeKitchen } = useRuntimeKitchenSelection()
const { ensureChefProfile } = useChefCreate()
const isEnsuringLiveKitchen = ref(false)
const isConsoleCreateSurface = computed(() => props.createSurface === 'console')
const createPath = computed(() =>
  isConsoleCreateSurface.value ? '/console/kitchen/create' : '/kitchens/create'
)
const createActionLabel = computed(() => 'Create kitchen')
const createActionMeaning = computed(() =>
  isConsoleCreateSurface.value
    ? 'It creates the kitchen console overlay and creates the public kitchen only if it does not already exist.'
    : 'It creates the public kitchen first, not the console overlay directly.'
)

const ensureLiveKitchenProfile = async () => {
  if (isEnsuringLiveKitchen.value) return false
  isEnsuringLiveKitchen.value = true

  try {
    await ensureChefProfile()
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? '')

    if (message.includes('[ensure] Missing authenticated user')) {
      await router.push(`/auth?redirect=${encodeURIComponent(route.fullPath)}`)
      return false
    }

    if (import.meta.dev) {
      console.error('[KitchenCTA] failed to ensure chef profile before live kitchen entry', error)
    }
    return false
  } finally {
    isEnsuringLiveKitchen.value = false
  }
}

const goToKitchen = async (mode: RuntimeKitchenMode, kitchenId?: string) => {
  if (mode === 'live') {
    const ready = await ensureLiveKitchenProfile()
    if (!ready) return
  }

  const fallback = String(runtimeKitchenId.value || '').trim()
  const resolvedId = String(kitchenId || fallback).trim()
  setRuntimeKitchen({ mode, kitchenId: resolvedId })
  await router.push('/console/kitchen/overview')
}

const createKitchen = async () => {
  const ready = await ensureLiveKitchenProfile()
  if (!ready) return
  await router.push(createPath.value)
}

</script>
