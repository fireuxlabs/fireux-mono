<template>
  <UCard>
    <template #header>
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-swatch-book" class="mt-1 size-5 text-muted" />
        <div>
          <div class="text-base font-semibold text-highlighted">
            Kitchen colours
          </div>
          <p class="text-sm text-dimmed">
            Used by menus without their own colours.
          </p>
        </div>
      </div>
    </template>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField v-for="field in fields" :key="field.key" :label="field.label">
        <div class="flex items-center gap-2">
          <input
            class="size-9 rounded-md border border-default bg-default"
            type="color"
            :value="draft[field.key]"
            :disabled="!canWrite"
            @input="set(field.key, ($event.target as HTMLInputElement).value)"
          />
          <UInput
            :model-value="draft[field.key]"
            :disabled="!canWrite"
            class="w-full"
            @update:model-value="set(field.key, String($event))"
          />
        </div>
      </UFormField>
    </div>

    <div class="mt-4 flex items-center justify-between gap-3">
      <p class="text-xs text-dimmed">{{ saveState }}</p>
      <UButton
        size="sm"
        :disabled="!canWrite || !valid"
        :loading="saving"
        @click="$emit('save', draft)"
      >
        Save
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { WorkspacePalette } from 'fireux-core/types/theme'
import { computed, reactive, watch } from 'vue'

const props = defineProps<{
  palette: WorkspacePalette
  canWrite: boolean
  saving: boolean
  saveState: string
}>()

defineEmits<{ save: [palette: WorkspacePalette] }>()

const fields = [
  { key: 'canvas', label: 'Canvas' },
  { key: 'text', label: 'Text' },
  { key: 'accent', label: 'Accent' },
  { key: 'accent_contrast', label: 'Accent contrast' },
] as const

const draft = reactive<WorkspacePalette>({ ...props.palette })
watch(
  () => props.palette,
  (palette: WorkspacePalette) => Object.assign(draft, palette),
  { deep: true }
)

const set = (key: keyof WorkspacePalette, value: string) => {
  draft[key] = value.trim().toLowerCase()
}
const valid = computed(() =>
  fields.every((field) => /^#[0-9a-f]{6}$/i.test(draft[field.key]))
)
</script>
