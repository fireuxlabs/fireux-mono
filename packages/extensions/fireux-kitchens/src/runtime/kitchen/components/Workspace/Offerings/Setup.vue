<template>
  <div class="space-y-6">
    <UAlert
      v-if="option.key === 'table_service' || option.key === 'qr_tables'"
      color="neutral"
      icon="i-lucide-link"
      title="Shared table settings"
      description="Table service and QR Tables share menus, hours and order settings. Each has its own availability switch."
    />
    <UAlert
      v-if="error"
      color="error"
      title="Could not save configuration"
      :description="error"
      ><template #actions><MoleculesCopyError :message="error" /></template
    ></UAlert>
    <UAlert
      v-if="sharedLabels.length"
      color="neutral"
      icon="i-lucide-link"
      title="Shared menus and hours"
      :description="
        'This offering also contains ' +
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
        label="Eligible menus"
        description="Customers choose from these menus."
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
        <UButton
          :to="openWorkspace ? undefined : '/workspace/kitchen/menus'"
          @click="openWorkspace?.('/workspace/kitchen/menus')"
          label="Manage menus"
          color="neutral"
          variant="link"
          class="mt-3"
        />
      </UFormField>
      <UFormField
        label="Serving hours"
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
      this offering.
    </p>
    <UFormField label="Availability">
      <USwitch
        v-model="enabled"
        :label="'Enable ' + option.label.toLowerCase() + ' when saved'"
        :disabled="disabled || busy"
      />
      <p v-if="!targetOfferingId" class="mt-2 text-sm text-muted">
        Nothing is available to customers until you save the configuration.
      </p>
    </UFormField>
    <UCheckbox
      v-if="activatesShared"
      v-model="activateShared"
      :label="
        'Also enable the saved ' +
        activatingLabels.join(', ') +
        ' settings in this offering'
      "
      :disabled="busy || disabled"
    />
    <template v-for="type in option.types" :key="type">
      <section class="space-y-4">
        <h3 class="font-semibold">
          {{ kitchenOrderTypeLabel(type) }} settings
        </h3>
        <UCheckbox
          v-if="option.types.length > 1"
          :model-value="drafts[type]?.enabled"
          :label="'Allow ' + kitchenOrderTypeLabel(type).toLowerCase()"
          :disabled="disabled || busy"
          @update:model-value="
            (value) => updateDraft(type, { enabled: value === true })
          "
        />
        <WorkspaceKitchenOfferingsTiming
          :config="drafts[type]!"
          :allow-asap="type !== 'pre_order'"
          :disabled="disabled || busy"
          :interaction-label="kitchenOrderTypeLabel(type)"
          :time-label="type === 'pre_order' ? 'Dining' : 'Serving'"
          customer-message-placeholder="Optional customer message"
          :update-function="(changes) => updateDraft(type, changes)"
        />
        <div class="grid items-start gap-4 md:grid-cols-2">
          <WorkspaceKitchenOfferingsCustomerDetails
            :config="drafts[type]!"
            :disabled="disabled || busy"
            handoff-label="Instructions"
            handoff-placeholder="Optional instructions"
            :update-function="(changes) => updateDraft(type, changes)"
          />
          <WorkspaceKitchenOfferingsPayment
            :config="drafts[type]!"
            :kitchen-id="kitchenId"
            :open-workspace="openWorkspace"
          />
        </div>
        <WorkspaceKitchenOfferingsAvailability
          :config="{
            ...drafts[type]!,
            enabled:
              enabled && (option.types.length === 1 || drafts[type]!.enabled),
          }"
          :disabled="disabled || busy"
          :interaction-label="kitchenOrderTypeLabel(type)"
          :update-function="(changes) => updateDraft(type, changes)"
        />
      </section>
    </template>
    <p class="text-sm text-muted">
      Payment methods are managed in
      <UButton
        :to="openWorkspace ? undefined : '/workspace/kitchen/identity/payments'"
        variant="link"
        @click="openWorkspace?.('/workspace/kitchen/identity/payments')"
        >Kitchen Identity</UButton
      >.
    </p>
    <div
      class="sticky bottom-0 -mx-6 border-t border-default bg-default px-6 py-4 flex flex-wrap items-center justify-between gap-3"
    >
      <p class="text-xs text-muted">
        Settings above are a draft until saved here.
      </p>
      <UButton
        @click="
          async () => {
            await submit()
          }
        "
        :label="enabled ? 'Save and enable' : 'Save with offering off'"
        :loading="busy"
        :disabled="disabled || !canSave"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
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
  requestedEnabled?: boolean
  disabled?: boolean
  active?: boolean
  captureIntent?: () => () => boolean
  openWorkspace?: (path: string) => unknown
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
  props.requestedEnabled ??
    (props.offering
      ? offeringOptionEnabled(props.offering, props.option)
      : true)
)
const activateShared = ref(false)
const busy = ref(false),
  error = ref('')
const drafts = ref<
  Partial<
    Record<KitchenOrderType, KitchenOrderTypeConfig & { enabled: boolean }>
  >
>(
  Object.fromEntries(
    props.option.types.map((type) => {
      const stored = props.offering?.interactions.find(
        (row) => row.type === type
      )
      return [
        type,
        JSON.parse(
          JSON.stringify(
            stored || { ...newKitchenOfferingInteraction(type), enabled: true }
          )
        ),
      ]
    })
  )
)
const effectiveTimezone = computed(
  () => props.offering?.hours?.timezone || props.timezone
)
const menuOptions = computed(() =>
  props.menus.map((menu) => ({
    value: menu.id,
    label: menu.name,
    description:
      menu.status !== 'published'
        ? 'Not published'
        : menu.doc?.url?.trim()
          ? 'Document · view only'
          : 'Published',
  }))
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
const hasOrderMenu = computed(() =>
  props.menus.some(
    (menu) =>
      menuIds.value.includes(menu.id) &&
      menu.status === 'published' &&
      !menu.doc?.url?.trim()
  )
)
const canSave = computed(
  () =>
    ['ready', 'empty'].includes(props.menusOutcome) &&
    (!enabled.value || hasOrderMenu.value) &&
    menuIds.value.length > 0 &&
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
  () => props.active !== false,
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
  if (busy.value || props.active === false || props.disabled || !canSave.value)
    return
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
    if (isCurrent()) emit('saved')
    return result
  } catch (cause) {
    if (!isCurrent()) return
    error.value = cause instanceof Error ? cause.message : 'Please try again.'
  } finally {
    if (local()) busy.value = false
  }
}
</script>
