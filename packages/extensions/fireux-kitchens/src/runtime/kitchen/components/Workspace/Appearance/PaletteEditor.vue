<template>
  <section class="mx-auto w-full max-w-6xl space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted">
        Appearance
      </h1>
      <p class="mt-2 text-sm text-muted">
        Choose the colours used across your Kitchen’s menus.
      </p>
    </div>
    <div class="appearance-editor">
      <div class="space-y-5">
        <UCard v-for="group in groups" :key="group.label">
          <template #header
            ><h2 class="font-semibold">{{ group.label }}</h2></template
          >
          <div class="space-y-5">
            <UFormField
              v-for="field in group.fields"
              :key="field.key"
              :label="field.label"
              :error="
                validColour(draft[field.key])
                  ? undefined
                  : 'Use a six-digit hex colour, such as #ffffff.'
              "
            >
              <div class="flex items-center gap-3">
                <input
                  class="appearance-swatch"
                  type="color"
                  :aria-label="`Choose ${field.label.toLowerCase()}`"
                  :value="previewPalette[field.key]"
                  :disabled="!canWrite || saving"
                  @input="
                    set(field.key, ($event.target as HTMLInputElement).value)
                  "
                />
                <UInput
                  :model-value="draft[field.key]"
                  :aria-label="field.label"
                  :disabled="!canWrite || saving"
                  class="w-full"
                  maxlength="7"
                  @update:model-value="set(field.key, String($event))"
                />
              </div>
            </UFormField>
          </div>
        </UCard>
        <UAlert
          v-if="conflict"
          title="Colours changed elsewhere"
          description="Discard your draft to load the latest colours."
          color="warning"
        />
        <UAlert
          v-if="error"
          title="Could not save colours"
          :description="error"
          color="error"
          ><template #actions><MoleculesCopyError :message="error" /></template
        ></UAlert>
        <div class="flex flex-wrap items-center gap-3">
          <UButton
            label="Save colours"
            :disabled="!canWrite || !valid || !dirty || conflict"
            :loading="saving"
            @click="$emit('save', { ...draft })"
          />
          <UButton
            v-if="dirty || conflict"
            label="Discard changes"
            color="neutral"
            variant="ghost"
            :disabled="saving"
            @click="reset"
          />
          <span class="text-xs text-muted" aria-live="polite">{{
            dirty ? 'Unsaved changes' : saveState
          }}</span>
        </div>
      </div>
      <div class="appearance-editor__preview space-y-3">
        <WorkspaceKitchenAppearancePreview
          :palette="previewPalette"
          :name="name"
          :image-url="imageUrl"
        />
        <p class="text-center text-xs text-muted">
          Preview only. Your colours change when you save.
        </p>
      </div>
    </div>
    <ClientOnly>
      <DevDebugPanel v-bind="debug" title="Appearance debug" />
    </ClientOnly>
  </section>
</template>
<script setup lang="ts">
import { defineDevDebugPayload } from 'fireux-core/runtime/types/dev-debug'
import type { WorkspacePalette } from 'fireux-core/types/theme'
import { computed, reactive, ref, watch } from 'vue'
const props = withDefaults(
  defineProps<{
    palette: WorkspacePalette
    storedPalette: WorkspacePalette | null
    debugContext: {
      route: string
      kitchenId: string
      placeId: string
      reads: { kitchen: string; place: string }
      paletteSource: string
    }
    canWrite: boolean
    saving: boolean
    saveState: string
    error?: string
    name?: string
    imageUrl?: string
  }>(),
  { error: '', name: 'Your Kitchen', imageUrl: '' }
)
defineEmits<{ save: [palette: WorkspacePalette] }>()
const groups = [
  {
    label: 'Page',
    fields: [
      { key: 'canvas', label: 'Background' },
      { key: 'text', label: 'Text' },
    ],
  },
  {
    label: 'Highlights',
    fields: [
      { key: 'accent', label: 'Accent colour' },
      { key: 'accent_contrast', label: 'Text on accent' },
    ],
  },
] as const
const keys = ['canvas', 'text', 'accent', 'accent_contrast'] as const
const draft = reactive<WorkspacePalette>({ ...props.palette })
const baseline = ref<WorkspacePalette>({ ...props.palette })
const conflict = ref(false)
const equal = (a: WorkspacePalette, b: WorkspacePalette) =>
  keys.every((key) => a[key] === b[key])
const dirty = computed(() => !equal(draft, baseline.value))
const validColour = (value: string) => /^#[0-9a-f]{6}$/i.test(value)
const valid = computed(() => keys.every((key) => validColour(draft[key])))
const previewPalette = computed<WorkspacePalette>(
  () =>
    Object.fromEntries(
      keys.map((key) => [
        key,
        validColour(draft[key]) ? draft[key] : props.palette[key],
      ])
    ) as WorkspacePalette
)
const debug = computed(() =>
  defineDevDebugPayload({
    objectOrigin: 'passed',
    objects: {
      storedPalette: props.storedPalette ? { ...props.storedPalette } : null,
      effectivePalette: { ...props.palette },
    },
    derived: {
      ...props.debugContext,
      draft: { ...draft },
      previewPalette: { ...previewPalette.value },
      dirty: dirty.value,
      valid: valid.value,
      conflict: conflict.value,
      canWrite: props.canWrite,
      saving: props.saving,
      saveState: props.saveState,
      hasSaveError: Boolean(props.error),
    },
  })
)
function set(key: keyof WorkspacePalette, value: string) {
  draft[key] = value.trim().toLowerCase()
}
function reset() {
  Object.assign(draft, props.palette)
  baseline.value = { ...props.palette }
  conflict.value = false
}
watch(
  () => props.palette,
  (next) => {
    if (equal(next, baseline.value)) return
    if (!dirty.value || equal(next, draft)) reset()
    else conflict.value = true
  },
  { deep: true }
)
</script>
<style scoped>
.appearance-editor {
  display: grid;
  gap: 2rem;
  align-items: start;
}
.appearance-swatch {
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  padding: 0.15rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.65rem;
  cursor: pointer;
  background: var(--ui-bg);
}
.appearance-swatch:disabled {
  cursor: default;
  opacity: 0.5;
}
@media (min-width: 64rem) {
  .appearance-editor {
    grid-template-columns: minmax(18rem, 0.85fr) minmax(0, 1.15fr);
  }
  .appearance-editor__preview {
    position: sticky;
    top: 1rem;
  }
}
</style>
