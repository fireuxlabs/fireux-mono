# Profile Index + CTA components

This document lists the full contents of the Index and CTA components used for each profile type.

## Chef

- CTA component: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue`

```vue
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
        :loading="creating"
        :disabled="creating"
        @click="onEnsure"
      >
        {{
          !ecosystemProfile
            ? 'Create Chef Profile'
            : 'Add to ' + tenancyDisplay + ' Chefs'
        }}
      </UButton>
      <p v-if="createError" class="text-red-600 text-sm mt-2">
        {{ createError.message || createError }}
      </p>
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
const { createChef, creating, error: createError } = useChefCreate()

async function onEnsure() {
  try {
    console.log('[CTA/Chef] Click createChef')
    await createChef()
  } catch (e) {
    // Swallow; createError ref will display
    console.error('[CTA] ensureProfile failed', e)
  }
}
</script>
```

- Index page: `packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue`

```vue
<template>
  <div class="page space-y-4">
    <!-- CTAs -->
    <OrganismsUserCoreCTA v-if="!coreUser" />
    <template v-else>
      <OrganismsUserAppCTA v-if="role === 'tenant' && !appUser" />
      <OrganismsProfilesChefCTA />
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
import { chefConfig } from '../../models/profiles/Chef.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useCoreUser } from 'fireux-core/runtime/composables/firestore/CoreUser/useCoreUser'
import { useAppUser } from 'fireux-core/runtime/composables/firestore/AppUser/useAppUser'

const { role } = useApp() // 'global' | 'tenant'
const { coreUser } = useCoreUser()
const { appUser } = useAppUser()
</script>
```

## Supplier

- CTA component: `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/CTA.vue`

```vue
<template>
  <div class="profile-cta">
    <div class="profile-cta-header">
      <h1 class="profile-cta-title">🚚 Create Your Supplier Profile</h1>
      <p class="profile-cta-description">
        Connect with chefs and restaurants as a trusted food supplier
      </p>
    </div>

    <div class="profile-cta-features">
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">🏢</div>
        <h3 class="profile-cta-feature-title">Business Profile</h3>
        <p class="profile-cta-feature-text">
          Showcase your company and products
        </p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">📦</div>
        <h3 class="profile-cta-feature-title">Product Catalog</h3>
        <p class="profile-cta-feature-text">Display inventory and pricing</p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">🤝</div>
        <h3 class="profile-cta-feature-title">Direct Orders</h3>
        <p class="profile-cta-feature-text">Receive orders from chefs</p>
      </div>
    </div>

    <div class="profile-cta-action">
      <UButton to="/suppliers/create" size="lg" color="primary">
        Create Supplier Profile
      </UButton>
      <p class="profile-cta-subtext">Free to join • Connect with local chefs</p>
    </div>
  </div>
</template>

<script setup>
// Clean CTA component for supplier profile creation
</script>
```

## Employer

- CTA component: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/CTA.vue`

```vue
<template>
  <div class="profile-cta">
    <div class="profile-cta-header">
      <h1 class="profile-cta-title">🏢 Create Your Employer Profile</h1>
      <p class="profile-cta-description">
        Connect with top talent and build your team
      </p>
    </div>

    <div class="profile-cta-features">
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">🏢</div>
        <h3 class="profile-cta-feature-title">Company Profile</h3>
        <p class="profile-cta-feature-text">Showcase your company culture</p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">💼</div>
        <h3 class="profile-cta-feature-title">Post Jobs</h3>
        <p class="profile-cta-feature-text">Create and manage job listings</p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">👥</div>
        <h3 class="profile-cta-feature-title">Find Talent</h3>
        <p class="profile-cta-feature-text">Search qualified professionals</p>
      </div>
    </div>

    <div class="profile-cta-action">
      <UButton to="/employers/create" size="lg" color="primary">
        Create Employer Profile
      </UButton>
      <p class="profile-cta-subtext">
        Free to join • Post jobs and find talent
      </p>
    </div>
  </div>
</template>

<script setup>
// Clean CTA component for employer profile creation
</script>
```

## Professional

- CTA component: `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/CTA.vue`

```vue
<template>
  <div class="profile-cta">
    <div class="profile-cta-header">
      <h1 class="profile-cta-title">💼 Create Your Professional Profile</h1>
      <p class="profile-cta-description">
        Showcase your skills and connect with top employers
      </p>
    </div>

    <div class="profile-cta-features">
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">�</div>
        <h3 class="profile-cta-feature-title">Career Portfolio</h3>
        <p class="profile-cta-feature-text">
          Highlight your experience and skills
        </p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">🎯</div>
        <h3 class="profile-cta-feature-title">Job Matching</h3>
        <p class="profile-cta-feature-text">Get matched with opportunities</p>
      </div>
      <div class="profile-cta-feature">
        <div class="profile-cta-feature-icon">🤝</div>
        <h3 class="profile-cta-feature-title">Direct Contact</h3>
        <p class="profile-cta-feature-text">Connect with recruiters</p>
      </div>
    </div>

    <div class="profile-cta-action">
      <UButton to="/professionals/create" size="lg" color="primary">
        Create Professional Profile
      </UButton>
      <p class="profile-cta-subtext">
        Free to join • Get discovered by employers
      </p>
    </div>
  </div>
</template>

<script setup>
// Clean CTA component for professional profile creation
</script>
```
