<template>
  <div>
    <pre>
allAppUsers
      {{ JSON.stringify(allAppUsers, null, 2) }}</pre
    >
  </div>
</template>
<script setup>
const { allAppUsers } = useAppUser()
</script>
