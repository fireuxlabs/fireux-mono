export function configurePages(resolver: any, nuxt: any) {
  nuxt.options._layers ||= []
  nuxt.options._layers.push({
    cwd: resolver.resolve('./runtime'),
    config: { srcDir: resolver.resolve('./runtime') },
  })
}
