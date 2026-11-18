<template>
  <div class="workspace-surface">
    <UPageHeader :title="title" :description="description" />
    <p class="fx-type-caption">
      Saved in this browser for your account and kitchen.
    </p>
    <UAlert v-if="error" color="error" :title="error" />
    <p v-if="!ready && !error" role="status">
      Waiting for the selected kitchen…
    </p>

    <template v-if="ready">
      <UCard v-if="view === 'plan'">
        <form
          class="workspace-surface workspace-surface--compact"
          @submit.prevent="addTask"
        >
          <UFormField label="Service date"
            ><UInput v-model="date" type="date" required
          /></UFormField>
          <UFormField label="Preparation"
            ><UInput v-model="name" required
          /></UFormField>
          <UFormField label="Planned quantity"
            ><UInput
              v-model="planned"
              type="number"
              min="0.001"
              step="any"
              required
          /></UFormField>
          <UFormField label="Unit"
            ><UInput v-model="unit" placeholder="e.g. portions" required
          /></UFormField>
          <div><UButton type="submit" label="Add to prep plan" /></div>
        </form>
      </UCard>
      <p v-if="!rows.length" role="status">
        {{
          view === 'plan' ? 'No prep tasks yet.' : 'No batches recorded yet.'
        }}
      </p>
      <UCard v-for="task in rows" :key="task.id">
        <h2 class="fx-type-card-heading">{{ task.name }}</h2>
        <p>
          Service date {{ task.date }} · Planned {{ task.planned }}
          {{ task.unit }}
        </p>
        <p v-if="task.batch">
          Made {{ task.batch.quantity }} {{ task.unit }} ·
          <time :datetime="task.batch.recordedAt"
            >{{ task.batch.recordedAt.slice(0, 10) }} UTC</time
          >
        </p>
        <form
          v-else
          class="workspace-surface workspace-surface--compact"
          @submit.prevent="complete(task.id, Number(actual[task.id]))"
        >
          <UFormField :label="`Actual quantity (${task.unit})`">
            <UInput
              v-model="actual[task.id]"
              type="number"
              min="0.001"
              step="any"
              required
            />
          </UFormField>
          <div>
            <UButton type="submit" label="Record batch" variant="soft" />
          </div>
        </form>
      </UCard>
    </template>
    <div>
      <UButton
        v-if="view === 'plan'"
        to="/workspace/kitchen/prep/batches"
        label="View batches"
        variant="soft"
      />
      <UButton
        v-else
        to="/workspace/kitchen/prep/plan"
        label="Open prep plan"
        variant="soft"
      />
    </div>
    <WorkspaceKitchenAIFocus
      :focus="`kitchen-ai.prep.${view}`"
      :label="title"
      context-label="Prep"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePrepProduction } from '../../../composables/workspace/prep/usePrepProduction'

const props = withDefaults(defineProps<{ view?: 'plan' | 'batches' }>(), {
  view: 'plan',
})
const { tasks, ready, error, add, complete } = usePrepProduction()
const title = computed(() => (props.view === 'plan' ? 'Prep plan' : 'Batches'))
const description = computed(() =>
  props.view === 'plan'
    ? 'Plan what needs making and record the actual output.'
    : 'Review the actual quantities recorded from your prep plan.'
)
const rows = computed(() =>
  props.view === 'plan' ? tasks.value : tasks.value.filter((task) => task.batch)
)
const date = ref('')
const name = ref('')
const planned = ref('')
const unit = ref('')
const actual = ref<Record<string, string>>({})

function addTask() {
  if (add(name.value, date.value, Number(planned.value), unit.value)) {
    name.value = ''
    planned.value = ''
  }
}
</script>
