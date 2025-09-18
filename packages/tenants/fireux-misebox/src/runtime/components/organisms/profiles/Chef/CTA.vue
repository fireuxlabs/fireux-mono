<!-- packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
  <UCard class="profile-cta">
    <template #header>
      <div class="cta-header">
        <h3>Chef Profiles</h3>
        <p class="muted">You’re in {{ tenancyDisplay }}</p>
      </div>
    </template>

    <div class="cta-content">
      <!-- Global profile section -->
      <section>
        <h4 class="section-title">Global profile</h4>
        <OrganismsProfilesChefCardsCell
          v-if="ecosystemProfile"
          :chef="ecosystemProfile"
        />
        <UAlert
          v-else
          color="warning"
          variant="soft"
          title="No global profile"
          description="Create your Chef profile for the whole ecosystem."
        />
      </section>

      <UDivider />

      <!-- App profile section (tenant only) -->
      <section v-if="appTenancy === 'tenant'">
        <h4 class="section-title">This app</h4>
        <OrganismsProfilesChefCardsCell v-if="appProfile" :chef="appProfile" />
        <UAlert
          v-else
          color="info"
          variant="soft"
          title="Not a Chef in this app"
          description="Add your profile to this app to appear in Chef lists."
        />
      </section>
    </div>

    <template #footer>
      <div class="cta-footer">
        <UButton
          v-if="!ecosystemProfile || (appTenancy === 'tenant' && !appProfile)"
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
    </template>
  </UCard>
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
const ecosystemProfile = current.global // ref to global (ecosystem) doc
const appProfile = current.appMirror // ref to app mirror (or null)

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

<style scoped>
.cta-header {
  display: grid;
  gap: 0.25rem;
}
.muted {
  color: var(--ui-text-muted);
}
.cta-content {
  display: grid;
  gap: 1rem;
}
.section-title {
  font-size: 0.95rem;
  color: var(--ui-text-muted);
}
.cta-footer {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
