<template>
  <section class="ignition-preview">
    <UAlert
      title="One supported example"
      description="This prepares source for a read-only Menu App inside the FireUX workspace. An operator installs and starts it. It does not deploy, provision Firebase or generate arbitrary industry software."
      color="neutral"
    />
    <form class="ignition-preview__form" @submit.prevent="prepare">
      <UFormField label="New App id" required>
        <UInput
          v-model="input.id"
          class="ignition-preview__input"
          required
          :maxlength="63"
        />
      </UFormField>
      <UFormField label="App name" required>
        <UInput
          v-model="input.name"
          class="ignition-preview__input"
          required
          :maxlength="80"
        />
      </UFormField>
      <UFormField label="Reviewed purpose" required>
        <UTextarea
          v-model="input.outcome"
          class="ignition-preview__input"
          required
          :maxlength="2000"
          :rows="3"
        />
      </UFormField>
      <UButton type="submit" label="Prepare starting App" :loading="pending" />
    </form>
    <UAlert
      v-if="error"
      color="error"
      title="App source was not prepared"
      :description="error"
    />
    <UCard v-if="artifact" aria-live="polite">
      <h2>Starting App source prepared</h2>
      <p>{{ artifact.input.name }} · {{ artifact.sourcePath }}</p>
      <p>
        The same preparation command is available to Codex. No files or database
        records have been written by this page.
      </p>
      <ul>
        <li v-for="path in Object.keys(artifact.files)" :key="path">
          {{ path }}
        </li>
      </ul>
      <UButton
        :href="downloadUrl"
        :download="`${artifact.input.id}.ignition.json`"
        label="Download prepared source"
        external
      />
      <UButton
        :to="artifact.previewUrl"
        label="Open local preview after startup"
        color="neutral"
        variant="soft"
        external
      />
      <ol>
        <li v-for="step in artifact.manualSteps" :key="step">{{ step }}</li>
      </ol>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type {
  IgnitionPreview,
  IgnitionPreviewInput,
} from '../../../shared/ignition-preview'

const input = reactive<IgnitionPreviewInput>({
  id: 'ignition-menu-demo',
  name: 'Ignition Menu Demo',
  outcome:
    'Let guests browse the existing fictional Kitchen Menu in a normal FireUX App.',
})
const artifact = ref<IgnitionPreview | null>(null)
const pending = ref(false)
const error = ref('')
let revision = 0
watch(
  input,
  () => {
    revision++
    artifact.value = null
    error.value = ''
  },
  { flush: 'sync' }
)
const downloadUrl = computed(() =>
  artifact.value
    ? `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(artifact.value, null, 2))}`
    : undefined
)
async function prepare() {
  if (pending.value) return
  const sent = revision
  pending.value = true
  error.value = ''
  try {
    const result = await $fetch<IgnitionPreview>('/api/ignition/preview', {
      method: 'POST',
      body: { ...input },
      retry: 0,
      timeout: 15000,
    })
    if (sent === revision) artifact.value = result
  } catch (caught: any) {
    if (sent === revision)
      error.value =
        caught?.data?.statusMessage ||
        'Please try preparing the starting App again.'
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.ignition-preview,
.ignition-preview__form {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.ignition-preview__input {
  width: 100%;
}
</style>
