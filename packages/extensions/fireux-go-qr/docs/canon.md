# fireux-go-qr Canon
Authority: Tier1 (Authoritative)
Updated: 2026-06-14
References: `docs/fireux-canon.md`, `packages/core/fireux-docs/src/runtime/components/README.md`

## Purpose
- Own reusable Go QR provider integration surfaces for FireUX apps.
- Keep Go QR-specific consumer wrappers out of `fireux-core`.
- Let apps and domain packages consume Go QR tools without rebuilding the tool UI locally.

## Boundaries
- `fireux-core` owns generic tool-provider iframe/protocol plumbing.
- `projects/fireux/go-qr` owns hosted Go QR tool behavior, routes, branding, and provider APIs.
- `fireux-go-qr` owns reusable Go QR consumer wrappers such as `ProviderGoQrTools`.
- Consumer apps and domains own their own storage, authorization, and product meaning.

## Component Canon
- Provider wrappers live under `runtime/components/Provider/GoQr/**`.
- Component names use Nuxt path-based names.
- FireUX consumers use `ProviderGoQrTools`.
- Plain external consumers call the Go QR provider API directly, then iframe the returned tool URL.
- Wrappers create hosted tool configs through Go QR provider APIs such as
  `POST /api/tools/doc`, then iframe the returned `/tools/{tool}/{id}` route.
- Consumer apps must not import Go QR internal tool components directly.
- Wrappers default to deployed Go QR (`https://go-qr.web.app`) even when the consuming app runs locally; local Go QR is opt-in by passing a local provider URL.
- Deployed apps use deployed Go QR.
- Local FireUX dev spins use deployed Go QR by default.
- Local pipeline work may set `NUXT_PUBLIC_GO_QR_PROVIDER_BASE_URL`
  to point a consuming app at local Go QR before shipping.
- Wrappers do not create storage records and do not duplicate Go QR tool internals.
- FireUX consumers should pass one provider tool payload object.
- Provider iframes may emit `tool-result` after a tool action succeeds.
  Consumers use that event to store their own product meaning.
- Plain external consumers should use the HTTP API, not FireUX Vue components.

## Usage Modes

FireUX/Nuxt consumer:

```vue
<ProviderGoQrTools
  tool="doc"
  :payload="toolPayload"
/>
```

Plain external consumer:

```ts
const response = await fetch('https://go-qr.web.app/api/tools/doc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(toolPayload),
})
const { toolUrl } = await response.json()
```

Render the returned `toolUrl` in an iframe.
