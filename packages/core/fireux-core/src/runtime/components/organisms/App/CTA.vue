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
const { appTenancy } = useApp()
const { coreUser } = useCoreUser()

// Simple role flag
const isTenant = computed(() => {
  const role = (appTenancy.value || '').toLowerCase()
  return role === 'tenant' || role === 'tennant'
})

// Only load app user if tenant
let appUser = null
if (isTenant.value) {
  const au = useAppUser()
  appUser = au.appUser
}
</script>

<style scoped>
/* no extra styles for debug */
</style>
