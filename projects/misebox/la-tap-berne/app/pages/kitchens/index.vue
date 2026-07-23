<script setup lang="ts">
definePageMeta({
  layout: 'default',
  pageTransition: false,
  nav: {
    key: 'kitchens',
    hidden: true,
    layouts: ['default'],
  },
})

await navigateTo('/menus', { replace: true })
</script>
