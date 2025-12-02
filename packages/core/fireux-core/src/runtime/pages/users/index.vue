<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Users"
      description="Inspect the current user and browse all users available to this runtime."
    />

    <UPageBody class="space-y-6">
      <OrganismsUserSectionsSingle :user="currentUser" />
      <OrganismsUserSectionsSubcollection v-if="isTenant" />

      <section v-if="isTenant">
        <UButton
          v-if="!showGlobalDirectory"
          variant="ghost"
          @click="showGlobalDirectory = true"
        >
          View global directory
        </UButton>
        <OrganismsUserSectionsCollection v-else />
      </section>

      <OrganismsUserSectionsCollection v-else />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

definePageMeta({
  nav: {
    key: 'users',
    label: 'Users',
    icon: 'i-lucide-users',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Users',
  description: 'FireUX users resolved for this runtime.',
  layout: 'default',
  name: 'UsersIndexPage',
})

const { user: currentUser } = useUser()
const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(!isTenant)

useHead({ title: 'Users' })
</script>
