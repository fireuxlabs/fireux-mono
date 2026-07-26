<template>
  <section class="market-page market-personal market-workbench">
    <div class="market-personal__content">
      <header class="market-workbench__header">
        <div>
          <p class="market-eyebrow">Interlaken Essen</p>
          <h1>{{ copy('market_admin_title') }}</h1>
        </div>
        <button
          type="button"
          :disabled="state === 'saving'"
          @click="createAnjaDraft"
        >
          <UIcon name="i-lucide-hexagon" aria-hidden="true" />
          Anja’s Honey · {{ copy('market_store_draft') }}
        </button>
      </header>

      <p v-if="state === 'loading'">{{ copy('market_loading') }}</p>
      <p v-if="message" :class="{ 'is-error': state === 'error' }">
        {{ message }}
      </p>

      <details class="market-workbench__form-card">
        <summary>
          <UIcon name="i-lucide-store" aria-hidden="true" />
          {{ copy('market_create_store') }}
        </summary>
        <form class="market-workbench__form" @submit.prevent="createDraft">
          <label>
            <span>{{ copy('market_store_name') }}</span>
            <input
              v-model="draftForm.name"
              required
              minlength="2"
              maxlength="80"
            >
          </label>
          <label>
            <span>{{ copy('market_store_slug') }}</span>
            <input
              v-model="draftForm.slug"
              required
              minlength="3"
              maxlength="80"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            >
          </label>
          <label class="market-workbench__wide">
            <span>{{ copy('market_store_description') }}</span>
            <textarea
              v-model="draftForm.description"
              required
              minlength="10"
              maxlength="1000"
              rows="4"
            />
          </label>
          <label>
            <span>{{ copy('market_locality') }}</span>
            <input v-model="draftForm.locality" required maxlength="80">
          </label>
          <label>
            <span>{{ copy('market_postcode') }}</span>
            <input
              v-model="draftForm.postcode"
              required
              pattern="[0-9]{4}"
              maxlength="4"
            >
          </label>
          <button type="submit" :disabled="state === 'saving'">
            <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
            {{ copy('market_create_store') }}
          </button>
        </form>
      </details>

      <div class="market-admin__list">
        <article v-for="store in stores" :key="store.id">
          <header>
            <div>
              <span>{{ storeStateLabel(store.publication_state) }}</span>
              <h2>{{ store.name }}</h2>
              <p>{{ store.slug }} · {{ store.locality.label }}</p>
            </div>
            <NuxtLink :to="`/mis/stores/${store.id}`">
              <UIcon name="i-lucide-pencil" aria-hidden="true" />
            </NuxtLink>
          </header>

          <div class="market-admin__actions">
            <button
              v-if="store.publication_state === 'pending_review'"
              type="button"
              @click="moderate(store.id, 'approve')"
            >
              {{ copy('market_admin_approve') }}
            </button>
            <button
              v-if="store.publication_state === 'pending_review'"
              type="button"
              @click="moderate(store.id, 'return')"
            >
              {{ copy('market_admin_return') }}
            </button>
            <button
              v-if="store.publication_state === 'published'"
              type="button"
              @click="moderate(store.id, 'pause')"
            >
              {{ copy('market_admin_pause') }}
            </button>
            <button
              v-if="store.publication_state === 'paused'"
              type="button"
              @click="moderate(store.id, 'resume')"
            >
              {{ copy('market_admin_resume') }}
            </button>
          </div>

          <form class="market-admin__member" @submit.prevent="assign(store.id)">
            <label>
              <span>{{ copy('market_admin_assign_user') }}</span>
              <input
                v-model="memberUid[store.id]"
                required
                placeholder="Firebase User UID"
              >
            </label>
            <select v-model="memberRole[store.id]">
              <option value="owner">{{ copy('market_admin_owner') }}</option>
              <option value="editor">{{ copy('market_admin_editor') }}</option>
            </select>
            <button type="submit">{{ copy('account_save') }}</button>
          </form>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import {
  anjaHoneyDraftOffers,
  anjaHoneyDraftStore,
} from '@/content/marketplace-seed'
import type {
  MarketplaceStoreModerationIntent,
} from 'fireux-marketplace/runtime/models/marketplace-api.model'
import type {
  MarketplaceStore,
  MarketplaceStoreState,
} from 'fireux-marketplace/runtime/models/marketplace.model'

definePageMeta({ layout: 'marketplace' })
const { copy } = useInterlakenCopy()
const marketplace = useMarketplaceClient()
const stores = ref<MarketplaceStore[]>([])
const state = ref<'loading' | 'idle' | 'saving' | 'error'>('loading')
const message = ref('')
const memberUid = reactive<Record<string, string>>({})
const memberRole = reactive<Record<string, 'owner' | 'editor'>>({})
const draftForm = reactive({
  name: '',
  slug: '',
  description: '',
  locality: '',
  postcode: '',
})

function storeStateLabel(state: MarketplaceStoreState) {
  return copy(`market_store_${state}` as
    | 'market_store_draft'
    | 'market_store_pending_review'
    | 'market_store_published'
    | 'market_store_paused')
}

async function load() {
  state.value = 'loading'
  try {
    stores.value = (await marketplace.adminStores()).items
    for (const store of stores.value) memberRole[store.id] ||= 'owner'
    state.value = 'idle'
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

async function moderate(
  storeId: string,
  action: MarketplaceStoreModerationIntent['action']
) {
  state.value = 'saving'
  try {
    await marketplace.moderateStore(storeId, { action })
    await load()
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

async function assign(storeId: string) {
  state.value = 'saving'
  try {
    await marketplace.mutateStoreMember(storeId, {
      uid: memberUid[storeId]?.trim(),
      role: memberRole[storeId] || 'owner',
      action: 'add',
    })
    memberUid[storeId] = ''
    await load()
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

async function createAnjaDraft() {
  state.value = 'saving'
  message.value = ''
  try {
    const existing = stores.value.find(
      store => store.id === anjaHoneyDraftStore.slug
    )
    if (
      existing &&
      (
        existing.name !== anjaHoneyDraftStore.name ||
        existing.locality.label !== anjaHoneyDraftStore.locality.label ||
        existing.locality.postal_code !==
          anjaHoneyDraftStore.locality.postal_code
      )
    ) {
      throw new Error('Anja draft slug is already in use')
    }
    const storeId = existing
      ? existing.id
      : (await marketplace.createStore(anjaHoneyDraftStore)).item.id
    const managed = (await marketplace.managedStore(storeId)).store
    for (const offer of anjaHoneyDraftOffers) {
      const alreadyPrepared = managed.offers.some(existingOffer =>
        existingOffer.title === offer.title &&
        existingOffer.unit_label === offer.unit_label
      )
      if (!alreadyPrepared) {
        await marketplace.createOffer(storeId, offer)
      }
    }
    await load()
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

async function createDraft() {
  state.value = 'saving'
  message.value = ''
  try {
    await marketplace.createStore({
      slug: draftForm.slug.trim(),
      name: draftForm.name.trim(),
      description: draftForm.description.trim(),
      locality: {
        label: draftForm.locality.trim(),
        postal_code: draftForm.postcode.trim(),
      },
      image_url: '',
      image_alt: '',
      section_ids: [],
      fulfilment_methods: [],
    })
    Object.assign(draftForm, {
      name: '',
      slug: '',
      description: '',
      locality: '',
      postcode: '',
    })
    await load()
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

onMounted(load)
</script>
