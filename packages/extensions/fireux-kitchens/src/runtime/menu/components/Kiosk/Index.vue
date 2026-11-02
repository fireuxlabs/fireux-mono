<template>
  <UPage class="menu-kiosk">
    <UContainer>
      <UAlert
        v-if="currentUser && !currentUser.isAnonymous"
        title="Use a guest browser for Kiosk"
        description="Open this address in a private browser window on the touchscreen. Keep your staff account in Workspace."
        color="neutral"
        icon="i-lucide-monitor"
      />
      <template v-else-if="!service">
        <UPageHeader
          title="Order here"
          description="Choose how you would like your food. Pay at the counter."
        />
        <div class="menu-kiosk__choices">
          <UButton
            label="Eat in"
            icon="i-lucide-utensils"
            size="xl"
            block
            @click="service = 'eat_in'"
          />
          <UButton
            label="Takeaway"
            icon="i-lucide-shopping-bag"
            size="xl"
            block
            @click="service = 'takeaway'"
          />
        </div>
      </template>
      <Suspense v-else :key="service">
        <KitchenDetailServiceMenu
          :kitchen-slug="kitchenSlug"
          :service="service"
          @reset="service = null"
        />
        <template #fallback>
          <FireState outcome="pending" entity="Menu" />
        </template>
      </Suspense>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

defineProps<{ kitchenSlug: string }>()
const { currentUser } = useAuth()
const service = ref<'eat_in' | 'takeaway' | null>(null)
</script>

<style scoped>
.menu-kiosk {
  min-height: 100dvh;
  padding-block: 2rem;
}
.menu-kiosk__choices {
  display: grid;
  gap: 1.5rem;
  max-width: 40rem;
  margin: 2rem auto;
}
.menu-kiosk__choices :deep(button) {
  min-height: 8rem;
  font-size: 1.5rem;
}
@media (min-width: 40rem) {
  .menu-kiosk__choices {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
