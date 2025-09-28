<!-- Archived from pages/dashboard/profile.vue on 2025-09-26 -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
const router = useRouter()
if (process.client) router.replace('/dashboard/user-profile')
</script>

<template>
  <div class="p-4 text-sm text-dimmed">Redirecting to your profile…</div>
</template>
