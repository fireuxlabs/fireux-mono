<template>
  <form class="grid gap-3" @submit.prevent="save">
    <UFormField label="String" :error="error || undefined">
      <UInput
        v-model="value"
        :disabled="busy"
        :maxlength="120"
        class="w-full"
      />
    </UFormField>
    <MoleculesCopyError v-if="error" :message="error" />
    <UButton
      type="submit"
      :label="label"
      :loading="busy"
      :disabled="!value.trim()"
      class="justify-self-start"
    />
  </form>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{
  initialValue?: string
  label: string
  submit: (value: string) => Promise<void>
}>()
const emit = defineEmits<{ saved: [] }>()
const value = ref(props.initialValue ?? '')
const busy = ref(false)
const error = ref('')
watch(
  () => props.initialValue,
  (text: string | undefined) => {
    value.value = text ?? ''
  }
)
async function save() {
  if (busy.value || !value.value.trim()) return
  busy.value = true
  error.value = ''
  try {
    await props.submit(value.value.trim())
    if (!props.initialValue) value.value = ''
    emit('saved')
  } catch {
    error.value =
      'The change could not be confirmed. Check the saved strings before trying again.'
  } finally {
    busy.value = false
  }
}
</script>
