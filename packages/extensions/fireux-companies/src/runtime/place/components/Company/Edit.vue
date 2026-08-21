<template>
  <section class="space-y-3">
    <ClientOnly>
      <UCard v-if="!company" variant="subtle">
        <p class="text-sm text-dimmed">Company data unavailable.</p>
      </UCard>

      <div v-else class="space-y-6">
        <PlaceEdit v-if="canEdit" :place="placeForEdit" />
        <UAlert
          v-else
          color="warning"
          variant="soft"
          title="Editing locked"
          description="Company editing is currently available to administrators."
        />
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import {
  PlaceDefaults,
  type Place,
} from 'fireux-places/runtime/place/models/place.model'
import { computed } from 'vue'
import type { CompanyDetail } from '../../models/company-directory.model.ts'

const props = defineProps<{ company: CompanyDetail | null }>()
const company = computed(() => props.company)
const { isAdmin } = useUser()
const canEdit = computed(() => Boolean(isAdmin.value))
const placeForEdit = computed<Place | null>(() =>
  company.value ? { ...PlaceDefaults, ...company.value } : null
)
</script>
