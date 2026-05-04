<template>
  <div class="space-y-6">
    <TeamCollectionManager
      :collection="teamMembers"
      title="Team"
      description="Kitchen team members for the selected kitchen."
    />

    <TeamConsoleCore :collection="teamMembers" />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen team"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleTeam } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleTeam'
import TeamCollectionManager from '../../../Team/Collection/Manager.vue'
import TeamConsoleCore from '../../../Team/Console/Core.vue'

const { teamMembers, debug } = useKitchenConsoleTeam()
const isDev = import.meta.dev
</script>
