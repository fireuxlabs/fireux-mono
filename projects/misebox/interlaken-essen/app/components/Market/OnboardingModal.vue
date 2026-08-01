<template>
  <ClientOnly>
    <UModal
      :open="open"
      :dismissible="false"
      prevent-close
      :title="copy('onboarding_modal_title')"
      :description="copy('onboarding_modal_description')"
      :ui="{
        overlay: 'market-onboarding-modal__overlay',
        content: 'market-onboarding-modal__content',
        header: 'sr-only',
        body: 'market-onboarding-modal__body',
      }"
    >
      <template #body>
        <article class="market-onboarding">
          <div class="market-onboarding__scene" aria-hidden="true">
            <img
              class="market-onboarding__scene-backdrop"
              src="/img/app/background.png"
              alt=""
            >
            <svg
              class="market-onboarding__linework"
              viewBox="0 0 600 230"
              fill="none"
            >
              <path d="M-18 186C72 166 112 105 173 104C221 103 250 143 289 137C333 131 351 66 414 59C474 52 521 116 620 133" />
              <path d="M-12 204C72 180 119 126 177 122C224 119 252 157 293 151C347 143 356 85 416 77C481 69 529 135 615 150" />
              <path d="M8 220C93 194 130 148 183 142C228 137 261 171 301 166C354 159 375 108 428 101C485 94 536 151 598 164" />
              <path d="M73 190C123 178 151 154 185 151C221 148 244 174 277 174" />
            </svg>
            <div class="market-onboarding__badge">
              <img src="/img/app/logo.png" alt="">
            </div>
          </div>

          <div class="market-onboarding__paper">
            <p class="market-onboarding__eyebrow">
              {{ copy('onboarding_region') }}
            </p>
            <h2>{{ copy('come_and_eat') }}.</h2>
            <p class="market-onboarding__copy">
              {{ copy('onboarding_intro') }}
            </p>

            <div
              class="market-onboarding__identity"
              :aria-label="
                copy('onboarding_signed_in_as', {
                  name: authDisplayName || copy('onboarding_user'),
                })
              "
            >
              <UAvatar
                :src="authAvatarSrc"
                :alt="authDisplayName || copy('onboarding_misebox_user')"
                :text="authInitials"
                size="md"
                class="market-onboarding__identity-avatar"
              />
              <strong>
                {{ authDisplayName || copy('onboarding_misebox_user') }}
              </strong>
            </div>

            <div v-if="completed" class="market-onboarding__success">
              <UIcon name="i-lucide-check" aria-hidden="true" />
              <div>
                <strong>{{ copy('onboarding_success_title') }}</strong>
                <span>{{ copy('onboarding_success_body') }}</span>
              </div>
            </div>

            <form
              v-else
              class="market-onboarding__form"
              @submit.prevent="completeOnboarding"
            >
              <fieldset class="market-onboarding__section">
                <legend>{{ copy('onboarding_locality_heading') }}</legend>

                <label class="market-onboarding__field" for="locality">
                  <span>
                    {{ copy('onboarding_locality_and_postcode_label') }}
                  </span>
                  <span class="market-onboarding__select-wrap">
                    <UIcon name="i-lucide-map-pin" aria-hidden="true" />
                    <select
                      id="locality"
                      v-model="localityId"
                      required
                      :disabled="Boolean(loading)"
                    >
                      <option value="" disabled>
                        {{ copy('onboarding_locality_select') }}
                      </option>
                      <option
                        v-for="locality in INTERLAKEN_LOCALITIES"
                        :key="locality.id"
                        :value="locality.id"
                      >
                        {{ locality.postalCode }} · {{ locality.label }}
                      </option>
                      <option :value="OTHER_LOCALITY_ID">
                        {{ copy('onboarding_other_locality') }}
                      </option>
                    </select>
                    <UIcon name="i-lucide-chevron-down" aria-hidden="true" />
                  </span>
                </label>

                <div
                  v-if="localityId === OTHER_LOCALITY_ID"
                  class="market-onboarding__other-locality"
                >
                  <label class="market-onboarding__field" for="locality-label">
                    <span>{{ copy('onboarding_locality_label') }}</span>
                    <input
                      id="locality-label"
                      v-model="localityLabel"
                      type="text"
                      maxlength="80"
                      :placeholder="copy('onboarding_locality_placeholder')"
                      required
                      :disabled="Boolean(loading)"
                    >
                  </label>
                  <label class="market-onboarding__field" for="postal-code">
                    <span>{{ copy('onboarding_postcode_label') }}</span>
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
                    >
                  </label>
                </div>
              </fieldset>

              <fieldset class="market-onboarding__section">
                <button
                  type="button"
                  class="market-onboarding__offer-toggle"
                  role="switch"
                  :aria-checked="offersEnabled"
                  :disabled="Boolean(loading)"
                  @click="offersEnabled = !offersEnabled"
                >
                  <span>
                    <strong>{{ copy('onboarding_offer_heading') }}</strong>
                  </span>
                  <span
                    class="market-onboarding__switch"
                    :class="{ 'is-on': offersEnabled }"
                    aria-hidden="true"
                  >
                    <span />
                  </span>
                </button>

                <div
                  v-if="offersEnabled"
                  class="market-onboarding__offer-fields"
                >
                  <label class="market-onboarding__field" for="public-name">
                    <span>{{ copy('onboarding_offer_name_label') }}</span>
                    <input
                      id="public-name"
                      v-model="publicName"
                      type="text"
                      minlength="2"
                      maxlength="80"
                      :placeholder="copy('onboarding_offer_name_placeholder')"
                      required
                      :disabled="Boolean(loading)"
                    >
                  </label>

                  <label class="market-onboarding__field" for="introduction">
                    <span>{{ copy('onboarding_introduction_label') }}</span>
                    <textarea
                      id="introduction"
                      v-model="introduction"
                      minlength="10"
                      maxlength="280"
                      rows="3"
                      :placeholder="
                        copy('onboarding_introduction_placeholder')
                      "
                      required
                      :disabled="Boolean(loading)"
                    />
                    <small>{{ introduction.length }}/280</small>
                  </label>
                </div>
              </fieldset>

              <div
                v-if="errorKey"
                class="market-onboarding__error"
                role="alert"
              >
                <strong>{{ copy('onboarding_error_heading') }}</strong>
                <span>{{ copy(errorKey) }}</span>
              </div>

              <div class="market-onboarding__actions">
                <UButton
                  type="submit"
                  block
                  trailing-icon="i-lucide-arrow-right"
                  :loading="loading === 'saving'"
                  :disabled="Boolean(loading) || !formIsValid"
                  class="market-onboarding__submit"
                >
                  {{ copy('onboarding_submit') }}
                </UButton>
                <UButton
                  type="button"
                  block
                  variant="ghost"
                  color="neutral"
                  :loading="loading === 'skipped'"
                  :disabled="Boolean(loading)"
                  class="market-onboarding__skip"
                  @click="skipOnboarding"
                >
                  {{ copy('onboarding_skip') }}
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
import { useMarketplaceOnboarding } from '@/composables/useMarketplaceOnboarding'

const {
  INTERLAKEN_LOCALITIES,
  OTHER_LOCALITY_ID,
  authAvatarSrc,
  authDisplayName,
  authInitials,
  completeOnboarding,
  completed,
  copy,
  errorKey,
  formIsValid,
  introduction,
  loading,
  localityId,
  localityLabel,
  offersEnabled,
  open,
  postalCode,
  publicName,
  skipOnboarding,
} = useMarketplaceOnboarding()
</script>

<style scoped src="./onboarding-modal.css"></style>
