import { useEffect } from 'react';

/**
 * Dynamically injects the correct Midtrans Snap.js script based on environment variables.
 *
 * Env Variables (set in Vercel or .env.local):
 *   VITE_MIDTRANS_CLIENT_KEY  → Your Client Key (Sandbox OR Production)
 *   VITE_MIDTRANS_IS_PRODUCTION → Set to "true" to use Production, default is Sandbox
 *
 * To switch Sandbox → Production:
 *   1. Go to Vercel → Settings → Environment Variables
 *   2. Change VITE_MIDTRANS_CLIENT_KEY to your Production Client Key (Mid-client-xxx)
 *   3. Change VITE_MIDTRANS_IS_PRODUCTION to "true"
 *   4. Redeploy
 */
export function useMidtrans() {
  useEffect(() => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

    if (!clientKey) {
      console.warn('[Midtrans] VITE_MIDTRANS_CLIENT_KEY is not set. Payment popup will be disabled.');
      return;
    }

    // Remove existing Snap script to prevent duplicates on hot reload
    const existing = document.getElementById('midtrans-snap-script');
    if (existing) existing.remove();

    const snapUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    const script = document.createElement('script');
    script.id = 'midtrans-snap-script';
    script.src = snapUrl;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const s = document.getElementById('midtrans-snap-script');
      if (s) s.remove();
    };
  }, []);
}
