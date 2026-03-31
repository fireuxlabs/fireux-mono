<template>
  <ConsoleEntityCTA
    title="Project console"
    entity="project"
    console-to="/console/projects/overview"
    my-label=""
    :read-only-label="showBundledReadOnly ? '' : 'Demo Projects'"
    :collapse-secondary-modes="collapseSecondaryModes"
    learn-more-to="/projects/learn-more"
  >
    <template #myNote>
      <li>Requires sign-in.</li>
      <li>The live list includes projects you own or can operate in this app.</li>
      <li>{{ createActionNote }}</li>
      <li>{{ createActionMeaning }}</li>
    </template>

    <template #my>
      <div class="space-y-2">
        <template v-if="isSignedIn">
          <div v-if="showBundledLive && bundledLiveProjectPill" class="space-y-2">
            <ConsoleBundleEntry
              v-bind="bundledLiveProjectPill"
              @action="goToProject('live')"
              @secondary-action="createProject"
            />
          </div>
          <div v-else-if="liveProjectCards.length" class="space-y-2">
            <ProjectCardsPill
              v-for="item in liveProjectCards"
              :key="item.id"
              :to="''"
              :image-url="item.imageUrl"
              :title="item.title"
              :subtitle="item.subtitle"
              :badges="item.badges"
              :action="true"
              @action="goToProject('live', item.id)"
            />
          </div>
          <p v-else class="text-sm text-dimmed">
            No project consoles yet.
          </p>
        </template>
        <p v-else class="text-sm text-dimmed">
          Sign in to see your project consoles and create one.
        </p>
        <UButton
          v-if="!showBundledLive || !bundledLiveProjectPill"
          block
          variant="subtle"
          color="primary"
          :icon="createCopy.limitReached ? 'i-lucide-lock' : (isSignedIn ? 'i-lucide-plus' : 'i-lucide-log-in')"
          :disabled="createCopy.disabled"
          @click="createProject"
        >
          {{ createCopy.label }}
        </UButton>
      </div>
    </template>

    <template #readOnlyNote>
      <li>Uses a selected demo scenario id.</li>
      <li>Available without sign-in.</li>
      <li>Scenarios do not require live project console authority.</li>
    </template>

    <template #readOnly>
      <div
        v-if="showPremiumPreviewToggle"
        class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2"
      >
        <div class="space-y-1">
          <p class="text-sm font-medium">View as premium</p>
          <p class="text-xs text-dimmed">
            Preview the grouped premium operator view for demo projects.
          </p>
        </div>
        <USwitch v-model="premiumPreviewEnabled" />
      </div>

      <div v-if="showBundledReadOnly && bundledReadOnlyPill" class="space-y-2">
        <ConsoleBundleEntry
          v-bind="bundledReadOnlyPill"
          @action="goToProject('read-only')"
        />
      </div>
      <div v-else-if="readOnlyScenarios.length" class="space-y-2">
        <ProjectCardsPill
          v-for="item in readOnlyScenarios"
          :key="item.id"
          :to="''"
          :title="item.name"
          :subtitle="item.label"
          :image-url="item.image_url"
          :link="false"
          :action="true"
          @action="goToProject('read-only', item.id)"
        />
      </div>
      <p v-else class="text-sm text-dimmed">
        No demo projects.
      </p>
    </template>

    <template #default>
      <img
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="Project operations"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      />
    </template>
  </ConsoleEntityCTA>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import { computed } from 'vue'
import type { RuntimeMode } from '../../../composables/fireux/runtime/runtime.types'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from '../../../composables/fireux/firestore/operations/useFirestoreRead'
import { getReadOnlyProjectScenarioList } from '../../../composables/fireux/app/runtime-project/read-only-scenarios/index'
import { useRuntimeProjectSelection } from '../../../composables/fireux/app/runtime-project/state'
import { useConsoleFamilyAccess } from '../../../composables/fireux/app/ui/useConsoleFamilyAccess'
import { resolveConsoleCreateCopy } from '../../../composables/fireux/app/ui/console-create-copy'
import { resolveConsoleEntryPath } from '../../../composables/fireux/app/ui/console-entry-routing'
import { useConsoleEntryState } from '../../../composables/fireux/app/ui/useConsoleEntryState'
import { useProjectCollection } from '../../../composables/fireux/firestore/system/project/fetch/useProjectCollection'
import type { ConsoleProject } from '../../../models/system/project.model'
import ConsoleEntityCTA from '../../entities/console/ConsoleEntityCTA.vue'
import ConsoleBundleEntry from '../../entities/console/ConsoleBundleEntry.vue'
import ProjectCardsPill from './Cards/Pill.vue'

const props = withDefaults(defineProps<{
  createSurface?: 'public' | 'console'
}>(), {
  createSurface: 'public',
})

