<template>
  <section
    v-if="state.request?.review"
    class="fx-page-stack"
    aria-label="Customer review"
  >
    <MenuExpressPreview :review="state.request.review" />
    <template v-if="state.request.stage === 'review'">
      <UFormField label="Corrections"
        ><UTextarea v-model="note" maxlength="2000"
      /></UFormField>
      <UButton
        :disabled="!note.trim()"
        :loading="state.busy"
        variant="outline"
        @click="state.act('correction', { note })"
        >Request corrections</UButton
      >
      <UButton :loading="state.busy" @click="state.act('approve')"
        >Approve this menu</UButton
      >
    </template>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { MenuExpressRequestView } from '../../composables/useMenuExpressRequest'
defineProps<{
  state: Pick<MenuExpressRequestView, 'request' | 'busy' | 'act'>
}>()
const note = ref('')
</script>
