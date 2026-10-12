export const ignitionMethod = [
  {
    id: 'brief',
    title: 'Describe the business outcome',
    instruction:
      'Name actors, industry, business needs and observable acceptance criteria without referring to the reference app, its routes or implementation.',
  },
  {
    id: 'research',
    title: 'Investigate the industry',
    instruction:
      'Use the existing industry-research method. Separate evidence, interpretation and product choices; do not use the reference implementation to predetermine demand.',
  },
  {
    id: 'assembly',
    title: 'Propose the assembly',
    instruction:
      'Map requirements to owned entities, workspaces, capabilities, tools, services and surfaces. A service describes a configured outcome and coordinates domain behaviour; it does not absorb domain records or authority.',
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
      'Reuse supported lower owners. Add domain implementation where needed. Record consequential decisions and their evidence rather than storing chat history.',
  },
  {
    id: 'verify',
    title: 'Prove the result',
    instruction:
      'Verify code, authority, scope changes, failures and the complete user journey independently. A source path or passing typecheck does not prove a usable product.',
  },
  {
    id: 'reconcile',
    title: 'Compare and improve Ignition',
    instruction:
      'Compare the independent proposal with the reference. Review gaps as missing knowledge, missing building blocks, incorrect composition or justified domain choices. Improve the owning method or implementation, then repeat with a fresh brief.',
  },
] as const
