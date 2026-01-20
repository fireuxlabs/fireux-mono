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
            label="Phone"
            type="phone"
            :firebase-value="company.phone"
            placeholder="+41 33 000 00 00"
            :maxlength="40"
            :update-function="handleUpdatePhone"
          />
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Email"
            type="email"
            :firebase-value="company.email"
            placeholder="hello@company.com"
            :maxlength="120"
            :update-function="handleUpdateEmail"
          />
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Summary"
            type="textarea"
            :rows="4"
            :firebase-value="company.summary"
            placeholder="Short description"
            :maxlength="500"
            :update-function="handleUpdateSummary"
          />
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreArrayOfStrings
            label="Badges"
            :firebase-value="company.badges || []"
            item-placeholder="Badge"
            new-item-placeholder="Add badge"
            :update-function="handleUpdateBadges"
          />
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreObjectArray
            label="Social links"
            :firebase-value="company.socials || []"
            :update-function="handleUpdateSocials"
          >
            <template #display="slotProps">
              <div class="p-4 border border-dashed rounded">
                <div class="text-sm font-medium">{{ slotProps.item?.name || 'Untitled' }}</div>
                <div class="text-xs text-gray-500">{{ slotProps.item?.url || 'No URL' }}</div>
                <div class="mt-3 flex gap-2">
                  <UButton
                    size="xs"
                    variant="soft"
                    icon="i-lucide-pencil"
                    @click="slotProps.startEditing()"
                  >
                    Edit
                  </UButton>
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="error"
                    icon="i-lucide-trash-2"
                    @click="slotProps.remove()"
                  >
                    Remove
                  </UButton>
                </div>
              </div>
            </template>

            <template #edit="slotProps">
              <div class="p-4 border border-dashed border-primary-300 rounded bg-primary-50">
                <div class="grid gap-2">
                  <UInput v-model="slotProps.item.name" placeholder="Name" />
                  <UInput v-model="slotProps.item.url" placeholder="https://..." />
                </div>
                <div class="mt-3 flex gap-2">
                  <UButton size="xs" variant="solid" icon="i-lucide-check" @click="slotProps.save()">
                    Save
                  </UButton>
                  <UButton size="xs" variant="soft" icon="i-lucide-x" @click="slotProps.cancel()">
                    Cancel
                  </UButton>
                </div>
              </div>
            </template>

            <template #create="slotProps">
              <UButton
                type="button"
                size="sm"
                variant="soft"
                icon="i-lucide-plus"
                @click="slotProps.push({ name: '', url: '' })"
              >
                Add link
              </UButton>
            </template>
          </MoleculesFormsFirestoreObjectArray>
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreMultiField
            label="Hours"
            :firebase-value="company.hours || {}"
            placeholder="Not set"
            :placeholders="hoursPlaceholders"
            :update-function="handleUpdateHours"
          />
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Brand color"
            :firebase-value="company.brand_color"
            placeholder="#ffffff"
            :maxlength="24"
            :update-function="handleUpdateBrandColor"
          />
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Logo variant"
            :firebase-value="company.logo_variant"
            placeholder="light | dark"
            :maxlength="40"
            :update-function="handleUpdateLogoVariant"
          />
        </UCard>

        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Place source"
            :firebase-value="company.place_source"
            placeholder="fireux | google | manual"
            :maxlength="40"
            :update-function="handleUpdatePlaceSource"
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

const hoursPlaceholders = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}

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

async function handleUpdatePhone(value: string) {
  if (!companyId.value) return
  try {
    await updateCompany(companyId.value, { phone: sanitize(value) })
    toast.success('Phone updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update phone: ${msg}`)
    throw error
  }
}

async function handleUpdateEmail(value: string) {
  if (!companyId.value) return
  try {
    await updateCompany(companyId.value, { email: sanitize(value) })
    toast.success('Email updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update email: ${msg}`)
    throw error
  }
}

async function handleUpdateSummary(value: string) {
  if (!companyId.value) return
  try {
    await updateCompany(companyId.value, { summary: sanitize(value) })
    toast.success('Summary updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update summary: ${msg}`)
    throw error
  }
}

async function handleUpdateBadges(value: string[]) {
  if (!companyId.value) return
  try {
    await updateCompany(companyId.value, { badges: value } as any)
    toast.success('Badges updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update badges: ${msg}`)
    throw error
  }
}

async function handleUpdateSocials(value: { name: string; url: string }[]) {
  if (!companyId.value) return
  try {
    await updateCompany(companyId.value, { socials: value } as any)
    toast.success('Social links updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update social links: ${msg}`)
    throw error
  }
}

async function handleUpdateHours(value: Record<string, string>) {
  if (!companyId.value) return
  try {
    await updateCompany(companyId.value, { hours: value } as any)
    toast.success('Hours updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update hours: ${msg}`)
    throw error
  }
}

async function handleUpdateBrandColor(value: string) {
  if (!companyId.value) return
  try {
    await updateCompany(companyId.value, { brand_color: sanitize(value) })
    toast.success('Brand color updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update brand color: ${msg}`)
    throw error
  }
}

async function handleUpdateLogoVariant(value: string) {
  if (!companyId.value) return
  try {
    await updateCompany(companyId.value, { logo_variant: sanitize(value) })
    toast.success('Logo variant updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update logo variant: ${msg}`)
    throw error
  }
}

async function handleUpdatePlaceSource(value: string) {
  if (!companyId.value) return
  try {
    await updateCompany(companyId.value, { place_source: sanitize(value) })
    toast.success('Place source updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update place source: ${msg}`)
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
