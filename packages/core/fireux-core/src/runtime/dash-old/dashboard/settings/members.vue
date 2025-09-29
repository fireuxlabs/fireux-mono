<!-- Archived from pages/dashboard/settings/members.vue on 2025-09-26 -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
const router = useRouter()
if (process.client) router.replace('/dashboard/followers')
</script>

<template>
  <div class="p-4 text-sm text-dimmed">Redirecting to Followers…</div>
</template>
