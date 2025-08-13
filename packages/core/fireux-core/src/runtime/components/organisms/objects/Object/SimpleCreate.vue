<script setup lang="ts">
import { computed } from 'vue'
import { useSimpleObjectCreate } from '@/runtime/composables/firestore/objects/useSimpleObjectCreate'

interface Props {
  collection: string
  label?: string
  placeholder?: string
  autoFocus?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  label: 'Add Item',
  placeholder: 'Name',
  autoFocus: false,
})

const createCtx = useSimpleObjectCreate({ collectionName: props.collection })
const canSubmit = computed(() => !!createCtx.name.value.trim() && !createCtx.creating.value)

function onEnter(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}

async function submit() {
  if (!canSubmit.value) return
  await createCtx.create()
}
</script>

<template>
  <div class="simple-create">
    <UForm class="simple-create-form" @submit.prevent="submit">
      <UFormGroup :label="props.label" name="name" required>
        <UInput
          v-model="createCtx.name.value"
          :placeholder="props.placeholder"
          :autofocus="props.autoFocus"
          autocomplete="off"
          @keydown="onEnter"
        />
      </UFormGroup>
      <UButton
        type="submit"
        :loading="createCtx.creating.value"
        :disabled="!canSubmit"
        class="submit-btn"
      >Add</UButton>
    </UForm>
    <p v-if="createCtx.error.value" class="err">{{ createCtx.error.value }}</p>
  </div>
</template>

<style scoped>
.simple-create-form { display: flex; flex-direction: column; gap: .5rem; }
@media (min-width:600px){ .simple-create-form { flex-direction: row; align-items: flex-end; } }
.submit-btn { margin-top: .25rem; }
.err { margin:.25rem 0 0; font-size:.7rem; color:#dc2626; }
</style>
