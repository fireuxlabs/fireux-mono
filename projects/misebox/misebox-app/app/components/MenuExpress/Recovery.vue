<template>
  <section class="fx-page-stack" aria-label="Request recovery">
    <UFormField
      v-if="!state.request"
      label="Recovery key"
      description="Use the key saved when you submitted this request."
    >
      <UInput v-model="state.token" type="password" autocomplete="off" />
      <UButton :loading="state.busy" @click="state.recover"
        >Open request</UButton
      >
    </UFormField>
    <template v-else>
      <UFormField
        label="Recovery key"
        description="Keep this key to recover your request in another browser."
        ><UInput :model-value="state.token" type="password" readonly
      /></UFormField>
      <UButton @click="copy">Copy recovery key</UButton>
      <p v-if="copied">Recovery key copied.</p>
      <p v-if="error" role="alert">{{ error }}</p>
    </template>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { MenuExpressRequestView } from '../../composables/useMenuExpressRequest'
const props = defineProps<{
  state: Pick<MenuExpressRequestView, 'request' | 'token' | 'busy' | 'recover'>
}>()
const copied = ref(false),
  error = ref('')
async function copy() {
  error.value = ''
  try {
    await navigator.clipboard.writeText(props.state.token)
    copied.value = true
  } catch {
    error.value =
      'The key could not be copied. Keep this browser available to recover your request.'
  }
}
</script>
