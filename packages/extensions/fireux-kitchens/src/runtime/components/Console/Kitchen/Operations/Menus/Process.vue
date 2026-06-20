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

      <div
        v-if="result"
        class="space-y-4"
      >
        <div class="grid gap-3 md:grid-cols-4">
          <UPageCard
            v-for="stat in stats"
            :key="stat.label"
            :title="stat.value"
            :description="stat.label"
            variant="soft"
          />
        </div>

        <UCard v-if="fileResults.length">
          <template #header>
            <h3 class="text-sm font-semibold text-highlighted">
              Uploaded photos
            </h3>
          </template>

          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="file in fileResults"
              :key="file.id"
              :color="file.status === 'failed' ? 'error' : file.status === 'empty' ? 'neutral' : 'success'"
              variant="soft"
            >
              {{ file.file_name }} · {{ file.status }}
            </UBadge>
          </div>
        </UCard>

        <UCard v-if="flags.length">
          <template #header>
            <h3 class="text-sm font-semibold text-highlighted">
              Review flags
            </h3>
          </template>

          <ul class="space-y-2">
            <li
              v-for="flag in flags"
              :key="`${flag.code}-${flag.message}`"
              class="rounded-lg border border-default p-3 text-sm"
            >
              <div class="flex flex-wrap items-center gap-2">
                <UBadge
                  :color="flag.level === 'error' ? 'error' : flag.level === 'warning' ? 'warning' : 'info'"
                  variant="soft"
                >
                  {{ flag.code }}
                </UBadge>
                <span class="text-highlighted">{{ flag.message }}</span>
              </div>
            </li>
          </ul>
        </UCard>

        <div class="grid gap-4 xl:grid-cols-2">
          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-highlighted">
                Current published menu
              </h3>
            </template>

            <ConsoleKitchenOperationsMenusProcessSections
              :sections="currentSections"
              empty-label="No current sections found."
            />
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-highlighted">
                AI extracted menu
              </h3>
            </template>

            <ConsoleKitchenOperationsMenusProcessSections
              :sections="extractedSections"
              empty-label="No AI sections returned."
            />
          </UCard>
        </div>
      </div>

      <DevJson
        v-if="result"
        title="Menu process result"
        context="Kitchen menu process · /console/kitchen/menus/[menuId]"
        :data="result"
        :default-open="false"
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
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const records = (value: unknown) =>
  Array.isArray(value) ? value.map(record) : []
const numberText = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? String(number) : '0'
}
const priceText = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? `CHF ${number}` : ''
}
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
const counts = computed(() => record(record(result.value?.comparison).counts))
const stats = computed(() => [
  {
    label: 'Source photos',
    value: numberText(counts.value.source_files),
  },
  {
    label: 'Current items',
    value: numberText(counts.value.current_items),
  },
  {
    label: 'AI items',
    value: numberText(counts.value.extracted_items),
  },
  {
    label: 'Review flags',
    value: String(flags.value.length),
  },
])
const fileResults = computed(() =>
  records(record(result.value?.extracted).files).map((file) => ({
    id: text(file.id),
    file_name: text(file.file_name),
    status: text(file.status),
  }))
)
const flags = computed(() =>
  records(record(result.value?.comparison).flags).map((flag) => ({
    code: text(flag.code),
    level: text(flag.level),
    message: text(flag.message),
  }))
)
const toSections = (value: unknown) =>
  records(value).map((section) => ({
    label: text(section.label),
    items: records(section.items).map((item) => ({
      name: text(item.name),
      description: text(item.description),
      price: priceText(item.price),
    })),
  }))
const currentSections = computed(() =>
  toSections(record(result.value?.current).sections)
)
const extractedSections = computed(() =>
  toSections(record(result.value?.extracted).sections)
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
