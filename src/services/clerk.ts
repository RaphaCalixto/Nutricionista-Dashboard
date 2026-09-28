/**
 * Clerk Authentication Configuration
 */

// Live Publishable Key for pacientenutri.com.br
const BUILTIN_CLERK_KEY = typeof atob === 'function' 
  ? atob('cGtfbGl2ZV9ZMmRzYm1NdWNHRmphV1Z1ZEdWdWRYUnlhUzVqYjIwLnluSWs=')
  : 'pk_live_Y2xlcmsucGFjaWVudGVudXRyaS5jb20uYnIk';

export const CLERK_PUBLISHABLE_KEY: string =
  (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY ||
  BUILTIN_CLERK_KEY;
