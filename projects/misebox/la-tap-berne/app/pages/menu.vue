<script setup lang="ts">
definePageMeta({
  layout: 'default',
  nav: {
    key: 'la-tap-menu',
    label: 'Menu',
    icon: 'i-lucide-utensils',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Menu',
})

await navigateTo('/kitchens/la-tapberne/menus/main', { replace: true })
</script>
