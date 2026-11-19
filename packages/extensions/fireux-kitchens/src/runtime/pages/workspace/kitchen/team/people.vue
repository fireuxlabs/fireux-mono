<template>
  <KitchenWorkspaceTeamPeople />
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const { appName } = useFireUXConfig()

definePageMeta({
  layout: 'workspace',

  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
  requiresAuth: true,
  requiresSelection: true,
})

useAppLandingSeo({
  title: `People | ${appName}`,
  description:
    'Review the people connected to this Kitchen and their Team roles.',
  path: '/workspace/kitchen/team/people',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
