<template>
  <div>
    <UButton
      label="Edit identity"
      icon="i-lucide-pencil"
      color="neutral"
      variant="soft"
      size="sm"
      @click="openEditor"
    />

    <UModal
      v-model:open="open"
      title="Edit Kitchen identity"
      description="Kitchen-specific public presentation"
      :ui="{ content: 'sm:max-w-xl' }"
    >
      <template #body>
        <div class="space-y-5">
          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            title="Identity could not be saved"
            :description="errorMessage"
          />

          <div v-if="loading" class="py-8 text-center text-sm text-muted">
            Loading Kitchen identity…
          </div>

          <form v-else class="grid gap-4" @submit.prevent="save">
            <UFormField
              label="Kitchen name override"
              description="Leave blank to use the linked Place name."
            >
              <UInput
                v-model="form.display_name"
                class="w-full"
                maxlength="120"
                placeholder="Use the Place name"
                :disabled="saving"
              />
            </UFormField>

            <UFormField label="Tagline">
              <UInput
                v-model="form.tagline"
                class="w-full"
                maxlength="140"
                placeholder="Short public line"
                :disabled="saving"
              />
            </UFormField>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-default p-3">
                <div class="aspect-square overflow-hidden rounded-lg bg-elevated">
                  <img
                    v-if="logoPreview"
                    :src="logoPreview"
                    :alt="`${kitchen.display_name} logo`"
                    class="size-full object-contain"
                  >
                  <div
                    v-else
                    class="flex size-full flex-col items-center justify-center gap-2 text-muted"
                  >
                    <UIcon name="i-lucide-image" class="size-8" />
                    <span class="text-xs">1024 × 1024</span>
                  </div>
                </div>
                <div class="mt-3">
                  <p class="text-sm font-medium text-highlighted">Logo</p>
                  <p class="mt-1 text-xs text-muted">
                    Current Kitchen logo. Recommended: 1024 × 1024 px,
                    transparent PNG.
                  </p>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <UButton
                    label="Choose image"
                    icon="i-lucide-image-up"
                    color="neutral"
                    variant="soft"
                    size="xs"
                    :disabled="saving"
                    @click="logoInput?.click()"
                  />
                  <UButton
                    v-if="logoPreview"
                    label="Remove"
                    icon="i-lucide-x"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    :disabled="saving"
                    @click="clearLogo"
                  />
                  <input
                    ref="logoInput"
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    @change="selectLogo"
                  >
                </div>
              </div>

              <div class="rounded-xl border border-default p-3">
                <div class="aspect-square overflow-hidden rounded-lg bg-elevated">
                  <img
                    v-if="cardPreview"
                    :src="cardPreview"
                    :alt="`${kitchen.display_name} card image`"
                    class="size-full object-cover"
                  >
                  <div
                    v-else
                    class="flex size-full flex-col items-center justify-center gap-2 text-muted"
                  >
                    <UIcon name="i-lucide-image" class="size-8" />
                    <span class="text-xs">1200 × 1200</span>
                  </div>
                </div>
                <div class="mt-3">
                  <p class="text-sm font-medium text-highlighted">Card image</p>
                  <p class="mt-1 text-xs text-muted">
                    Recommended: 1200 × 1200 px.
                  </p>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <UButton
                    label="Choose image"
                    icon="i-lucide-image-up"
                    color="neutral"
                    variant="soft"
                    size="xs"
                    :disabled="saving"
                    @click="cardInput?.click()"
                  />
                  <UButton
                    v-if="form.card_image_url || cardFile"
                    label="Use Place image"
                    icon="i-lucide-undo-2"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    :disabled="saving"
                    @click="clearCard"
                  />
                  <input
                    ref="cardInput"
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    @change="selectCard"
                  >
                </div>
              </div>
            </div>

            <p class="text-xs leading-5 text-muted">
              Address, contact details, cover imagery and gallery remain owned
              by the linked Place. Menus remain managed in the Kitchen Console.
            </p>
          </form>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <UButton
            to="/console/kitchen/identity"
            label="Open full identity"
            icon="i-lucide-panel-right-open"
            color="neutral"
            variant="ghost"
            @click="open = false"
          />
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              :disabled="saving"
              @click="open = false"
            />
            <UButton
              label="Save identity"
              icon="i-lucide-check"
              :loading="saving"
              :disabled="loading"
              @click="save"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { computed, reactive, ref } from 'vue'
