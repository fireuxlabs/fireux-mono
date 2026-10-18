<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <h3 v-if="showName" class="font-medium">
        {{ offering?.name || option.label }}
      </h3>
      <USwitch
        v-model="enabled"
        :label="enabled ? 'On' : 'Off'"
        :aria-label="
          (showName ? offering?.name + ' ' : '') +
          option.label +
          ' availability'
        "
        :disabled="disabled || busy"
      />
    </div>
    <UAlert
      v-if="error"
      color="error"
      title="Could not save configuration"
      :description="error"
      ><template #actions><MoleculesCopyError :message="error" /></template
    ></UAlert>
    <div v-show="enabled" class="space-y-6">
      <UAlert
        v-if="option.key === 'table_service' || option.key === 'qr_tables'"
        color="neutral"
        icon="i-lucide-link"
        title="Shared table settings"
        description="Table service and QR table ordering share menus, hours and order settings. Each has its own availability switch."
      />
      <UAlert
        v-if="sharedLabels.length"
        color="neutral"
        icon="i-lucide-link"
        title="Shared menus and hours"
        :description="
          'This service also contains ' +
          sharedLabels.join(', ') +
          '. Menu and hour changes apply to those options too.'
        "
      />
      <MoleculesStateCard
        v-if="menusOutcome === 'idle' || menusOutcome === 'pending'"
        entity="Menus"
        loading
      />
      <MoleculesStateCard
        v-else-if="menusOutcome === 'error'"
        entity="Menus"
        state="error"
      />
      <div v-else class="grid items-start gap-6 md:grid-cols-2">
        <UFormField
          :label="option.key === 'collection' ? 'Menus' : 'Eligible menus'"
          required
        >
          <UCheckboxGroup
            v-if="menuOptions.length"
            v-model="menuIds"
            :items="menuOptions"
            :disabled="disabled || busy"
            class="mt-3"
          />
          <p v-else class="my-3 text-sm text-muted">
            Create a menu to get started.
          </p>
          <p class="mt-2 text-sm text-muted">
            Regular interactive menus only. Daily specials and documents are
            managed separately.
          </p>
          <UButton
            to="/workspace/kitchen/menus"
            label="Manage menus"
            color="neutral"
            variant="link"
            class="mt-3"
          />
        </UFormField>
        <UFormField
          :label="
            option.key === 'collection' ? 'Collection hours' : 'Serving hours'
          "
          :description="
            effectiveTimezone
              ? 'Local time · ' + effectiveTimezone
              : 'Set the venue timezone in Identity first.'
          "
          required
        >
          <UTextarea
            v-model="hoursText"
            :rows="7"
            placeholder="Tuesday - Sunday 12:00 - 22:00"
            :disabled="disabled || busy || !effectiveTimezone"
            class="w-full"
          />
          <p class="mt-2 text-xs text-muted">
            Use a separate line for each time range.
          </p>
        </UFormField>
      </div>
      <p
        v-if="enabled && menuIds.length && !hasOrderMenu"
        class="text-sm text-warning"
      >
        Publish at least one selected menu with items and prices before enabling
        this service.
      </p>
      <UCheckbox
        v-if="activatesShared"
        v-model="activateShared"
        :label="
          'Also enable the saved ' +
          activatingLabels.join(', ') +
          ' settings in this service'
        "
        :disabled="busy || disabled"
      />
      <template v-if="option.key !== 'collection'">
        <WorkspaceKitchenOfferingsSetupInteraction
          v-for="type in option.types"
          :key="type"
          :type="type"
          :config="drafts[type]!"
          :allow-toggle="option.types.length > 1"
          :kitchen-id="kitchenId"
          :disabled="disabled || busy"
          @update="updateDraft(type, $event)"
        />
      </template>
    </div>
    <div
      v-if="enabled || savedEnabled"
      class="sticky bottom-0 -mx-6 border-t border-default bg-default px-6 py-4 flex flex-wrap items-center justify-between gap-3"
    >
      <p class="text-xs text-muted">
        {{
          enabled
            ? 'Settings above are a draft until saved here.'
            : 'Save to turn this service off.'
        }}
      </p>
      <div class="flex items-center gap-2">
        <UButton
          label="Discard changes"
          color="neutral"
          variant="ghost"
          :disabled="busy || disabled"
          @click="resetDraft"
        />
        <UButton
          @click="
            async () => {
              await submit()
            }
          "
          :label="enabled ? 'Save and enable' : 'Save with service off'"
          :loading="busy"
          :disabled="disabled || !canSave"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  serviceMenuOptions,
  serviceMenuReadiness,
} from '../../../utils/service-menus'
import { computed, ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import type { Menu } from '../../../../menu/models/menu.model'
import type {
  KitchenOffering,
  KitchenOfferingInteractionChanges,
} from '../../../models/offering.model'
import type { KitchenOrderType } from '../../../models/offering-interaction-types.model'
import type { KitchenOrderTypeConfig } from '../../../models/ordering.model'
import type { KitchenOfferingOption } from '../../../utils/offering-options'
import { offeringOptionEnabled } from '../../../utils/offering-options'
import {
  newKitchenOfferingInteraction,
  patchKitchenOfferingInteraction,
} from '../../../utils/offering-interaction'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
import {
  formatWeekdayTimeText,
  parseWeekdayTimeText,
} from '../../../../utils/weekday-time'
const props = defineProps<{
  option: KitchenOfferingOption
  kitchenId: string
  offering?: KitchenOffering
  offeringId?: string
  menus: Menu[]
  menusOutcome: ReadOutcome
  timezone: string
  showName?: boolean
  disabled?: boolean
  captureIntent?: () => () => boolean
  save: (
    input: Record<string, unknown>,
    isSurfaceCurrent?: () => boolean
  ) => Promise<unknown>
}>()
const emit = defineEmits<{ saved: [] }>()
const initialOfferingId = props.offering?.id
const initialOfferingName = props.offering?.name
const targetOfferingId = computed(() => props.offeringId || initialOfferingId)
const menuIds = ref([...(props.offering?.menu_ids || [])])
const hoursText = ref(formatWeekdayTimeText(props.offering?.hours))
const enabled = ref(
  props.offering ? offeringOptionEnabled(props.offering, props.option) : false
)
const savedEnabled = ref(enabled.value)
const draftEpoch = ref(0)
const activateShared = ref(false)
const busy = ref(false),
  error = ref('')
function interactionDrafts() {
  return Object.fromEntries(
    props.option.types
      .filter((type) => type !== 'collection')
      .map((type) => {
        const stored = props.offering?.interactions.find(
          (row) => row.type === type
        )
        return [
          type,
          JSON.parse(
            JSON.stringify(
              stored || {
                ...newKitchenOfferingInteraction(type),
                enabled: true,
              }
            )
          ),
        ]
      })
  ) as Partial<
    Record<KitchenOrderType, KitchenOrderTypeConfig & { enabled: boolean }>
  >
}
const drafts = ref(interactionDrafts())
function resetDraft() {
  draftEpoch.value++
  enabled.value = props.offering
    ? offeringOptionEnabled(props.offering, props.option)
    : false
  savedEnabled.value = enabled.value
  menuIds.value = [...(props.offering?.menu_ids || [])]
  hoursText.value = formatWeekdayTimeText(props.offering?.hours)
  drafts.value = interactionDrafts()
  activateShared.value = false
}
const effectiveTimezone = computed(
  () => props.offering?.hours?.timezone || props.timezone
)
const menuOptions = computed(() =>
  serviceMenuOptions(props.menus, menuIds.value)
)
const menuReadiness = computed(() =>
  serviceMenuReadiness(menuIds.value, props.menus)
)
const shared = computed(
  () =>
    props.offering?.interactions.filter(
      (row) =>
        row.type !== 'browse' &&
        !(props.option.types as readonly string[]).includes(row.type)
    ) || []
)
const sharedLabels = computed(() =>
  shared.value.map((row) => kitchenOrderTypeLabel(row.type as KitchenOrderType))
)
const activatingLabels = computed(() =>
  shared.value
    .filter((row) => row.enabled)
    .map((row) => kitchenOrderTypeLabel(row.type as KitchenOrderType))
)
const activatesShared = computed(
  () =>
    enabled.value &&
    props.offering &&
    !props.offering.enabled &&
    activatingLabels.value.length > 0
)
const hasOrderMenu = computed(() => menuReadiness.value.canEnable)
const canSave = computed(
  () =>
    ['ready', 'empty'].includes(props.menusOutcome) &&
    (!enabled.value || hasOrderMenu.value) &&
    menuReadiness.value.validSelection &&
    Boolean(hoursText.value.trim()) &&
    Boolean(effectiveTimezone.value) &&
    (!activatesShared.value || activateShared.value)
)
async function updateDraft(
  type: KitchenOrderType,
  changes: KitchenOfferingInteractionChanges
) {
  drafts.value[type] = patchKitchenOfferingInteraction(
    type,
    drafts.value[type],
    changes
  ) as KitchenOrderTypeConfig & { enabled: boolean }
}
const surfaceSources = [
  draftEpoch,
  () => props.kitchenId,
  () => props.option.key,
  targetOfferingId,
  () => props.save,
  () => props.captureIntent,
  () => JSON.stringify(menuIds.value),
  hoursText,
  enabled,
  activateShared,
  () => JSON.stringify(drafts.value),
]
const captureSurface = useCommandScope(surfaceSources)
watch(
  surfaceSources,
  () => {
    busy.value = false
    error.value = ''
  },
  { flush: 'sync' }
)
async function submit() {
  if (busy.value || props.disabled || !canSave.value) return
  const local = captureSurface()
  const owner = props.captureIntent?.() || (() => true)
  const isCurrent = () => local() && owner()
  busy.value = true
  error.value = ''
  try {
    const hours = parseWeekdayTimeText(hoursText.value, effectiveTimezone.value)
    if (!hours.windows.length) throw new Error('Add at least one serving time.')
    const result = await props.save(
      {
        ...(targetOfferingId.value
          ? { offeringId: targetOfferingId.value }
          : {}),
        option: props.option.key,
        name:
          props.offering?.name ||
          initialOfferingName ||
          (props.option.key === 'table_service' ||
          props.option.key === 'qr_tables'
            ? 'Tables'
            : props.option.label),
        menu_ids: menuIds.value,
        hours,
        enabled: enabled.value,
        activateShared: activateShared.value,
        interactions: props.option.types.map((type) => {
          if (type === 'collection') return { type, changes: { enabled: true } }
          const { type: _, ...changes } = drafts.value[type]!
          return {
            type,
            changes: {
              ...changes,
              enabled: props.option.types.length === 1 || changes.enabled,
            },
          }
        }),
      },
      isCurrent
    )
    if (isCurrent()) {
      savedEnabled.value = enabled.value
      emit('saved')
    }
    return result
  } catch (cause) {
    if (!isCurrent()) return
    error.value = cause instanceof Error ? cause.message : 'Please try again.'
  } finally {
    if (local()) busy.value = false
  }
}
</script>
