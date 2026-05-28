<template>
  <div class="space-y-4">
    <form class="space-y-4" @submit.prevent="createQr">
      <UFormField :label="tool.ui.text_label">
        <UTextarea
          v-model="textInput"
          :placeholder="tool.ui.text_placeholder"
          :rows="4"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="tool.slug.label">
        <UInput
          v-model="slugInput"
          :placeholder="tool.slug.placeholder"
          class="w-full"
        />
        <p class="mt-1 text-xs text-muted">
          {{ previewUrl }}
        </p>
        <p
          v-if="slugMessage"
          class="mt-1 text-xs"
          :class="slugIsValid ? 'text-muted' : 'text-error'"
        >
          {{ slugMessage }}
        </p>
      </UFormField>

      <UButton
        type="submit"
        icon="i-lucide-qr-code"
        block
        size="lg"
        :disabled="!canCreate"
        :loading="isCreating"
      >
        {{ isCreating ? tool.ui.loading_label : tool.ui.cta_label }}
      </UButton>

      <p v-if="createError" class="text-xs text-error">
        {{ createError }}
      </p>
    </form>

    <div
      v-if="createdQrPath"
      class="flex flex-wrap gap-2 border-t border-default pt-4"
    >
      <UButton :to="createdPath" target="_blank" icon="i-lucide-external-link">
        {{ tool.ui.open_target_label }}
      </UButton>
      <UButton :to="createdQrPath" target="_blank" icon="i-lucide-qr-code" variant="soft">
        {{ tool.ui.open_qr_label }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import type { GoQrTextToolContract } from '../../../../utils/goQrProviderClient'

const props = defineProps<{
  tool: GoQrTextToolContract
}>()

const textInput = ref('')
const slugInput = ref('')
const slugError = ref('')
const slugTaken = ref(false)
const availabilityPending = ref(false)
const isCreating = ref(false)
const createError = ref('')
const createdPath = ref('')
const createdQrPath = ref('')

const normalizedSlug = computed(() => normalizeSlug(slugInput.value))
const slugIsValid = computed(() => Boolean(normalizedSlug.value && !slugError.value && !slugTaken.value))
const previewUrl = computed(() => {
  const slug = normalizedSlug.value || props.tool.slug.placeholder
  return `${props.tool.preview.base_url}/${slug}${props.tool.preview.path_suffix}`
})
const slugMessage = computed(() => {
  if (slugError.value) return slugError.value
  if (slugTaken.value) return props.tool.slug.taken_message
  if (availabilityPending.value) return 'Checking path...'
  return normalizedSlug.value ? 'Path is available.' : ''
})
const canCreate = computed(() =>
  Boolean(textInput.value.trim() && slugIsValid.value && !availabilityPending.value && !isCreating.value)
)

function resetCreatedState() {
  createdPath.value = ''
  createdQrPath.value = ''
}

function localSlugError(slug: string) {
  const result = validatePublicSlug(slug, {
    label: props.tool.slug.validation_label,
    reservedScope: 'entity',
    reserved: props.tool.slug.reserved,
  })

  return result.isValid ? '' : result.message || 'Text path is not valid.'
}

watch(slugInput, async (value) => {
  const slug = normalizeSlug(value)
  slugTaken.value = false
  slugError.value = localSlugError(slug)
  resetCreatedState()

  if (!slug || slugError.value) return

  availabilityPending.value = true
  try {
    const response = await $fetch<{ taken?: boolean, is_valid?: boolean, message?: string }>(
      props.tool.endpoints.availability,
      { query: { id: slug } }
    )
    slugTaken.value = Boolean(response.taken)
    slugError.value = response.is_valid === false ? response.message || 'Text path is not valid.' : ''
  } catch (error) {
    slugError.value = error instanceof Error ? error.message : 'Text path is not valid.'
  } finally {
    availabilityPending.value = false
  }
})

async function createQr() {
  if (!canCreate.value) return

  isCreating.value = true
  createError.value = ''
  resetCreatedState()

  try {
    const response = await $fetch<{ path?: string, qr_path?: string, url?: string, qr_url?: string }>(props.tool.endpoints.create, {
      method: 'POST',
      body: {
        slug: normalizedSlug.value,
        text: textInput.value.trim(),
        display_label: normalizedSlug.value,
        qr_centre_label: 'Q',
      },
    })

    createdPath.value = response.url || response.path || ''
    createdQrPath.value = response.qr_url || response.qr_path || ''
  } catch (error) {
    createError.value = error instanceof Error ? error.message : 'QR code could not be created.'
  } finally {
    isCreating.value = false
  }
}
</script>
