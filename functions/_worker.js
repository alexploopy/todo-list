import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import * as build from '../build/server/index.js'

const handleRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (context) => context.env,
})

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url)
      
      // Handle static assets
      if (url.pathname.startsWith('/assets/')) {
        const response = await env._STATIC_CONTENT.fetch(request)
        if (response.status === 404) {
          return new Response('Asset not found', { status: 404 })
        }
        return response
      }

      // Handle all other requests
      const response = await handleRequest({ request, env, ctx })
      return response
    } catch (error) {
      console.error('Worker error:', error)
      return new Response(
        JSON.stringify({
          error: error.message,
          stack: error.stack,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
  }
} 