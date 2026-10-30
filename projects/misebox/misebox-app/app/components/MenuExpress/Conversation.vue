<template>
  <section aria-label="Conversation" class="fx-page-stack">
    <h3>Conversation</h3>
    <article v-for="entry in state.messages" :key="entry.id">
      <strong>{{ entry.sender_name }}</strong>
      <p>{{ entry.body }}</p>
    </article>
    <UFormField :label="label"
      ><UTextarea v-model="draft" maxlength="4000"
    /></UFormField>
    <UButton :disabled="!draft.trim()" :loading="state.busy" @click="submit"
      >Send message</UButton
    >
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { MenuExpressRequestView } from '../../composables/useMenuExpressRequest'
const props = defineProps<{
  state: Pick<MenuExpressRequestView, 'messages' | 'busy' | 'send'>
  label: string
}>()
const draft = ref('')
async function submit() {
  const submitted = draft.value
  if ((await props.state.send(submitted)) && draft.value === submitted)
    draft.value = ''
}
</script>
