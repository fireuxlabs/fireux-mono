<!-- packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
  <div class="profile-cta">
    <p>You’re in {{ tenancyDisplay }}</p>

    <!-- Global -->
    <OrganismsProfilesChefCardsCell
      v-if="ecosystemProfile"
      :chef="ecosystemProfile"
    />
    <p v-else>❌ You don’t have a global Chef profile yet.</p>

    <!-- App (tenant only) -->
    <template v-if="appTenancy === 'tenant'">
      <OrganismsProfilesChefCardsCell v-if="appProfile" :chef="appProfile" />
      <p v-else>❌ You are not a Chef in this app.</p>
    </template>

    <!-- CTA button (only when something's missing) -->
    <div class="cta-buttons">
      <UButton
        v-if="(!ecosystemProfile) || (appTenancy === 'tenant' && !appProfile)"
        size="lg"
        color="primary"
        @click="onEnsure"
      >
        {{ !ecosystemProfile ? 'Create Chef Profile'
                             : 'Add to ' + tenancyDisplay + ' Chefs' }}
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { chefConfig } from '../../../../models/profiles/Chef.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useChefCreate } from '../../../../composables/firestore/profiles/Chef/useChefCreate'

// tenancy strings
const { tenancyDisplay, appTenancy } = useApp()

// correct shape from useProfile()
const { current } = useProfile(chefConfig)
const ecosystemProfile = current.global      // ref to global (ecosystem) doc
const appProfile = current.appMirror         // ref to app mirror (or null)

// tiny wrapper around profile create
const { createChef } = useChefCreate()

async function onEnsure() {
  try {
    await createChef()
    // If you later add explicit refresh(), call it here.
  } catch (e) {
    console.error('[CTA] ensureProfile failed', e)
  }
}
</script>