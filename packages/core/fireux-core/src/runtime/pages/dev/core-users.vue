<template>
  <div>
    <!-- Page Header -->
    <UCard>
      <h1>{{ coreUser?.email || 'No core user' }}</h1>
      <p>Core User Development Page</p>
    </UCard>

    <!-- Current Core User Components -->
    <UCard v-if="coreUser">
      <template #header>
        <h2>Current Core User Components</h2>
      </template>

      <div>
        <h3>Pill Component</h3>
        <FireOrganismsUserCoreCardsPill :core-user="coreUser" />
      </div>

      <USeparator />

      <div>
        <h3>Cell Component</h3>
        <FireOrganismsUserCoreCardsCell :core-user="coreUser" />
      </div>

      <USeparator />

      <div>
        <h3>Profile Component</h3>
        <FireOrganismsUserCoreCardsProfile :core-user="coreUser" />
      </div>
    </UCard>

    <!-- Computed Properties -->
    <UCard v-if="coreUser">
      <template #header>
        <h2>Computed Properties</h2>
      </template>

      <div>
        <p>
          Is Core User:
          <UBadge :color="isCoreUser ? 'green' : 'red'">{{
            isCoreUser
          }}</UBadge>
        </p>
        <p>
          Has Avatar:
          <UBadge :color="hasAvatar ? 'green' : 'red'">{{ hasAvatar }}</UBadge>
        </p>
        <p>
          User Of Apps: <UBadge color="blue">{{ userOfApps }}</UBadge>
        </p>
        <p>
          Has Multiple Apps:
          <UBadge :color="hasMultipleApps ? 'blue' : 'gray'">{{
            hasMultipleApps
          }}</UBadge>
        </p>
      </div>
    </UCard>

    <!-- No Core User State -->
    <UCard v-else>
      <div>
        <UIcon name="i-heroicons-user-plus" />
        <h3>No Core User Found</h3>
        <p>Create a core user to get started</p>
        <UButton @click="ensureCoreUser" color="primary">
          Create Core User
        </UButton>
      </div>
    </UCard>

    <!-- Core Users Collection -->
    <UCard>
      <template #header>
        <div>
          <h2>All Core Users</h2>
          <UBadge color="blue">{{ coreUsers?.length || 0 }} users</UBadge>
        </div>
      </template>

      <div v-if="coreUsers?.length">
        <FireOrganismsUserCoreCardsCell
          v-for="user in coreUsers"
          :key="user.id"
          :core-user="user"
        />
      </div>

      <div v-else>
        <UIcon name="i-heroicons-users" />
        <p>No core users found</p>
      </div>
    </UCard>

    <!-- Raw Data -->
    <UCard>
      <template #header>
        <h2>Raw Data</h2>
      </template>

      <UAccordion
        :items="[
          {
            label: 'Core User Data',
            icon: 'i-heroicons-user',
            content: JSON.stringify(coreUser, null, 2),
          },
          {
            label: 'All Core Users Data',
            icon: 'i-heroicons-users',
            content: JSON.stringify(coreUsers, null, 2),
          },
        ]"
      >
        <template #content="{ item }">
          <pre>{{ item.content }}</pre>
        </template>
      </UAccordion>
    </UCard>
  </div>
</template>

<script setup>
const {
  coreUser,
  coreUsers,
  isCoreUser,
  hasAvatar,
  userOfApps,
  hasMultipleApps,
  ensureCoreUser,
  updateCoreUser,
  deleteCoreUser,
} = await useCoreUser()
</script>
