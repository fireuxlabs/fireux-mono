<!-- FILE: packages/core/fireux-core/src/runtime/components/App/Shell.vue -->
<template>
  <UApp>
    <!-- Toast target -->
    <ClientOnly>
      <UToaster />
    </ClientOnly>

    <!-- Tiny dev icon dock -->
    <ClientOnly>
      <div
        v-if="isDev"
        class="fixed bottom-0 left-1/2 z-[2147483647] select-none"
        style="transform: translateX(calc(-200% - 6rem));"
      >
        <div class="mb-2 flex items-center gap-2">
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

            <UTooltip
              :text="supportsInlineNotes ? (notesVisible ? 'Hide developer notes' : 'Show developer notes') : 'No developer notes on this page yet'"
              :popper="{ placement: 'top' }"
            >
              <UButton
                :aria-label="supportsInlineNotes ? (notesVisible ? 'Hide developer notes' : 'Show developer notes') : 'No developer notes on this page yet'"
                size="xs"
                variant="ghost"
                :color="supportsInlineNotes && notesVisible ? 'warning' : 'neutral'"
                :icon="notesVisible ? 'i-lucide-file-text' : 'i-lucide-file-minus-2'"
                :disabled="!supportsInlineNotes"
                @click="toggleNotes()"
              />
            </UTooltip>

            <UTooltip
              :text="canCopyNotes ? (copiedNotes ? 'Copied developer notes' : 'Copy visible developer notes') : 'Show developer notes to copy them'"
              :popper="{ placement: 'top' }"
            >
              <UButton
                :aria-label="canCopyNotes ? 'Copy visible developer notes' : 'Show developer notes to copy them'"
                size="xs"
                variant="ghost"
                :color="copiedNotes ? 'success' : 'neutral'"
                :icon="copiedNotes ? 'i-lucide-check' : 'i-lucide-copy'"
                :disabled="!canCopyNotes"
                @click="copyVisibleNotes()"
              />
            </UTooltip>

            <UTooltip text="Collapse dev controls" :popper="{ placement: 'top' }">
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
            :popper="{ placement: 'top' }"
          >
            <UButton
              :aria-label="panelOpen ? 'Collapse dev controls' : 'Expand dev controls'"
              size="xs"
              variant="ghost"
              color="neutral"
              icon="i-heroicons-wrench-screwdriver"
              class="opacity-70 hover:opacity-100"
              @click="togglePanel()"
            />
          </UTooltip>
        </div>
      </div>
    </ClientOnly>

    <!-- App content -->
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

    </UMain>

    <!-- Blocker until app is initialized -->
    <!-- Render only after app doc resolves.
         This avoids a brief modal flash while the app payload is still loading. -->
    <ClientOnly>
      <UModal
        v-if="showOnboardingModal"
        :open="showOnboardingModal"
        prevent-close
        title="🚫 Blocked"
        description="This app needs to be initialized."
      >
        <template #body>
          <AppCreateSystem />
        </template>
      </UModal>
    </ClientOnly>
  </UApp>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '#imports'
import { useDevUi } from '../../composables/fireux/app/ui/useDevUi'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'

const isDev = import.meta.dev
const router = useRouter()
const { panelOpen, notesVisible, supportsInlineNotes, toggleNotes, togglePanel } = useDevUi()
const copiedNotes = ref(false)
const canCopyNotes = computed(() => supportsInlineNotes.value && notesVisible.value)

const { isResolved, isInitialized } = import.meta.client
  ? useApp()
  : ({
      isResolved: computed(() => false),
      isInitialized: computed(() => true),
    } as const)

const showOnboardingModal = computed(
  () => isResolved.value && !isInitialized.value
)

useHead({
  link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
})

function goToDev() {
  router.push('/dev')
}

async function copyVisibleNotes() {
  if (!canCopyNotes.value || !import.meta.client) return

  const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-dev-note]'))
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
