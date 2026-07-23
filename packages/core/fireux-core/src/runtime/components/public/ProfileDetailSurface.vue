<template>
  <UPage>
    <UPageBody class="pagebody">
      <slot v-if="pending" name="loading">
        <div
          class="public-profile-detail"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <USkeleton class="h-72 rounded-3xl" />
          <div class="public-profile-detail__content">
            <USkeleton class="h-96 rounded-3xl" />
            <USkeleton class="h-64 rounded-3xl" />
          </div>
        </div>
      </slot>

      <UPageCard
        v-else-if="failed"
        :title="`${entityLabel} unavailable`"
        :description="`This ${entityLabel.toLowerCase()} profile could not be loaded right now. Please try again.`"
        icon="i-lucide-cloud-alert"
        variant="subtle"
        class="rounded-3xl"
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
        v-else-if="missing"
        :title="`${entityLabel} not found`"
        :description="`This ${entityLabel.toLowerCase()} profile does not exist.`"
        :icon="icon"
        variant="subtle"
        class="rounded-3xl"
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
defineOptions({ name: 'PublicProfileDetailSurface' })

defineProps<{
  backTo: string
  entityLabel: string
  failed: boolean
  icon: string
  missing: boolean
  pending: boolean
  pluralLabel: string
}>()
</script>
