<template>
  <div>
    <h2>App CTA Debug</h2>
    <p>Tenancy: {{ isTenant ? 'Tenant' : 'King' }}</p>

    <!-- King apps -->
    <div v-if="!isTenant">
      <p>This is a <strong>King app</strong>.</p>
      <div v-if="coreUser">
        <p>✅ Core User exists → showing Core User cell</p>
        <OrganismsUserCoreCardsCell :core-user="coreUser" />
      </div>
      <div v-else>
        <p>❌ No Core User found → nothing to show</p>
      </div>
    </div>

    <!-- Tenant apps -->
    <div v-else>
      <p>This is a <strong>Tenant app</strong>.</p>
      <div v-if="appUser">
        <p>✅ App User exists → showing App User cell</p>
        <OrganismsUserAppCardsCell :user="appUser" />
      </div>
      <div v-else-if="coreUser">
        <p>✅ Core User exists but ❌ no App User → showing Core User cell</p>
        <OrganismsUserCoreCardsCell :core-user="coreUser" />
      </div>
      <div v-else>
        <p>❌ Neither Core User nor App User found → nothing to show</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { role } = useFireUXConfig()
const isTenant = computed(() => role === 'tenant')
const { user } = useUser()
const coreUser = computed(() => user.value?.core)
const appUser = computed(() => user.value?.app)
</script>

<style scoped>
/* no extra styles for debug */
</style>
