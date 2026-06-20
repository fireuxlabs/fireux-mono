<template>
  <UCard v-if="menu || source">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            Process source with AI
          </h2>
          <p class="text-sm text-dimmed">
            {{ processDescription }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton
            :loading="pendingMode === 'full'"
            :disabled="!canProcess"
            icon="i-lucide-scan-text"
            @click="processSource('full')"
          >
            Convert to dishes with AI
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
        This reads the uploaded menu document and returns a cleaned dish draft
        for review. It does not create menu, section, or dish records yet.
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
              Uploaded document
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

        <div
          class="grid gap-4"
          :class="{ 'xl:grid-cols-2': currentSections.length }"
        >
          <UCard v-if="currentSections.length">
            <template #header>
              <h3 class="text-sm font-semibold text-highlighted">
                Existing menu
              </h3>
            </template>

            <ConsoleKitchenOperationsMenusProcessSections
              :sections="currentSections"
              empty-label="No existing sections found."
            />
          </UCard>

          <UCard>
            <template #header>
              <div class="space-y-1">
                <h3 class="text-sm font-semibold text-highlighted">
                  Normalized menu draft
                </h3>
                <p class="text-sm text-dimmed">
                  The raw read has been cleaned into reviewable menu sections.
                </p>
              </div>
            </template>

            <ConsoleKitchenOperationsMenusProcessSections
              :sections="draftSections"
              empty-label="No draft sections returned."
            />
          </UCard>
        </div>

        <ConsoleKitchenOperationsMenusConfirm
          :menu="menu"
          :source="source"
          :result="result"
          :sections="confirmSections"
          :app-id="activeKitchenAppId"
          :kitchen-id="kitchenId"
          :menu-id="menuId"
          :auth-token="authToken"
          :blocked="Boolean(pendingMode)"
        />
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
  source,
  menuId,
  kitchenId,
  activeKitchenAppId,
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
const processDescription = computed(() =>
  menu.value
    ? 'Dry-run extraction for this menu source. Existing menu records are only used for comparison.'
    : 'Convert this uploaded menu document into a dish draft. No menu records are changed.'
)
const statusMessage = computed(() => {
  if (pendingMode.value === 'test') {
    return 'Testing the uploaded menu document.'
  }

  if (pendingMode.value === 'full') {
    return 'Converting the uploaded menu document into dishes. This may take a few minutes.'
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
    label: 'Source files',
    value: numberText(counts.value.source_files),
  },
  {
    label: 'Raw items',
    value: numberText(counts.value.raw_extracted_items ?? counts.value.extracted_items),
  },
  {
    label: 'Draft items',
    value: numberText(counts.value.normalized_items ?? counts.value.extracted_items),
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
const rawExtractedSections = computed(() =>
  records(record(result.value?.extracted).sections)
)
const rawNormalizedSections = computed(() =>
  records(record(result.value?.normalized).sections)
)
const extractedSections = computed(() =>
  toSections(rawExtractedSections.value)
)
const normalizedSections = computed(() =>
  toSections(rawNormalizedSections.value)
)
const draftSections = computed(() =>
  normalizedSections.value.length ? normalizedSections.value : extractedSections.value
)
const confirmSections = computed(() =>
  rawNormalizedSections.value.length
    ? rawNormalizedSections.value
    : rawExtractedSections.value
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
