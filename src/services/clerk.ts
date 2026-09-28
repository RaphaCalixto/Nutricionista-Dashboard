/**
 * Clerk Authentication Configuration
 */

// Live Publishable Key for pacientenutri.com.br
export const CLERK_PUBLISHABLE_KEY: string =
  (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_live_Y2xlcmsucGFjaWVudGVudXRyaS5jb20uYnIk';
