<template>
  <section :aria-label="title">
    <h2>{{ title }}</h2>
    <p v-if="pending" role="status">Loading context…</p>
    <UTextarea
      v-if="ready"
      v-model="text"
      :aria-label="title"
      :disabled="disabled || saving"
      :rows="5"
      :maxlength="maxlength ?? 32000"
      placeholder="Background, decisions and questions to confirm"
      autoresize
      @blur="text.trim() !== value && emit('update', text)"
    />
    <p v-if="saving" role="status">Updating…</p>
    <div v-if="error">
      <FireCopyError :message="error" />
      <div class="fx-card__actions">
        <UButton
          v-if="ready"
          label="Retry update"
          color="neutral"
          variant="soft"
          :disabled="saving"
          @click="emit('update', text)"
        />
        <UButton
          label="Reload saved context"
          color="neutral"
          variant="ghost"
          :disabled="saving || pending"
          @click="emit('reload')"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{
  maxlength?: number
  title: string
  value: string
  ready: boolean
  pending?: boolean
  saving?: boolean
  disabled?: boolean
  error?: string
}>()
const emit = defineEmits<{ update: [value: string]; reload: [] }>()
const text = ref(props.value)
watch(
  () => props.value,
  (value) => {
    text.value = value
  }
)
</script>
