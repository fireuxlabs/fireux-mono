# Lasagne architecture

Updated: 2026-08-18
Ref: e23268507
Role: map, not canon

## Purpose

Describe FireUX's preferred shape for reusable entity and workflow code:
clear horizontal layers, one-way dependencies, and domain-owned composition.

Lasagne is not a new framework. It is the test used before extracting another
shared helper. The goal is to keep each layer understandable in isolation
while allowing the layer above it to compose a useful product surface.

## Links

- Parent: [spine.md](spine.md)
- Entity capabilities: [composables.md](composables.md)
- Stored authority: [firestore-entity.md](firestore-entity.md)
- Component ownership: [components.md](components.md)
- Runtime filesystem: [runtime-filesystem.md](runtime-filesystem.md)
- Creation commands: [create.md](create.md)

## Layer direction

Dependencies travel upward only:

```text
stored authority and trusted commands
                ↓
       X storage adapters
                ↓
  X capabilities and presentation
                ↓
     Y's named use of X
                ↓
   Y controller or provided context
                ↓
      Y components and stages
                ↓
        structural framing
                ↓
              route
```

The lower layer must remain ignorant of the layer consuming it. Place does not
know about Kitchen. A Kitchen capability may consume the supported Place
capability it needs.

These are dependency layers, not a demand for root technical folders. Physical
package ownership follows `runtime-filesystem.md`: shared layers remain in the
root spine, while entity-specific components, composables, models, and server
behaviour live beneath the entity root.

## Entity capabilities

An entity exposes named capabilities rather than one compulsory umbrella:

- `useXFetch` and `useXCollection` adapt authorized reads.
- `useXCreate`, `useXUpdate`, and `useXDelete` invoke named commands.
- `useXInterface` maps X into X-owned presentation shapes.
- `useXDetail` controls X's routable detail outcome.
- `useXOnboarding` controls X's creation journey.
- `useX` exists only when X has a genuine active read/view aggregate. It must
  not be invented merely to make every entity look symmetrical.

A higher capability should consume the narrow supported X capability that
owns the required result. It should not reach through it to X's Firestore
paths, reproduce X normalization, or import X's internal stage state.

## Cross-domain composition

Name Y's use of X from Y's perspective when that adaptation has a real job:

- `useKitchenPlace` may consume Place detail or interface capabilities.
- `useKitchenOnboarding` may compose the completed Place onboarding result.
- `usePlace` must not import Kitchen or expose Kitchen-specific fields.

`useYX` does not always need to call an unqualified `useX`. It uses the
narrowest supported X capability. The dependency rule matters more than
surface naming.

Do not create `useYX` as a pass-through alias. It should add a Y-owned decision,
projection, policy, or lifecycle relationship.

## Controllers and context

A workflow root owns its domain controller. Prefer passing one cohesive
controller or providing one domain context over relaying the same group of
refs and callbacks through several component layers.

Use provided context when:

- several sibling or nested stages share the same live workflow;
- stages need both state and named commands;
- prop relaying obscures which component owns the lifecycle; and
- the provider and consumers share one visible domain boundary.

Keep props when a child is a reusable presentation component with a small,
explicit input. Do not replace ordinary component APIs with global or
unbounded injection.

The provider remains domain-owned: `provideKitchenOnboarding`, not a generic
provider containing every entity's possible fields.

## Structural shells

A shared shell owns structure only:

- layout;
- slot placement;
- progress and error placement when their shape is truly common; and
- ordinary Nuxt UI chrome.

The domain root owns:

- nouns and copy;
- stage definitions;
- drafts and validation;
- provider and persistence calls;
- button meaning and completion behavior; and
- the components rendered in each stage.

For current onboarding, `OnboardingShell` receives one small stage
object and exposes `intro`, default, and `footer` slots. `PlaceOnboarding` and
`KitchenOnboarding` own what those slots mean.

## Deliberate repetition

FireUX does not optimize for the fewest lines. Small domain-owned repetition
is accepted when it keeps meaning and authority local.

The controlled sibling lifecycle in `spine.md` also permits a bounded proving
sibling to begin structurally aligned with a complete baseline. Preserve
separately named entrypoints such as `useKitchenCollection` and
`useCompanyCollection`, reuse established lower mechanics and outcome
vocabulary immediately, and let each domain's authority, query, projection,
and lifecycle differentiate honestly. The initial copy establishes an
independent comparison surface; it does not prove an abstraction.

Repeat a thin edge when sharing it would require:

- a large optional prop contract;
- entity-name branches;
- callbacks whose owner is unclear;
- a generic controller that unions unrelated states; or
- a lower layer importing knowledge from a higher layer.

Extract only after two or more real domains have materially differentiated and
still prove the same input, output, lifecycle, authority boundary, ownership,
and dependency direction. Similar appearance or common ancestry alone is not
sufficient.

## Reference shapes

### Staged funnel

The Menu ordering funnel demonstrates one controller, one active screen, and
one action footer. Its domain owns readiness and progression; child screens own
their decision UI.

### Workspace operation

Workspace operation roots compose named `Read`, `Write`, `Tools`, or workflow
children. A provided domain workspace allows those children to consume one
selected operational context without a long prop chain.

### Index page

An index route supplies framing and composes its CTA and collection manager.
The route does not absorb collection fetching, filtering, card mapping, and
creation behavior merely because it displays them together.

## Stop signals

- A shared component gains domain nouns or entity-specific conditions.
- A component accepts many optional props used by only one consumer.
- `useX` becomes a bag of reads, writes, SEO, interface mapping, and page state.
- `useYX` reconstructs X from raw storage.
- A child receives the same controller fields through multiple ancestors.
- A generic abstraction is justified by visual similarity rather than common
  authority and lifecycle.
- Removing three repeated lines creates a new package-wide dependency.

When these appear, move responsibility back to the nearest named owner before
adding another helper.

## Verification

- Inspect the nearest working sibling and dependency direction.
- Confirm stored authority against current models and trusted commands.
- Run focused type checks for every touched package.
- Run `pnpm guard` before handoff.
