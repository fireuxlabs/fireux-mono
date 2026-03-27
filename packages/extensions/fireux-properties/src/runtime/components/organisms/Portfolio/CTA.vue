<template>
  <ConsoleEntityCTA
    title="Portfolio console"
    entity="portfolio"
    console-to="/console/portfolio/overview"
    my-label="My Portfolio Consoles"
    test-label="Test Portfolio"
    read-only-label="Read-only Portfolios"
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
          <div v-if="livePills.length" class="space-y-2">
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
          block
          variant="subtle"
          color="primary"
          :icon="isSignedIn ? 'i-lucide-plus' : 'i-lucide-log-in'"
          @click="createPortfolio"
        >
          {{ createCopy.label }}
        </UButton>
      </div>
    </template>

    <template #testNote>
      <li>Available without sign-in.</li>
      <li>Sign in to save your progress.</li>
      <li>Signed out uses an app-branded portfolio test identity. Signed in uses your user identity when available.</li>
      <li>Uses the shared portfolio test runtime instead of a live portfolio you operate.</li>
    </template>

    <template #test>
          <PortfolioCardsPill
            :to="''"
            :title="testPortfolioIdentity.title"
            :subtitle="testPortfolioIdentity.subtitle"
            :image-url="testPortfolioIdentity.imageUrl"
            :action="true"
            :show-badges="false"
            @action="goToPortfolio('test')"
          />
    </template>

    <template #readOnly>
          <div v-if="readOnlyPills.length" class="space-y-2">
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
            No read-only portfolios.
          </p>
    </template>

    <template #readOnlyNote>
      <li>Uses a selected read-only scenario id.</li>
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
import { resolveConsoleCreateCopy } from 'fireux-core/runtime/composables/fireux/app/ui/console-create-copy'
import { resolveConsoleTestIdentity } from 'fireux-core/runtime/composables/fireux/app/ui/console-test-identity'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { getReadOnlyPortfolioScenarioList } from '../../../composables/fireux/app/portfolio-runtime/read-only-scenarios'
import type { RuntimePortfolioMode } from '../../../composables/fireux/app/portfolio-runtime/shared'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioFetch } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import type { PortfolioApp } from '../../../models/portfolio.model'
import PortfolioCardsPill from './Cards/Pill.vue'

const props = withDefaults(defineProps<{
  createSurface?: 'public' | 'console'
}>(), {
  createSurface: 'public',
})

const route = useRoute()
const router = useRouter()
const { runtimePortfolioId, setRuntimePortfolio } = useRuntimePortfolioSelection()
const { portfolios } = usePortfolioFetch()
const { pill } = usePortfolioInterface()
const { uid } = useAuth()
const { currentUser, avatarSrc } = useUser()
const { appId, appLogo, appThumbnail } = useFireUXConfig()
const { firestoreFetchCollection } = useFirestoreRead()
const portfolioOverlays = appId
  ? firestoreFetchCollection<PortfolioApp>(`apps/${appId}/portfolios`)
  : null
const isSignedIn = computed(() => Boolean(String(uid.value || '').trim()))
const createCopy = computed(() =>
  resolveConsoleCreateCopy({
    entityLabel: 'portfolio',
    createSurface: props.createSurface,
    signedIn: isSignedIn.value,
    publicPath: '/portfolios/create',
    consolePath: '/console/portfolio/create',
  })
)
const testPortfolioIdentity = computed(() =>
  resolveConsoleTestIdentity({
    entityLabel: 'Portfolio',
    signedIn: isSignedIn.value,
    appAvatarUrl: appLogo || appThumbnail || '/img/app/logo.png',
    userDisplayName: currentUser.value?.display_name,
    userAvatarUrl: avatarSrc.value,
    userSubtitle: 'Personal portfolio test workspace',
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

const goToPortfolio = async (mode: RuntimePortfolioMode, portfolioId?: string) => {
  if (mode === 'live' && !isSignedIn.value) {
    await router.push(signInPath.value)
    return
  }

  const fallback = String(runtimePortfolioId.value || '').trim()
  const resolvedId = String(portfolioId || fallback).trim()
  setRuntimePortfolio({ portfolioId: resolvedId, mode })
  await router.push('/console/portfolio/overview')
}

const createPortfolio = async () => {
  if (!isSignedIn.value) {
    await router.push(signInPath.value)
    return
  }

  await router.push(createCopy.value.createPath)
}
</script>
