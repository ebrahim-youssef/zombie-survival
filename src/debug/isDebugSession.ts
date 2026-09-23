/**
 * Local Vite dev is always debug-capable. Deployed QA is deliberately
 * opt-in via ?debug=1, with no Cloudflare build-time variable needed.
 * Do not use QA sessions for trusted highscores.
 */
export function isDebugSession(): boolean {
  return import.meta.env.DEV ||
    new URLSearchParams(window.location.search).get("debug") === "1";
}
