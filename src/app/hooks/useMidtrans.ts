import { useEffect } from 'react';

/**
 * Dynamically injects the correct Midtrans Snap.js script based on environment variables.
 *
 * Env Variables (set in Vercel or .env.local):
 *   VITE_MIDTRANS_CLIENT_KEY     → Client Key (SB-Mid-client-... for Sandbox, Mid-client-... for Production)
 *   VITE_MIDTRANS_IS_PRODUCTION  → "true" for Production endpoint, anything else = Sandbox
 */
export function useMidtrans() {
  useEffect(() => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

    if (!clientKey) {
      console.warn('[Midtrans] VITE_MIDTRANS_CLIENT_KEY is not set. Payment popup disabled.');
      return;
    }

    // Jika sudah ada, jangan load ulang
    if (document.getElementById('midtrans-snap-script')) return;

    const snapUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    console.log('[Midtrans] Loading snap.js from:', snapUrl, '| Key:', clientKey.substring(0, 20) + '...');

    const script = document.createElement('script');
    script.id = 'midtrans-snap-script';
    script.src = snapUrl;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    script.onload = () => {
      console.log('[Midtrans] snap.js loaded successfully ✅');
    };
    script.onerror = () => {
      console.error('[Midtrans] Failed to load snap.js ❌');
    };

    document.head.appendChild(script);

    // Jangan remove saat unmount — snap perlu tetap ada
  }, []);
}
