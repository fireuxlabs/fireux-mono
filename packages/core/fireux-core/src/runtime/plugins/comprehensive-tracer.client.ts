import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  if (import.meta.dev && typeof window !== 'undefined') {
    const originalWarn = console.warn
    const originalError = console.error

    // Track composable calls and their return values
    const composableTracker = new Map()

    // Enhanced warning interceptor
    console.warn = (...args: unknown[]) => {
      const err = new Error()
      const stack = err.stack || ''
      const [firstArg] = args
      const message = typeof firstArg === 'string' ? firstArg : ''

      // Ignore tracer file self-logs
      if (stack.includes('comprehensive-tracer.client.ts')) return

      // toRefs() Warning - Our main target
      if (
        message.includes(
          'toRefs() expects a reactive object but received a plain one'
        )
      ) {
        console.group(
          '%c🚨 toRefs() WARNING DETECTED!',
          'color: red; font-weight: bold; font-size: 16px; background: yellow; padding: 8px;'
        )

        console.log('%c📍 Original Warning:', 'color: red; font-weight: bold;')
        originalWarn('[toRefs Warning]:', ...args)

        console.log(
          '%c🔍 Detailed Analysis:',
          'color: blue; font-weight: bold;'
        )
        console.log('Current URL:', window?.location?.href)
        console.log('Current route:', window?.location?.pathname)
        console.log('Timestamp:', new Date().toISOString())

        console.log(
          '%c📊 Composable Tracker State:',
          'color: purple; font-weight: bold;'
        )
        console.table(Array.from(composableTracker.entries()))

        console.log('%c📚 Stack Analysis:', 'color: orange; font-weight: bold;')
        const stackLines = stack.split('\n')
        const relevantFrames = stackLines.filter(
          (line) =>
            line.includes('.vue') ||
            line.includes('composables') ||
            line.includes('layouts') ||
            line.includes('pages') ||
            line.includes('components')
        )

        console.log('Relevant stack frames:')
        relevantFrames.forEach((frame, index) => {
          console.log(`${index + 1}. ${frame.trim()}`)
        })

        console.log(
          '%c💡 Investigation Tips:',
          'color: green; font-weight: bold;'
        )
        console.log(
          '1. Check if any composable returns a plain object instead of reactive'
        )
        console.log(
          '2. Look for destructuring of non-reactive objects with toRefs()'
        )
        console.log('3. Verify all reactive() calls wrap proper objects')
        console.log('4. Check if any computed/ref returns plain objects')

        console.groupEnd()
        return
      }

      // Inject Warnings
      if (message.includes('inject() can only be used')) {
        console.log(
          '%c🚨 [Vue Inject Warning]:',
          'color: orange; font-weight: bold;'
        )
        originalWarn('[Inject Warning]:', ...args)
        console.log('%c🔍 Suggested Action:', 'color: lightblue;')
        console.log(
          '- Review composable usage for proper setup()/plugin context.'
        )
        console.trace()
        return
      }

      // VueFire SSR Warnings
      if (
        message.includes(
          '[VueFire SSR]: Could not get the path of the data source'
        )
      ) {
        console.log(
          '%c⚠️ [VueFire SSR Warning]:',
          'color: yellow; font-weight: bold;'
        )
        originalWarn('[VueFire SSR Warning]:', ...args)
        console.log('%c🔍 Suggested Action:', 'color: lightblue;')
        console.log(
          '- Ensure `useCollection` and `useDocument` are called after runtime config and APP_ID are available.\n' +
            '- Use <ClientOnly> or guards to prevent early calls during SSR/hydration.'
        )
        console.trace()
        return
      }

      // Reactivity warnings
      if (
        message.includes('reactive') ||
        message.includes('ref') ||
        message.includes('computed')
      ) {
        console.log(
          '%c⚡ [Reactivity Warning]:',
          'color: cyan; font-weight: bold;'
        )
        originalWarn('[Reactivity Warning]:', ...args)
        console.trace()
        return
      }

      // Always fallback to original warn for other cases
      originalWarn(...args)
    }

    // Enhanced error tracking for reactivity issues
    console.error = (...args: unknown[]) => {
      const err = new Error()
      const stack = err.stack || ''
      const [firstArg] = args
      const message = typeof firstArg === 'string' ? firstArg : ''

      // Ignore tracer file self-logs
      if (stack.includes('comprehensive-tracer.client.ts')) return

      // Reactivity-related errors
      if (
        message.includes('toRefs') ||
        message.includes('reactive') ||
        message.includes('ref') ||
        message.includes('computed')
      ) {
        console.log(
          '%c❌ [Reactivity Error]:',
          'color: red; font-weight: bold; font-size: 16px;'
        )
        originalError('[Reactivity Error]:', ...args)
        console.trace()
        return
      }

      // Always fallback to original error for other cases
      originalError(...args)
    }

    // Wait for Vue to be available and hook into reactivity system
    const checkVue = () => {
      if (typeof window !== 'undefined' && (window as any).Vue) {
        const Vue = (window as any).Vue

        // Override toRefs with detailed logging
        if (Vue.toRefs) {
          const originalToRefs = Vue.toRefs
          Vue.toRefs = function (object: any) {
            console.group(
              '%c🔍 toRefs() Debug Session',
              'color: blue; font-weight: bold; font-size: 14px;'
            )

            console.log(
              '%c📥 Input Object:',
              'color: green; font-weight: bold;'
            )
            console.log('Value:', object)
            console.log('Type:', typeof object)
            console.log('Constructor:', object?.constructor?.name)
            console.log('Is Array:', Array.isArray(object))
            console.log('Is Null/Undefined:', object == null)

            console.log(
              '%c🔬 Reactivity Status:',
              'color: orange; font-weight: bold;'
            )
            console.log('__v_isReactive:', object?.__v_isReactive)
            console.log('__v_isRef:', object?.__v_isRef)
            console.log('__v_isReadonly:', object?.__v_isReadonly)
            console.log('__v_isShallow:', object?.__v_isShallow)

            if (object && typeof object === 'object') {
              console.log(
                '%c🔑 Object Keys:',
                'color: purple; font-weight: bold;'
              )
              console.log(Object.keys(object))

              console.log(
                '%c📊 Property Details:',
                'color: cyan; font-weight: bold;'
              )
              Object.keys(object).forEach((key) => {
                const value = object[key]
                console.log(`${key}:`, {
                  value,
                  type: typeof value,
                  isReactive: value?.__v_isReactive,
                  isRef: value?.__v_isRef,
                })
              })
            }

            console.log('%c📍 Call Stack:', 'color: red; font-weight: bold;')
            console.trace()

            // Check if object is reactive
            if (
              !object ||
              typeof object !== 'object' ||
              (!object.__v_isReactive && !Array.isArray(object))
            ) {
              console.warn(
                '%c⚠️ WARNING: toRefs() called on non-reactive object!',
                'color: red; font-weight: bold; background: yellow; padding: 4px;'
              )
              console.log(
                "%c💡 This will cause the Vue warning you're seeing",
                'color: orange;'
              )
            }

            console.groupEnd()

            return originalToRefs(object)
          }
        }

        // Override reactive with logging
        if (Vue.reactive) {
          const originalReactive = Vue.reactive
          Vue.reactive = function (target: any) {
            console.log(
              '%c⚡ reactive() called with:',
              'color: green; font-weight: bold;',
              target
            )
            return originalReactive(target)
          }
        }

        console.log(
          '%c🔧 Vue Reactivity Hooks Loaded',
          'color: green; font-weight: bold; background: black; padding: 4px;'
        )
      } else {
        // Retry in next tick
        setTimeout(checkVue, 100)
      }
    }

    // Start checking for Vue
    checkVue()

    // Track when composables are called
    const trackComposable = (name: string, fn: Function) => {
      return function (this: any, ...args: any[]) {
        const startTime = performance.now()

        try {
          const result = fn.apply(this, args)
          const endTime = performance.now()

          // Store tracking info
          composableTracker.set(name, {
            lastCalled: new Date().toISOString(),
            duration: endTime - startTime,
            args: args.length,
            resultType: typeof result,
            isReactive:
              result && typeof result === 'object'
                ? result.__v_isReactive
                : false,
            keys:
              result && typeof result === 'object' ? Object.keys(result) : [],
          })

          // Log if result might be problematic
          if (
            result &&
            typeof result === 'object' &&
            !result.__v_isReactive &&
            !Array.isArray(result)
          ) {
            console.warn(
              `%c⚠️ Composable '${name}' returned non-reactive object:`,
              'color: orange; font-weight: bold;',
              result
            )
          }

          return result
        } catch (error) {
          console.error(
            `%c❌ Error in composable '${name}':`,
            'color: red; font-weight: bold;',
            error
          )
          throw error
        }
      }
    }

    console.log(
      '%c🔧 Comprehensive Tracer Loaded',
      'color: green; font-weight: bold; background: black; padding: 8px;'
    )
    console.log(
      '%c- Tracking toRefs() warnings and reactivity issues',
      'color: cyan;'
    )
    console.log('%c- Vue reactivity system hooks active', 'color: cyan;')
    console.log('%c- Composable monitoring ready', 'color: cyan;')
  }
})
