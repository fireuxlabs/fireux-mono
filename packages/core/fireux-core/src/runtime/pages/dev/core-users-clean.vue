<template>
  <div>
    <!-- Page Header -->
    <UCard>
      <template #header>
        <h1>Core Users Development</h1>
        <p>Complete card ecosystem showcase and data exploration</p>
      </template>

      <div>
        <p>
          Current User:
          <UBadge :color="coreUser ? 'green' : 'red'">{{
            coreUser ? 'Found' : 'None'
          }}</UBadge>
        </p>
        <p>
          Total Users:
          <UBadge color="blue">{{ coreUsers?.length || 0 }}</UBadge>
        </p>
        <p>
          Computed Properties Working:
          <UBadge :color="isCoreUser ? 'green' : 'gray'">{{
            isCoreUser ? 'Yes' : 'No'
          }}</UBadge>
        </p>
      </div>
    </UCard>

    <!-- Component Showcase - Current User -->
    <UCard v-if="coreUser">
      <template #header>
        <h2>🎯 Current Core User - Component Showcase</h2>
      </template>

      <div>
        <h3>Pills</h3>
        <FireOrganismsUserCoreCardsPill :core-user="coreUser" />

        <USeparator />

        <h3>Cells</h3>
        <FireOrganismsUserCoreCardsCell :core-user="coreUser" />

        <USeparator />

        <h3>Profile Cards</h3>
        <FireOrganismsUserCoreCardsProfile :core-user="coreUser" />
      </div>
    </UCard>

    <!-- All Core Users Grid -->
    <UCard>
      <template #header>
        <h2>📋 All Core Users Collection</h2>
        <UBadge color="blue">{{ coreUsers?.length || 0 }} users</UBadge>
      </template>

      <div v-if="coreUsers?.length">
        <FireOrganismsUserCoreCardsCell
          v-for="user in coreUsers"
          :key="user.id"
          :core-user="user"
        />
      </div>

      <div v-else>
        <p>No core users found</p>
        <UButton @click="ensureCoreUser" color="primary"
          >Create Core User</UButton
        >
      </div>
    </UCard>

    <!-- Computed Properties -->
    <UCard v-if="coreUser">
      <template #header>
        <h2>⚙️ Computed Properties</h2>
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

    <!-- Copyable JSON for AI -->
    <UCard>
      <template #header>
        <h2>🤖 AI Assistant Data</h2>
        <p>Copyable JSON data for AI interaction</p>
      </template>

      <UAccordion
        :items="[
          {
            label: 'Current Core User JSON',
            icon: 'i-heroicons-user',
            defaultOpen: false,
          },
          {
            label: 'All Core Users JSON',
            icon: 'i-heroicons-users',
            defaultOpen: false,
          },
          {
            label: 'Computed Properties JSON',
            icon: 'i-heroicons-cog-6-tooth',
            defaultOpen: false,
          },
        ]"
      >
        <template #item="{ item, index, open }">
          <div v-if="index === 0 && open">
            <UButton
              @click="copyToClipboard(JSON.stringify(coreUser, null, 2))"
              size="xs"
              >Copy JSON</UButton
            >
            <pre>{{ JSON.stringify(coreUser, null, 2) }}</pre>
          </div>

          <div v-if="index === 1 && open">
            <UButton
              @click="copyToClipboard(JSON.stringify(coreUsers, null, 2))"
              size="xs"
              >Copy JSON</UButton
            >
            <pre>{{ JSON.stringify(coreUsers, null, 2) }}</pre>
          </div>

          <div v-if="index === 2 && open">
            <UButton
              @click="
                copyToClipboard(
                  JSON.stringify(
                    { isCoreUser, hasAvatar, userOfApps, hasMultipleApps },
                    null,
                    2
                  )
                )
              "
              size="xs"
              >Copy JSON</UButton
            >
            <pre>{{
              JSON.stringify(
                { isCoreUser, hasAvatar, userOfApps, hasMultipleApps },
                null,
                2
              )
            }}</pre>
          </div>
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
} = await useCoreUser()

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // Could show toast notification here
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}
</script>
