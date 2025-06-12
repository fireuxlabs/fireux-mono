// Test script to verify module pages are accessible in the FireUX app
import http from 'http'

const testRoutes = [
  // '/' excluded - each app has its own index page
  '/auth',
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/account',
  '/blog',
  '/products',
  '/admin',
  '/design',
  '/developer',
  '/getting-started',
  '/skills',
]

async function testPageAccessibility() {
  console.log('Testing page accessibility for FireUX app...\n')

  const baseUrl = 'http://localhost:3003' // FireUX dev server port

  for (const route of testRoutes) {
    const url = `${baseUrl}${route}`

    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
          })
        })

        req.on('error', reject)
        req.setTimeout(5000, () => reject(new Error('Timeout')))
      })

      console.log(
        `${route}: ${response.status === 200 ? '✓' : '✗'} (${response.status})`
      )
    } catch (error) {
      console.log(`${route}: ✗ (${error.message})`)
    }
  }

  console.log('\nPage accessibility test completed.')
}

testPageAccessibility()
