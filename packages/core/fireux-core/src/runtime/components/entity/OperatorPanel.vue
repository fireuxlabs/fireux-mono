<template>
  <UCard class="fx-card fx-card--public-action">
    <div class="fx-public-action">
      <div class="fx-public-action__badges">
        <UBadge color="primary" variant="soft">
          Operator
        </UBadge>
      </div>

      <div class="fx-public-action__body">
        <UAvatar
          icon="i-lucide-key-round"
          size="md"
          class="fx-public-action__avatar"
        />

        <div class="fx-public-action__content">
          <div class="fx-public-action__copy">
            <h2 class="fx-public-action__title">
              {{ panelTitle }}
            </h2>
            <p class="fx-public-action__description">
              {{ panelDescription }}
            </p>
          </div>

          <div v-if="operatorUserPill" class="fx-public-action__subject">
            <span class="fx-public-action__label">{{ operatorLabel }}</span>
            <UserCardsPill
              v-bind="operatorUserPill"
              :show-badges="false"
              :link="Boolean(operatorUserPill.to)"
              class="block"
            />
          </div>

          <div v-if="manageAction" class="fx-public-action__actions">
            <UButton
              size="xs"
              :color="manageAction.color"
              variant="soft"
              :icon="manageAction.icon"
              :to="manageAction.to"
              @click="manageAction.onClick"
            >
              {{ manageAction.label }}
            </UButton>
          </div>

          <div v-if="groups.length" class="fx-public-action__groups">
            <div
              v-for="group in groups"
              :key="group.label"
              class="fx-public-action__group"
            >
              <p class="fx-public-action__label">
                {{ group.label }}
              </p>
              <div class="fx-public-action__chips">
                <UBadge
                  v-for="item in group.items"
                  :key="item"
                  :color="group.color || 'neutral'"
                  variant="soft"
                >
                  {{ item }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { UserCard } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { computed } from 'vue'
import {
  visiblePublicActionGroups,
  type PublicActionButton,
  type PublicActionGroup,
} from '../../composables/fireux/app/ui/usePublicActionPanel'

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

const manageAction = computed<PublicActionButton | null>(() =>
  showManageAction.value
    ? {
        label: isAdminEdit.value ? adminManageLabel.value : manageLabel.value,
        to: editTo.value,
        icon: isAdminEdit.value
          ? 'i-lucide-shield-check'
          : 'i-lucide-pencil',
        color: isAdminEdit.value ? 'warning' as const : 'neutral' as const,
        onClick: (event: MouseEvent) => emit('manage', event),
      }
    : null
)
const groups = computed<PublicActionGroup[]>(() =>
  visiblePublicActionGroups([
    {
      label: 'Aligned',
      items: props.aligned,
      color: 'primary' as const,
    },
    {
      label: 'Not aligned yet',
      items: props.notAligned,
      color: 'neutral' as const,
    },
  ])
)
</script>
