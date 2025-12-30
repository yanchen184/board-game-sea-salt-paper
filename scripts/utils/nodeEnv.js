/**
 * Node Environment Setup
 *
 * Provides compatibility shims for running browser-oriented code in Node.js
 * Specifically handles import.meta.env for Vite-based projects
 */

// Set default NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

// Create import.meta shim for Node.js environment
// This allows Vite-specific code to run in Node.js
if (typeof globalThis.import === 'undefined') {
  Object.defineProperty(globalThis, 'import', {
    value: {
      meta: {
        env: new Proxy(process.env, {
          get(target, prop) {
            // Handle DEV flag
            if (prop === 'DEV') {
              return target.NODE_ENV !== 'production'
            }
            // Handle PROD flag
            if (prop === 'PROD') {
              return target.NODE_ENV === 'production'
            }
            // Handle MODE
            if (prop === 'MODE') {
              return target.NODE_ENV || 'development'
            }
            // Pass through VITE_* environment variables
            if (typeof prop === 'string') {
              return target[prop]
            }
            return undefined
          }
        })
      }
    },
    writable: false,
    configurable: false
  })
}

console.log('✅ Node.js environment adapter loaded (NODE_ENV:', process.env.NODE_ENV, ')')

export default {
  isNode: true,
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production'
}
