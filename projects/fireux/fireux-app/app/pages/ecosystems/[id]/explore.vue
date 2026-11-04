<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  layout: false,
  name: 'EcosystemExploreRedirect',
})

const ecosystemId = useRouteParam('id')
await navigateTo(`/ecosystems/${encodeURIComponent(ecosystemId.value)}`, {
  redirectCode: 301,
  replace: true,
})
</script>
