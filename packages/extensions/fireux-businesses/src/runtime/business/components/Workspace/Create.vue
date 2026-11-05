<template>
  <form @submit.prevent="create">
    <UFormField label="Business name" name="business-name"><UInput v-model="name" required maxlength="120" /></UFormField>
    <UButton type="submit" label="Create business" :loading="busy" :disabled="busy || !name.trim()" />
    <p v-if="error" role="alert">{{ error }}</p>
  </form>
</template>
<script setup lang="ts">
import { onScopeDispose, ref } from 'vue'
import { useBusinessWorkspace } from '../../composables/useBusinessWorkspace'
const workspace = useBusinessWorkspace()
const name = ref(''), error = ref(''), busy = ref(false)
let active = true
const requestId = ref('')
onScopeDispose(() => { active = false })
async function create() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  requestId.value ||= crypto.randomUUID()
  try {
    const result = await workspace.command('POST', { id: requestId.value, name: name.value }, () => active)
    if (active && result.current) { name.value = ''; requestId.value = '' }
  } catch (cause) {
    if (active) error.value = cause instanceof Error ? cause.message : 'Business could not be created.'
  } finally { if (active) busy.value = false }
}
</script>
