<script setup lang="ts">
const route = useRoute()
await navigateTo(
  { path: '/pricing/pro', query: route.query, hash: route.hash },
  { redirectCode: 301 }
)
</script>
