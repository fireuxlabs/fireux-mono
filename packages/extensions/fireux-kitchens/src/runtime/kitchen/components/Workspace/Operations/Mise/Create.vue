<template>
  <form class="space-y-4" @submit.prevent="createTask">
    <UFormField label="Task" required>
      <UInput
        v-model="title"
        placeholder="Prepare tomato sauce"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Description">
      <UTextarea v-model="description" :rows="3" class="w-full" />
    </UFormField>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Station">
        <UInput v-model="station" placeholder="Cold kitchen" class="w-full" />
      </UFormField>
      <UFormField label="Service date">
        <UInput v-model="serviceDate" type="date" class="w-full" />
      </UFormField>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Workflow stage">
        <USelect
          v-model="workflowStage"
          :items="workflowOptions"
          value-key="value"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Priority">
        <USelect
          v-model="priority"
          :items="KITCHEN_MISE_PRIORITY_OPTIONS"
          value-key="value"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="flex justify-end gap-2">
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        @click="emit('cancel')"
      />
      <UButton
        label="Add prep task"
        icon="i-lucide-list-plus"
        type="submit"
        :loading="saving"
        :disabled="!title.trim()"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  KITCHEN_MISE_PRIORITY_OPTIONS,
  KITCHEN_MISE_WORKFLOW_STAGE_OPTIONS,
  type KitchenMisePriority,
  type KitchenMiseWorkflowStage,
} from '../../../../utils/mise.ts'
import { useKitchenMiseCreate } from '../../../../composables/workspace/operations/Mise/mutations/useKitchenMiseCreate'
import { useKitchenMiseWorkspace } from '../../../../composables/workspace/operations/Mise/useKitchenMiseWorkspace'

const emit = defineEmits<{
  cancel: []
  created: [result: { title: string }]
}>()
const { kitchenId, rootCollection } = useKitchenMiseWorkspace()
const { createKitchenMiseTask } = useKitchenMiseCreate()
const title = ref('')
const description = ref('')
const station = ref('')
const serviceDate = ref('')
const workflowStage = ref<KitchenMiseWorkflowStage | ''>('')
const priority = ref<KitchenMisePriority>('normal')
const saving = ref(false)
const workflowOptions = [
  { value: '', label: 'Unsorted' },
  ...KITCHEN_MISE_WORKFLOW_STAGE_OPTIONS,
]

async function createTask() {
  const taskTitle = title.value.trim()
  if (!taskTitle || saving.value) return
  saving.value = true
  try {
    await createKitchenMiseTask(
      kitchenId.value,
      {
        title: taskTitle,
        description: description.value,
        station: station.value,
        service_date: serviceDate.value,
        workflow_stage: workflowStage.value,
        priority: priority.value,
      },
      { kitchenCollectionPath: rootCollection.value }
    )
    emit('created', { title: taskTitle })
  } finally {
    saving.value = false
  }
}
</script>
