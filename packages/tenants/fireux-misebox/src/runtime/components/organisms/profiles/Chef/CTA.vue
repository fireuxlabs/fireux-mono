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
    <template v-if="appTenancy === 'tenant'">
      <OrganismsProfilesChefCardsCell v-if="appProfile" :chef="appProfile" />
      <p v-else>❌ You are not a Chef in this app.</p>
    </template>

    <!-- Single CTA button -->
    <div class="cta-buttons">
      <UButton
        v-if="!ecosystemProfile || !appProfile"
        size="lg"
        color="primary"
        @click="onEnsure"
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
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useChefCreate } from '../../../../composables/firestore/profiles/Chef/useChefCreate'

const { tenancyDisplay, appTenancy } = useApp()
// Read current profiles via unified profile composable
const { ecosystemProfile, appProfile } = useProfile(chefConfig) as any
// Use minimal creation flow for consistent logging and behavior
const { createChef } = useChefCreate()

async function onEnsure() {
  try {
    console.log('[CTA/Chef] Click createChef')
    await createChef()
  } catch (e) {
    console.error('[CTA] ensureProfile failed', e)
  }
}
</script>
