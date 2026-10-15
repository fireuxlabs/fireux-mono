<template>
  <div v-if="process.showStats" class="grid gap-3 md:grid-cols-4">
    <UPageCard
      v-for="stat in process.stats"
      :key="stat.label"
      :title="stat.value"
      :description="stat.label"
      variant="soft"
    />
  </div>
  <MoleculesDisclosurePanel
    v-if="process.fileResults.length || process.writeMessage"
    title="Uploaded document"
  >
    <div class="mt-3 space-y-3 rounded-lg border border-default p-3">
      <div v-if="process.fileResults.length" class="flex flex-wrap gap-2">
        <UBadge
          v-for="file in process.fileResults"
          :key="file.id"
          :color="
            file.status === 'failed'
              ? 'error'
              : file.status === 'empty'
                ? 'neutral'
                : 'success'
          "
          variant="soft"
        >
          {{ file.file_name }} · {{ file.status }}
        </UBadge>
      </div>
      <p v-if="process.writeMessage" class="text-sm text-dimmed">
        {{ process.writeMessage }}
      </p>
    </div>
  </MoleculesDisclosurePanel>
  <MoleculesDisclosurePanel
    v-if="process.flags.length"
    title="Review flags"
    :default-open="true"
  >
    <ul class="mt-3 space-y-2">
      <li
        v-for="flag in process.flags"
        :key="`${flag.code}-${flag.message}`"
        class="rounded-lg border border-default p-3 text-sm"
      >
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            :color="
              flag.level === 'error'
                ? 'error'
                : flag.level === 'warning'
                  ? 'warning'
                  : 'info'
            "
            variant="soft"
          >
            {{ flag.code }}
          </UBadge>
          <span class="text-highlighted">{{ flag.message }}</span>
        </div>
      </li>
    </ul>
  </MoleculesDisclosurePanel>
</template>
<script setup lang="ts">
import type { UnwrapNestedRefs } from 'vue'
import type { useMenuSourceProcess } from '../../../../composables/workspace/menus/useMenuSourceProcess'
defineProps<{
  process: UnwrapNestedRefs<ReturnType<typeof useMenuSourceProcess>>
}>()
</script>
