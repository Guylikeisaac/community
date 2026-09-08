const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pgtwwyvsseiurkpsjaxn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

// WhatsApp invite links per community. Keep in sync with script.js.
const COMMUNITY_INVITES = {
  TA: 'https://chat.whatsapp.com/BePLWJnBxUN6btKouNA3is?mode=gi_t',
  SDE: 'https://chat.whatsapp.com/D68qlLyjIPY10hOgXLvOxn?mode=gi_t',
  DATA: 'https://chat.whatsapp.com/IKfbKsinjAH11aFZTg1Na9?mode=gi_t',
  SALES: 'https://chat.whatsapp.com/L6LbfwH0xldJFqYShwoIFq?mode=gi_t',
  DESIGN: 'https://chat.whatsapp.com/IrfyrCjkgz3Ekl72mxcMpM?mode=gi_t',
  FREELANCE: 'https://chat.whatsapp.com/HFxuW4xFd9B9kl2OdMXraC?mode=gi_t',
  FOUNDERS: 'https://chat.whatsapp.com/KE9zPqyXdK6FiJQTZULpdc?mode=gi_t'
};

const ALLOWED_SOURCES = new Set([...Object.keys(COMMUNITY_INVITES), 'DIRECT']);

function redirect(response, location) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Location', location);
  response.status(302).end();
}

async function recordJoin(community, sourceGroup) {
  if (!SUPABASE_ANON_KEY) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/click_events`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ event_type: 'join_click', community, source_group: sourceGroup }),
      signal: controller.signal
    });
  } catch {
    // Never block the redirect on a tracking failure.
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(request, response) {
  const query = request.query || {};
  const community = String(query.community || '').trim().toUpperCase();
  const sourceRaw = String(query.source || 'DIRECT').trim().toUpperCase();
  const sourceGroup = ALLOWED_SOURCES.has(sourceRaw) ? sourceRaw : 'DIRECT';

  const invite = COMMUNITY_INVITES[community];
  if (!invite) return redirect(response, '/index.html');

  // Wait for the write so the serverless instance is not frozen before it lands.
  await recordJoin(community, sourceGroup);

  return redirect(response, invite);
}
