<template>
  <UCard>
    <div class="menu-process-row">
      <div class="workspace-surface workspace-surface--compact">
        <p class="fx-type-card-heading">AI cost estimate</p>
        <p class="fx-type-caption">
          This will be recorded against the selected kitchen when you confirm.
        </p>
      </div>

      <UBadge color="neutral" variant="soft">
        {{ sourceLabel }}
      </UBadge>
    </div>

    <UAlert
      v-if="sourceLabel === 'photo'"
      class="workspace-surface workspace-surface--compact"
      color="neutral"
      variant="soft"
      icon="i-lucide-file-text"
      title="PDFs are usually cheaper"
      description="Photos are harder for AI to read, so they use a stronger model. If you have a clear PDF version of the same menu, it will usually cost less to process."
    />

    <div class="workspace-surface__grid workspace-surface__grid--2">
      <UPageCard
        title="Recommended"
        :description="standardDescription"
        variant="soft"
      >
        <div class="workspace-surface workspace-surface--compact">
          <p class="fx-type-card-heading">
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
        <div class="workspace-surface workspace-surface--compact">
          <p class="fx-type-card-heading">
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

    <UCard
      v-if="selectedMode"
      class="workspace-surface workspace-surface--compact"
    >
      <div class="menu-process-row">
        <div class="workspace-surface workspace-surface--compact">
          <p class="fx-type-card-heading">Confirm {{ selectedLabel }}</p>
          <p class="fx-type-caption">
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

    <p v-if="pending" class="workspace-surface workspace-surface--compact">
      Estimating AI cost...
    </p>
    <p v-else-if="error" class="fx-type-caption">
      {{ error }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onScopeDispose, ref, toRef, watch } from 'vue'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const props = defineProps<{
  source: unknown
  menuId: string
  kitchenId: string
  appId: string
  canWrite: boolean
  canProcess?: boolean
  pendingMode?: 'standard' | 'strong' | ''
}>()
const emit = defineEmits<{
  select: ['standard' | 'strong']
}>()
const source = toRef(props, 'source')
const menuId = toRef(props, 'menuId')
const kitchenId = toRef(props, 'kitchenId')
const activeKitchenAppId = toRef(props, 'appId')
const canWrite = toRef(props, 'canWrite')
const { currentUser } = useAuth()
const estimate = ref<Record<string, unknown> | null>(null)
const pending = ref(false)
const error = ref('')
const selectedMode = ref<'standard' | 'strong' | ''>('')

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const standard = computed(() =>
  record(record(estimate.value?.estimates).standard)
)
const strong = computed(() => record(record(estimate.value?.estimates).strong))
const amount = (value: Record<string, unknown>) =>
  text(value.amount_label) || 'Estimating'
const modelLine = (value: Record<string, unknown>) =>
  [
    text(value.file_profile),
    text(value.extraction_model),
    `${Number(value.planned_ai_calls || 0)} AI call(s)`,
  ]
    .filter(Boolean)
    .join(' · ')
const standardAmount = computed(() => amount(standard.value))
const strongAmount = computed(() => amount(strong.value))
const selectedEstimate = computed(() =>
  selectedMode.value === 'strong' ? strong.value : standard.value
)
const selectedAmount = computed(() => amount(selectedEstimate.value))
const selectedLabel = computed(() =>
  selectedMode.value === 'strong'
    ? 'stronger processing'
    : 'recommended processing'
)
const standardDescription = computed(
  () => modelLine(standard.value) || 'Uses the best default for this upload.'
)
const strongDescription = computed(
  () =>
    modelLine(strong.value) ||
    'Uses the stronger model if the first run needs help.'
)
const sourceLabel = computed(
  () => text(standard.value.file_profile) || 'menu source'
)
const uploadId = computed(
  () => text(record(source.value).id) || text(menuId.value)
)
const canSelect = computed(() =>
  Boolean(props.canProcess && estimate.value && !pending.value)
)

const scopeSources = [source, activeKitchenAppId, kitchenId, menuId, canWrite]
let estimateRun = 0
const captureScope = useMenuEditorScope(scopeSources, () => {
  estimateRun++
  pending.value = false
  estimate.value = null
  selectedMode.value = ''
  error.value = ''
})
onScopeDispose(() => {
  estimateRun++
})

watch([currentUser, ...scopeSources], refreshEstimate, {
  immediate: true,
  flush: 'sync',
})

async function refreshEstimate() {
  const run = ++estimateRun
  const currentScope = captureScope()
  const isCurrent = () => run === estimateRun && currentScope()
  pending.value = false
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
    if (!isCurrent()) return
    const response = await fetch(
      '/api/workspace/kitchen/menus/process-estimate',
      {
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
      }
    )
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        text(payload?.statusMessage) ||
          text(payload?.message) ||
          `Estimate failed with status ${response.status}.`
      )
    }

    if (!isCurrent()) return
    estimate.value = payload as Record<string, unknown>
  } catch (cause) {
    if (!isCurrent()) return
    error.value =
      cause instanceof Error ? cause.message : 'Could not estimate AI cost.'
  } finally {
    if (isCurrent()) pending.value = false
  }
}
</script>

<style scoped>
.menu-process-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: start;
  gap: calc(var(--spacing) * 3);
}
</style>
