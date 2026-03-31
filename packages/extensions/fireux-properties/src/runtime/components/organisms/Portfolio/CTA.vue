<template>
  <ConsoleEntityCTA
    title="Portfolio console"
    entity="portfolio"
    console-to="/console/portfolio/overview"
    my-label=""
    :read-only-label="showBundledReadOnly ? '' : 'Demo Portfolios'"
    :collapse-secondary-modes="collapseSecondaryModes"
    learn-more-to="/portfolios/learn-more"
  >
    <template #myNote>
      <li>Requires sign-in.</li>
      <li>The live list only includes portfolios you can operate.</li>
      <li>{{ createActionNote }}</li>
      <li>{{ createActionMeaning }}</li>
    </template>

    <template #my>
      <div class="space-y-2">
        <template v-if="isSignedIn">
          <div v-if="showBundledLive && bundledLivePortfolioPill" class="space-y-2">
            <ConsoleBundleEntry
              v-bind="bundledLivePortfolioPill"
              @action="goToPortfolio('live')"
              @secondary-action="createPortfolio"
            />
          </div>
          <div v-else-if="livePills.length" class="space-y-2">
            <PortfolioCardsPill
              v-for="item in livePills"
              :key="item.id"
              :to="''"
              :title="item.title"
              :subtitle="item.subtitle"
              :badges="item.badges"
              :action="true"
              @action="goToPortfolio('live', item.id)"
            />
          </div>
          <p v-else class="text-sm text-dimmed">
            No portfolio consoles yet.
          </p>
        </template>
        <p v-else class="text-sm text-dimmed">
          Sign in to see your portfolio consoles and create one.
        </p>
        <UButton
          v-if="!showBundledLive || !bundledLivePortfolioPill"
          block
          variant="subtle"
          color="primary"
          :icon="createCopy.limitReached ? 'i-lucide-lock' : (isSignedIn ? 'i-lucide-plus' : 'i-lucide-log-in')"
          :disabled="createCopy.disabled"
          @click="createPortfolio"
        >
          {{ createCopy.label }}
        </UButton>
      </div>
    </template>

    <template #readOnly>
          <div
            v-if="showPremiumPreviewToggle"
            class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2"
          >
            <div class="space-y-1">
              <p class="text-sm font-medium">View as premium</p>
              <p class="text-xs text-dimmed">
                Preview the grouped premium operator view for demo portfolios.
              </p>
            </div>
            <USwitch v-model="premiumPreviewEnabled" />
          </div>

          <div v-if="showBundledReadOnly && bundledReadOnlyPill" class="space-y-2">
            <ConsoleBundleEntry
              v-bind="bundledReadOnlyPill"
              @action="goToPortfolio('read-only')"
            />
          </div>
          <div v-else-if="readOnlyPills.length" class="space-y-2">
            <PortfolioCardsPill
              v-for="item in readOnlyPills"
              :key="item.id"
              v-bind="item"
              :link="false"
              :action="true"
              :show-badges="false"
              class="cursor-pointer"
              @action="goToPortfolio('read-only', item.id)"
            />
          </div>
          <p v-else class="text-sm text-dimmed">
            No demo portfolios.
          </p>
    </template>

    <template #readOnlyNote>
      <li>Uses a selected demo scenario id.</li>
      <li>Available without sign-in.</li>
      <li>Scenarios do not require live portfolio console authority.</li>
    </template>

    <template #default>
      <img
        src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="Portfolio operations"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      />
    </template>
  </ConsoleEntityCTA>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import { computed } from 'vue'
import ConsoleEntityCTA from 'fireux-core/runtime/components/entities/console/ConsoleEntityCTA.vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { resolveConsoleEntryPath } from 'fireux-core/runtime/composables/fireux/app/ui/console-entry-routing'
import { resolveConsoleCreateCopy } from 'fireux-core/runtime/composables/fireux/app/ui/console-create-copy'
import { useConsoleFamilyAccess } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleFamilyAccess'
import { useConsoleEntryState } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleEntryState'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import ConsoleBundleEntry from 'fireux-core/runtime/components/entities/console/ConsoleBundleEntry.vue'
import { getReadOnlyPortfolioScenarioList } from '../../../composables/fireux/app/portfolio-runtime/read-only-scenarios'
import type { RuntimePortfolioMode } from '../../../composables/fireux/app/portfolio-runtime/shared'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioFetch } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import type { ConsolePortfolio } from '../../../models/portfolio.model'
import PortfolioCardsPill from './Cards/Pill.vue'

const props = withDefaults(defineProps<{
  createSurface?: 'public' | 'console'
}>(), {
  createSurface: 'public',
})

