<script setup lang="ts">
const route = useRoute()
const restaurant = computed(() => String(route.params.restaurant ?? ''))

await navigateTo(`/${restaurant.value}/menu`, { redirectCode: 302 })
</script>
