<template>
  <div class="space-y-2">
    <OrganismsProfilesSupplierSectionsLocalCollection v-if="isTenant" />

    <section class="space-y-2">
      <div v-if="isTenant" class="flex items-center justify-end">
        <UButton variant="ghost" @click="showGlobalDirectory = !showGlobalDirectory">
          {{ showGlobalDirectory ? 'Hide global suppliers' : 'View global suppliers' }}
        </UButton>
      </div>

      <OrganismsProfilesSupplierSectionsGlobalCollection
        v-if="showGlobalDirectory || !isTenant"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'

const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(!isTenant)
</script>
