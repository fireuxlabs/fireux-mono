<template>
  <UAlert
    v-if="attentionFlags.length"
    color="warning"
    variant="soft"
    title="Check before creating the Menu"
    :description="attentionFlags.map((flag) => flag.message).join(' ')"
  />
  <FireDisclosurePanel title="Import details">
    <dl
      v-if="process.showStats"
      class="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm"
    >
      <div v-for="stat in process.stats" :key="stat.label">
        <dt class="text-dimmed">{{ stat.label }}</dt>
        <dd class="font-medium">{{ stat.value }}</dd>
      </div>
    </dl>
    <FireDisclosurePanel
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
    </FireDisclosurePanel>
    <FireDisclosurePanel v-if="process.flags.length" title="Review flags">
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
    </FireDisclosurePanel>
  </FireDisclosurePanel>
</template>
<script setup lang="ts">
import { computed, type UnwrapNestedRefs } from 'vue'
import type { useMenuSourceProcess } from '../../../../composables/workspace/menus/useMenuSourceProcess'
const props = defineProps<{
  process: UnwrapNestedRefs<ReturnType<typeof useMenuSourceProcess>>
}>()
const attentionFlags = computed(() =>
  props.process.flags.filter(
    (flag) => flag.level === 'warning' || flag.level === 'error'
  )
)
</script>
