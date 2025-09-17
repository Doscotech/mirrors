import { redirect } from 'next/navigation';

// The unified (hash-based) settings page has been decomposed into discrete route segments
// (e.g. /settings/account, /settings/billing, etc.). To maintain existing external links
// to /settings we permanently redirect to the Account section as the canonical landing page.
// Update the target below if the default landing section ever changes.
export default function SettingsIndexRedirect() {
  redirect('/settings/account');
}
