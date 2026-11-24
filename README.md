# FireUX Mono

FireUX is a Nuxt-based SaaS framework that integrates Nuxt UI and Firebase.

For repository work, start with the [contributor instructions](AGENTS.md).
See the [architecture map](docs/concepts/fireux-mono.md),
[current priorities](docs/roadmaps/fireux-priorities.md), and
[App developer guide](https://fireux.app/getting-started) as needed.

## Core

Core provides the product-neutral framework, including identity, access, and Nuxt and Firebase integration.
Apps can use Core and Extensions directly without an Ecosystem.

| Name          | Purpose                                      | Documentation                                 |
| ------------- | -------------------------------------------- | --------------------------------------------- |
| `fireux-core` | Shared App, User, and Ecosystem foundations. | [README](packages/core/fireux-core/README.md) |

## Extensions

Extensions add reusable domains, integrations, and App capabilities.

| Name                   | Purpose                                                      | Documentation                                                |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `fireux-ai`            | Shared AI providers, execution, and presentation.            | [README](packages/extensions/fireux-ai/README.md)            |
| `fireux-app`           | Standard App assembly and shared public surfaces.            | [README](packages/extensions/fireux-app/README.md)           |
| `fireux-blogs`         | Blog authoring and publishing.                               | [README](packages/extensions/fireux-blogs/README.md)         |
| `fireux-bookings`      | Server-side booking and calendar integrations.               | [README](packages/extensions/fireux-bookings/README.md)      |
| `fireux-businesses`    | Business identity, locations, Workspace, and Team.           | [README](packages/extensions/fireux-businesses/README.md)    |
| `fireux-compliance`    | Portfolio compliance records and expiry tracking.            | [README](packages/extensions/fireux-compliance/README.md)    |
| `fireux-docs`          | Public FireUX developer reference.                           | [README](packages/extensions/fireux-docs/README.md)          |
| `fireux-documents`     | Portfolio document storage and record links.                 | [README](packages/extensions/fireux-documents/README.md)     |
| `fireux-ecosystem`     | Shared Main App composition and child-App discovery.         | [README](packages/extensions/fireux-ecosystem/README.md)     |
| `fireux-finance`       | Money primitives, financial facts, and report presentation.  | [README](packages/extensions/fireux-finance/README.md)       |
| `fireux-go-qr`         | Go QR provider integration and UI.                           | [README](packages/extensions/fireux-go-qr/README.md)         |
| `fireux-ignite`        | Evidence-led App assembly and reconciliation.                | [Directory](packages/extensions/fireux-ignite/)              |
| `fireux-jobs`          | Job postings and applications.                               | [README](packages/extensions/fireux-jobs/README.md)          |
| `fireux-kitchens`      | Kitchen management, Menus, preparation, and staff Orders.    | [README](packages/extensions/fireux-kitchens/README.md)      |
| `fireux-marketplace`   | Multi-vendor catalogues and offline order requests.          | [README](packages/extensions/fireux-marketplace/README.md)   |
| `fireux-notifications` | Reusable email delivery and SMTP integration.                | [README](packages/extensions/fireux-notifications/README.md) |
| `fireux-places`        | Place records and venue discovery.                           | [README](packages/extensions/fireux-places/README.md)        |
| `fireux-products`      | Product catalogues, pricing, and optional Stripe checkout.   | [README](packages/extensions/fireux-products/README.md)      |
| `fireux-projects`      | Project identity, access, and Workspace capabilities.        | [README](packages/extensions/fireux-projects/README.md)      |
| `fireux-properties`    | Property and portfolio management.                           | [README](packages/extensions/fireux-properties/README.md)    |
| `fireux-reservations`  | Property availability and reservations.                      | [README](packages/extensions/fireux-reservations/README.md)  |
| `fireux-sproochli`     | Reviewed multilingual copy and translation.                  | [README](packages/extensions/fireux-sproochli/README.md)     |
| `fireux-suppliers`     | Supplier identity, catalogue, and Workspace operations.      | [README](packages/extensions/fireux-suppliers/README.md)     |
| `fireux-tasks`         | Cross-domain task tracking for portfolios.                   | [README](packages/extensions/fireux-tasks/README.md)         |
| `fireux-workspace`     | Shared Workspace greeting and domain authority utilities. | [README](packages/extensions/fireux-workspace/README.md)     |

## Ecosystems

Ecosystem packages compose Extensions for an App family and supply shared infrastructure bindings.

| Name               | Purpose                                                | Documentation                                           |
| ------------------ | ------------------------------------------------------ | ------------------------------------------------------- |
| `fireux-bringli`   | Local producer and delivery marketplace composition.   | [README](packages/ecosystem/fireux-bringli/README.md)   |
| `fireux-buenohost` | Shared composition for property-hosting Apps.          | [README](packages/ecosystem/fireux-buenohost/README.md) |
| `fireux-fireux`    | FireUX platform bindings and composition.              | [README](packages/ecosystem/fireux-fireux/README.md)    |
| `fireux-granite`   | Property portfolio and landlord App composition.       | [README](packages/ecosystem/fireux-granite/README.md)   |
| `fireux-misebox`   | Shared composition for Misebox and venue Apps.         | [README](packages/ecosystem/fireux-misebox/README.md)   |
| `fireux-sharer`    | Personal sharing profiles and branded App composition. | [README](packages/ecosystem/fireux-sharer/README.md)    |
| `fireux-slap`      | Apps That Slap branding and presentation contracts.    | [README](packages/ecosystem/fireux-slap/README.md)      |
| `fireux-werkbox`   | Practical-work App composition.                        | [README](packages/ecosystem/fireux-werkbox/README.md)   |

## Apps and projects

Concrete Apps, the reusable starter, and local test harnesses.

| Name                      | Purpose                                                            | Documentation                                           |
| ------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| `ausfinn-apartments`      | Holiday accommodation around Interlaken.                           | [Directory](projects/buenohost/ausfinn-apartments/)     |
| `baeren-ringgenberg`      | Hotel Bären venue and Menu.                                        | [Directory](projects/misebox/baeren-ringgenberg/)       |
| `bangin-coffee`           | Mobile coffee bar and event enquiries.                             | [Directory](projects/misebox/bangin-coffee/)            |
| `book-with-nats`          | Private Swiss Alps apartment and guest information.                | [Directory](projects/buenohost/book-with-nats/)         |
| `bringli-app`             | Bringli marketplace for local producers.                           | [Directory](projects/bringli/bringli-app/)              |
| `buenohost-app`           | Digital guest guides for accommodation hosts.                      | [Directory](projects/buenohost/buenohost-app/)          |
| `find-my-seo-app`         | Directory of SEO professionals and agencies.                       | [Directory](projects/fireux/find-my-seo-app/)           |
| `fireux-blank`            | Native Nuxt, Nuxt UI and Firebase reference App.                             | [Directory](projects/fireux/fireux-blank/)              |
| `fireux-platform-app`     | FireUX platform site, developer reference, and Project management. | [Directory](projects/fireux/fireux-app/)                |
| `fireux-template`         | Reusable Nuxt App starter for FireUX.                              | [Directory](projects/templates/fireux-template/)        |
| `fireux-tenant`           | Michel AG Metallbau company site.                                  | [Directory](projects/fireux/tenant/)                    |
| `friiites`                | Friiites brand, locations, and Menu.                               | [Directory](projects/misebox/friiites/)                 |
| `go-qr-app`               | Shareable QR pages for documents and URLs.                         | [Directory](projects/fireux/go-qr/)                     |
| `granite-app`             | Property portfolio operations for landlords.                       | [Directory](projects/granite/granite-app/)              |
| `holzworm-app`            | Bern laser engraving and wooden products.                          | [Directory](projects/fireux/holzworm/)                  |
| `ignition-menu-demo`      | Menu browsing App for the assisted Ignition demo.                  | [Directory](projects/fireux/ignition-menu-demo/)        |
| `interlaken-bike-tours`   | Private guided bike tours around Interlaken.                       | [README](projects/slap/interlaken-bike-tours/README.md) |
| `interlaken-essen`        | Local food discovery and marketplace.                              | [Directory](projects/misebox/interlaken-essen/)         |
| `kjordi`                  | Kjordi’s personal sharing profile.                                 | [Directory](projects/sharer/kjordi/)                    |
| `la-tap-berne`            | La Tap Berne venue and Menu.                                       | [Directory](projects/misebox/la-tap-berne/)             |
| `lifeguard-community-app` | Discussion and learning for lifeguards.                            | [Directory](projects/fireux/lifeguard-community/)       |
| `misebox-app`             | Kitchen Workspace and public Menu publishing.                      | [Directory](projects/misebox/misebox-app/)              |
| `no-fireux-embed-test`    | Static host for testing FireUX embeds.                             | [Directory](projects/fireux/no-fireux-embed-test/)      |
| `richies-reinigung`       | Cleaning services around Interlaken.                               | [Directory](projects/werkbox/richies-reinigung/)        |
| `sharer-app`              | Save and share links from an installable App.                      | [Directory](projects/sharer/sharer-app/)                |
| `slap-app`                | Apps That Slap brand sites and storefronts.                        | [Directory](projects/slap/slap-app/)                    |
| `sproochli-app`           | Multilingual QR information pages.                                 | [Directory](projects/fireux/sproochli/)                 |
| `swiss-alpine-guides`     | Guided alpine activities, courses, and enquiries.                  | [README](projects/slap/swiss-alpine-guides/README.md)   |
| `werkbox-app`             | Practical job discovery and direct hiring.                         | [Directory](projects/werkbox/werkbox-app/)              |
| `yellow-velo-app`         | Bicycles, accessories, and merchandise.                            | [Directory](projects/slap/yellow-velo/)                 |

## Tools

| Name                    | Purpose                                             | Documentation                                |
| ----------------------- | --------------------------------------------------- | -------------------------------------------- |
| `eslint`                | FireUX Vue lint rules.                              | [Directory](tools/eslint/)                   |
| `firebase-release`      | Portable Firebase SSR release artifacts and checks. | [README](tools/firebase-release/README.md)   |
| `firefox-running-apps`  | Firefox integration for locally running Apps.       | [Directory](tools/firefox-running-apps/)     |
| `fireux-launcher`       | Pick and launch local Apps.                         | [Directory](tools/fireux-launcher/)          |
| `ide`                   | Editor setup, focused checks, and Codex Map.        | [README](tools/ide/README.md)                |
| `mcp-firestore`         | Firestore MCP integration.                          | [Directory](tools/mcp-firestore/)            |
| `misebox-migrations`    | Misebox data migration scripts and notes.           | [README](tools/misebox-migrations/README.md) |
| `package-config`        | Build package configuration exports.                | [Directory](tools/package-config/)           |
| `scripts-parked`        | Parked repository scripts.                          | [Directory](tools/scripts-parked/)           |
| `vscode-fireux-toolbar` | VS Code toolbar for local FireUX Apps and files.    | [Directory](tools/vscode-fireux-toolbar/)    |
| `walking-bridge`        | Approved GitHub handoffs for local Codex execution. | [README](tools/walking-bridge/README.md)     |
| `workspace-migrations`  | Workspace record migration and planning scripts.    | [Directory](tools/workspace-migrations/)     |
