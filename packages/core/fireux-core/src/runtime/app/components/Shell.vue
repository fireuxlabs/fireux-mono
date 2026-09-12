<!-- FILE: packages/core/fireux-core/src/runtime/app/components/Shell.vue -->
<!-- Concurrent edit — 2026-07-20 15:50 CEST — Repo Efficiency Pass 1 of 6: resolve initialization through a narrow background DTO. -->
<template>
  <UApp>
    <!-- App content -->
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <ClientOnly>
      <Teleport to="body">
        <div
          v-if="isDev"
          class="pointer-events-none select-none"
          :style="devDockShellStyle"
        >
          <div class="pointer-events-auto mb-2 flex items-center gap-2">
            <div
              v-if="panelOpen"
              class="flex items-center gap-1 rounded-full border border-default bg-elevated/95 px-2 py-1 shadow-lg backdrop-blur"
            >
              <UTooltip text="Open /dev" :popper="{ placement: 'top' }">
                <UButton
                  aria-label="Open dev page"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-terminal"
                  @click="goToDev()"
                />
              </UTooltip>

              <UTooltip :text="mediaSyncTooltip" :popper="{ placement: 'top' }">
                <UButton
                  aria-label="Sync App media"
                  size="xs"
                  variant="ghost"
                  :color="mediaSyncColor"
                  :icon="mediaSyncIcon"
                  :loading="mediaSyncPending"
                  :disabled="mediaSyncPending"
                  @click="syncRuntimeMedia()"
                />
              </UTooltip>

              <UTooltip
                :text="
                  supportsInlineNotes
                    ? notesVisible
                      ? 'Hide developer notes'
                      : 'Show developer notes'
                    : 'No developer notes on this page yet'
                "
                :popper="{ placement: 'top' }"
              >
                <UButton
                  :aria-label="
                    supportsInlineNotes
                      ? notesVisible
                        ? 'Hide developer notes'
                        : 'Show developer notes'
                      : 'No developer notes on this page yet'
                  "
                  size="xs"
                  variant="ghost"
                  :color="
                    supportsInlineNotes && notesVisible ? 'warning' : 'neutral'
                  "
                  :icon="
                    notesVisible
                      ? 'i-lucide-file-text'
                      : 'i-lucide-file-minus-2'
                  "
                  :disabled="!supportsInlineNotes"
                  @click="toggleNotes()"
                />
              </UTooltip>

              <UTooltip
                :text="
                  canCopyNotes
                    ? copiedNotes
                      ? 'Copied developer notes'
                      : 'Copy visible developer notes'
                    : 'Show developer notes to copy them'
                "
                :popper="{ placement: 'top' }"
              >
                <UButton
                  :aria-label="
                    canCopyNotes
                      ? 'Copy visible developer notes'
                      : 'Show developer notes to copy them'
                  "
                  size="xs"
                  variant="ghost"
                  :color="copiedNotes ? 'success' : 'neutral'"
                  :icon="copiedNotes ? 'i-lucide-check' : 'i-lucide-copy'"
                  :disabled="!canCopyNotes"
                  @click="copyVisibleNotes()"
                />
              </UTooltip>

              <UTooltip
                text="Collapse dev controls"
                :popper="{ placement: 'top' }"
              >
                <UButton
                  aria-label="Collapse dev controls"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-chevron-down"
                  @click="togglePanel()"
                />
              </UTooltip>
            </div>

            <UTooltip
              :text="
                panelOpen ? 'Collapse dev controls' : 'Expand dev controls'
              "
              :popper="{ placement: 'top' }"
            >
              <UButton
                :aria-label="
                  panelOpen ? 'Collapse dev controls' : 'Expand dev controls'
                "
                size="xs"
                variant="ghost"
                color="warning"
                icon="i-lucide-flame"
                class="opacity-90 hover:opacity-100"
                style="color: var(--fx-fireux-yellow)"
                @click="togglePanel()"
              />
            </UTooltip>
          </div>
        </div>
      </Teleport>
    </ClientOnly>

    <!-- Blocker until app is initialized -->
    <!-- Render only after app doc resolves.
         This avoids a brief modal flash while the app payload is still loading. -->
    <ClientOnly>
      <UModal
        v-if="showOnboardingModal"
        :open="showOnboardingModal"
        :dismissible="false"
        prevent-close
        title="🚫 Blocked"
        :description="setupDescription"
      >
        <template #body>
          <AppInitializeSystem />
        </template>
      </UModal>
    </ClientOnly>
  </UApp>
