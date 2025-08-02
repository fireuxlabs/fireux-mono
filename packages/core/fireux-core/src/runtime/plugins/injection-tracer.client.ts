// Simple injection error tracer - finds exact source of Vue injection errors
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    console.log('[INJECTION-TRACER] Starting simple injection error monitoring')

    const originalConsoleWarn = console.warn

    // Intercept console warnings to catch injection errors
    console.warn = function (...args: any[]) {
      if (args.length > 0 && typeof args[0] === 'string') {
        if (
          args[0].includes('inject() can only be used inside setup()') ||
          args[0].includes('injection') ||
          args[0].includes('composable')
        ) {
          const stack = new Error().stack
          console.error('🚨 [INJECTION-ERROR] Found injection violation!')
          console.error('📍 Message:', args[0])
          console.error('📋 Full Stack:', stack)

          // Extract just our package lines for easier debugging
          const stackLines = stack?.split('\n') || []
          const ourCode = stackLines
            .filter(
              (line) =>
                line.includes('/packages/') && !line.includes('node_modules')
            )
            .slice(0, 5)

          if (ourCode.length > 0) {
            console.error('🎯 Our Code Stack:', ourCode)
          }

          console.error('---')
        }
      }
      return originalConsoleWarn.apply(this, args)
    }

    console.log('[INJECTION-TRACER] Ready to catch injection errors!')
  }
})
