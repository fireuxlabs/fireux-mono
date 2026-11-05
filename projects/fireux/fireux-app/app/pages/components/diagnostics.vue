<script setup lang="ts">
const { query, hash } = useRoute()
await navigateTo(
  { path: '/docs/components/diagnostics', query, hash },
  { redirectCode: 301, replace: true }
)
</script>
