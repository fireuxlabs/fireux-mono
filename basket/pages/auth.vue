<template>
  <div class="page">
    <ClientOnly>
      <EffectsStarfield />
      <OrganismsAuthSystem v-if="currentUser" />
    </ClientOnly>
  </div>
</template>

<script setup>

const currentUser = useCurrentUser()

</script>