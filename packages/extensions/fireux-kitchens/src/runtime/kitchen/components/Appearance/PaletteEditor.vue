<template>
  <section class="workspace-surface" aria-labelledby="kitchen-menu-colours">
    <div class="section__copy">
      <h2 id="kitchen-menu-colours">Menu colours</h2>
    </div>
    <div class="workspace-surface__split">
      <div class="workspace-surface workspace-surface__primary">
        <UCard v-for="group in groups" :key="group.label">
          <template #header>
            <h3 class="fx-type-card-title">{{ group.label }}</h3>
          </template>
          <div class="workspace-surface__grid workspace-surface__grid--2">
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
              <div class="fx-card-body-stack">
                <UColorPicker
                  size="sm"
                  :aria-label="`Choose ${field.label.toLowerCase()}`"
                  :model-value="previewPalette[field.key]"
                  :disabled="!canWrite || saving"
                  @update:model-value="set(field.key, String($event))"
                />
                <UInput
                  :model-value="draft[field.key]"
                  :aria-label="field.label"
                  :disabled="!canWrite || saving"
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
        <div class="fx-card__actions">
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
          <span class="fx-type-caption" aria-live="polite">{{
            dirty ? 'Unsaved changes' : saveState
          }}</span>
        </div>
      </div>
      <div class="workspace-surface__context fx-card-body-stack">
        <KitchenAppearancePreview
          :palette="previewPalette"
          :name="name"
          :image-url="imageUrl"
          :image-fit="imageFit"
          :image-background="imageBackground"
        />
        <p class="fx-type-caption">
          Preview only. Your colours change when you save.
        </p>
      </div>
    </div>
    <ClientOnly>
      <DiagnosticsDebugPanel v-bind="debug" title="Appearance debug" />
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
    imageFit?: 'contain' | 'cover'
    imageBackground?: string
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
