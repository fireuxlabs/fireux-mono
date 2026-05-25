<template>
  <div class="space-y-6">
    <TeamCollectionManager
      :collection="teamMembers"
      title="Team"
      description="Kitchen team members for the selected kitchen."
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen team"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleTeam } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleTeam'
import TeamCollectionManager from '../../../Team/Collection/Manager.vue'

const { teamMembers, debug } = useKitchenConsoleTeam()
const isDev = import.meta.dev
</script>
