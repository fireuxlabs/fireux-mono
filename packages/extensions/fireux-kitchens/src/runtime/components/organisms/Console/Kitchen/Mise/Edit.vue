<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Edit mise task</div>
        <p class="console-card-header__description">
          Record management for this test kitchen prep task.
        </p>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="save">
      <UFormField label="Title">
        <UInput v-model="title" placeholder="Missing mise title" />
      </UFormField>

      <UFormField label="Description">
        <UTextarea v-model="description" :rows="3" />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="Type">
          <select
            v-model="type"
            class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted"
          >
            <option value="food">Food</option>
            <option value="non-food">Non-food</option>
          </select>
        </UFormField>

        <UFormField label="Station / responsibility">
          <UInput v-model="station" placeholder="Station" />
        </UFormField>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          type="submit"
          :loading="saving"
          :disabled="!canEditMise"
        >
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
import type { KitchenMiseTask } from '../../../../../models/kitchen-mise.model'
import { useKitchenConsoleMiseTask } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleMiseTask'
import { useKitchenMiseUpdate } from '../../../../../composables/fireux/firestore/kitchen/mise/mutations/useKitchenMiseUpdate'

const props = defineProps<{
  task: KitchenMiseTask
}>()

const { kitchenId, rootCollection, miseId, canEditMise } =
  useKitchenConsoleMiseTask()
const { updateKitchenMise } = useKitchenMiseUpdate()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const title = ref('')
const description = ref('')
const type = ref<'food' | 'non-food'>('food')
const station = ref('')
const saving = ref(false)
const message = ref('')

watch(
  () => props.task,
  (task) => {
    const source = task as Record<string, unknown>
    title.value = normalizeString(task.title)
    description.value = normalizeString(task.description)
    type.value = normalizeString(source.type) === 'non-food' ? 'non-food' : 'food'
    station.value = normalizeString(task.station)
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
      patch: {
        title: title.value,
        description: description.value,
        type: type.value,
        station: station.value,
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
