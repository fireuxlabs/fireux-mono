<script setup lang="ts">
import { navigateTo } from '#imports'
definePageMeta({
  layout: 'workspace',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
})
await navigateTo('/workspace/kitchen/settings/integrations', {
  replace: true,
  redirectCode: 302,
})
</script>
