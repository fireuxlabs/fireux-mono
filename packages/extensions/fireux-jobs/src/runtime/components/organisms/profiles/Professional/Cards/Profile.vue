<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <UAvatar :src="avatar || undefined" :alt="title" size="md" />
          <div class="min-w-0">
            <div class="truncate text-base font-semibold">{{ title }}</div>
            <div class="text-sm text-dimmed">
              <span v-if="subtitle">{{ subtitle }}</span>
              <span v-else class="italic">missing</span>
            </div>
          </div>
        </div>

        <div v-if="badges.length" class="flex flex-wrap justify-end gap-1">
          <UBadge
            v-for="badge in badges"
            :key="badge"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="prop" class="text-sm text-dimmed">
        {{ prop }}
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Bio</div>
        <div class="text-sm">
          <span v-if="prop || line1">{{ prop || line1 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Specialties</div>
        <div class="text-sm">
          <span v-if="line2">{{ line2 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Locations</div>
        <div class="text-sm">
          <span v-if="line3">{{ line3 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { reactive, toRefs, watchEffect } from 'vue'
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional'

const prop = defineProp<string>('prop', { required: false })

const props = defineProps<{ card: ProfessionalCard.Card }>()

const card = reactive({ ...props.card })

watchEffect(() => {
  Object.assign(card, props.card)
})

const { avatar, title, subtitle, badges, line1, line2, line3 } = toRefs(card)
</script>
