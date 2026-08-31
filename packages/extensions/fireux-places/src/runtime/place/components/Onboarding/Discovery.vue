<template>
  <section class="form-stack-sm">
    <UAlert
      color="primary"
      variant="soft"
      icon="i-lucide-sparkles"
      title="AI-assisted discovery"
      description="The introduction and categories use confirmed Place facts. Review them before saving. Add a real venue photograph when one is available."
    />

    <UFormField label="About" required>
      <UTextarea
        :model-value="about"
        maxlength="900"
        :rows="5"
        class="w-full"
        @update:model-value="emit('update:about', String($event || ''))"
      />
    </UFormField>

    <UFormField label="Discovery tags" hint="Comma-separated, up to 8">
      <UInput
        :model-value="tags.join(', ')"
        placeholder="restaurant, terrace, family-friendly"
        class="w-full"
        @update:model-value="updateTags"
      />
    </UFormField>

    <MoleculesFormsEditableImagePicker
      v-if="coverEditable"
      :src="previewSource"
      :alt="`${placeName} cover`"
      :initials="initials"
      :button-label="
        previewSource ? 'Change cover photograph' : 'Choose cover photograph'
      "
      :loading="uploading"
      :disabled="uploading"
      :update="stageCover"
    />

    <div
      v-else-if="coverImage"
      class="aspect-video overflow-hidden rounded-xl bg-elevated"
    >
      <img
        :src="coverImage"
        :alt="`${placeName} cover`"
        class="size-full object-cover"
      />
    </div>

    <UButton
      v-if="coverEditable && coverFile"
      type="button"
      color="neutral"
      variant="ghost"
      icon="i-lucide-x"
      label="Remove staged cover"
      :disabled="uploading"
      @click="clearCover"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  placeName: string
  about: string
  tags: string[]
  coverImage: string
  coverFile: File | null
  coverEditable: boolean
  uploading: boolean
}>()

const emit = defineEmits<{
  (event: 'update:about', value: string): void
  (event: 'update:tags', value: string[]): void
  (event: 'cover-selected', value: File | null): void
}>()

const objectUrl = ref('')
let previewedFile: File | null = null
const previewSource = computed(() => objectUrl.value || props.coverImage)
const initials = computed(() =>
  props.placeName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
)

function updateTags(value: unknown) {
  emit(
    'update:tags',
    String(value || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  )
}

function revokeObjectUrl() {
  if (objectUrl.value && import.meta.client)
    URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = ''
  previewedFile = null
}

function syncPreview(file: File | null) {
  if (previewedFile === file) return
  revokeObjectUrl()
  if (!file || !import.meta.client) return
  objectUrl.value = URL.createObjectURL(file)
  previewedFile = file
}

function stageCover(file: File) {
  if (!props.coverEditable) return
  syncPreview(file)
  emit('cover-selected', file)
}

function clearCover() {
  revokeObjectUrl()
  emit('cover-selected', null)
}

watch(() => props.coverFile, syncPreview, { immediate: true })
onBeforeUnmount(revokeObjectUrl)
</script>
