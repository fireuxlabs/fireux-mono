<template>
  <UCard>
    <template #header>
      <div class="workspace-card-header">
        <div class="workspace-card-header__title">{{ tool.label }}</div>
        <p class="workspace-card-header__description">
          Record management for this kitchen prep task.
        </p>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="save">
      <UFormField label="Title">
        <UInput
          v-model="title"
          placeholder="Missing mise title"
          :disabled="!canEditMise"
        />
      </UFormField>

      <UFormField label="Description">
        <UTextarea v-model="description" :rows="3" :disabled="!canEditMise" />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="Station / responsibility">
          <UInput
            v-model="station"
            placeholder="Station"
            :disabled="!canEditMise"
          />
        </UFormField>

        <UFormField label="Service date">
          <UInput v-model="serviceDate" type="date" :disabled="!canEditMise" />
        </UFormField>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UFormField label="Workflow stage">
          <select
            v-model="workflowStage"
            :disabled="!canEditMise"
            class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted"
          >
            <option value="">Unsorted</option>
            <option
              v-for="option in KITCHEN_MISE_WORKFLOW_STAGE_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </UFormField>

        <UFormField label="Status">
          <select
            v-model="status"
            :disabled="!canEditMise"
            class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted"
          >
            <option
              v-for="option in KITCHEN_MISE_STATUS_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </UFormField>

        <UFormField label="Priority">
          <select
            v-model="priority"
            :disabled="!canEditMise"
            class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted"
          >
            <option
              v-for="option in KITCHEN_MISE_PRIORITY_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </UFormField>

        <UFormField label="Estimated minutes">
          <UInput
            v-model="estimatedMinutes"
            type="number"
            min="0"
            step="1"
            :disabled="!canEditMise"
          />
        </UFormField>
      </div>

      <div class="flex items-center gap-2">
        <UButton type="submit" :loading="saving" :disabled="!canEditMise">
          Save mise task
        </UButton>
        <p v-if="message" class="text-xs text-dimmed">
          {{ message }}
        </p>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  KITCHEN_MISE_PRIORITY_OPTIONS,
  KITCHEN_MISE_STATUS_OPTIONS,
  KITCHEN_MISE_WORKFLOW_STAGE_OPTIONS,
  normalizeKitchenMisePriority,
  normalizeKitchenMiseStatus,
  normalizeKitchenMiseWorkflowStage,
  type KitchenMisePriority,
  type KitchenMiseStatus,
  type KitchenMiseTask,
  type KitchenMiseWorkflowStage,
} from '../../../../utils/mise.ts'
import { useKitchenMiseTaskWorkspace } from '../../../../composables/workspace/operations/Mise/useKitchenMiseTaskWorkspace'
import { useKitchenMiseUpdate } from '../../../../composables/workspace/operations/Mise/mutations/useKitchenMiseUpdate'
import { kitchenMisePrepTaskUpdateTool } from '../../../../tools/mise'

const props = defineProps<{
  task: KitchenMiseTask
}>()

const { kitchenId, rootCollection, miseId, canEditMise } =
  useKitchenMiseTaskWorkspace()
const { updateKitchenMise } = useKitchenMiseUpdate()
const tool = kitchenMisePrepTaskUpdateTool.surfaces.human

const normalizeString = (value: unknown) => String(value ?? '').trim()
const title = ref('')
const description = ref('')
const station = ref('')
const workflowStage = ref<KitchenMiseWorkflowStage | ''>('')
const serviceDate = ref('')
const status = ref<KitchenMiseStatus>('todo')
const priority = ref<KitchenMisePriority>('normal')
const estimatedMinutes = ref<number | string>(0)
const saving = ref(false)
const message = ref('')

watch(
  () => props.task,
  (task: KitchenMiseTask) => {
    title.value = normalizeString(task.title)
    description.value = normalizeString(task.description)
    station.value = normalizeString(task.station)
    workflowStage.value = normalizeKitchenMiseWorkflowStage(task.workflow_stage)
    serviceDate.value = normalizeString(task.service_date)
    status.value = normalizeKitchenMiseStatus(task.status)
    priority.value = normalizeKitchenMisePriority(task.priority)
    estimatedMinutes.value = Math.max(
      0,
      Math.round(Number(task.estimated_minutes) || 0)
    )
    message.value = ''
  },
  { immediate: true }
)

const save = async () => {
  if (!canEditMise.value || saving.value) return

  saving.value = true
  message.value = ''

  try {
    await updateKitchenMise({
      kitchenId: kitchenId.value,
      taskId: miseId.value,
      kitchenCollectionPath: rootCollection.value,
      changes: {
        title: title.value,
        description: description.value,
        station: station.value,
        workflow_stage: workflowStage.value,
        service_date: serviceDate.value,
        status: status.value,
        priority: priority.value,
        estimated_minutes: Number(estimatedMinutes.value),
      },
    })
    message.value = 'Saved.'
  } catch (error) {
    message.value = String((error as any)?.message || error || 'Save failed.')
  } finally {
    saving.value = false
  }
}
</script>
