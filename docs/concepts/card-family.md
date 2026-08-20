# Card family

Updated: 2026-08-04
Ref: d232cc731
Role: map, not canon

## Purpose

Classify reusable Cards separately from data controllers, view adapters,
profile/detail compositions, and specialist operational records.

## Canon

`X/Cards` is a dumb presentation family. A Card receives props or a bounded
view model and may format values, select conditional anatomy, normalize an
image URL, compose another dumb Card, navigate to a supplied destination, or
emit presentation actions. It does not fetch, subscribe, mutate storage, or
decide record authority.

The canonical variants are:

- `Cell`: collection/list identity with optional supplied navigation or action.
- `Pill`: compact inline identity or selection token.
- `Preview`: bounded standalone summary for previews and specimens.

Domain Card props do not need one universal field interface. They must consume
the domain's typed card/view projection and preserve the semantic variant
contract above.

Core owns the shared visual foundation for those variants:

- The universal baseline follows Nuxt UI directly: semantic outline/elevated
  surfaces, typography, spacing, colour, radius, focus, and state behavior.
  Decorative rails, terminal typography, glow, and hard neon stripes are not
  part of the default Card language.
- Cells are compact collection records with a clear identity hierarchy.
- Pills are touch-safe inline selectors or tokens, not miniature detail cards.
- Previews carry the strongest elevation and enough bounded context to stand
  alone in a product proof.
- `app.designPack.preset = 'sci-fire'` explicitly opts a main App into the
  Core-owned Sci-Fire presentation layer. That pack may add a restrained
  app-primary edge, ambient depth, and fast interaction, but it cannot replace
  Nuxt UI typography, spacing, radius, semantics, or Card anatomy. Ambient
  styling derives from `--ui-primary`; information colour remains state-only.
- Elevation must not derive shadow colour from theme-inverted surfaces, which
  become pale halos in dark mode.
- Domain personality may set the shared `--fx-card-accent` bridge for a narrow
  edge, focus, selected state, or media treatment. It must not fork the shared
  variant geometry or rebuild the entire surface.
- Static cards must not advertise interaction. Linked/action cards receive
  hover and keyboard-focus affordances, and all motion respects reduced-motion
  preferences.

## Separate families

- `Collection/Manager`, `Index`, `Workspace/*/Read`, route detail components, and
  equivalent controllers own loading, selection, empty/error outcomes, and
  composition.
- `useXInterface` and named presentation projectors translate records into
  Card/Profile view models. A Card may use a pure presentation helper but does
  not acquire the underlying record.
- `X/Profile`, `X/Detail`, public detail compositions, and Workspace detail
  headers may render many sections and actions. They are not ordinary Cards
  merely because their outer element is `UCard`.
- Order Tickets, Supplier Catalogue presentation, QR Business Cards, receipts,
  boards, and similar domain records/workspaces retain their named operational
  or specialist presentation family.

## Installed Cards audit

This table classifies every component under the audited Core, Places,
Companies, Kitchens, Suppliers, and Jobs `Cards` trees after the User/App
entity-family alignment: 54 canonical variants, 15 legacy Profile
compositions, and 3 Place dropdown support components.

| Owner                        | Canonical dumb variants   | Profile/detail migration | Card support                                              |
| ---------------------------- | ------------------------- | ------------------------ | --------------------------------------------------------- |
| Core App                     | `Cell`, `Pill`, `Preview` | —                        | —                                                         |
| Core Ecosystem               | `Cell`, `Pill`, `Preview` | `Profile`                | —                                                         |
| Core Project                 | `Cell`, `Pill`            | —                        | —                                                         |
| Core User                    | `Cell`, `Pill`, `Preview` | —                        | —                                                         |
| Company                      | `Cell`, `Pill`, `Preview` | `Profile`                | —                                                         |
| Agent                        | `Cell`, `Pill`, `Preview` | `Profile`                | —                                                         |
| Job                          | `Cell`, `Pill`, `Preview` | `Profile`                | —                                                         |
| Professional                 | `Cell`, `Pill`, `Preview` | `Profile`                | —                                                         |
| Chef                         | `Cell`, `Pill`, `Preview` | `Profile`                | —                                                         |
| Customer                     | `Cell`, `Pill`            | —                        | —                                                         |
| Driver                       | `Cell`, `Pill`            | `Profile`                | —                                                         |
| Ingredient                   | `Cell`, `Pill`, `Preview` | `Profile`                | —                                                         |
| Kitchen                      | `Cell`, `Pill`, `Preview` | `Profile`                | —                                                         |
| Menu                         | `Cell`, `Pill`, `Preview` | —                        | —                                                         |
| Kitchen Operation Dish       | `Cell`                    | `Profile`                | —                                                         |
| Kitchen Operation Ingredient | `Cell`                    | —                        | —                                                         |
| Kitchen Operation Menu       | —                         | `Profile`                | —                                                         |
| Kitchen Operation Mise       | `Cell`, `Pill`, `Preview` | `Profile`                | —                                                         |
| Kitchen Operation Recipe     | `Cell`                    | —                        | —                                                         |
| Kitchen Operation Supplier   | `Cell`                    | `Profile`                | —                                                         |
| Place                        | `Cell`, `Pill`, `Preview` | `Profile`                | `Dropdown/Fireux`, `Dropdown/Google`, `Dropdown/Selected` |
| Supplier                     | `Cell`, `Pill`, `Preview` | `Profile`                | —                                                         |
| Supplier Item                | `Cell`, `Pill`            | —                        | —                                                         |

## Alignment status

- `accepted`: navigation/action emits, conditional anatomy, formatting, avatar
  proxying, social-link projection, and Menu's pure presentation helper remain
  presentation behavior.
- `accepted`: Place dropdown rows are prop-driven support pieces for the Place
  Card selection UI.
- `migration`: the exact guarded `Cards/Profile.vue` allowlist remains in place
  for current consumers. Add no new member. Move each to its owning
  `Profile`/`Detail` family when that surface is materially changed and its
  consumers can migrate together.
- `completed`: Core App profile presentation now lives at `App/Profile.vue`;
  the active User summary lives at `User/IdentitySummary.vue`, while the
  bounded route profile remains `User/Profile.vue`.
- `completed`: Kitchen Order Ticket moved to
  `Workspace/Kitchen/Operations/Orders/Ticket/*`.
- `completed`: Supplier Catalogue moved to
  `Supplier/Catalogue/Presentation.vue`.
- `completed`: Professional's QR presentation moved to
  `Professional/BusinessCard.vue`; QR generation is presentation derivation,
  not fetching, but its anatomy is a specialist Business Card.

## Verification

`scripts/guards/components.mjs` requires prop input for Cards, rejects
fetching/storage APIs inside the tree, freezes legacy Profile/support paths,
rejects unclassified new `Cards/*` names, and keeps the Misebox `/cards`
specimen limited to `Cell`, `Pill`, and `Preview`. Canonical Card components
must consume Core's matching `.card--cell`, `.pill`, or `.preview` anatomy;
profile adapters may delegate that contract to `PublicProfileDirectoryCard`.
Core's `molecules/card-surfaces.scss` is the single shared surface authority;
the three variant molecules own only their distinct geometry, state, and
content anatomy. Optional ecosystem atmosphere belongs only in the Core
`design-packs/sci-fire.css` bundle and is never imported by the universal
`main.scss` cascade.
