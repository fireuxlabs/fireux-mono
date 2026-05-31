<template>
  <UCard
    variant="subtle"
    class="w-full"
  >
    <div class="space-y-4">
      <a
        href="https://go-qr.web.app"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-highlighted"
      >
        <img
          src="https://go-qr.web.app/img/app/logo.svg"
          alt="Go QR"
          class="size-4"
        >
        <span>Powered by Go QR</span>
      </a>

      <div class="space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="text-lg font-semibold text-highlighted">
            {{ data?.tool.title }}
          </h2>
          <UBadge
            label="/api/tools/doc"
            color="neutral"
            variant="soft"
          />
        </div>
        <p class="text-sm leading-6 text-muted">
          {{ data?.tool.description }}
        </p>
      </div>

      <form
        class="space-y-4"
        @submit.prevent="createMenu"
      >
        <UFormField label="Menu file">
          <UFileUpload
            v-model="selectedFile"
            accept="application/pdf,.doc,.docx"
            variant="area"
            size="xl"
            class="w-full"
          />
          <p class="mt-1 text-xs text-muted">
            PDF, DOC, or DOCX. Max 10 MB.
          </p>
        </UFormField>

        <UFormField label="Menu path">
          <UInput
            v-model="slugInput"
            placeholder="my-menu"
            class="w-full"
          />
          <p class="mt-1 break-all text-xs text-muted">
            {{ previewUrl }}
          </p>
          <p
            v-if="slugMessage"
            class="mt-1 text-xs"
            :class="canUseSlug ? 'text-muted' : 'text-error'"
          >
            {{ slugMessage }}
          </p>
        </UFormField>

        <UButton
          type="submit"
          icon="i-lucide-qr-code"
          block
          :disabled="!canCreate"
          :loading="isCreating"
        >
          {{ isCreating ? 'Creating menu...' : 'Create QR menu' }}
        </UButton>

        <p
          v-if="createError"
          class="text-xs text-error"
        >
          {{ createError }}
        </p>
      </form>

      <div
        v-if="createdPath"
        class="flex flex-wrap gap-2"
      >
        <UButton
          :to="createdPath"
          target="_blank"
          icon="i-lucide-external-link"
        >
          Open menu
        </UButton>
        <UButton
          :to="createdQrPath"
          target="_blank"
          icon="i-lucide-qr-code"
          variant="soft"
        >
          Open QR
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const providerBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'

const { data } = await useFetch(`${providerBaseUrl}/api/tools/doc`)

const selectedFile = ref<File | File[] | null>(null)
const slugInput = ref('')
const slugTaken = ref(false)
const slugError = ref('')
const isCreating = ref(false)
const createError = ref('')
const createdPath = ref('')
const createdQrPath = ref('')

const file = computed(() =>
  Array.isArray(selectedFile.value)
    ? selectedFile.value[0] || null
    : selectedFile.value
)
const normalizedSlug = computed(() =>
  slugInput.value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
)
const previewUrl = computed(() =>
  `https://misebox.app/menus/${normalizedSlug.value || 'my-menu'}/qr`
)
const canUseSlug = computed(() => Boolean(normalizedSlug.value && !slugTaken.value && !slugError.value))
const slugMessage = computed(() => {
  if (slugError.value) return slugError.value
  if (slugTaken.value) return 'This menu path is already taken.'
  return normalizedSlug.value ? 'Path is available.' : ''
})
const canCreate = computed(() =>
  Boolean(file.value && canUseSlug.value && !isCreating.value)
)

watch(slugInput, async () => {
  const slug = normalizedSlug.value
  slugTaken.value = false
  slugError.value = ''
  createdPath.value = ''
  createdQrPath.value = ''

  if (!slug) return

  try {
    const response = await $fetch<{
      taken?: boolean
      is_valid?: boolean
      message?: string
    }>('/api/menus/availability', {
      query: { id: slug },
    })

    slugTaken.value = Boolean(response.taken)
    slugError.value = response.is_valid === false ? response.message || 'Menu path is not valid.' : ''
  } catch (error) {
    slugError.value = error instanceof Error ? error.message : 'Menu path is not valid.'
  }
})

async function createMenu() {
  if (!canCreate.value || !file.value) return

  isCreating.value = true
  createError.value = ''
  createdPath.value = ''
  createdQrPath.value = ''

  try {
    const form = new FormData()
    form.append('slug', normalizedSlug.value)
    form.append('file', file.value)

    const response = await $fetch<{
      path?: string
      qr_path?: string
    }>('/api/menus/create', {
      method: 'POST',
      body: form,
    })

    createdPath.value = response.path || ''
    createdQrPath.value = response.qr_path || ''
  } catch (error) {
    createError.value = error instanceof Error ? error.message : 'Menu could not be created.'
  } finally {
    isCreating.value = false
  }
}
</script>
