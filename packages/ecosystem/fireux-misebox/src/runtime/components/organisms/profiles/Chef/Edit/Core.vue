<template>
  <ClientOnly>
    <div v-if="chef" class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <MoleculesFormsFirestoreSimpleField
            label="Tagline"
            :firebase-value="tagline"
            placeholder="Ex: Private chef focused on seasonal tasting menus"
            :update-function="handleTagline"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Short Bio"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :firebase-value="chef.bio_short || ''"
            placeholder="Share a quick intro for listings"
            :update-function="handleShortBio"
          />
        </div>
      </UCard>
    </div>

    <MoleculesNotFound v-else entity="chef profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefCoreProfile } from '../../../../../models/profiles/Chef.model.ts'
import { useChefUpdate } from '../../../../../composables/firestore/profiles/Chef/main/useChefUpdate.ts'

const props = defineProps<{ chef: ChefCoreProfile | null }>()

const chef = computed(() => props.chef ?? null)
const { updateTagline, updateBioShort } = useChefUpdate()

const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const tagline = computed(
  () =>
    chef.value?.tagline ??
    (chef.value as { subtitle?: string | null } | null)?.subtitle ??
    ''
)

const handleTagline = async (value: string) => {
  if (!chef.value) return 'success'
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
  if (!chef.value) return 'success'
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