import type {
  KitchenPublicIdentityEdit,
  KitchenPublicIdentityEditResponse,
  PublicKitchenDetail,
} from '../../../models/kitchen/kitchen-index.model'

const props = defineProps<{
  kitchen: PublicKitchenDetail
}>()

const emit = defineEmits<{
  saved: [identity: KitchenPublicIdentityEdit]
}>()

const emptyIdentity = (): KitchenPublicIdentityEdit => ({
  display_name: '',
  tagline: '',
  card_image_url: '',
  logo_image_url: '',
})
const form = reactive<KitchenPublicIdentityEdit>(emptyIdentity())
const open = ref(false)
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const logoInput = ref<HTMLInputElement | null>(null)
const cardInput = ref<HTMLInputElement | null>(null)
const logoFile = ref<File | null>(null)
const cardFile = ref<File | null>(null)
const logoLocalPreview = ref('')
const cardLocalPreview = ref('')
const { currentUser } = useAuth()
const { uploadImage } = useImageStorage()
const toast = useToastify()
const logoPreview = computed(() =>
  logoLocalPreview.value || form.logo_image_url
)
const cardPreview = computed(() =>
  cardLocalPreview.value ||
  form.card_image_url ||
  props.kitchen.cover_image ||
  props.kitchen.place_image_url ||
  ''
)

async function authorization() {
  const user = currentUser.value
  if (!user) throw new Error('Sign in to edit this Kitchen.')
  return {
    Authorization: `Bearer ${await user.getIdToken()}`,
  }
}

function assignIdentity(identity: KitchenPublicIdentityEdit) {
  Object.assign(form, identity)
  resetSelectedFiles()
}

function imageFile(event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0] || null
  if (input) input.value = ''
  if (!file) return null
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file.')
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Images must be 10 MB or smaller.')
  }
  return file
}

function replacePreview(target: typeof logoLocalPreview, file: File | null) {
  if (target.value.startsWith('blob:')) URL.revokeObjectURL(target.value)
  target.value = file ? URL.createObjectURL(file) : ''
}

function resetSelectedFiles() {
  replacePreview(logoLocalPreview, null)
  replacePreview(cardLocalPreview, null)
  logoFile.value = null
  cardFile.value = null
}

function selectLogo(event: Event) {
  try {
    const file = imageFile(event)
    logoFile.value = file
    replacePreview(logoLocalPreview, file)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Choose another image.'
  }
}

function selectCard(event: Event) {
  try {
    const file = imageFile(event)
    cardFile.value = file
    replacePreview(cardLocalPreview, file)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Choose another image.'
  }
}

function clearLogo() {
  logoFile.value = null
  replacePreview(logoLocalPreview, null)
  form.logo_image_url = ''
}

function clearCard() {
  cardFile.value = null
  replacePreview(cardLocalPreview, null)
  form.card_image_url = ''
}

async function openEditor() {
  open.value = true
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await $fetch<KitchenPublicIdentityEditResponse>(
      `/api/kitchens/${encodeURIComponent(props.kitchen.slug)}/identity`,
      { headers: await authorization() }
    )
    assignIdentity(response.identity)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Please try again.'
  } finally {
    loading.value = false
  }
}

async function save() {
  if (loading.value || saving.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    const identity = { ...form }
    if (logoFile.value) {
      identity.logo_image_url = await uploadImage(
        `kitchens/${props.kitchen.id}/identity/logo/current`,
        logoFile.value
      )
    }
    if (cardFile.value) {
      identity.card_image_url = await uploadImage(
        `kitchens/${props.kitchen.id}/identity/card/current`,
        cardFile.value
      )
    }
    const response = await $fetch<KitchenPublicIdentityEditResponse>(
      `/api/kitchens/${encodeURIComponent(props.kitchen.slug)}/identity`,
      {
        method: 'PATCH',
        headers: await authorization(),
        body: identity,
      }
    )
    assignIdentity(response.identity)
    emit('saved', response.identity)
    toast.success('Kitchen identity updated')
    open.value = false
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Please try again.'
  } finally {
    saving.value = false
  }
}
</script>
