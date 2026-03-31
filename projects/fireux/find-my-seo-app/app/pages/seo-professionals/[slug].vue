<script setup lang="ts">
const route = useRoute()
await navigateTo(`/seo-providers/${String(route.params.slug || '')}`, { redirectCode: 301 })
</script>
