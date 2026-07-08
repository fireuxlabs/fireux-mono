<script setup lang="ts">
await navigateTo('/ordering/kiosk', {
  redirectCode: 301,
})

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingTakeAwayPage',
})
</script>
