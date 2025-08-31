export function configurePages(resolver: any, nuxt: any) {
  // Expose module pages under a subdir (Nuxt v4: extends-like registration)
  // Add as layered app dir so pages/layouts/middleware are discovered
  nuxt.options._layers = nuxt.options._layers || []
  nuxt.options._layers.push({
    cwd: resolver.resolve('./runtime'),
    // Nuxt expects a config with srcDir for layer prioritization
    config: { srcDir: resolver.resolve('./runtime') },
  })
}
