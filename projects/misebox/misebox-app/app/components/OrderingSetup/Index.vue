<template>
  <div class="mx-auto w-full max-w-2xl space-y-6 py-8">
    <section v-if="signedIn" aria-label="Your Kitchens" class="space-y-3">
      <p v-if="myKitchens.outcome.value === 'pending'" role="status">Loading your Kitchens…</p>
      <UAlert v-else-if="myKitchens.outcome.value === 'error'" title="Your Kitchens could not be loaded" color="error">
        <template #description><MoleculesCopyError :message="String(myKitchens.error.value || 'Your Kitchens could not be loaded.')" /></template>
      </UAlert>
      <template v-else-if="myKitchens.kitchens.value.length">
        <h1 class="text-2xl font-semibold text-highlighted">Your Kitchens</h1>
        <div class="grid gap-3 sm:grid-cols-2">
          <WorkspaceSelectionRow
            v-for="kitchen in myKitchens.kitchens.value"
            :key="kitchen.id"
            :selected="selectedKitchenId === kitchen.id"
            @select="selectedKitchenId = kitchen.id || ''"
          >
            <UAvatar
              :src="kitchen.display_image_url || undefined"
              :alt="kitchen.display_name"
              icon="i-lucide-chef-hat"
            />
            <span class="truncate">{{ kitchen.display_name || kitchen.id }}</span>
            <UIcon v-if="selectedKitchenId === kitchen.id" name="i-lucide-check" class="ml-auto shrink-0 text-primary" />
          </WorkspaceSelectionRow>
        </div>
        <div v-if="selectedKitchen" class="space-y-3" role="status">
          <UAlert :title="`${selectedKitchen.display_name} selected`" color="success" icon="i-lucide-check-circle" />
          <UButton label="Use another Kitchen" color="neutral" variant="link" @click="selectedKitchenId = ''" />
        </div>
      </template>
      <UAlert v-else-if="myKitchens.outcome.value === 'missing'" title="Your linked Kitchens are unavailable" color="warning" />
    </section>
    <KitchenOnboarding
      v-if="!selectedKitchen"
      :key="onboardingKey"
      mode="root"
      intent="directory"
      return-to="/services/ordering/setup"
      cancel-to="/services/ordering/setup"
      :select-workspace-on-complete="false"
    >
      <template #selected="{ preview }">
        <template v-if="preview.existing">
          <p v-if="access.outcome.value === 'pending'" role="status">
            Checking your Kitchen access…
          </p>
          <UAlert
            v-else-if="access.outcome.value === 'error'"
            title="Kitchen access could not be checked"
            color="error"
          >
            <template #description
              ><MoleculesCopyError
                :message="
                  String(
                    access.error.value || 'Kitchen access could not be checked.'
                  )
                "
            /></template>
          </UAlert>
          <UAlert
            v-else-if="access.outcome.value === 'idle'"
            title="Kitchen access is unavailable for this account"
            color="neutral"
          />
          <UAlert
            v-else
            :title="
              access.ids.value.includes(preview.kitchen_id)
                ? 'You can use this Kitchen'
                : 'You are not in this Kitchen team'
            "
            :color="
              access.ids.value.includes(preview.kitchen_id)
                ? 'success'
                : 'neutral'
            "
          />
        </template>
      </template>
    </KitchenOnboarding>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenAccess } from 'fireux-kitchens/runtime/kitchen/composables/useKitchenAccess'
const { currentUser } = useAuth()
import { useKitchenWorkspaceKitchens } from 'fireux-kitchens/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceKitchens'
const access = useKitchenAccess()
const signedIn = computed(() => Boolean(currentUser.value && !currentUser.value.isAnonymous))
const myKitchens = useKitchenWorkspaceKitchens({ enabled: signedIn })
const selectedKitchenId = ref('')
const selectedKitchen = computed(() => myKitchens.kitchens.value.find((kitchen) => kitchen.id === selectedKitchenId.value))
watch(myKitchens.kitchens, (kitchens) => {
  if (!kitchens.some((kitchen) => kitchen.id === selectedKitchenId.value)) selectedKitchenId.value = ''
})
const onboardingKey = ref(0)
watch(
  () => currentUser.value?.uid,
  () => {
    selectedKitchenId.value = ''
    onboardingKey.value += 1
  }
)
</script>

