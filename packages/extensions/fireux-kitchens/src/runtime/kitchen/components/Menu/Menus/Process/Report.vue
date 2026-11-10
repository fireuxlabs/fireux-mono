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
      class="workspace-surface workspace-surface--compact"
    >
      <div v-for="stat in process.stats" :key="stat.label">
        <dt class="fx-type-caption">{{ stat.label }}</dt>
        <dd class="fx-type-card-heading">{{ stat.value }}</dd>
      </div>
    </dl>
    <FireDisclosurePanel
      v-if="process.fileResults.length || process.writeMessage"
      title="Uploaded document"
    >
      <div class="workspace-surface workspace-surface--compact">
        <div
          v-if="process.fileResults.length"
          class="workspace-surface workspace-surface--compact"
        >
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
        <p v-if="process.writeMessage" class="fx-type-caption">
          {{ process.writeMessage }}
        </p>
      </div>
    </FireDisclosurePanel>
    <FireDisclosurePanel v-if="process.flags.length" title="Review flags">
      <ul class="workspace-surface workspace-surface--compact">
        <li
          v-for="flag in process.flags"
          :key="`${flag.code}-${flag.message}`"
          class="workspace-surface workspace-surface--compact"
        >
          <div class="workspace-surface workspace-surface--compact">
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
            <span class="fx-type-card-heading">{{ flag.message }}</span>
          </div>
        </li>
      </ul>
    </FireDisclosurePanel>
  </FireDisclosurePanel>
</template>
<script setup lang="ts">
import { computed, type UnwrapNestedRefs } from 'vue'
import type { useMenuSourceProcess } from '../../../../composables/menu/useMenuSourceProcess'
const props = defineProps<{
  process: UnwrapNestedRefs<ReturnType<typeof useMenuSourceProcess>>
}>()
const attentionFlags = computed(() =>
  props.process.flags.filter(
    (flag) => flag.level === 'warning' || flag.level === 'error'
  )
)
</script>
