<script setup lang="ts">
import { navigateTo } from '#imports'
definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-settings',
    label: 'Settings',
    icon: 'i-lucide-settings-2',
    order: 90,
    position: 'top',
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      { label: 'Devices & stations', to: '/workspace/kitchen/settings/kiosks' },
      {
        label: 'Integrations',
        to: '/workspace/kitchen/settings/integrations',
      },
      { label: 'Access', to: '/workspace/kitchen/settings/access' },
    ],
  },
})
await navigateTo('/workspace/kitchen/settings/integrations', {
  replace: true,
  redirectCode: 302,
})
</script>
