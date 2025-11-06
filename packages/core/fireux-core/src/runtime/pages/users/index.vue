<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageBody class="page-index">
      <UPageHeader title="Users" description="Review the current runtime user." />

      <!-- Single -->
      <UCard class="index-card">
        <template #header>
          <div class="index-card-header">
            <h1 class="index-title">Current User</h1>
          </div>
        </template>

        <!-- just check the nested ref; no .value needed in templates -->
        <template v-if="user.coreUser">
          <!-- pillProps(user.coreUser) auto-unwraps in template -->
          <MoleculesPill v-bind="pillProps(user.coreUser)" />
          <OrganismsUserCardsCell :user="user.coreUser" />
        </template>

        <MoleculesNotFound v-else kind="document" entity="user" />
      </UCard>

      <!-- Collection -->
      <UCard class="index-card">
        <div v-if="users?.length" class="entity-grid">
          <MoleculesPill
            v-for="item in users"
            :key="item.id"
            v-bind="pillProps(item)"
          />
        </div>

        <MoleculesNotFound v-else kind="collection" entity="users" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useUserCollection } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserCollection.ts'

definePageMeta({
  nav: { key: 'users', label: 'Users', icon: 'i-lucide-users', order: 50, desktop: true, mobile: true, layouts: ['default'] },
  title: 'Users',
  description: 'FireUX user accounts resolved for this runtime.',
})

const { user, pillProps } = useUser()
const { users } = useUserCollection()
</script>