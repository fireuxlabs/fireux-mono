<template>
  <UCard>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="text-sm font-medium text-highlighted">
          AI cost estimate
        </p>
        <p class="text-sm text-dimmed">
          This will be recorded against the selected kitchen when you confirm.
        </p>
      </div>

      <UBadge color="neutral" variant="soft">
        {{ sourceLabel }}
      </UBadge>
    </div>

    <UAlert
      v-if="isPhotoSource"
      class="mt-4"
      color="neutral"
      variant="soft"
      icon="i-lucide-file-text"
      title="PDFs are usually cheaper"
      description="Photos are harder for AI to read, so they use a stronger model. If you have a clear PDF version of the same menu, it will usually cost less to process."
    />

    <div class="mt-4 grid gap-3 md:grid-cols-2">
      <UPageCard
        title="Recommended"
        :description="standardDescription"
        variant="soft"
      >
        <div class="space-y-3">
          <p class="text-2xl font-semibold text-highlighted">
            {{ standardAmount }}
          </p>
          <UButton
            block
            icon="i-lucide-scan-text"
            :disabled="!canSelect"
            :variant="selectedMode === 'standard' ? 'solid' : 'soft'"
            @click="selectedMode = 'standard'"
          >
            Select recommended
          </UButton>
        </div>
      </UPageCard>

      <UPageCard
        title="Stronger"
        :description="strongDescription"
        variant="soft"
      >
        <div class="space-y-3">
          <p class="text-2xl font-semibold text-highlighted">
            {{ strongAmount }}
          </p>
          <UButton
            block
            color="neutral"
            icon="i-lucide-zap"
            :disabled="!canSelect"
            :variant="selectedMode === 'strong' ? 'solid' : 'soft'"
            @click="selectedMode = 'strong'"
          >
            Select stronger
          </UButton>
        </div>
      </UPageCard>
    </div>

    <UCard v-if="selectedMode" class="mt-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-1">
          <p class="text-sm font-medium text-highlighted">
            Confirm {{ selectedLabel }}
          </p>
          <p class="text-sm text-dimmed">
            {{ selectedAmount }} will be recorded against this kitchen when
            processing starts.
          </p>
        </div>
        <UButton
          icon="i-lucide-check"
          :loading="pendingMode === selectedMode"
          :disabled="!canSelect"
          @click="emit('select', selectedMode)"
        >
          Confirm and process
        </UButton>
      </div>
    </UCard>

    <p v-if="pending" class="mt-3 text-sm text-dimmed">
      Estimating AI cost...
    </p>
    <p v-else-if="error" class="mt-3 text-sm text-warning">
      {{ error }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/console/useConsoleWriteGuard'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenConsoleMenu } from '../../../../../composables/console/operations/Menus/useKitchenConsoleMenu'

const props = defineProps<{
  canProcess?: boolean
  pendingMode?: 'standard' | 'strong' | ''
}>()
const emit = defineEmits<{
  select: ['standard' | 'strong']
}>()
const {
  source,
  menuId,
  kitchenId,
  activeKitchenAppId,
  canWrite,
} = useKitchenConsoleMenu()
const { currentUser } = useAuth()
const { requireWritableData } = useConsoleWriteGuard('kitchen')
const estimate = ref<Record<string, unknown> | null>(null)
const pending = ref(false)
const error = ref('')
const selectedMode = ref<'standard' | 'strong' | ''>('')

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const standard = computed(() => record(record(estimate.value?.estimates).standard))
const strong = computed(() => record(record(estimate.value?.estimates).strong))
const amount = (value: Record<string, unknown>) =>
  text(value.amount_label) || 'Estimating'
const modelLine = (value: Record<string, unknown>) =>
  [
    text(value.file_profile),
    text(value.extraction_model),
    `${Number(value.planned_ai_calls || 0)} AI call(s)`,
  ].filter(Boolean).join(' · ')
const standardAmount = computed(() => amount(standard.value))
const strongAmount = computed(() => amount(strong.value))
const selectedEstimate = computed(() =>
  selectedMode.value === 'strong' ? strong.value : standard.value
)
const selectedAmount = computed(() => amount(selectedEstimate.value))
const selectedLabel = computed(() =>
  selectedMode.value === 'strong' ? 'stronger processing' : 'recommended processing'
)
const standardDescription = computed(() =>
  modelLine(standard.value) || 'Uses the best default for this upload.'
)
const strongDescription = computed(() =>
  modelLine(strong.value) || 'Uses the stronger model if the first run needs help.'
)
const sourceLabel = computed(() =>
  text(standard.value.file_profile) || 'menu source'
)
const isPhotoSource = computed(() => sourceLabel.value === 'photo')
const uploadId = computed(() => text(record(source.value).id) || text(menuId.value))
const canSelect = computed(() =>
  Boolean(props.canProcess && estimate.value && !pending.value)
)

watch(
  [currentUser, source, activeKitchenAppId, kitchenId, menuId, canWrite],
  refreshEstimate,
  { immediate: true }
)

async function refreshEstimate() {
  error.value = ''
  estimate.value = null
  selectedMode.value = ''

  if (
    !import.meta.client ||
      !canWrite.value ||
      !currentUser.value ||
      !source.value ||
      !activeKitchenAppId.value ||
      !kitchenId.value ||
      !menuId.value
  ) {
    return
  }

  pending.value = true

  try {
    const appId = activeKitchenAppId.value
    const selectedKitchenId = kitchenId.value
    const selectedMenuId = menuId.value
    const selectedUploadId = uploadId.value
    const token = await currentUser.value.getIdToken()
    requireWritableData('live')
    if (
      !canWrite.value ||
      activeKitchenAppId.value !== appId ||
      kitchenId.value !== selectedKitchenId ||
      menuId.value !== selectedMenuId ||
      uploadId.value !== selectedUploadId
    ) {
      return
    }
    const response = await fetch('/api/console/kitchen/menus/process-estimate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId,
        kitchenId: selectedKitchenId,
        menuId: selectedMenuId,
        uploadId: selectedUploadId,
      }),
    })
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        text(payload?.statusMessage) ||
          text(payload?.message) ||
          `Estimate failed with status ${response.status}.`
      )
    }

    estimate.value = payload as Record<string, unknown>
  } catch (cause) {
    error.value = cause instanceof Error
      ? cause.message
      : 'Could not estimate AI cost.'
  } finally {
    pending.value = false
  }
}
</script>
