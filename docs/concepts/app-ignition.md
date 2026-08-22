# App ignition

Updated: 2026-08-22
Ref: da689ed54
Role: map, not canon

## Purpose

Map the path from an App request to an evidence-led FireUX product. This is the
durable source for future App-ignition tutorials; current source and guards
remain implementation authority.

## Links

- Parent: fireux-mono.md
- Horizontal: product-language.md
- Horizontal: workspace.md
- Horizontal: firestore-entity.md
- Horizontal: search-visibility.md

## Ignition boundary

Ignition currently records an App request for review and scope. Its canonical
record is a Conversation with `kind: 'ignition'`; it is not an App, Project
Operation, or parallel App collection.

Once a request is accepted, **App ignition** names the product-development
lifecycle below. The intake and development lifecycle are connected stages,
not competing meanings or storage shapes.

## Development lifecycle

1. **Understand the domain** — name the domain, intended operator and boundary,
   then investigate what people seek without using the proposed App, current
   models, routes or planned features to predetermine the evidence.
2. **Map demand** — preserve observations as evidence, then group them into
   operator jobs and demand families as an explicitly separate interpretation.
3. **Define capabilities** — decide which demand families the App will serve.
   Search demand informs this decision; it does not dictate navigation or
   require the App to fulfil every observed need.
4. **Organise the Workspace** — arrange the first capability map according to
   how the domain is operated. The Workspace summarises and routes into its
   capability pages.
5. **Deepen capabilities** — apply the same greenfield method within each
   established capability, then refine its boundary from stronger evidence.
6. **Define tools and evidence** — specify the human, AI-assisted, and compound
   actions that fulfil the selected jobs, plus the smallest canonical data and
   relationships they require.
7. **Build, validate and publish** — implement the tools, connect operational
   evidence, publish supported literature, measure outcomes and iterate.

The dependency direction is:

```text
domain evidence -> demand map -> capabilities -> Workspace
                -> capability research -> tools and data
                -> build, validation and publication
```

## Recursive search-demand contract

`X/search-demand` always asks the greenfield question for domain `X`:

> What do people seek when working in this domain?

The rule is recursive. A Kitchen pass may discover Food Safety; a later Food
Safety pass may discover HACCP; a focused HACCP pass can then penetrate that
domain more deeply. A child pass must not rewrite its parent observations or
pretend that child demand represents the whole parent domain.

Every level must:

- start from the named domain rather than an existing FireUX solution;
- use multiple neutral seed families so one preferred answer cannot dominate;
- record source, query, geography, language, date, period, and available
  metrics without manufacturing missing values;
- distinguish observed evidence, interpretation, product response, and live
  operational evidence;
- include unexpected, inconvenient, and currently unsupported demand;
- identify coverage gaps and empty-result seeds;
- state whether a signal proves query language, relative interest, or measured
  volume; and
- end with demand families and operator jobs, not predetermined pages or
  Firestore collections.

Autocomplete and live results can establish current language and breadth. They
do not establish absolute volume, willingness to pay, or final priority.
Search Console measures an existing site's acquisition rather than a
greenfield market. Use it later as response evidence, not as the only source
for initial domain discovery.

## AI-assisted ignition

An operator may begin with only an App name and a good plain description.
FireUX AI can turn those inputs into a provisional structured research brief:

- domain and intended operators;
- neutral research question;
- inclusions, adjacent boundaries, and exclusions;
- operator vocabulary and domain synonyms;
- operating formats, geographies, and languages to test;
- broad seed families and deeper follow-up seeds; and
- an explicit coverage checklist.

The operator reviews that brief before research tools run. Tool results become
source observations with provenance. FireUX AI may then group those
observations into jobs and demand families, state confidence and gaps, and
propose candidate capabilities for a separate product decision.

```text
App name + description
  -> AI-proposed research brief
  -> operator approval
  -> external research tools
  -> sourced observations
  -> AI-assisted demand map
  -> human capability decisions
```

AI-generated seeds, summaries, classifications, and capability proposals are
interpretation, never search-demand evidence. A query becomes evidence only
when a named external source returns it. Empty results remain useful coverage
evidence and must not be filled with invented demand.

Current `fireux-ai` source supports schema-checked generation from supplied
content. External research orchestration and its approval workflow remain a
separate capability to implement; this map does not claim that Ignition
already runs the complete pipeline automatically.

## Capability decision test

Before promoting a demand family into an App capability, review:

- evidence breadth and measured demand;
- operational frequency, consequence, and current workaround;
- operator pain and willingness to pay;
- fit with the App's domain and explicit boundaries;
- relationships to other selected capabilities;
- the tools and canonical evidence required to fulfil it; and
- what current source can truthfully expose now.

Several demand families may compose one capability. One family may also split
into multiple capabilities after deeper research. Navigation is therefore an
operational design decision, not a keyword taxonomy.

## Literature and AI boundary

- **Source research** records what external tools and operators reveal.
- **Interpretation** groups that evidence and states confidence and gaps.
- **Product response** defines selected capabilities, tools, and explanatory
  literature.
- **SEO publication** answers appropriate public intent without copying the
  research workbench onto the landing.
- **Operational evidence** comes from actual App records and completed work.
- **AI** may read evidence and available tools, propose contextual actions, and
  invoke tools only with the required approval. It does not convert weak search
  evidence into a product fact.

## Current source

- `projects/fireux/fireux-app/app/pages/get-started.vue`
- `projects/fireux/fireux-app/app/composables/useIgnitionRequestForm.ts`
- `projects/fireux/fireux-app/app/content/meta/source.ts`
- `packages/core/fireux-core/src/runtime/models/operations/conversation.model.ts`
- `packages/core/fireux-core/src/config/app/search-demand.ts`
- `packages/core/fireux-core/src/runtime/pages/search-demand/index.vue`
- `packages/core/fireux-core/src/runtime/pages/search-demand/analysis.vue`
- `packages/core/fireux-core/src/runtime/pages/search-demand/capabilities.vue`
- `projects/*/*-app/app/search-demand.ts`

## Tutorial sequence

Future tutorials should follow the lifecycle rather than begin with a Nuxt
page or Firestore collection:

1. Submit and review an Ignition request.
2. Write the domain brief.
3. Conduct and inspect greenfield search demand.
4. Build the demand map.
5. Select and name capabilities.
6. Compose the Workspace.
7. Deepen each selected capability.
8. Define tools and required evidence.
9. Model canonical Entities and parent-owned records.
10. Build, validate, publish and iterate.

Tutorials must label which steps are currently automated, supported manually,
or still roadmap work. This map does not make the whole lifecycle an existing
FireUX command.

## Verification

- Check Ignition claims against the Conversation model and live request flow.
- Check search-demand claims against the shared contract, App-owned corpus,
  API, index page, and analysis page.
- Check capability and Workspace claims bottom-up against current child source
  and `product-language.md`.
- Run `node scripts/guards/documentation.mjs` while iterating and the complete
  `pnpm guard` before a repository handoff.
