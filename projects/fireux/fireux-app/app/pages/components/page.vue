<script setup lang="ts">
const { query, hash } = useRoute()
await navigateTo(
  { path: '/patterns/page-composition', query, hash },
  { redirectCode: 301, replace: true }
)
</script>
