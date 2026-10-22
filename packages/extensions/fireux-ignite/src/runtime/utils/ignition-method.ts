export const ignitionMethod = [
  {
    id: 'brief',
    title: 'Describe the business outcome',
    instruction:
      'Name actors, industry, business needs and observable acceptance criteria without referring to the reference app, its routes or implementation. Prepare one operator-reviewed App context string with purpose, audience, background, accepted boundaries and unresolved decisions; keep it distinct from public description, instructions and verified evidence.',
  },
  {
    id: 'research',
    title: 'Investigate the industry',
    instruction:
      'Use the existing industry-research method. Separate evidence, interpretation and product choices; do not use the reference implementation to predetermine demand.',
  },
  {
    id: 'search-strategy',
    title: 'Plan search discovery',
    instruction:
      'Produce an App-owned search plan before assembly. Identify who should find the product and who should find businesses or services using it; keep those search journeys separate. Record target geography, languages, evidence-backed search intent, useful public pages, their fact owners and intended customer action. For each route family, decide canonical identity, Main App versus tenant ownership, index/noindex and sitemap eligibility, structured data and any complete language variants. Record explicit non-applicability for private-only products. Reuse Core search transport and domain publication rules rather than copying a reference industry. Do not create thin location/keyword pages or invent demand, reviews, service areas or ranking promises. Define aggregate search/indexation measures, their owner and a baseline plan; unconnected measurement remains a gap. Treat external listings and review-request integrations as separate scoped capabilities with their own access and provider requirements.',
  },
  {
    id: 'assembly',
    title: 'Propose the assembly',
    instruction:
      'Map requirements, including the reviewed search plan, to owned entities, workspaces, capabilities, tools, services and surfaces. Assign implementation and acceptance owners for search pages, metadata, sitemap providers and measurement; unsupported pieces remain explicit gaps. A service describes a configured outcome and coordinates domain behaviour; it does not absorb domain records or authority.',
  },
  {
    id: 'compare',
    title: 'Compare like for like and identify deltas',
    instruction:
      'Use identical architectural terms for shared responsibilities. Separate domain substitutions from configuration, composition and genuinely new behaviour. Assess source availability and journey proof independently. Start from a shared-structure hypothesis; keep justified exceptions rather than forcing every industry into the reference domain.',
  },
  {
    id: 'build',
    title: 'Implement a bounded journey',
    instruction:
      'Build FireUX Apps on the actual framework from the first implementation: consume defineFireuxConfig, the owning native runtime layers and Core AppShell. Reuse shared platform attribution and legal/account entrances, Core SEO metadata and indexing policy, and the Core App manifest with the owning brand assets. A prototype still uses the framework; an Ignite brief or type dependency alone does not establish a FireUX App. Compose in FireUX style from the first implementation: map named user responsibilities to a readable parent, a clear state/lifecycle owner and focused controls. Reuse supported Core and domain primitives and commands without duplicating reads or authority. Keep cohesive controls local; avoid forwarding wrappers and premature abstractions. Record consequential decisions and their evidence rather than storing chat history. Supply the reviewed context to the owning App creation command. For a configured App, declare context in defineFireuxConfig; Core passes this seed through server-only runtime configuration and persists it only on first creation. Project-owned App creation accepts context directly. Never overwrite subsequently edited context on initialization or retry.',
  },
  {
    id: 'verify',
    title: 'Prove the result',
    instruction:
      'Verify the visible platform attribution and entrypoints, rendered canonical/social/structured metadata, robots/sitemap agreement and App-specific PWA identity. Check the search plan against representative public landing, directory, detail, tenant and private routes where applicable. Inspect server-rendered HTML, response status and headers, crawlable links and primary content, canonical and social origins, sitemap membership and structured-data agreement with visible public facts. Production canonical, social and structured-data URLs must not use loopback or preview origins. Verify robots and sitemap delivery on the actual hosting target, including redirects and failure outcomes; a source file is not a deployed endpoint. Check cross-App duplicates and approved multilingual routes, then establish a representative performance baseline. Keep local checks, deployed observations, indexation and measured search outcomes separate. Unverified endpoints or measurement must remain open findings, not SEO-complete claims. Keep preview noindex separate from a missing SEO integration. Review the complete route, composition, controls, state/lifecycle owner and commands; remove obsolete paths and confirm registration and consumers. Verify code, authority, scope changes, failures and the complete user journey independently. A shorter file, source path or passing typecheck does not prove sound composition or a usable product. Verify that App creation persisted the intended context, public projections omit it, and repeated initialization preserves operator edits.',
  },
  {
    id: 'reconcile',
    title: 'Compare and improve Ignition',
    instruction:
      'Compare the independent proposal with the reference. Review gaps as missing knowledge, missing building blocks, incorrect composition or justified domain choices. Improve the owning method or implementation, then repeat with a fresh brief.',
  },
] as const
