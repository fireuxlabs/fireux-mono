<template>
  <section v-if="menu || source" class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-highlighted">
          Convert menu with AI
        </h3>
        <p class="text-sm text-dimmed">
          {{ processDescription }}
        </p>
      </div>
    </div>
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
        {{ sourceDescription }}
      </p>
      <UCollapsible v-if="source" :default-open="true">
        <UButton block color="neutral" variant="soft" trailing-icon="i-lucide-chevron-down">
          Process source
        </UButton>
        <template #content>
          <div class="mt-3 space-y-3">
            <ConsoleKitchenOperationsMenusProcessCost
              :can-process="canProcess"
              :pending-mode="pendingMode"
              @select="processSource"
            />
            <p v-if="statusMessage" class="text-sm text-dimmed">
              {{ statusMessage }}
            </p>
            <p v-if="displayError" class="text-sm text-error">
              {{ displayError }}
            </p>
          </div>
        </template>
      </UCollapsible>
      <div v-if="hasDraft" class="space-y-4">
        <div v-if="showStats" class="grid gap-3 md:grid-cols-4">
          <UPageCard
            v-for="stat in stats"
            :key="stat.label"
            :title="stat.value"
            :description="stat.label"
            variant="soft"
          />
        </div>
        <UCollapsible v-if="fileResults.length || writeMessage">
          <UButton block color="neutral" variant="soft" trailing-icon="i-lucide-chevron-down">
            Uploaded document
          </UButton>
          <template #content>
            <div class="mt-3 space-y-3 rounded-lg border border-default p-3">
              <div v-if="fileResults.length" class="flex flex-wrap gap-2">
                <UBadge
                  v-for="file in fileResults"
                  :key="file.id"
                  :color="file.status === 'failed' ? 'error' : file.status === 'empty' ? 'neutral' : 'success'"
                  variant="soft"
                >
                  {{ file.file_name }} · {{ file.status }}
                </UBadge>
              </div>
              <p v-if="writeMessage" class="text-sm text-dimmed">
                {{ writeMessage }}
              </p>
            </div>
          </template>
        </UCollapsible>
        <UCollapsible v-if="flags.length" :default-open="true">
          <UButton block color="neutral" variant="soft" trailing-icon="i-lucide-chevron-down">
            Review flags
          </UButton>
          <template #content>
            <ul class="mt-3 space-y-2">
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
          </template>
        </UCollapsible>
        <div class="grid gap-4" :class="{ 'xl:grid-cols-2': currentSections.length }">
          <UCollapsible v-if="currentSections.length">
            <UButton block color="neutral" variant="soft" trailing-icon="i-lucide-chevron-down">
              Existing menu
            </UButton>
            <template #content>
              <div class="mt-3 rounded-lg border border-default p-3">
                <ConsoleKitchenOperationsMenusProcessSections
                  :sections="currentSections"
                  empty-label="No existing sections found."
                />
              </div>
            </template>
          </UCollapsible>
          <UCollapsible :default-open="true">
            <UButton block color="neutral" variant="soft" trailing-icon="i-lucide-chevron-down">
              Menu draft
            </UButton>
            <template #content>
              <div class="mt-3 space-y-3 rounded-lg border border-default p-3">
                <p class="text-sm text-dimmed">
                  The raw read has been cleaned into reviewable menu sections.
                </p>
                <ConsoleKitchenOperationsMenusProcessSections
                  :sections="draftSections"
                  empty-label="No draft sections returned."
                />
              </div>
            </template>
          </UCollapsible>
        </div>

        <ConsoleKitchenOperationsMenusProcessConfirmation
          :source="source"
          :result="result"
          :app-id="activeKitchenAppId"
          :kitchen-id="kitchenId"
          :menu-id="menuId"
          :auth-token="authToken"
          :flags="flags"
          :blocked="!canWrite || Boolean(pendingMode)"
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
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenConsoleMenu } from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'

const {
  menu,
  source,
  menuId,
  kitchenId,
  activeKitchenAppId,
  canWrite,
} = useKitchenConsoleMenu()
const { currentUser } = useAuth()
const authToken = ref('')
const pendingMode = ref<'standard' | 'strong' | ''>('')
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
const optionLabel = (option: Record<string, unknown>) =>
  text(option.label) ||
    [text(option.quantity), text(option.unit)].filter(Boolean).join(' ')
const processDescription = computed(() =>
  menu.value
    ? 'Convert the upload and save a review draft. Published menus are not overwritten automatically.'
    : 'Convert this upload into a new draft menu.'
)
const sourceDescription =
  'Reads the saved source and saves a structured menu draft. Processing can take several minutes; if interrupted, retry resumes from the last saved checkpoint.'
