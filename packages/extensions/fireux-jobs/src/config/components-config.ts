import { addComponentsDir } from '@nuxt/kit'
import type { ModuleOptions } from '../module'

/**
 * Configure components for the FireUX Jobs module
 * @param resolver The resolver instance to resolve file paths
 * @param options Module options containing component prefix
 */
export function configureComponents(resolver: any, options: ModuleOptions) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Register Professional profile components with JobProfessional prefix
  addComponentsDir({
    path: resolvePath('./runtime/components/Organisms/profiles/Professional/Cards'),
    pathPrefix: false,
    prefix: 'JobProfessional',
    global: true,
  })

  // Register Employer profile components with JobEmployer prefix
  addComponentsDir({
    path: resolvePath('./runtime/components/Organisms/profiles/Employer/Cards'),
    pathPrefix: false,
    prefix: 'JobEmployer',
    global: true,
  })

  // Register Professional management components
  addComponentsDir({
    path: resolvePath('./runtime/components/Organisms/profiles/Professional'),
    pathPrefix: false,
    prefix: 'JobProfessional',
    global: true,
    pattern: '*.vue', // Only direct files, not Cards folder
  })

  // Register Employer management components
  addComponentsDir({
    path: resolvePath('./runtime/components/Organisms/profiles/Employer'),
    pathPrefix: false,
    prefix: 'JobEmployer',
    global: true,
    pattern: '*.vue', // Only direct files, not Cards folder
  })

  // Register other job components
  addComponentsDir({
    path: resolvePath('./runtime/components/cards'),
    pathPrefix: false,
    prefix: 'Job',
    global: true,
  })
}
