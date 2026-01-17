export function ensureRuntimeConfigBuckets(nuxt, key) {
  if (!key) return
  const rc = nuxt.options.runtimeConfig || (nuxt.options.runtimeConfig = {})

  rc[key] ||= {}

  const pub = (rc.public ||= {})
  pub[key] ||= {}
}

export function exposeRuntimeAlias(nuxt, aliasKey, runtimeDir) {
  if (!aliasKey || !runtimeDir) return

  nuxt.options.alias ||= {}
  nuxt.options.alias[aliasKey] = runtimeDir

  nuxt.hook('nitro:config', (nitroConfig) => {
    nitroConfig.alias ||= {}
    nitroConfig.alias[aliasKey] = runtimeDir
  })
}

export function ensureRuntimeLayerFromPath(nuxt, runtimeDir) {
  if (!runtimeDir) return null

  const currentLayers = nuxt.options.layers
  if (!currentLayers) {
    nuxt.options.layers = [runtimeDir]
  } else if (Array.isArray(currentLayers)) {
    if (!currentLayers.includes(runtimeDir)) currentLayers.push(runtimeDir)
  } else if (typeof currentLayers === 'string') {
    if (currentLayers !== runtimeDir) {
      nuxt.options.layers = [currentLayers, runtimeDir]
    }
  }

  const current = nuxt.options.extends
  if (!current) {
    nuxt.options.extends = []
  } else if (!Array.isArray(current)) {
    nuxt.options.extends = [current]
  }
  const ext = nuxt.options.extends

  const already = ext.some((entry) =>
    Array.isArray(entry) ? entry[0] === runtimeDir : entry === runtimeDir
  )

  if (!already) {
    ext.push([
      runtimeDir,
      {
        config: {
          rootDir: runtimeDir,
          srcDir: runtimeDir,
          dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
        },
      },
    ])
  }

  const options = nuxt.options
  const internalLayers = (options._layers ||= [])
  const hasInternal = internalLayers.some((entry) => {
    if (typeof entry === 'string') return entry === runtimeDir
    return entry?.cwd === runtimeDir || entry?.src === runtimeDir
  })
  if (!hasInternal) {
    internalLayers.push({
      cwd: runtimeDir,
      src: runtimeDir,
      config: {
        rootDir: runtimeDir,
        srcDir: runtimeDir,
        dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' },
      },
    })
  }

  return runtimeDir
}

export function ensureRuntimeLayer(resolver, nuxt) {
  const runtimeDir = resolver.resolve('./runtime')
  if (!runtimeDir) return null
  return ensureRuntimeLayerFromPath(nuxt, runtimeDir)
}