<script setup lang="ts">
const { query } = useRoute()
await navigateTo(
  { path: '/docs/components/surfaces', query, hash: '#action-surface' },
  { redirectCode: 301, replace: true }
)
</script>