const route = useRoute()
const router = useRouter()
const { setRuntimeProject } = useRuntimeProjectSelection()
const { projects } = useProjectCollection()
const { currentUser, avatarSrc, canOwnMultipleConsoles } = useUser()
const { isSignedIn } = useConsoleEntryState()
const { appId, appLogo, appThumbnail } = useFireUXConfig()
const { firestoreFetchCollection } = useFirestoreRead()
const projectOverlays = appId
  ? firestoreFetchCollection<ConsoleProject>(`apps/${appId}/projects`)
  : null
const createCopy = computed(() =>
  resolveConsoleCreateCopy({
    entityLabel: 'project',
    createSurface: props.createSurface,
    signedIn: isSignedIn.value,
    ownedCount: liveProjectCards.value.length,
    canOwnMultipleConsoles: canOwnMultipleConsoles.value,
    publicPath: '/projects/create',
    consolePath: '/console/projects/create',
  })
)
const signInPath = computed(() => `/auth?redirect=${encodeURIComponent(route.fullPath)}`)
const createActionNote = computed(() => createCopy.value.note)
const createActionMeaning = computed(() => createCopy.value.meaning)

const readOnlyScenarios = computed(() => getReadOnlyProjectScenarioList())
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
  entityKey: 'project',
  singularNoun: 'project',
  pluralNoun: 'projects',
  ownerName: computed(() => currentUser.value?.display_name),
  signedIn: isSignedIn,
  isPremium: canOwnMultipleConsoles,
  liveCount: computed(() => liveProjectCards.value.length),
  readOnlyCount: computed(() => readOnlyScenarios.value.length),
})
const collapseSecondaryModes = computed(
  () => canOwnMultipleConsoles.value && liveProjectCards.value.length > 0
)

const bundledLiveProjectPill = computed(() => {
  if (!showBundledLive.value) return null

  const firstProject = liveProjectCards.value[0]

  return {
    id: 'my-live-projects',
    title: liveBundleTitle.value,
    subtitle: liveBundleSubtitle.value,
    imageUrl: String(avatarSrc.value || '').trim(),
    secondaryActionLabel:
      createCopy.value.disabled ? '' : createCopy.value.label,
    previewItems: liveProjectCards.value.slice(0, 4).map((item) => ({
      title: item.title,
      imageUrl: item.imageUrl,
    })),
  }
})

const bundledReadOnlyPill = computed(() => {
  if (!showBundledReadOnly.value) return null

  const firstScenario = readOnlyScenarios.value[0]

  return {
    id: 'my-read-only-projects',
    title: readOnlyBundleTitle.value,
    subtitle: readOnlyBundleSubtitle.value,
    imageUrl: String(appLogo || appThumbnail || '/img/app/logo.png').trim(),
    previewItems: readOnlyScenarios.value.slice(0, 4).map((item) => ({
      title: String(item.name || '').trim(),
      imageUrl: String(item.image_url || '').trim(),
    })),
  }
})
const accessibleProjectIds = computed(() => {
  const currentUid = String(currentUser.value?.id || '').trim()
  if (!currentUid) return new Set<string>()

  const ids = new Set<string>()

  for (const overlay of projectOverlays?.value ?? []) {
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

  for (const project of projects.value ?? []) {
    const id = String((project as any)?.id || '').trim()
    const ownerUserId = String((project as any)?.owner_user_id || '').trim()
    if (id && ownerUserId === currentUid) {
      ids.add(id)
    }
  }

  return ids
})

const liveProjects = computed(() =>
  (projects.value ?? []).filter((entry) =>
    accessibleProjectIds.value.has(String((entry as any)?.id || '').trim())
  )
)

const liveProjectCards = computed(() =>
  liveProjects.value.map((entry) => ({
    id: String((entry as any)?.id || '').trim(),
    imageUrl: String((entry as any)?.image_url || '').trim(),
    title: String((entry as any)?.name || 'Project').trim(),
    subtitle: String((entry as any)?.slug || (entry as any)?.id || '').trim(),
    badges: [String((entry as any)?.status || 'active').trim()],
  }))
)

const goToProject = async (mode: RuntimeMode, projectId?: string) => {
  if (mode === 'read-only') {
    const resolvedId = String(projectId || '').trim()
    setRuntimeProject({ mode: 'read-only', projectId: resolvedId })
    await router.push(resolveConsoleEntryPath('/console/projects', 'read-only', resolvedId))
    return
  }

  if (mode === 'live' && !isSignedIn.value) {
    await router.push(signInPath.value)
    return
  }

  const resolvedId = String(projectId || '').trim()
  setRuntimeProject({ projectId: resolvedId, mode })
  await router.push('/console/projects/overview')
}

const createProject = async () => {
  if (!isSignedIn.value) {
    await router.push(signInPath.value)
    return
  }

  if (createCopy.value.disabled) return

  await router.push(createCopy.value.createPath)
}
</script>