const uploadId = computed(() => text(record(source.value).id) || text(menuId.value))
const sourceDraft = computed(() => record(record(source.value).ai_draft))
const sourceProcess = computed(() => record(record(source.value).ai_process))
const persistedStage = computed(() => text(sourceProcess.value.stage))
const persistedProcessMessage = computed(() => {
  if (result.value) return ''
  if (persistedStage.value === 'extracting') {
    return 'Extraction is the last saved stage. If the earlier request has ended, retry processing.'
  }
  if (persistedStage.value === 'normalizing') {
    return 'The extracted draft is checkpointed and normalization is the last saved stage. If the earlier request has ended, retry to resume cleanup.'
  }
  return ''
})
const statusMessage = computed(() => {
  if (pendingMode.value === 'standard') {
    return 'Converting and saving the upload. Keep this tab open; this may take several minutes.'
  }

  if (pendingMode.value === 'strong') {
    return 'Processing with the stronger model. Keep this tab open; this may take several minutes and costs more than the recommended pass.'
  }

  return persistedProcessMessage.value
})
const persistedError = computed(() =>
  persistedStage.value === 'failed'
    ? text(sourceProcess.value.reason) || 'The previous menu processing run failed.'
    : ''
)
const displayError = computed(() => error.value || persistedError.value)
const canProcess = computed(() =>
  Boolean(
    canWrite.value &&
      source.value &&
      activeKitchenAppId.value &&
      kitchenId.value &&
      menuId.value &&
      authToken.value &&
      !pendingMode.value
  )
)
const persistedReport = computed(() => record(sourceDraft.value.report))
const counts = computed(() => {
  const local = record(record(result.value?.comparison).counts)
  return Object.keys(local).length ? local : record(persistedReport.value.counts)
})
const showStats = computed(() =>
  Boolean(result.value || Object.keys(counts.value).length)
)
const stats = computed(() => [
  { label: 'Source files', value: numberText(counts.value.source_files) },
  { label: 'Raw items', value: numberText(counts.value.raw_extracted_items ?? counts.value.extracted_items) },
  { label: 'Draft items', value: numberText(counts.value.normalized_items ?? counts.value.extracted_items) },
  { label: 'Draft variants', value: numberText(counts.value.extracted_price_options) },
  { label: 'Draft add-ons', value: numberText(counts.value.extracted_add_ons) },
  { label: 'Review flags', value: String(flags.value.length) },
  {
    label: 'Menu write',
    value: text(record(result.value?.write).action) ||
      text(record(sourceDraft.value.write).action) || 'Pending',
  },
  {
    label: 'AI calls',
    value: numberText(
      record(result.value?.cost).planned_ai_calls ??
        record(sourceDraft.value.cache).planned_ai_calls
    ),
  },
])
const fileResults = computed(() =>
  records(record(result.value?.extracted).files).map((file) => ({
    id: text(file.id),
    file_name: text(file.file_name),
    status: text(file.status),
  }))
)
const toFlags = (value: unknown) =>
  records(value).map((flag) => ({
    code: text(flag.code),
    level: text(flag.level),
    message: text(flag.message),
  }))
const flags = computed(() => {
  const local = toFlags(record(result.value?.comparison).flags)
  return local.length ? local : toFlags(persistedReport.value.flags)
})
const writeMessage = computed(() =>
  text(result.value?.message) ||
    text(record(result.value?.write).action) ||
    text(record(sourceDraft.value.write).action)
)
const toSections = (value: unknown) =>
  records(value).map((section) => ({
    label: text(section.label),
    items: records(section.items).map((item) => ({
      name: text(item.name),
      description: text(item.description),
      price: priceText(item.price),
      addOns: records(item.add_ons)
        .map((option) => ({
          label: optionLabel(option),
          price: priceText(option.price),
        }))
        .filter((option) => option.label && option.price),
      priceOptions: records(item.price_options)
        .map((option) => ({
          label: optionLabel(option),
          price: priceText(option.price),
        }))
        .filter((option) => option.label && option.price),
    })),
  }))
const currentSections = computed(() =>
  toSections(record(result.value?.current).sections)
)
const extractedSections = computed(() =>
  toSections(record(result.value?.extracted).sections)
)
const normalizedSections = computed(() =>
  toSections(record(result.value?.normalized).sections)
)
const persistedDraftSections = computed(() =>
  toSections(sourceDraft.value.sections)
)
const draftSections = computed(() =>
  normalizedSections.value.length
    ? normalizedSections.value
    : extractedSections.value.length
      ? extractedSections.value
      : persistedDraftSections.value
)
const hasDraft = computed(() => Boolean(result.value) ||
  draftSections.value.some((section) => section.items.length)
)
watch(
  currentUser,
  async (user: { getIdToken: () => Promise<string> } | null) => {
    authToken.value = import.meta.client && user ? await user.getIdToken() : ''
  },
  { immediate: true }
)

async function processSource(mode: 'standard' | 'strong') {
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
        uploadId: uploadId.value,
        quality: mode,
        force: mode === 'strong',
        confirmBilling: true,
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
