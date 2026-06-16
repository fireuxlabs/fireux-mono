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
              Project Operations
            </h2>
            <p class="fx-public-action__description">
              {{ panelDescription }}
            </p>
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
                  :color="group.color"
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
import { computed } from 'vue'
import {
  visiblePublicActionGroups,
  type PublicActionGroup,
} from '../../composables/fireux/app/ui/usePublicActionPanel'
import type { ProjectSurface } from '../../composables/fireux/firestore/core/project/utils/view/useProjectInterface'

const props = defineProps<{
  project?: ProjectSurface | null
}>()

const aligned = ['Identity', 'App', 'Ecosystem']
const notAligned: string[] = []
const projectName = computed(() =>
  String(props.project?.name || props.project?.slug || props.project?.id || '').trim()
)
const panelDescription = computed(() =>
  projectName.value
    ? `Project operators manage apps, ecosystem links, and project work for ${projectName.value}.`
    : 'Project operators manage apps, ecosystem links, and project work from the project console.'
)
const groups = computed<PublicActionGroup[]>(() =>
  visiblePublicActionGroups([
    {
      label: 'Aligned',
      items: aligned,
      color: 'primary' as const,
    },
    {
      label: 'Not aligned yet',
      items: notAligned,
      color: 'neutral' as const,
    },
  ])
)
</script>
