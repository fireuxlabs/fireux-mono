<template>
  <div>
    <UCard>
      <h1>Core Users</h1>
      <p>User: {{ coreUser?.email || 'None' }}</p>
    </UCard>

    <UCard v-if="coreUser">
      <h2>Components</h2>

      <h3>Pill</h3>
      <FireOrganismsUserCoreCardsPill :core-user="coreUser" />

      <USeparator />

      <h3>Cell</h3>
      <FireOrganismsUserCoreCardsCell :core-user="coreUser" />

      <USeparator />

      <h3>Profile</h3>
      <FireOrganismsUserCoreCardsProfile :core-user="coreUser" />
    </UCard>

    <UCard>
      <h2>JSON Snapshot</h2>
      <pre>{{
        JSON.stringify(
          {
            currentUser: coreUser,
            computedProps: {
              isCoreUser,
              hasAvatar,
              userOfApps,
              hasMultipleApps,
            },
            collection: {
              total: coreUsers?.length || 0,
              users: coreUsers,
            },
          },
          null,
          2
        )
      }}</pre>
    </UCard>

    <UCard>
      <h2>All Users ({{ coreUsers?.length || 0 }})</h2>

      <div v-if="coreUsers?.length">
        <FireOrganismsUserCoreCardsCell
          v-for="user in coreUsers"
          :key="user.id"
          :core-user="user"
        />
      </div>

      <p v-else>No users found</p>
    </UCard>
  </div>
</template>

<script setup>
const { coreUser, coreUsers, isCoreUser, hasAvatar, userOfApps, hasMultipleApps } = await useCoreUser()

</script>
