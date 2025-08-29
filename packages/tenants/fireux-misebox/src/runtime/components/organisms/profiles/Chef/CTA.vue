<template>
  <div class="profile-cta">
    <MiseOrganismsProfilesChefCardsCell :chef="current" />

    <!-- Features removed as requested -->

    <div class="profile-cta-action">
      <template v-if="current && hasLocal">
        <UButton size="lg" color="primary" disabled>
          Chef Profile Complete
        </UButton>
        <p class="profile-cta-subtext">You have a chef profile for this app.</p>
      </template>
      <template v-else-if="current && !hasLocal">
        <UButton size="lg" color="primary" @click="createLocalProfile">
          Add {{ current.chef_name }} to {{ appName }} Chefs
        </UButton>
      </template>
      <template v-else-if="!current && hasLocal">
        <UButton size="lg" color="primary" disabled>Profile Error</UButton>
        <p class="profile-cta-subtext text-warning">
          (Fallback) Local profile exists without global. Please contact
          support.
        </p>
      </template>
      <template v-else>
        <UButton size="lg" color="primary" @click="createGlobalProfile">
          Create Chef Profile
        </UButton>
        <p class="profile-cta-subtext">
          Free to join • Takes less than 5 minutes
        </p>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Chef } from '../../../../models/profiles/Chef.model'
import { chefConfig } from '../../../../models/profiles/Chef.model'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useAppUser } from 'fireux-core/runtime/composables/firestore/AppUser/useAppUser'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig'

const { current, createProfile } = await useProfile<Chef>(chefConfig)
const { appUser } = await useAppUser()

// Get app name from runtime config or fallback
const { appName } = useFireUXConfig()

const hasLocal = computed(() => {
  return appUser.value?.profiles?.some((p) => p.type === 'chef') ?? false
})

const { profileToAppAction } = useApp()

function createGlobalProfile() {
  const id = current.value?.uid || ''
  const name = current.value?.chef_name || ''
  createProfile({ id, name })
}

async function createLocalProfile() {
  const id = current.value?.uid || ''
  const name = current.value?.chef_name || ''
  const avatarUrl = current.value?.avatarUrl || ''
  await profileToAppAction('add', 'chefs', id, { id, name, avatarUrl })
}
</script>
