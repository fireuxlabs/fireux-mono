# Tool Provider Canon

Authority: Operational
Updated: 2026-06-14

## Meaning

A FireUX tool provider is a hosted app that exposes a small tool surface for
another app to embed or call.

Core owns the reusable provider plumbing. Provider apps own the tool behavior
and brand. Consumer apps own how and why they consume the provider.

## Runtime Shape

- `ToolProviderToolContract` defines the shared tool contract.
- Core `defineToolProviderRegistry()` owns shared registry mechanics.
- Core `Provider/Tool/Iframe.vue` owns consumer-side iframe height handling.
- Core `Provider/Tool/Frame.vue` owns the hosted provider card shell.
- Core `useToolProviderTool()` owns the FireUX consumer-side API call that
  creates a hosted tool config and returns the iframe URL.
- Core `useToolProviderHeight()` owns hosted page height messages.
- Core server `tool-provider` helpers own no-store JSON and CORS response
  headers for tool contract endpoints.

## Provider Apps

Provider apps keep their own tool definitions, endpoints, and forms.

Current provider apps:

- Go QR hosts QR tools.
- Sproochli hosts translation tools.
- Misebox hosts ordering tools.

Provider apps keep hosted tool components in their app namespace under
`Provider/`, for example `Provider/Frame.vue` plus specific tool components
such as `Provider/Tools/Url.vue`, `Provider/Tools/Menu.vue`, or
`Provider/Tools/Ordering.vue`.

## Consumer Apps

Consumer apps may embed hosted provider pages or call provider APIs.

Consumer apps must not copy provider plumbing locally when the core provider
seam can carry it.

FireUX consumers should use a provider wrapper that calls the hosted provider
API as an external consumer. Plain external consumers should call the provider
API directly and iframe the returned tool URL.

## Short Version

Core provides the tool-provider frame, iframe, API-call, height, and response
plumbing.

Provider apps provide the actual tools.

Consumer apps consume the hosted tools.
