<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            Compare source with AI
          </h2>
          <p class="text-sm text-dimmed">
            Dry-run extraction against the current published menu.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton
            color="neutral"
            variant="soft"
            :loading="pendingMode === 'test'"
            :disabled="!canProcess"
            icon="i-lucide-scan-eye"
            @click="processSource('test')"
          >
            Test first photo
          </UButton>
          <UButton
            :loading="pendingMode === 'full'"
            :disabled="!canProcess"
            icon="i-lucide-scan-text"
            @click="processSource('full')"
          >
            Run all photos
          </UButton>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <p
        v-if="!source"
        class="text-sm text-dimmed"
      >
        Upload the source document before processing.
      </p>
      <p
        v-else
        class="text-sm text-dimmed"
      >
        This reads the uploaded source and current menu, then returns a JSON
        comparison payload. It does not overwrite dishes, sections, or menu
        items.
      </p>

      <p
        v-if="statusMessage"
        class="text-sm text-dimmed"
      >
        {{ statusMessage }}
      </p>

      <p
        v-if="error"
        class="text-sm text-error"
      >
        {{ error }}
      </p>

      <DevJson
        v-if="result"
        title="Menu process result"
        context="Kitchen menu process · /console/kitchen/menus/[menuId]"
        :data="result"
        :default-open="true"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenConsoleMenu } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'

const {
  menu,
  menuId,
  kitchenId,
  activeKitchenAppId,
  menuSources,
} = useKitchenConsoleMenu()
const { currentUser } = useAuth()
const authToken = ref('')
const pendingMode = ref<'test' | 'full' | ''>('')
const error = ref('')
const result = ref<Record<string, unknown> | null>(null)
const text = (value: unknown) => String(value ?? '').trim()
const source = computed(
  () => menuSources.value.find((item) => text(item.id) === menuId.value) ?? null
)
const statusMessage = computed(() => {
  if (pendingMode.value === 'test') {
    return 'Testing the first uploaded photo. If it is a cover, AI should classify it as no visible menu items.'
  }

  if (pendingMode.value === 'full') {
    return 'Running all uploaded photos. This may take a few minutes; terminal logs show per-photo progress.'
  }

  return ''
})
const canProcess = computed(() =>
  Boolean(
    source.value &&
      activeKitchenAppId.value &&
      kitchenId.value &&
      menuId.value &&
      authToken.value &&
      !pendingMode.value
  )
)

watch(
  currentUser,
  async (user) => {
    authToken.value = import.meta.client && user ? await user.getIdToken() : ''
  },
  { immediate: true }
)

async function processSource(mode: 'test' | 'full') {
  error.value = ''
  result.value = null

  if (!canProcess.value) {
    error.value = 'Upload a source document and sign in before processing.'
    return
  }

  pendingMode.value = mode

  try {
    const response = await fetch('/api/console/kitchen/menus/process', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: activeKitchenAppId.value,
        kitchenId: kitchenId.value,
        menuId: menuId.value,
        uploadId: menuId.value,
        limit: mode === 'test' ? 1 : undefined,
      }),
    })
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        text(payload?.statusMessage) ||
          text(payload?.message) ||
          `Process failed with status ${response.status}.`
      )
    }

    result.value = payload as Record<string, unknown>
  } catch (cause) {
    error.value = cause instanceof Error
      ? cause.message
      : 'Menu processing failed.'
  } finally {
    pendingMode.value = ''
  }
}
</script>
