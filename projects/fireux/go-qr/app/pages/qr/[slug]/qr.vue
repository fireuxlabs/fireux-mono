<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug || '').trim()

await navigateTo(`/text/${encodeURIComponent(slug)}/qr`, { redirectCode: 301 })
</script>
