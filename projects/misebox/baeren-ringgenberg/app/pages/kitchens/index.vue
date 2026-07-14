<script setup lang="ts">
definePageMeta({
  layout: 'default',
  nav: {
    key: 'kitchens',
    hidden: true,
    layouts: ['default'],
  },
})

await navigateTo('/menu', { replace: true })
</script>
