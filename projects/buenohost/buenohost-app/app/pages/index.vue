<script setup lang="ts">
const route = useRoute()
await navigateTo({ path: '/home', query: route.query, hash: route.hash }, { redirectCode: 302 })
</script>
