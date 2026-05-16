<template>
  <UPage v-if="property">
    <UPageHeader
      :title="property.name"
      :description="property.headline"
    >
      <template #headline>
        <UBadge color="primary" variant="soft">
          Direct booking enquiry
        </UBadge>
      </template>

      <template #links>
        <UButton
          :to="`/properties/${property.slug}/info`"
          color="neutral"
          variant="soft"
          icon="i-lucide-book-open"
        >
          View property info
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div class="space-y-6">
          <img
            :src="property.image_url"
            :alt="property.name"
            class="aspect-[16/9] w-full rounded-lg object-cover"
          />

          <UCard>
            <div class="space-y-4">
              <div>
                <p class="text-sm font-semibold text-primary">
                  {{ property.location_label }}
                </p>
                <p class="mt-2 text-sm leading-6 text-toned">
                  {{ property.summary }}
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <p class="text-xs font-semibold uppercase text-muted">
                    Address
                  </p>
                  <p class="mt-1 text-sm">
                    {{ property.address_display }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase text-muted">
                    Manager
                  </p>
                  <p class="mt-1 text-sm">
                    {{ property.manager_name }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase text-muted">
                    Rate
                  </p>
                  <p class="mt-1 text-sm">
                    {{ property.price_hint }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase text-muted">
                    Availability
                  </p>
                  <p class="mt-1 text-sm">
                    {{ property.availability_hint }}
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="amenity in property.amenities"
                  :key="amenity"
                  color="neutral"
                  variant="soft"
                >
                  {{ amenity }}
                </UBadge>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="space-y-3">
              <h2 class="text-xl font-semibold">
                Public information boundary
              </h2>
              <ul class="grid gap-2">
                <li
                  v-for="note in property.public_notes"
                  :key="note"
                  class="flex gap-2 text-sm text-toned"
                >
                  <Icon name="i-lucide-check" class="mt-0.5 size-4 text-primary" />
                  <span>{{ note }}</span>
                </li>
              </ul>
            </div>
          </UCard>
        </div>

        <UCard>
          <div class="space-y-5">
            <div>
              <h2 class="text-xl font-semibold">
                Message the host
              </h2>
              <p class="mt-1 text-sm leading-6 text-toned">
                Ask about dates or direct booking before private stay details are shared.
              </p>
            </div>

            <UAlert
              v-if="submitMessage"
              :color="submitColor"
              :title="submitTitle"
              :description="submitMessage"
            />

            <form class="space-y-4" @submit.prevent="handleSubmit">
              <UFormField label="Name" required>
                <UInput v-model="draft.name" placeholder="Your name" />
              </UFormField>

              <UFormField label="Email" required>
                <UInput v-model="draft.email" type="email" placeholder="you@example.com" />
              </UFormField>

              <UFormField label="Phone">
                <UInput v-model="draft.phone" placeholder="+41 ..." />
              </UFormField>

              <UFormField label="Message" required>
                <UTextarea
                  v-model="draft.message"
                  :rows="5"
                  placeholder="Tell the host your dates, guest count, and any questions."
                />
              </UFormField>

              <UButton
                block
                color="primary"
                type="submit"
                :loading="submitting"
              >
                Send enquiry
              </UButton>
            </form>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>

  <UPage v-else>
    <UPageHeader
      title="Property not found"
      description="This BuenoHost property is unavailable."
    />
    <UPageBody>
      <UButton to="/" color="primary">
        Back to BuenoHost
      </UButton>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useConversationCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/conversation/mutations/useConversationCreate'
import { findDemoBuenoHostPublicProperty } from '../../../demo/properties'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const property = computed(() => findDemoBuenoHostPublicProperty(slug.value))
const { createConversation } = useConversationCreate()

const submitting = ref(false)
const submitTitle = ref('')
const submitMessage = ref('')
const submitColor = ref<'success' | 'warning' | 'error'>('success')
const draft = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
})

function resetDraft() {
  draft.name = ''
  draft.email = ''
  draft.phone = ''
  draft.message = ''
}

async function handleSubmit() {
  if (!property.value) return

  if (!draft.name.trim() || !draft.email.trim() || !draft.message.trim()) {
    submitColor.value = 'warning'
    submitTitle.value = 'Complete the form'
    submitMessage.value = 'Please add your name, email, and message before sending.'
    return
  }

  submitting.value = true
  submitMessage.value = ''

  try {
    const conversationId = await createConversation({
      app_id: 'buenohost',
      kind: 'property_enquiry',
      related_entity: {
        family: 'properties',
        id: property.value.id,
        path: `properties/${property.value.id}`,
        label: property.value.name,
      },
      guest_contact: {
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        preferred_channel: 'chat',
      },
      source_route: route.fullPath,
      initial_message: {
        body: draft.message,
        sender_type: 'guest',
        sender_name: draft.name,
      },
    })

    submitColor.value = 'success'
    submitTitle.value = 'Enquiry sent'
    submitMessage.value = `Your message is saved as conversation ${conversationId}.`
    resetDraft()
  } catch (error) {
    submitColor.value = 'error'
    submitTitle.value = 'Could not send enquiry'
    submitMessage.value =
      error instanceof Error ? error.message : 'Please try again.'
  } finally {
    submitting.value = false
  }
}

useSeoMeta({
  title: computed(() =>
    property.value
      ? `${property.value.name} | BuenoHost`
      : 'Property | BuenoHost'
  ),
  description: computed(() =>
    property.value?.summary || 'BuenoHost public property enquiry page.'
  ),
})
</script>
