// Lightweight shims to prevent the app typecheck from traversing workspace package sources.
// This keeps nuxi/vue-tsc focused on the app while packages are developed/built separately.

declare module 'fireux-core' {
  const mod: any
  export = mod
}
declare module 'fireux-core/*' {
  const mod: any
  export = mod
}

declare module 'fireux-misebox' {
  const mod: any
  export = mod
}
declare module 'fireux-misebox/*' {
  const mod: any
  export = mod
}

declare module 'fireux-cleanbox' {
  const mod: any
  export = mod
}
declare module 'fireux-cleanbox/*' {
  const mod: any
  export = mod
}

declare module 'fireux-fireux' {
  const mod: any
  export = mod
}
declare module 'fireux-fireux/*' {
  const mod: any
  export = mod
}

declare module 'fireux-jobs' {
  const mod: any
  export = mod
}
declare module 'fireux-jobs/*' {
  const mod: any
  export = mod
}

declare module 'fireux-places' {
  const mod: any
  export = mod
}
declare module 'fireux-places/*' {
  const mod: any
  export = mod
}
