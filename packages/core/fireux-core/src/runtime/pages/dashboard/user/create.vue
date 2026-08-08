<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'

const route = useRoute()
await navigateTo(
  {
    path: '/users/create',
    query: route.query,
  },
  { replace: true }
)
</script>
