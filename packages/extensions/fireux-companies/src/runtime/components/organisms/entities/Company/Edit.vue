<template>
  <section class="space-y-3">
    <ClientOnly>
      <UCard v-if="!company" variant="subtle">
        <p class="text-sm text-dimmed">Company data unavailable.</p>
      </UCard>

      <div v-else class="space-y-6">
        <UCard>
          <MoleculesFormsFirestoreSimpleField
            label="Website"
            :firebase-value="company.website"
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
import { useCompanyUpdate } from '../../../../composables/fireux/firestore/objects/company/mutations/useCompanyUpdate';
import type { Company } from '../../../../models/objects/company.model';

const props = defineProps<{ company: Company | null }>()
const company = computed(() => props.company)
const companyId = computed(() => company.value?.id ?? '')

const { updateCompany } = useCompanyUpdate()
const toast = useToastify()

const sanitize = (value: string) => value.trim()

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
</script>
