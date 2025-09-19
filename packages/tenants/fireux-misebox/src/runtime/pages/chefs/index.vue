<template>
  <div class="page space-y-4">
    <!-- CTA: create or add-to-app -->
    <template v-if="showCreate">
      <UPageCTA :title="ctaTitle" variant="soft">
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

    <!-- If profile already exists: show compact current -->
    <template v-else-if="profile">
      <div class="mt-4 space-y-2">
        <OrganismsProfilesChefCardsPill
          class="cursor-pointer"
          :chef="profile"
        />
        <OrganismsProfilesChefCardsCell
          class="cursor-pointer"
          :chef="profile"
        />
      </div>
    </template>

    <!-- All profiles listing via reusable Root -->
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

// tenancy
const { role, tenancyDisplay } = useApp()
const isTenant = role === 'tenant'

// profile
const { profile, ensure } = useProfile(chefConfig)

// CTA logic
const showCreate = computed(() => !profile.value)

const ctaTitle = computed(() =>
  showCreate.value
    ? chefConfig.ctaTitle
    : `You're all set`
)

const primaryLabel = computed(() =>
  showCreate.value
    ? 'Create Chef Profile'
    : `Add to ${tenancyDisplay} Chefs`
)

// action
async function onEnsure() {
  await ensure()
}
</script>