</template>

<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue'
import { useRouter } from 'vue-router'
import { useHead, useRuntimeConfig } from '#imports'
import { useFireUXConfig } from '../composables/config/FireUXConfig'
import { useColorMode } from '../../composables/theme/useColorMode'
import { useDevUi } from '../../composables/dev/useDevUi'
import AppInitializeSystem from './Initialize/System.vue'
import { useAppRead } from '../composables/useAppRead'
import { syncAppMediaToStorage } from '../composables/firestore/utils/appMediaSync'
import { withBuildVersion } from '../../utils/buildVersionUrl'

const isDev = import.meta.dev
const router = useRouter()
const fireuxConfig = useFireUXConfig()
const runtimeConfig = useRuntimeConfig()
const manifestHref = withBuildVersion(
  '/manifest.webmanifest',
  runtimeConfig.app?.buildId
)
// App shell owns global colour-mode activation; components should only consume resolved mode.
useColorMode()
const {
  panelOpen,
  notesVisible,
  supportsInlineNotes,
  toggleNotes,
  togglePanel,
} = useDevUi()
const copiedNotes = ref(false)
const mediaSyncPending = ref(false)
const mediaSyncState = ref<'idle' | 'success' | 'error'>('idle')
const mediaSyncTooltip = computed(() => {
  if (mediaSyncPending.value) return 'Syncing App media'
  if (mediaSyncState.value === 'success') return 'App media synced'
  if (mediaSyncState.value === 'error') return 'App media sync failed'
  return 'Sync App media'
})
const mediaSyncColor = computed(() => {
  if (mediaSyncState.value === 'success') return 'success' as const
  if (mediaSyncState.value === 'error') return 'error' as const
  return 'neutral' as const
})
const mediaSyncIcon = computed(() => {
  if (mediaSyncState.value === 'success') return 'i-lucide-check'
  if (mediaSyncState.value === 'error') return 'i-lucide-triangle-alert'
  return 'i-lucide-cloud-upload'
})
const canCopyNotes = computed(
  () => supportsInlineNotes.value && notesVisible.value
)
const devDockShellStyle: CSSProperties = {
  position: 'fixed',
  left: '50vw',
  bottom: 'max(0px, env(safe-area-inset-bottom))',
  transform: 'translateX(calc(-200% - 6rem))',
  zIndex: 2147483647,
}

const { exists: appExists } = useAppRead(fireuxConfig.appId)
const setupDescription = 'This App needs to be initialized.'

const showOnboardingModal = computed(() => appExists.value === false)

useHead({
  meta: fireuxConfig.isTenant
    ? [{ name: 'robots', content: 'noindex, nofollow' }]
    : [],
  link: [{ key: 'fireux-manifest', rel: 'manifest', href: manifestHref }],
})

function goToDev() {
  router.push('/dev')
}

async function syncRuntimeMedia() {
  if (mediaSyncPending.value) return

  mediaSyncPending.value = true
  mediaSyncState.value = 'idle'
  try {
    const result = await syncAppMediaToStorage()
    mediaSyncState.value = result.failed.length ? 'error' : 'success'
    if (result.failed.length) {
      console.error('[AppShell] App media sync failed', result.failed)
    }
  } catch (error) {
    mediaSyncState.value = 'error'
    console.error('[AppShell] App media sync failed', error)
  } finally {
    mediaSyncPending.value = false
  }
}

async function copyVisibleNotes() {
  if (!canCopyNotes.value || !import.meta.client) return

  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>('[data-dev-note]')
  )
  const notes = nodes
    .map((node) => {
      const title = String(node.dataset.devNoteTitle || '').trim()
      const bodyNode = node.querySelector<HTMLElement>('[data-dev-note-body]')
      const body = String(bodyNode?.innerText || node.innerText || '')
        .replace(/^Developer Note\s*/i, '')
        .trim()

      if (!body) return ''
      return title ? `${title}\n${body}` : body
    })
    .filter(Boolean)

  if (!notes.length) return

  await navigator.clipboard.writeText(notes.join('\n\n'))
  copiedNotes.value = true
  window.setTimeout(() => {
    copiedNotes.value = false
  }, 1500)
}
</script>
