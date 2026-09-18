<template>
  <div v-if="isAdmin" class="space-y-3">
    <div class="flex flex-wrap items-center gap-3">
      <UButton
        v-if="missing.length && !running"
        :label="`Generate missing images (${missing.length})`"
        icon="i-lucide-sparkles"
        color="neutral"
        variant="soft"
        size="sm"
        @click="start"
      />
      <span v-if="running" role="status" class="text-sm text-muted">
        {{ completed }} / {{ total }} · {{ currentName }}
      </span>
      <span v-else-if="completed" role="status" class="text-sm text-muted">
        {{ completed }} images saved
      </span>
      <UButton
        v-if="running"
        :label="stopRequested ? 'Stopping after this image…' : 'Stop'"
        :disabled="stopRequested"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="stopRequested = true"
      />
    </div>
    <MoleculesStateCard
      v-if="error"
      state="error"
      :title="`Image unavailable: ${currentName}`"
      :description="error"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useIngredientImageGeneration } from '../../composables/useIngredientImageGeneration'

const props = defineProps<{
  ingredients: Array<{ id: string; name?: string; image_url?: string }>
}>()
const { isAdmin } = useUserSession()
const { generate, error } = useIngredientImageGeneration()
const missing = computed(() =>
  props.ingredients.filter((item) => !item.image_url)
)
const running = ref(false)
const stopRequested = ref(false)
const completed = ref(0)
const total = ref(0)
const currentName = ref('')
onBeforeUnmount(() => {
  stopRequested.value = true
})

async function start() {
  if (running.value || !isAdmin.value) return
  const jobs = missing.value.map((item) => ({ ...item }))
  running.value = true
  stopRequested.value = false
  completed.value = 0
  total.value = jobs.length
  error.value = ''
  try {
    for (const job of jobs) {
      if (stopRequested.value || !isAdmin.value) break
      currentName.value = job.name || job.id
      // The existing command checks authority and preserves concurrent uploads.
      const result = await generate(job.id)
      if (!result) break
      completed.value++
    }
  } finally {
    running.value = false
  }
}
</script>
