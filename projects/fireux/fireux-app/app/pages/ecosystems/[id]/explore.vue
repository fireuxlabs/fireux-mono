<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  layout: false,
  name: 'EcosystemExploreRedirect',
})

const oldId = useRouteParam('id').value
// The former Werkbox explore page predates the stored-ID detail route.
const ecosystemId = oldId === 'werkbox' ? 'cleanbox' : oldId
await navigateTo(`/ecosystems/${encodeURIComponent(ecosystemId)}`, {
  redirectCode: 301,
  replace: true,
})
</script>
