<template>
  <section class="space-y-3">
    <ClientOnly>
      <UCard v-if="!company" variant="subtle">
        <p class="text-sm text-dimmed">Company data unavailable.</p>
      </UCard>

      <div v-else class="space-y-6">
        <UCard>
          <div class="flex flex-col items-center gap-2">
            <MoleculesFormsFirestoreImagePicker
              :src="company.place_image"
              :alt="company.name || 'Company'"
              :initials="avatarInitials"
              :update-function="handleAvatarUpload"
            />
            <p v-if="avatarUploading" class="text-xs text-gray-500">
              Uploading image…
            </p>
          </div>
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Company name"
            :firebase-value="company.name"
            placeholder="e.g. Misebox"
            :maxlength="120"
            :update-function="handleUpdateName"
          />
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Website"
            :firebase-value="company.website"
            placeholder="https://…"
            :maxlength="200"
            :update-function="handleUpdateWebsite"
          />
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Formatted address"
            :firebase-value="company.formatted_address"
            placeholder="Gutenbrunnenstrasse 6, 3775 Lenk, Switzerland"
            :maxlength="200"
            :update-function="handleUpdateAddress"
          />
        </UCard>
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { computed, ref } from 'vue'
import { useCompanyUpdate } from '../../../../composables/fireux/firestore/objects/company/mutations/useCompanyUpdate'
import type { Company } from '../../../../models/objects/company.model'

const props = defineProps<{ company: Company | null }>()
const company = computed(() => props.company)
const companyId = computed(() => company.value?.id ?? '')

const avatarInitials = computed(() => {
  const name = company.value?.name || 'C'
  const trimmed = name.trim()
  if (!trimmed) return 'C'
  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
})

const avatarUploading = ref(false)
const { uploadImage } = useImageStorage()
const { updateCompany } = useCompanyUpdate()
const toast = useToastify()

const sanitize = (value: string) => value.trim()
const buildSearchTerm = (name?: string, address?: string) =>
  `${name ?? ''} ${address ?? ''}`.toLowerCase().trim()
const normalizeSearchTerm = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

async function handleAvatarUpload(file: File) {
  if (!companyId.value) return
  avatarUploading.value = true
  try {
    const url = await uploadImage(`companies/${companyId.value}/avatar`, file)
    await updateCompany(companyId.value, { place_image: url } as any)
    toast.success('Image updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update image: ${msg}`)
    throw error
  } finally {
    avatarUploading.value = false
  }
}

async function handleUpdateName(value: string) {
  if (!companyId.value) return
  try {
    const name = sanitize(value) || 'Untitled Company'
    const address = company.value?.formatted_address ?? ''
    const searchTerm = buildSearchTerm(name, address)
    await updateCompany(companyId.value, {
      name,
      search_term: searchTerm,
      search_term_normalized: normalizeSearchTerm(searchTerm),
    })
    toast.success('Name updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update name: ${msg}`)
    throw error
  }
}

async function handleUpdateWebsite(value: string) {
  if (!companyId.value) return
  try {
    await updateCompany(companyId.value, { website: sanitize(value) })
    toast.success('Website updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update website: ${msg}`)
    throw error
  }
}

async function handleUpdateAddress(value: string) {
  if (!companyId.value) return
  try {
    const address = sanitize(value)
    const name = company.value?.name ?? ''
    const searchTerm = buildSearchTerm(name, address)
    await updateCompany(companyId.value, {
      formatted_address: address,
      search_term: searchTerm,
      search_term_normalized: normalizeSearchTerm(searchTerm),
    } as any)
    toast.success('Address updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update address: ${msg}`)
    throw error
  }
}
</script>
