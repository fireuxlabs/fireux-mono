<template>
  <ClientOnly>
    <UModal
      v-model:open="open"
      :title="copy('profile_modal_title')"
      :description="copy('profile_modal_description')"
      :ui="{
        overlay: 'market-profile-editor__overlay',
        content: 'market-profile-editor__content',
        header: 'sr-only',
        body: 'market-profile-editor__body',
      }"
    >
      <template #body>
        <article class="market-profile">
          <div class="market-profile__scene" aria-hidden="true">
            <img
              class="market-profile__scene-backdrop"
              src="/img/app/background.png"
              alt=""
            />
            <svg
              class="market-profile__linework"
              viewBox="0 0 600 230"
              fill="none"
            >
              <path
                d="M-18 186C72 166 112 105 173 104C221 103 250 143 289 137C333 131 351 66 414 59C474 52 521 116 620 133"
              />
              <path
                d="M-12 204C72 180 119 126 177 122C224 119 252 157 293 151C347 143 356 85 416 77C481 69 529 135 615 150"
              />
              <path
                d="M8 220C93 194 130 148 183 142C228 137 261 171 301 166C354 159 375 108 428 101C485 94 536 151 598 164"
              />
              <path
                d="M73 190C123 178 151 154 185 151C221 148 244 174 277 174"
              />
            </svg>
            <div class="market-profile__badge">
              <img src="/img/app/logo.png" alt="" />
            </div>
          </div>

          <div class="market-profile__paper">
            <p class="market-profile__eyebrow">
              {{ copy('profile_region') }}
            </p>
            <h2>{{ copy('profile_modal_title') }}</h2>
            <p class="market-profile__copy">
              {{ copy('profile_intro') }}
            </p>

            <div
              class="market-profile__identity"
              :aria-label="
                copy('profile_signed_in_as', {
                  name: authDisplayName || copy('profile_user'),
                })
              "
            >
              <UAvatar
                :src="authAvatarSrc"
                :alt="authDisplayName || copy('profile_misebox_user')"
                :text="authInitials"
                size="md"
                class="market-profile__identity-avatar"
              />
              <strong>
                {{ authDisplayName || copy('profile_misebox_user') }}
              </strong>
            </div>

            <form class="market-profile__form" @submit.prevent="save">
              <fieldset class="market-profile__section">
                <legend>{{ copy('profile_locality_heading') }}</legend>

                <label class="market-profile__field" for="locality">
                  <span>
                    {{ copy('profile_locality_and_postcode_label') }}
                  </span>
                  <span class="market-profile__select-wrap">
                    <UIcon name="i-lucide-map-pin" aria-hidden="true" />
                    <select
                      id="locality"
                      v-model="localityId"
                      required
                      :disabled="Boolean(loading)"
                    >
                      <option value="" disabled>
                        {{ copy('profile_locality_select') }}
                      </option>
                      <option
                        v-for="locality in INTERLAKEN_LOCALITIES"
                        :key="locality.id"
                        :value="locality.id"
                      >
                        {{ locality.postalCode }} · {{ locality.label }}
                      </option>
                      <option :value="OTHER_LOCALITY_ID">
                        {{ copy('profile_other_locality') }}
                      </option>
                    </select>
                    <UIcon name="i-lucide-chevron-down" aria-hidden="true" />
                  </span>
                </label>

                <div
                  v-if="localityId === OTHER_LOCALITY_ID"
                  class="market-profile__other-locality"
                >
                  <label class="market-profile__field" for="locality-label">
                    <span>{{ copy('profile_locality_label') }}</span>
                    <input
                      id="locality-label"
                      v-model="localityLabel"
                      type="text"
                      maxlength="80"
                      :placeholder="copy('profile_locality_placeholder')"
                      required
                      :disabled="Boolean(loading)"
                    />
                  </label>
                  <label class="market-profile__field" for="postal-code">
                    <span>{{ copy('profile_postcode_label') }}</span>
                    <input
                      id="postal-code"
                      v-model="postalCode"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]{4}"
                      maxlength="4"
                      placeholder="3825"
                      required
                      :disabled="Boolean(loading)"
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset class="market-profile__section">
                <button
                  type="button"
                  class="market-profile__offer-toggle"
                  role="switch"
                  :aria-checked="offersEnabled"
                  :disabled="Boolean(loading)"
                  @click="offersEnabled = !offersEnabled"
                >
                  <span>
                    <strong>{{ copy('profile_offer_heading') }}</strong>
                  </span>
                  <span
                    class="market-profile__switch"
                    :class="{ 'is-on': offersEnabled }"
                    aria-hidden="true"
                  >
                    <span />
                  </span>
                </button>

                <div v-if="offersEnabled" class="market-profile__offer-fields">
                  <label class="market-profile__field" for="public-name">
                    <span>{{ copy('profile_offer_name_label') }}</span>
                    <input
                      id="public-name"
                      v-model="publicName"
                      type="text"
                      minlength="2"
                      maxlength="80"
                      :placeholder="copy('profile_offer_name_placeholder')"
                      required
                      :disabled="Boolean(loading)"
                    />
                  </label>

                  <label class="market-profile__field" for="introduction">
                    <span>{{ copy('profile_introduction_label') }}</span>
                    <textarea
                      id="introduction"
                      v-model="introduction"
                      minlength="10"
                      maxlength="280"
                      rows="3"
                      :placeholder="copy('profile_introduction_placeholder')"
                      required
                      :disabled="Boolean(loading)"
                    />
                    <small>{{ introduction.length }}/280</small>
                  </label>
                </div>
              </fieldset>

              <div v-if="errorKey" class="market-profile__error" role="alert">
                <strong>{{ copy('profile_error_heading') }}</strong>
                <span>{{ copy(errorKey) }}</span>
                <MoleculesCopyError :message="copy(errorKey)" />
              </div>

              <div class="market-profile__actions">
                <UButton
                  type="submit"
                  block
                  trailing-icon="i-lucide-arrow-right"
                  :loading="loading"
                  :disabled="Boolean(loading) || !formIsValid"
                  class="market-profile__submit"
                >
                  {{ copy('profile_submit') }}
                </UButton>
                <UButton
                  type="button"
                  block
                  variant="ghost"
                  color="neutral"
                  :disabled="Boolean(loading)"
                  class="market-profile__cancel"
                  @click="open = false"
                >
                  {{ copy('profile_cancel') }}
                </UButton>
              </div>
            </form>
          </div>
        </article>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useMarketplaceProfile } from '@/composables/useMarketplaceProfile'
import type { MarketplaceProfile } from '@/content/marketplace-profile'

const props = defineProps<{ profile: MarketplaceProfile }>()
const open = defineModel<boolean>('open', { required: true })

const {
  INTERLAKEN_LOCALITIES,
  OTHER_LOCALITY_ID,
  authAvatarSrc,
  authDisplayName,
  authInitials,
  saveProfile,
  copy,
  errorKey,
  formIsValid,
  introduction,
  loading,
  localityId,
  localityLabel,
  offersEnabled,
  postalCode,
  publicName,
} = useMarketplaceProfile(props.profile)

async function save() {
  if (await saveProfile()) open.value = false
}
</script>

<style scoped src="./profile-editor.css"></style>
