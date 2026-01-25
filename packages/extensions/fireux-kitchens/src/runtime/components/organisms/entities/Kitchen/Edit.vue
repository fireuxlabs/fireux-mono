<template>
  <section class="space-y-3">
    <ClientOnly>
      <UCard v-if="!kitchen" variant="subtle">
        <p class="text-sm text-dimmed">Kitchen data unavailable.</p>
      </UCard>

      <div v-else class="space-y-6">
        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Website"
            :firebase-value="kitchen.website"
            placeholder="https://…"
            :maxlength="200"
            :update-function="handleUpdateWebsite"
          />
        </UCard>
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify';
import { computed } from 'vue';
import { useKitchenUpdate } from '../../../../composables/fireux/firestore/objects/kitchen/mutations/useKitchenUpdate';
import type { Kitchen } from '../../../../models/objects/kitchen.model'

const props = defineProps<{ kitchen: Kitchen | null }>()
const kitchen = computed(() => props.kitchen)
const kitchenId = computed(() => kitchen.value?.id ?? '')
const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()

const sanitize = (value: string) => value.trim()

async function handleUpdateWebsite(value: string) {
  if (!kitchenId.value) return
  try {
    await updateKitchen(kitchenId.value, { website: sanitize(value) })
    toast.success('Website updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update website: ${msg}`)
    throw error
  }
}
</script>
