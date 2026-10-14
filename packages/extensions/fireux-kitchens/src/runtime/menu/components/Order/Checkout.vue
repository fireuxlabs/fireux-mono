<template>
          <MenuOrderCart
            :lines="flow.cart"
            :total="flow.total"
            :money="flow.money"
            :pending="flow.pending"
            @adjust="flow.adjust"
          >
            <fieldset
              v-if="flow.cart.length"
              :disabled="flow.pending"
              class="space-y-3"
            >
              <MenuOrderDetails
                v-model:name="flow.name"
                v-model:phone="flow.phone"
                v-model:address="flow.address"
                :context="context"
              />
              <p
                v-for="issue in flow.issues"
                :key="issue"
                class="text-sm text-muted"
              >
                {{ issue }}
              </p>
              <UButton
                label="Submit order"
                block
                size="lg"
                :disabled="flow.issues.length > 0 || !flow.currentUser"
                :loading="flow.pending"
                @click="flow.submit"
              />
            </fieldset>
          </MenuOrderCart>
</template>
<script setup lang="ts">
import type { UnwrapRef } from 'vue'
import type { useMenuOrderFlow, MenuOrderInput } from '../../composables/useMenuOrderFlow'
defineProps<{ flow: UnwrapRef<ReturnType<typeof useMenuOrderFlow>>; context: MenuOrderInput['context'] }>()
</script>
