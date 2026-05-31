<template>
  <UCard
    variant="subtle"
    class="w-full"
  >
    <template #header>
      <div class="space-y-1">
        <h2 class="text-base font-semibold text-highlighted">
          Add menu document
        </h2>
        <p class="text-sm text-muted">
          Upload a finished PDF, DOC, or DOCX to this kitchen.
        </p>
      </div>
    </template>

    <UAlert
      v-if="!canWrite || !kitchenId"
      color="neutral"
      variant="soft"
      title="Select a writable kitchen"
      description="Choose a live kitchen before adding a menu document."
    />

    <form
      v-else
      class="space-y-4"
      @submit.prevent="createMenu"
    >
      <UFormField label="Menu file">
        <UInput
          type="file"
          accept="application/pdf,.doc,.docx"
          class="w-full"
          @change="setFile"
        />
        <p class="mt-1 text-xs text-muted">
          PDF, DOC, or DOCX. Max 10 MB.
        </p>
      </UFormField>

      <UFormField label="Menu path">
        <UInput
          v-model="slugInput"
          placeholder="dinner-menu"
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
        icon="i-lucide-file-up"
        block
        :disabled="!canCreate"
        :loading="isCreating"
      >
        {{ isCreating ? 'Adding menu...' : 'Add menu document' }}
      </UButton>

      <p
        v-if="createError"
        class="text-xs text-error"
      >
        {{ createError }}
      </p>

      <div
        v-if="createdConsolePath || createdPublicPath"
        class="flex flex-wrap gap-2"
      >
        <UButton
          v-if="createdConsolePath"
          :to="createdConsolePath"
          icon="i-lucide-list-tree"
        >
          Edit menu
        </UButton>
        <UButton
          v-if="createdPublicPath"
          :to="createdPublicPath"
          target="_blank"
          icon="i-lucide-external-link"
          variant="soft"
        >
          Open public menu
        </UButton>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenConsoleMenus } from 'fireux-kitchens/runtime/composables/fireux/console/kitchen/operations/useKitchenConsoleMenus'

const { kitchenId, selectedKitchen, canWrite } = useKitchenConsoleMenus()

const file = ref<File | null>(null)
const slugInput = ref('')
const slugTaken = ref(false)
const slugError = ref('')
const isCreating = ref(false)
const createError = ref('')
const createdConsolePath = ref('')
const createdPublicPath = ref('')

const normalizedSlug = computed(() =>
  slugInput.value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
)
const kitchenSlug = computed(() => String((selectedKitchen.value as any)?.slug || '').trim())
const previewUrl = computed(() => {
  const slug = normalizedSlug.value || 'dinner-menu'
  return kitchenSlug.value
    ? `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus/${encodeURIComponent(slug)}`
    : `/kitchens/{kitchen}/menus/${encodeURIComponent(slug)}`
})
const encodedKitchenId = computed(() => encodeURIComponent(kitchenId.value || ''))
const availabilityEndpoint = computed(() =>
  `/api/console/kitchen/menus/${encodedKitchenId.value}/availability`
)
const createEndpoint = computed(() =>
  `/api/console/kitchen/menus/${encodedKitchenId.value}/create`
)
const canUseSlug = computed(() => Boolean(normalizedSlug.value && !slugTaken.value && !slugError.value))
const slugMessage = computed(() => {
  if (slugError.value) return slugError.value
  if (slugTaken.value) return 'This menu path is already taken.'
  return normalizedSlug.value ? 'Path is available.' : ''
})
const canCreate = computed(() =>
  Boolean(file.value && kitchenId.value && canWrite.value && canUseSlug.value && !isCreating.value)
)

watch(slugInput, async () => {
  const slug = normalizedSlug.value
  slugTaken.value = false
  slugError.value = ''
  createdConsolePath.value = ''
  createdPublicPath.value = ''

  if (!slug || !kitchenId.value) return

  try {
    const response = await $fetch<{
      taken?: boolean
      is_valid?: boolean
      message?: string
    }>(availabilityEndpoint.value, {
      query: { id: slug },
    })

    slugTaken.value = Boolean(response.taken)
    slugError.value = response.is_valid === false ? response.message || 'Menu path is not valid.' : ''
  } catch (error) {
    slugError.value = error instanceof Error ? error.message : 'Menu path is not valid.'
  }
})

function setFile(event: Event) {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] || null
  createError.value = ''
}

async function createMenu() {
  if (!canCreate.value || !file.value) return

  isCreating.value = true
  createError.value = ''
  createdConsolePath.value = ''
  createdPublicPath.value = ''

  try {
    const form = new FormData()
    form.append('slug', normalizedSlug.value)
    form.append('file', file.value)

    const response = await $fetch<{
      slug?: string
      path?: string
    }>(createEndpoint.value, {
      method: 'POST',
      body: form,
    })

    const slug = response.slug || normalizedSlug.value
    createdConsolePath.value = `/console/kitchen/menus/${encodeURIComponent(slug)}`
    createdPublicPath.value = response.path || ''
  } catch (error) {
    createError.value = error instanceof Error ? error.message : 'Menu document could not be added.'
  } finally {
    isCreating.value = false
  }
}
</script>
