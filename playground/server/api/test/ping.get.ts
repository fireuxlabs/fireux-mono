export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'Playground API test endpoint is working!',
    timestamp: new Date().toISOString(),
  }
})
