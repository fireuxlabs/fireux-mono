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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0;">JSON Snapshot</h2>
        <UButton 
          icon="i-heroicons-clipboard-document"
          size="sm"
          variant="outline"
          @click="copyToClipboard(jsonSnapshot)"
        >
          Copy JSON
        </UButton>
      </div>
      <pre>{{ jsonSnapshot }}</pre>
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
const { appUser, appUsers, isAppUser, isPro, isAdmin, initials } = await useAppUser()

// JSON snapshot for copy functionality
const jsonSnapshot = computed(() => {
  return JSON.stringify({
    currentUser: appUser.value,
    computedProps: {
      isAppUser: isAppUser.value,
      isPro: isPro.value,
      isAdmin: isAdmin.value,
      initials: initials.value,
    },
    collection: {
      total: appUsers.value?.length || 0,
      users: appUsers.value,
    },
  }, null, 2)
})

// Copy to clipboard function
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('JSON copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy JSON:', err)
  }
}
</script>