const route = useRoute()
const router = useRouter()
const { setRuntimePortfolio } = useRuntimePortfolioSelection()
const { portfolios } = usePortfolioFetch()
const { pill } = usePortfolioInterface()
const { uid, isSignedIn } = useConsoleEntryState()
const { currentUser, avatarSrc, canOwnMultipleConsoles } = useUser()
const { appId, appLogo, appThumbnail } = useFireUXConfig()
const { firestoreFetchCollection } = useFirestoreRead()
const portfolioOverlays = appId
  ? firestoreFetchCollection<ConsolePortfolio>(`apps/${appId}/portfolios`)
  : null
const createCopy = computed(() =>
  resolveConsoleCreateCopy({
    entityLabel: 'portfolio',
    createSurface: props.createSurface,
    signedIn: isSignedIn.value,
    ownedCount: livePills.value.length,
    canOwnMultipleConsoles: canOwnMultipleConsoles.value,
    publicPath: '/portfolios/create',
    consolePath: '/console/portfolio/create',
  })
)
const signInPath = computed(() => `/auth?redirect=${encodeURIComponent(route.fullPath)}`)
const createActionNote = computed(() => createCopy.value.note)
const createActionMeaning = computed(() => createCopy.value.meaning)

const accessiblePortfolioIds = computed(() => {
  const currentUid = String(uid.value || '').trim()
  if (!currentUid) return new Set<string>()

  const ids = new Set<string>()

  for (const overlay of portfolioOverlays?.value ?? []) {
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

  return ids
})

const livePills = computed(() =>
  (portfolios.value ?? [])
    .filter((entry) =>
      accessiblePortfolioIds.value.has(String((entry as any)?.id || '').trim())
    )
    .map((entry) => pill(entry))
    .filter((entry): entry is NonNullable<ReturnType<typeof pill>> => Boolean(entry))
)

const readOnlyScenarios = computed(() =>
  getReadOnlyPortfolioScenarioList()
    .map((entry) => ({
      id: String(entry.id || '').trim(),
      name: String(entry.name || '').trim(),
      subtitle: String(entry.manager_display_name || '').trim(),
      imageUrl: String(entry.manager_avatar_url || entry.image_url || '').trim(),
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

const {
  premiumPreviewEnabled,
  showPremiumPreviewToggle,
  showBundledLive,
  liveBundleTitle,
  liveBundleSubtitle,
  showBundledReadOnly,
  readOnlyBundleTitle,
  readOnlyBundleSubtitle,
} = useConsoleFamilyAccess({
  entityKey: 'portfolio',
  singularNoun: 'portfolio',
  pluralNoun: 'portfolios',
  ownerName: computed(() => currentUser.value?.display_name),
  signedIn: isSignedIn,
  isPremium: canOwnMultipleConsoles,
  liveCount: computed(() => livePills.value.length),
  readOnlyCount: computed(() => readOnlyPills.value.length),
})
const collapseSecondaryModes = computed(
  () => canOwnMultipleConsoles.value && livePills.value.length > 0
)

const bundledLivePortfolioPill = computed(() => {
  if (!showBundledLive.value) return null

  const firstPortfolio = livePills.value[0]

  return {
    id: 'my-live-portfolios',
    title: liveBundleTitle.value,
    subtitle: liveBundleSubtitle.value,
    imageUrl: String(avatarSrc.value || '').trim(),
    secondaryActionLabel:
      createCopy.value.disabled ? '' : createCopy.value.label,
    previewItems: livePills.value.slice(0, 4).map((item) => ({
      title: item.title,
      imageUrl: item.imageUrl,
    })),
  }
})

const bundledReadOnlyPill = computed(() => {
  if (!showBundledReadOnly.value) return null

  const firstScenario = readOnlyScenarios.value[0]

  return {
    id: 'my-read-only-portfolios',
    title: readOnlyBundleTitle.value,
    subtitle: readOnlyBundleSubtitle.value,
    imageUrl: String(appLogo || appThumbnail || '/img/app/logo.png').trim(),
    previewItems: readOnlyScenarios.value.slice(0, 4).map((item) => ({
      title: item.name,
      imageUrl: item.imageUrl,
    })),
  }
})

const goToPortfolio = async (mode: RuntimePortfolioMode, portfolioId?: string) => {
  if (mode === 'read-only') {
    const resolvedId = String(portfolioId || '').trim()
    setRuntimePortfolio({ mode: 'read-only', portfolioId: resolvedId })
    await router.push(resolveConsoleEntryPath('/console/portfolio', 'read-only', resolvedId))
    return
  }

  if (mode === 'live' && !isSignedIn.value) {
    await router.push(signInPath.value)
    return
  }

  const resolvedId = String(portfolioId || '').trim()
  setRuntimePortfolio({ portfolioId: resolvedId, mode })
  await router.push('/console/portfolio/overview')
}

const createPortfolio = async () => {
  if (!isSignedIn.value) {
    await router.push(signInPath.value)
    return
  }

  if (createCopy.value.disabled) return

  await router.push(createCopy.value.createPath)
}
</script>
