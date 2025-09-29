<script setup lang="ts">
// Redirect legacy /dashboard/profile to the canonical /dashboard/user-profile
definePageMeta({ layout: 'dashboard' })
const router = useRouter()
if (process.client) router.replace('/dashboard/user-profile')
</script>

<template>
  <div class="p-4 text-sm text-dimmed">Redirecting to your profile…</div>
</template>
