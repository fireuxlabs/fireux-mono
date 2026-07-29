<template>
  <UPage>
    <UPageBody class="pagebody">
      <UPageCard v-if="outcome === 'pending'" variant="subtle">
        <p class="text-sm text-dimmed">Loading kitchen…</p>
      </UPageCard>

      <UPageCard
        v-else-if="outcome === 'error'"
        title="Kitchen unavailable"
        description="This kitchen could not be loaded. Please try again."
        variant="subtle"
      />

      <UPageCard
        v-else-if="!kitchen"
        title="Kitchen not found"
        description="This kitchen does not exist or is not public-ready."
        variant="subtle"
      />

      <div v-else class="kitchen-detail">
        <nav class="kitchen-detail__toolbar" aria-label="Kitchen directory">
          <UButton
            to="/kitchens"
            label="All kitchens"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            size="sm"
          />
          <div class="kitchen-detail__actions">
            <KitchenDetailSproochli
              v-if="displayKitchen?.sproochli?.enabled"
              :sproochli="displayKitchen.sproochli"
            />
            <KitchenDetailIdentityEditor
              v-if="canEditIdentity && displayKitchen"
              :kitchen="displayKitchen"
              @saved="applyIdentity"
            />
          </div>
        </nav>

        <KitchenDetailIdentity :kitchen="displayKitchen" />

        <KitchenDetailMenus :kitchen="displayKitchen" />

        <KitchenDetailFulfilment
          :kitchen="displayKitchen"
          :fulfilment="resolvedFulfilment"
        />

        <KitchenDetailOperatorPanel :kitchen="displayKitchen" />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFetch } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, ref, watch } from 'vue'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenFulfilmentConfig } from '../../../models/kitchen.model'
import type {
  KitchenPublicIdentityEdit,
  PublicKitchenDetail,
} from '../../../models/kitchen/kitchen-index.model'
import type { KitchenDetailOutcome } from '../../../composables/fireux/kitchen/useKitchenDetail'

const props = defineProps<{
  kitchen?: PublicKitchenDetail | null
  outcome: KitchenDetailOutcome
}>()

const emit = defineEmits<{
  refresh: []
}>()

const kitchen = computed(() =>
  props.kitchen as KitchenSurface | null | undefined
)
const identityOverride = ref<KitchenPublicIdentityEdit | null>(null)
watch(() => props.kitchen, () => {
  identityOverride.value = null
})
const displayKitchen = computed<PublicKitchenDetail | null>(() => {
  if (!props.kitchen) return null
  const identity = identityOverride.value
  if (!identity) return props.kitchen
  const displayName =
    identity.display_name || props.kitchen.name || props.kitchen.display_name
  const tagline = identity.tagline || props.kitchen.brand_tagline
  const imageUrl =
    identity.card_image_url ||
    props.kitchen.display_image_url ||
    props.kitchen.image_url
  return {
    ...props.kitchen,
    name: displayName,
    display_name: displayName,
    ...(tagline ? { tagline, brand_tagline: tagline } : {}),
    ...(identity.logo_image_url
      ? { logo_image_url: identity.logo_image_url }
      : {}),
    ...(imageUrl
      ? { image_url: imageUrl, display_image_url: imageUrl }
      : {}),
  }
})
const { appId, role } = useFireUXConfig()
const { isAdmin, isDeveloper } = useUser()
const canEditIdentity = computed(() =>
  Boolean(
    (isAdmin.value || isDeveloper.value) &&
    (
      role === 'global' ||
      props.kitchen?.app_scope_app_id === appId
    )
  )
)
const applyIdentity = (identity: KitchenPublicIdentityEdit) => {
  identityOverride.value = identity
  emit('refresh')
}
const locator = computed(() => String(props.kitchen?.slug || '').trim())
const emptyFulfilment: KitchenFulfilmentConfig = {
  delivery_zones: [],
  payment_methods: [],
}
const fulfilmentPath = computed(() =>
  locator.value
    ? `/api/kitchens/${encodeURIComponent(locator.value)}/fulfilment`
    : ''
)

const { data: fulfilmentData } = useFetch<KitchenFulfilmentConfig>(
  fulfilmentPath,
  {
    immediate: Boolean(fulfilmentPath.value),
    watch: [fulfilmentPath],
  }
)
const resolvedFulfilment = computed(() => fulfilmentData.value || emptyFulfilment)
</script>

<style scoped>
.kitchen-detail {
  display: grid;
  gap: clamp(calc(var(--spacing) * 8), 4vw, calc(var(--spacing) * 14));
  padding-bottom: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 20));
}

.kitchen-detail__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  margin-bottom: calc(var(--spacing) * -4);
}

.kitchen-detail__actions {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

@media (max-width: 40rem) {
  .kitchen-detail__toolbar {
    margin-bottom: calc(var(--spacing) * -3);
  }
}
</style>
