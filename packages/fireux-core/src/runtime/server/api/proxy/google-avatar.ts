import { defineEventHandler, getQuery, setResponseHeaders } from 'h3'

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)

  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid URL parameter',
    })
  }

  // Only allow Google profile images
  if (!url.includes('googleusercontent.com') && !url.includes('google.com')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only Google profile images are allowed',
    })
  }

  try {
    // Fetch the image from Google
    const response = await fetch(url)

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch image',
      })
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Set appropriate headers
    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
    })

    return imageBuffer
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to proxy image',
    })
  }
})
