# fireux-go-qr Canon
Authority: Tier1 (Authoritative)
Updated: 2026-06-09
References: `docs/fireux-canon.md`, `packages/core/fireux-docs/src/runtime/components/README.md`

## Purpose
- Own reusable Go QR provider integration surfaces for FireUX apps.
- Keep Go QR-specific consumer wrappers out of `fireux-core`.
- Let apps and domain packages consume Go QR tools without rebuilding the tool UI locally.

## Boundaries
- `fireux-core` owns generic tool-provider iframe/protocol plumbing.
- `projects/fireux/go-qr` owns hosted Go QR tool behavior, routes, branding, and provider APIs.
- `fireux-go-qr` owns reusable Go QR consumer wrappers such as `ProviderGoQrDoc`.
- Consumer apps and domains own their own storage, authorization, and product meaning.

## Component Canon
- Provider wrappers live under `runtime/components/Provider/GoQr/**`.
- Component names use Nuxt path-based names.
- Wrappers pass configuration to hosted Go QR `/tools/**` pages.
- Wrappers default to deployed Go QR (`https://go-qr.web.app`) even when the consuming app runs locally; local Go QR is opt-in by passing a local provider URL.
- Wrappers do not create storage records and do not duplicate Go QR tool internals.
- FireUX consumers should pass one provider tool config object. Explicit per-field props remain for plain external embeds and small ad-hoc tests.
