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

// JSON snapshot for copy functionality
const jsonSnapshot = computed(() => {
  return JSON.stringify({
    currentUser: coreUser.value,
    computedProps: {
      isCoreUser: isCoreUser.value,
      hasAvatar: hasAvatar.value,
      userOfApps: userOfApps.value,
      hasMultipleApps: hasMultipleApps.value,
    },
    collection: {
      total: coreUsers.value?.length || 0,
      users: coreUsers.value,
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
