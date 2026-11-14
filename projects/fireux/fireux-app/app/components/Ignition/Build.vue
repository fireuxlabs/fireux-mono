<template>
  <section class="fx-card-body-stack">
    <h4 class="fx-type-card-heading">Project build</h4>
    <template v-if="build">
      <p>{{ build.state }} · {{ build.sourcePath }}</p>
      <UButton
        v-if="build.task"
        :to="build.task.url"
        label="Open development task"
        external
      />
      <p v-else class="fx-type-caption">
        The claiming local worker can resume this build. Its existing claim and
        task receipt are retained on retry.
      </p>
      <code
        >pnpm --filter fireux-platform-app ignition:deliver
        {{ build.id }} --queue-url {{ origin }} --token-file
        /path/to/admin-token</code
      >
    </template>
    <form
      v-else-if="['accepted', 'in-progress'].includes(status)"
      class="fx-card-body-stack"
      @submit.prevent="submit"
    >
      <UFormField label="Project id" required
        ><UInput v-model="input.id" required pattern="[a-z][a-z0-9-]{2,58}"
      /></UFormField>
      <UFormField label="Project name" required
        ><UInput v-model="input.name" required :maxlength="80"
      /></UFormField>
      <UFormField label="Reviewed purpose" required
        ><UTextarea v-model="input.outcome" required :maxlength="2000"
      /></UFormField>
      <UButton type="submit" label="Queue project build" :loading="pending" />
    </form>
    <p v-else class="fx-type-caption">
      Accept and review this request before preparing a project build.
    </p>
  </section>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRequestURL } from 'nuxt/app'
const props = defineProps<{
  status: string
  name: string
  purpose: string
  build: {
    id: string
    state: string
    sourcePath: string
    task: { url: string } | null
  } | null
  prepare: (input: {
    id: string
    name: string
    outcome: string
  }) => Promise<void>
}>()
const input = reactive({ id: '', name: props.name, outcome: props.purpose })
const pending = ref(false)
const origin = useRequestURL().origin
async function submit() {
  if (pending.value) return
  pending.value = true
  try {
    await props.prepare({ ...input })
  } finally {
    pending.value = false
  }
}
</script>
