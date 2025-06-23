<template>
  <CoreDashboard :routes="routes" />
</template>

<script setup>
import { getPublicJobRoutes } from 'fireux-jobs/composables/usePublicJobRoutes'
import { getPrivateJobRoutes } from 'fireux-jobs/composables/usePrivateJobRoutes'
import { useAppUser } from 'fireux-core/composables/firestore/AppUser/useAppUser'

const { appUser } = useAppUser()
const routes = computed(() =>
  useRoutes(getPublicJobRoutes(), appUser.value ? getPrivateJobRoutes() : [])
)
</script>