<!-- Temporarily parked: ordering setup steps. Restore after the directory/access interaction is reviewed.
<template>
  <main
    class="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10"
  >
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <NuxtLink to="/" class="text-sm font-semibold text-primary"
          >Misebox</NuxtLink
        >
        <h1 class="mt-2 text-3xl font-semibold">Set up website ordering</h1>
        <p class="mt-2 text-sm text-muted">
          Configure ordering, check the customer and Kitchen journey, then
          install your website button.
        </p>
      </div>
      <UButton
        to="/workspace/kitchen"
        label="Open Workspace"
        color="neutral"
        variant="outline"
      />
    </header>
    <UCard>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="font-medium">{{ selectedName }}</p>
        <WorkspaceKitchenSelector :show-upgrade="false" return-to="/services/ordering/setup" />
      </div>
    </UCard>
    <MoleculesStateCard
      v-if="index.outcome.value === 'idle' || index.outcome.value === 'pending'"
      entity="Kitchens"
      loading
    />
    <MoleculesStateCard
      v-else-if="index.outcome.value === 'error'"
      entity="Kitchens"
      state="error"
    />
    <section
      v-else-if="!index.selectedId.value"
      aria-label="Set up your Kitchen"
    >
      <KitchenOnboarding mode="workspace" return-to="/services/ordering/setup" cancel-to="/services/ordering/setup" />
    </section>
    <template v-else>
      <nav aria-label="Ordering setup" class="flex flex-wrap gap-2">
        <UButton
          v-for="item in steps"
          :key="item.id"
          :label="item.label"
          :aria-current="step === item.id ? 'step' : undefined"
          :variant="step === item.id ? 'solid' : 'soft'"
          :color="step === item.id ? 'primary' : 'neutral'"
          @click="step = item.id"
        />
      </nav>
      <div :key="index.selectedId.value" class="min-w-0">
        <WorkspaceKitchenIdentity
          v-if="step === 'kitchen'"
          :identity="identity"
        />
        <template v-else-if="step === 'menus'">
          <p class="mb-4 text-sm text-muted">
            Use your existing menus or create one here. Open a menu to edit its
            items and publication in the Workspace.
          </p>
          <WorkspaceKitchenMenusCollection />
        </template>
        <WorkspaceKitchenServices v-else-if="step === 'service'" />
        <WorkspaceKitchenFulfilment v-else-if="step === 'payment'" />
        <template v-else-if="step === 'test'">
          <UCard class="mb-6">
            <template #header
              ><h2 class="text-lg font-semibold">
                Prove one order before installing
              </h2></template
            >
            <p class="mb-4 text-sm text-muted">
              Manual checklist, not a recorded test result. Configuration alone
              does not prove that ordering works.
            </p>
            <ol class="list-decimal space-y-3 pl-5 text-sm">
              <li>
                Open a customer link below. Check the correct menu, item, price,
                available fulfilment options, times and customer message.
              </li>
              <li>
                When ready for a real test, use a clearly labelled order with
                an enabled fulfilment option. Review allergies and submit once.
                Submission creates a real order.
              </li>
              <li>
                In Incoming, match the order ID, items, total, fulfilment details
                and requested time. Confirm that it appears exactly once.
              </li>
              <li>
                Confirm in the Kitchen, then choose an available payment method
                as the customer. Verify the payment state and customer status
                before starting preparation. Online payment may charge real money.
              </li>
              <li>
                Prepare, mark ready and complete. Verify one Sale and, if
                printing is configured, the expected ticket. A deferred payment
                choice is not proof that payment was collected.
              </li>
            </ol>
            <div class="mt-5 flex flex-wrap gap-2">
              <UButton
                to="/workspace/kitchen/orders"
                target="_blank"
                label="Open Incoming"
                icon="i-lucide-external-link"
              />
              <UButton
                color="neutral"
                variant="soft"
                label="Continue to website code"
                @click="step = 'install'"
              />
            </div>
          </UCard>
          <WorkspaceKitchenIntegrationsOrderingSetup
            v-if="
              ordering.outcome.value === 'ready' &&
              ordering.selectedKitchen.value
            "
            :kitchen="ordering.selectedKitchen.value"
            :name="ordering.name.value"
            :services="ordering.services.value"
            :menus="ordering.menus.value"
            :menus-outcome="ordering.menusOutcome.value"
          />
          <MoleculesStateCard
            v-else-if="ordering.outcome.value === 'error'"
            entity="Ordering configuration"
            state="error"
          />
          <MoleculesStateCard v-else entity="Ordering configuration" loading />
        </template>
        <template v-else>
          <p class="mb-4 text-sm text-muted">
            Copy the website button after verifying your order journey. Opening
            this step does not mark ordering as ready.
          </p>
          <WorkspaceKitchenIntegrationsWebsiteOrdering
            v-if="
              ordering.outcome.value === 'ready' &&
              ordering.selectedKitchen.value
            "
            :kitchen="ordering.selectedKitchen.value"
          />
          <MoleculesStateCard
            v-else-if="ordering.outcome.value === 'error'"
            entity="Kitchen"
            state="error"
          />
          <MoleculesStateCard v-else entity="Kitchen" loading />
        </template>
      </div>
    </template>
  </main>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenWorkspaceIndex } from 'fireux-kitchens/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceIndex'
import { useKitchenIdentity } from 'fireux-kitchens/runtime/kitchen/composables/workspace/identity/useKitchenIdentity'
import { provideKitchenMenusContext } from 'fireux-kitchens/runtime/kitchen/composables/workspace/menus/useKitchenMenusContext'
import WorkspaceKitchenMenusCollection from 'fireux-kitchens/runtime/kitchen/components/Workspace/Menus/Collection.vue'
import { useKitchenServices } from 'fireux-kitchens/runtime/kitchen/composables/workspace/services/useKitchenServices'
const ordering = useKitchenServices()
const index = useKitchenWorkspaceIndex()
const identity = useKitchenIdentity()
provideKitchenMenusContext()
const steps = [
  { id: 'kitchen', label: '1. Kitchen' },
  { id: 'menus', label: '2. Menu' },
  { id: 'service', label: '3. Service' },
  { id: 'payment', label: '4. Payment' },
  { id: 'test', label: '5. Prove an order' },
  { id: 'install', label: '6. Install' },
]
const step = ref('kitchen')
const selectedName = computed(
  () =>
    index.collection.value.find(
      (kitchen) => kitchen.id === index.selectedId.value
    )?.display_name || 'Choose your Kitchen'
)
watch(index.selectedId, () => {
  step.value = 'kitchen'
})
</script>

-->
