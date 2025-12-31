<template>
  <div class="space-y-2">
    <OrganismsProfilesProfessionalSectionsLocalCollection v-if="isTenant" />

    <section class="space-y-2">
      <div v-if="isTenant" class="flex items-center justify-end">
        <UButton
          variant="ghost"
          @click="showGlobalDirectory = !showGlobalDirectory"
        >
          {{
            showGlobalDirectory
              ? 'Hide global professionals'
              : 'View global professionals'
          }}
        </UButton>
      </div>

      <OrganismsProfilesProfessionalSectionsGlobalCollection
        v-if="showGlobalDirectory || !isTenant"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(true)
</script>
