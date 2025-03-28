import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import * as build from '../build/server/index.js'

const handleRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (context) => context.env,
})

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/assets/')) {
      return env.ASSETS.fetch(request)
    }
    return handleRequest({ request, env, ctx })
  }
} 