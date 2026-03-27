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
      <li>Requires sign-in.</li>
      <li>The live list only includes kitchens you can operate.</li>
      <li>{{ createActionNote }}</li>
      <li>{{ createActionMeaning }}</li>
    </template>

    <template #testNote>
      <li>Available without sign-in.</li>
      <li>Sign in to save your progress.</li>
      <li>Signed out uses an app-branded kitchen test identity. Signed in prefers Chef identity, then user identity.</li>
      <li>Test mode does not require a Chef profile. Chef gating is only for live kitchen entry.</li>
      <li>Uses the shared kitchen test runtime instead of a live kitchen you operate.</li>
    </template>

    <template #my>
      <div class="space-y-2">
        <template v-if="isSignedIn">
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
        </template>
        <p v-else class="text-sm text-dimmed">
          Sign in to see your kitchen consoles and create one.
        </p>
        <UButton
          block
          variant="subtle"
          color="primary"
          :icon="isSignedIn ? 'i-lucide-plus' : 'i-lucide-log-in'"
          :loading="isSignedIn ? isEnsuringLiveKitchen : false"
          @click="createKitchen"
        >
          {{ createCopy.label }}
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
      <li>Available without sign-in.</li>
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
import { resolveConsoleCreateCopy } from 'fireux-core/runtime/composables/fireux/app/ui/console-create-copy'
import { resolveConsoleTestIdentity } from 'fireux-core/runtime/composables/fireux/app/ui/console-test-identity'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import ConsoleEntityCTA from 'fireux-core/runtime/components/entities/console/ConsoleEntityCTA.vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { getReadOnlyKitchenScenarioList } from '../../../composables/fireux/app/kitchen-runtime/read-only-scenarios'
import type { RuntimeKitchenMode } from '../../../composables/fireux/app/kitchen-runtime/shared'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useChefCreate } from '../../../composables/fireux/firestore/profiles/Chef/main/useChefCreate'
import { useChef } from '../../../composables/fireux/firestore/profiles/Chef/useChef'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenApp } from '../../../models/kitchen.model'
import KitchenCardsPill from './Cards/Pill.vue'

const props = withDefaults(defineProps<{
  createSurface?: 'public' | 'console'
}>(), {
  createSurface: 'public',
})

const toFirstWord = (value: unknown): string => {
  const text = String(value ?? '').trim()
  return text ? text.split(/\s+/)[0] || '' : ''
}

const toPossessiveKitchenTitle = (value: unknown): string => {
  const firstWord = toFirstWord(value)
  if (!firstWord) return 'Your Kitchen'
  return /s$/i.test(firstWord) ? `${firstWord}' Kitchen` : `${firstWord}'s Kitchen`
}

const { kitchens } = useKitchenFetch()
const { pill: kitchenPill } = useKitchenInterface()
const { currentUser, avatarSrc } = useUser()
const { uid } = useAuth()
const { appId, appLogo, appThumbnail } = useFireUXConfig()
const { firestoreFetchCollection } = useFirestoreRead()
const { interface: chefInterface } = useChef()

const kitchenOverlays = appId
  ? firestoreFetchCollection<KitchenApp>(`apps/${appId}/kitchens`)
  : null

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
const isSignedIn = computed(() => Boolean(String(uid.value || '').trim()))
const createCopy = computed(() =>
  resolveConsoleCreateCopy({
    entityLabel: 'kitchen',
    createSurface: props.createSurface,
    signedIn: isSignedIn.value,
    publicPath: '/kitchens/create',
    consolePath: '/console/kitchen/create',
  })
)
const chefCard = computed(() => chefInterface())
const testKitchenIdentity = computed(() =>
  resolveConsoleTestIdentity({
    entityLabel: 'Kitchen',
    signedIn: isSignedIn.value,
    appAvatarUrl: appLogo || appThumbnail || '/img/app/logo.png',
    userDisplayName: currentUser.value?.display_name,
    userAvatarUrl: avatarSrc.value,
    profileDisplayName: chefCard.value?.displayName,
    profileAvatarUrl: chefCard.value?.avatarUrl,
    userSubtitle: 'Personal kitchen test workspace',
    profileSubtitle: 'Chef-led kitchen test workspace',
  })
)
const testKitchenPill = computed(() => ({
  id: 'test-kitchen',
  to: '',
  title:
    testKitchenIdentity.value.source === 'generic'
      ? testKitchenIdentity.value.title
      : toPossessiveKitchenTitle(
          chefCard.value?.displayName || currentUser.value?.display_name
        ),
  subtitle:
    testKitchenIdentity.value.source === 'generic'
      ? testKitchenIdentity.value.subtitle
      : 'My test kitchen',
  imageUrl: testKitchenIdentity.value.imageUrl,
}))
const signInPath = computed(() => `/auth?redirect=${encodeURIComponent(route.fullPath)}`)
const createActionNote = computed(() =>
  isSignedIn.value
    ? `Create ${createCopy.value.targetLabel} ensures a Chef profile, then routes to ${createCopy.value.createPath}.`
    : createCopy.value.note
)
const createActionMeaning = computed(() => createCopy.value.meaning)

const ensureAuthenticated = async () => {
  if (String(uid.value || '').trim()) return true
  await router.push(`/auth?redirect=${encodeURIComponent(route.fullPath)}`)
  return false
}

const ensureLiveKitchenProfile = async () => {
  const isSignedIn = await ensureAuthenticated()
  if (!isSignedIn) return false

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
  if (!isSignedIn.value) {
    await router.push(signInPath.value)
    return
  }

  const ready = await ensureLiveKitchenProfile()
  if (!ready) return
  await router.push(createCopy.value.createPath)
}

</script>
