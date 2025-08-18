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
const { appUser, appUsers } = await useAppUser()
</script>
