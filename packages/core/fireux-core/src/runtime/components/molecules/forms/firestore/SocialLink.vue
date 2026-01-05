<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center gap-2 text-sm font-medium text-default">
      <Icon :name="icon" mode="svg" class="size-4" />
      <span>{{ label }}</span>
    </div>

    <div v-if="!isEditing" class="w-full rounded-md fx-field-surface px-3 py-2 text-sm">
      <a
        v-if="modelValue"
        :href="toHref(modelValue)"
        target="_blank"
        rel="noopener noreferrer"
        class="break-words text-default hover:underline"
      >
        {{ toHref(modelValue) }}
      </a>
      <span v-else class="text-dimmed italic">Not set</span>
    </div>

    <UFieldGroup v-else class="w-full">
      <div
        v-if="leading"
        class="flex w-full overflow-hidden rounded-md fx-field-surface"
      >
        <div
          class="shrink-0 border-r border-[var(--ui-border)] bg-transparent px-3 py-2 text-sm text-muted"
        >
          {{ leading }}
        </div>

        <input
          :id="id"
          :value="modelValue"
          :placeholder="computedPlaceholder"
          class="w-full bg-transparent px-3 py-2 text-sm text-default outline-none"
          @input="(e) => onInput(e)"
          @keydown.enter="emit('enter')"
          @keydown.esc="emit('esc')"
        />
      </div>

      <UInput
        v-else
        :id="id"
        :model-value="modelValue"
        :placeholder="computedPlaceholder"
        class="w-full"
        @update:model-value="(v: unknown) => emit('update:modelValue', String(v ?? ''))"
        @keyup.enter="emit('enter')"
        @keyup.esc="emit('esc')"
      />
    </UFieldGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  label: string
  icon: string
  isEditing: boolean
  modelValue: string
  placeholder?: string
  leading?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'enter'): void
  (e: 'esc'): void
}>()

const computedPlaceholder = computed(() => props.placeholder ?? '')
const leading = computed(() => (props.leading ?? '').trim())

function onInput(e: Event) {
  const target = e.target as HTMLInputElement | null
  emit('update:modelValue', target?.value ?? '')
}

function toHref(value: string): string {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}
</script>
