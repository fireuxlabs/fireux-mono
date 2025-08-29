<template>
  <div>
    <UCard>
      <h1>App Users</h1>
      <p>User: {{ appUser?.email || 'None' }}</p>
    </UCard>

    <UCard v-if="appUser">
      <h2>Components</h2>

      <h3>Pill</h3>
      <FireOrganismsUserAppCardsPill :app-user="appUser" />

      <USeparator />

      <h3>Cell</h3>
      <FireOrganismsUserAppCardsCell :user="appUser" />

      <USeparator />

      <h3>Profile</h3>
      <FireOrganismsUserAppCardsProfile :user="appUser" />
    </UCard>

    <UCard>
      <FireCopyJson
        :data="{
          currentUser: appUser,
          computedProps: { isAppUser, isPro, isAdmin, initials },
          collection: { total: appUsers?.length || 0, users: appUsers },
        }"
        title="App Users JSON"
      />
    </UCard>

    <UCard>
      <h2>All Users ({{ appUsers?.length || 0 }})</h2>

      <div v-if="appUsers?.length">
        <FireOrganismsUserAppCardsCell
          v-for="user in appUsers"
          :key="user.uid"
          :user="user"
        />
      </div>

      <p v-else>No users found</p>
    </UCard>
  </div>
</template>

<script setup>
const { appUser, appUsers, isAppUser, isPro, isAdmin, initials } =
  await useAppUser()

</script>
