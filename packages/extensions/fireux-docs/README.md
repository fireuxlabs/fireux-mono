# FireUX Docs

This Nuxt layer serves the public developer reference at `/docs` in FireUX App.
The guides follow the shape of a Nuxt App: configuration, pages, layouts,
components, composables, and server routes. FireUX Core owns its shared runtime.

If you work on FireUX itself, start with the repository's
[contributor instructions](../../../AGENTS.md).

The public component library is `/docs/components`. Core's explicit catalogue
at `src/catalogue/public-components.mjs` selects its entries; Docs supplies safe
previews. Add a catalogue entry and preview together. Nuxt registration alone
does not publish a component. Restart the dev server after changing catalogue
metadata, then run the Docs catalogue and route tests.

The full source inventory is `/dev/core-components` during local development.
It and its component detail routes are excluded from production.
