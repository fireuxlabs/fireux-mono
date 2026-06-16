<template>
  <UCard class="border-primary/30 bg-primary/5 ring-1 ring-primary/20">
    <div class="space-y-4">
      <div class="space-y-2">
        <div class="flex items-start gap-3">
          <UAvatar
            icon="i-lucide-key-round"
            size="md"
            class="bg-primary/10 text-primary"
          />

          <div class="min-w-0 space-y-2">
            <h2 class="text-xl font-semibold">
              {{ panelTitle }}
            </h2>
            <p class="text-sm leading-6 text-muted">
              {{ panelDescription }}
            </p>
          </div>
        </div>

        <div v-if="operatorUserPill" class="space-y-2">
          <span class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {{ operatorLabel }}
          </span>
          <div class="fx-operator-user">
            <UserCardsPill
              v-bind="operatorUserPill"
              :show-badges="false"
              :link="Boolean(operatorUserPill.to)"
              class="block"
            />
          </div>
        </div>

        <div v-if="showManageAction" class="flex flex-wrap gap-2">
          <UButton
            :class="{ 'fx-admin-edit-button': isAdminEdit }"
            size="xs"
            :color="isAdminEdit ? 'warning' : 'neutral'"
            variant="soft"
            :icon="isAdminEdit ? 'i-lucide-shield-check' : 'i-lucide-pencil'"
            :to="editTo"
            @click="emit('manage', $event)"
          >
            {{ isAdminEdit ? adminManageLabel : manageLabel }}
          </UButton>
        </div>
      </div>

      <div
        v-if="aligned.length || notAligned.length"
        class="grid gap-3 sm:grid-cols-2"
      >
        <div v-if="aligned.length" class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Aligned
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="badge in aligned"
              :key="badge"
              color="primary"
              variant="soft"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="notAligned.length" class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Not aligned yet
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="badge in notAligned"
              :key="badge"
              color="neutral"
              variant="soft"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { UserCard } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    entityLabel: string
    title?: string
    description?: string
    operatorLabel?: string
    operatorUserPill?: UserCard.Card | null
    canEdit?: boolean
    isAdminEdit?: boolean
    editTo?: string
    manageLabel?: string
    adminManageLabel?: string
    aligned?: string[]
    notAligned?: string[]
  }>(),
  {
    operatorLabel: 'Operator',
    operatorUserPill: null,
    canEdit: false,
    isAdminEdit: false,
    editTo: '',
    manageLabel: 'Edit details',
    adminManageLabel: 'Admin Edit',
    aligned: () => [],
    notAligned: () => [],
  }
)
const emit = defineEmits<{
  manage: [event: MouseEvent]
}>()

const entityLowerLabel = computed(() =>
  String(props.entityLabel || 'record').trim().toLowerCase()
)
const panelTitle = computed(
  () => props.title || `${props.entityLabel || 'Record'} console`
)
const panelDescription = computed(
  () =>
    props.description ||
    `Operators manage this ${entityLowerLabel.value} from its console.`
)
const operatorUserPill = computed(() => props.operatorUserPill ?? null)
const operatorLabel = computed(() => props.operatorLabel || 'Operator')
const editTo = computed(() => String(props.editTo || '').trim())
const showManageAction = computed(() => props.canEdit && Boolean(editTo.value))
const isAdminEdit = computed(() => Boolean(props.isAdminEdit))
const manageLabel = computed(() => props.manageLabel || 'Edit details')
const adminManageLabel = computed(() => props.adminManageLabel || 'Admin Edit')
</script>

<style scoped>
.fx-operator-user {
  display: block;
  max-width: 100%;
  width: min(100%, 260px);
}

.fx-admin-edit-button {
  border-color: var(--fx-debug-yellow-border);
  background: var(--fx-debug-yellow-bg);
  color: var(--fx-fireux-yellow-muted);
}
</style>
