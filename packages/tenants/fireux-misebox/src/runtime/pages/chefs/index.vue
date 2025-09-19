<template>
  <div class="page space-y-4">
    <!-- CTA only when profile needs to be created or added to app -->
    <template v-if="showCreateGlobal || showAddToApp">
      <UPageCTA
        :title="ctaTitle"
        variant="soft"
      >
        <template #links>
          <UButton
            size="lg"
            color="primary"
            :label="primaryLabel"
            @click="onEnsure"
          />
        </template>
      </UPageCTA>
    </template>

    <!-- When both profiles exist: show compact current profile surfaces -->
    <template v-else>
      <div class="mt-4 space-y-2">
        <OrganismsProfilesChefCardsPill
          class="cursor-pointer"
          :chef="current"
        />
        <OrganismsProfilesChefCardsCell
          class="cursor-pointer"
          :chef="current"
        />
      </div>
    </template>

    <!-- Profiles via reusable Root -->
    <OrganismsProfileRoot :config="chefConfig">
      <template #profile-pill="{ profile, navigate }">
        <OrganismsProfilesChefCardsPill
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-card="{ profile, navigate }">
        <OrganismsProfilesChefCardsProfile
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>

      <template #profile-item="{ profile, navigate }">
        <OrganismsProfilesChefCardsCell
          class="cursor-pointer"
          :chef="profile"
          @click="navigate(profile)"
        />
      </template>
    </OrganismsProfileRoot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { chefConfig } from '../../models/profiles/Chef.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useChefCreate } from '../../composables/firestore/profiles/Chef/useChefCreate'

// tenancy state (strings, not refs)
const { role, tenancyDisplay } = useApp() // e.g. 'global' | 'tenant'

// profile state
const { current, refresh } = useProfile(chefConfig)
const ecosystemProfile = current.global      // ref<Document | null>
const appProfile = current.appMirror         // ref<Document | null>

// render logic
const showCreateGlobal = computed(() => !ecosystemProfile.value)
const showAddToApp = computed(() => ecosystemProfile.value && role === 'tenant' && !appProfile.value)

const ctaTitle = computed(() => {
  if (showCreateGlobal.value) {
    return chefConfig.ctaTitle
  }
  if (showAddToApp.value) {
    return `Add your Chef profile to ${tenancyDisplay}`
  }
  return `You're all set`
})

const primaryLabel = computed(() => {
  if (showCreateGlobal.value) {
    return 'Create Chef Profile'
  }
  return `Add to ${tenancyDisplay} Chefs`
})

// actions → delegate to useProfileCreate via useChefCreate
const { createChef } = useChefCreate()

async function onEnsure() {
  // no args: create global; if tenant, mirror is auto-created by useProfileCreate
  await createChef()
  await refresh?.()
}
</script>