<script setup lang="ts">
const { query } = useRoute()
await navigateTo(
  { path: '/docs/components/state-feedback', query, hash: '#state-card' },
  { redirectCode: 301, replace: true }
)
</script>
