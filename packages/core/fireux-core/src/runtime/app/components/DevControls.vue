<template>
  <ClientOnly>
    <Teleport to="body">
      <div v-if="isDev" class="app-dev-controls">
        <div class="app-dev-controls__row">
          <div v-if="panelOpen" class="app-dev-controls__panel">
            <UTooltip text="Open /dev" :content="{ side: 'top' }">
              <UButton
                aria-label="Open dev page"
                size="xs"
                variant="ghost"
                color="neutral"
                icon="i-lucide-terminal"
                @click="goToDev()"
              />
            </UTooltip>

            <UTooltip :text="mediaSyncTooltip" :content="{ side: 'top' }">
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
              :content="{ side: 'top' }"
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
                  notesVisible ? 'i-lucide-file-text' : 'i-lucide-file-minus-2'
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
              :content="{ side: 'top' }"
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

            <UTooltip text="Collapse dev controls" :content="{ side: 'top' }">
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
            :text="panelOpen ? 'Collapse dev controls' : 'Expand dev controls'"
            :content="{ side: 'top' }"
          >
            <UButton
              :aria-label="
                panelOpen ? 'Collapse dev controls' : 'Expand dev controls'
              "
              size="xs"
              variant="ghost"
              color="warning"
              icon="i-lucide-flame"
              class="app-dev-controls__toggle"
              @click="togglePanel()"
            />
          </UTooltip>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useDiagnosticsUi } from '../../composables/diagnostics/useDiagnosticsUi'
import { syncAppMediaToStorage } from '../utils/sync-app-media'

const router = useRouter()
const isDev = import.meta.dev
let copyTimeout: number | undefined
onBeforeUnmount(() => {
  if (copyTimeout) clearTimeout(copyTimeout)
})
const {
  panelOpen,
  notesVisible,
  supportsInlineNotes,
  toggleNotes,
  togglePanel,
} = useDiagnosticsUi()
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
function goToDev() {
  router.push('/diagnostics')
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
  if (copyTimeout) clearTimeout(copyTimeout)
  copyTimeout = window.setTimeout(() => {
    copiedNotes.value = false
  }, 1500)
}
</script>

<style scoped>
.app-dev-controls {
  position: fixed;
  inset-inline-start: calc(var(--spacing) * 4);
  bottom: max(0px, env(safe-area-inset-bottom));
  max-width: calc(100vw - var(--spacing) * 8);
  z-index: 2147483647;
  pointer-events: none;
  user-select: none;
}
.app-dev-controls__row {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 2);
  pointer-events: auto;
}
.app-dev-controls__panel {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  border: 1px solid var(--ui-border);
  border-radius: 999px;
  background: color-mix(in oklab, var(--ui-bg-elevated) 95%, transparent);
  padding: var(--spacing) calc(var(--spacing) * 2);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  backdrop-filter: blur(8px);
}
.app-dev-controls__toggle {
  color: var(--fx-fireux-yellow);
  opacity: 0.9;
}
.app-dev-controls__toggle:hover {
  opacity: 1;
}
@media print {
  .app-dev-controls {
    display: none;
  }
}
</style>
