<template>
  <div class="profile-cta">
    <p>You’re in {{ tenancyDisplay }}</p>

    <!-- Ecosystem profile -->
    <OrganismsProfilesChefCardsCell
      v-if="ecosystemProfile"
      :chef="ecosystemProfile"
    />
    <p v-else>❌ You don’t have a global Chef profile yet.</p>

    <!-- App profile (only if tenant) -->
    <template v-if="appTenancy === 'tennant'">
      <OrganismsProfilesChefCardsCell v-if="appProfile" :chef="appProfile" />
      <p v-else>❌ You are not a Chef in this app.</p>
    </template>

    <!-- Single CTA button -->
    <div class="cta-buttons">
      <UButton
        v-if="!ecosystemProfile || !appProfile"
        size="lg"
        color="primary"
        @click="ensureProfile"
      >
        {{
          !ecosystemProfile
            ? 'Create Chef Profile'
            : 'Add to ' + tenancyDisplay + ' Chefs'
        }}
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { chefConfig } from '../../../../models/profiles/Chef.model'

const { tenancyDisplay, appTenancy } = useApp()
const { ecosystemProfile, appProfile, ensureProfile } = useProfile(chefConfig)
</script>
