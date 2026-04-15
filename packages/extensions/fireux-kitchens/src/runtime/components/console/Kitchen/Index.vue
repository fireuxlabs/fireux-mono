<!-- ConsoleKitchen.vue -->
<template>
  <section class="space-y-6">
    <UAlert
      v-if="!liveKitchens.length"
      color="neutral"
      variant="soft"
      title="No live kitchens found"
      description="No live kitchens are currently available in this workspace."
    />

    <div v-if="liveKitchens.length" class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            {{ kitchen ? 'Selected Kitchen' : 'Select a kitchen' }}
          </div>

          <UButton
            v-if="kitchen"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </div>

        <KitchenCardsPill
          v-if="kitchen"
          v-bind="kitchen"
          :link="false"
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a kitchen below to load it into the console.
        </p>
      </div>

      <KitchenCollectionManager
        :collection="liveKitchens"
        title="Choose Kitchen"
        description="Select the live kitchen you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="selectKitchen"
      />
    </div>

    <section v-if="demoKitchens.length" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Try a kitchen simulation</div>

        <USwitch
          v-model="showSimulations"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Show kitchen simulations"
        />
      </div>

      <div v-if="showSimulations" class="space-y-2">
        <div class="text-sm text-dimmed">
          Read-only demo kitchens wired into the same console stack.
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <UButton
            v-for="scenario in demoKitchens"
            :key="scenario.id"
            color="neutral"
            variant="soft"
            class="justify-between"
            @click="selectDemoKitchen(scenario.id)"
          >
            <span>{{ scenario.name }}</span>
            <span class="text-xs text-dimmed">{{ scenario.address_label }}</span>
          </UButton>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenConsoleIndex } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleIndex'

const {
  kitchen,
  liveKitchens,
  demoKitchens,
  clearSelection,
  selectKitchen,
  selectDemoKitchen,
} = useKitchenConsoleIndex({ publishHeader: true })

const showSimulations = ref(false)
</script>