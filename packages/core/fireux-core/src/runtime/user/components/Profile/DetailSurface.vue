<template>
  <UPage>
    <UPageBody class="pagebody">
      <slot v-if="pending" name="loading">
        <FireState outcome="pending" :entity="`${entityLabel} profile`" />
      </slot>

      <UPageCard
        v-else-if="failed"
        :title="`${entityLabel} unavailable`"
        :description="`This ${entityLabel.toLowerCase()} profile could not be loaded right now. Please try again.`"
        icon="i-lucide-cloud-alert"
        variant="subtle"
      >
        <template #footer>
          <UButton
            :to="backTo"
            :label="`Browse ${pluralLabel.toLowerCase()}`"
            color="neutral"
            variant="soft"
          />
        </template>
      </UPageCard>

      <UPageCard
        v-else-if="empty"
        :title="`${entityLabel} not found`"
        :description="`This ${entityLabel.toLowerCase()} profile does not exist.`"
        :icon="icon"
        variant="subtle"
      >
        <template #footer>
          <UButton
            :to="backTo"
            :label="`Browse ${pluralLabel.toLowerCase()}`"
            icon="i-lucide-arrow-left"
          />
        </template>
      </UPageCard>

      <slot v-else />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
defineOptions({ name: 'UserProfileDetailSurface' })

defineProps<{
  backTo: string
  entityLabel: string
  failed: boolean
  icon: string
  empty: boolean
  pending: boolean
  pluralLabel: string
}>()
</script>
