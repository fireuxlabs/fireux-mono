<template>
  <ClientOnly>
    <div v-if="supplier" class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <MoleculesFormsFirestoreSimpleField
            label="Tagline"
            :firebase-value="tagline"
            placeholder="Summarize your business focus"
            :update-function="handleTagline"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Short Bio"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :firebase-value="supplier.bio_short || ''"
            placeholder="Share a quick intro for listings"
            :update-function="handleShortBio"
          />
        </div>
      </UCard>
    </div>

    <MoleculesStateCard
      v-else
      entity="supplier profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SupplierCoreProfile } from '../../../../../models/profiles/Supplier/Supplier.model.ts'
import { useSupplierUpdate } from '../../../../../composables/fireux/firestore/profiles/Supplier/main/useSupplierUpdate.ts'

const props = defineProps<{ supplier: SupplierCoreProfile | null }>()

const supplier = computed(() => props.supplier ?? null)
const { updateTagline, updateBioShort } = useSupplierUpdate()

const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const tagline = computed(
  () =>
    supplier.value?.tagline ??
    (supplier.value as { subtitle?: string | null } | null)?.subtitle ??
    ''
)

const handleTagline = async (value: string) => {
  if (!supplier.value) return 'success'
  try {
    await updateTagline(value)
    toast?.add({
      title: 'Tagline updated',
      icon: 'i-heroicons-check-circle',
    })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update tagline',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleShortBio = async (value: string) => {
  if (!supplier.value) return 'success'
  try {
    await updateBioShort(value)
    toast?.add({
      title: 'Short bio updated',
      icon: 'i-heroicons-check-circle',
    })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update short bio',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}
</script>
