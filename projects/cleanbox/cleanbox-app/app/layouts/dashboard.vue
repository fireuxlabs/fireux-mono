<template>
  <CoreDashboard :routes="routes" />
</template>

<script setup>
const { appUser } = useAppUser()

const jobPublicRoutes = getPublicJobRoutes() || []
const jobPrivateRoutes = appUser.value ? getPrivateJobRoutes() || [] : []

const routes = useRoutes(jobPublicRoutes, jobPrivateRoutes)
</script>
