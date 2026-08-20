<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-swatch-book" class="mt-1 size-5 text-muted" />
        <div>
          <h2 class="text-base font-semibold text-highlighted">Menu colours</h2>
          <p class="text-sm text-dimmed">
            {{
              hasOverride
                ? 'This Menu has its own four-colour palette.'
                : 'Inherited from the Kitchen until this Menu needs to stand out.'
            }}
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

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p class="text-xs text-dimmed">
        {{ hasOverride ? 'Menu override' : 'Kitchen palette' }}
      </p>
      <div class="flex gap-2">
        <UButton
          v-if="hasOverride"
          size="sm"
          color="neutral"
          variant="soft"
          :disabled="!canWrite"
          :loading="saving"
          @click="inheritKitchen"
        >
          Use Kitchen colours
        </UButton>
        <UButton
          size="sm"
          :disabled="!canWrite || !valid || !changed"
          :loading="saving"
          @click="save"
        >
          Save Menu colours
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { deleteField } from 'firebase/firestore'
import { readWorkspacePalette } from 'fireux-core/runtime/utils/brand-palette'
import type { WorkspacePalette } from 'fireux-core/types/theme'
import { computed, reactive, ref, watch } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenWorkspaceMenu } from '../../../../../composables/workspace/operations/Menus/useKitchenWorkspaceMenu'

const fallback: WorkspacePalette = {
  canvas: '#f8fafc',
  text: '#0f172a',
  accent: '#0f766e',
  accent_contrast: '#ffffff',
}
const fields = [
  { key: 'canvas', label: 'Canvas' },
  { key: 'text', label: 'Text' },
  { key: 'accent', label: 'Accent' },
  { key: 'accent_contrast', label: 'Accent contrast' },
] as const

const { menu, selectedKitchen, kitchenId, canWrite, updateMenu } =
  useKitchenWorkspaceMenu()
const toast = useToastify()
const saving = ref(false)
const menuPalette = computed(() =>
  readWorkspacePalette(menu.value?.theme?.palette)
)
const kitchenPalette = computed(() => {
  const kitchen = selectedKitchen.value as {
    workspace_theme?: { palette?: WorkspacePalette }
  } | null
  return readWorkspacePalette(kitchen?.workspace_theme?.palette) || fallback
})
const effectivePalette = computed(
  () => menuPalette.value || kitchenPalette.value
)
const hasOverride = computed(() => Boolean(menuPalette.value))
const draft = reactive<WorkspacePalette>({ ...effectivePalette.value })
watch(effectivePalette, (palette) => Object.assign(draft, palette), {
  deep: true,
})

const set = (key: keyof WorkspacePalette, value: string) => {
  draft[key] = value.trim().toLowerCase()
}
const valid = computed(() =>
  fields.every((field) => /^#[0-9a-f]{6}$/i.test(draft[field.key]))
)
const changed = computed(() =>
  fields.some((field) => draft[field.key] !== effectivePalette.value[field.key])
)

async function writeTheme(
  theme: { palette: WorkspacePalette } | ReturnType<typeof deleteField>
) {
  const menuId = String(menu.value?.id || '').trim()
  if (!canWrite.value || !kitchenId.value || !menuId) return
  saving.value = true
  try {
    await updateMenu(kitchenId.value, menuId, { theme: theme as never })
    toast.add({
      title: 'Menu colours updated',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    toast.add({
      title: 'Could not update Menu colours',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    saving.value = false
  }
}

const save = () => valid.value && writeTheme({ palette: { ...draft } })
const inheritKitchen = () => writeTheme(deleteField())
</script>
