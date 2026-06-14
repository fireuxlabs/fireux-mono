export const goQrProviderBaseUrl = () =>
  process.env.NUXT_PUBLIC_GO_QR_PROVIDER_BASE_URL ||
  process.env.GO_QR_PROVIDER_BASE_URL ||
  ''

export const goQrNuxtOverrides = {
  runtimeConfig: {
    public: {
      goQrProviderBaseUrl: goQrProviderBaseUrl(),
    },
  },
}
