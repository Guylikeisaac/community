const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pgtwwyvsseiurkpsjaxn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const ALLOWED_COMMUNITIES = new Set(['TA', 'SDE', 'DATA', 'SALES', 'DESIGN', 'FREELANCE', 'FOUNDERS']);
const ALLOWED_EVENTS = new Set(['website_visit', 'join_click']);

function json(response, status = 200) {
  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!SUPABASE_ANON_KEY) return json({ error: 'Tracking is not configured' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const eventType = String(body.event_type || '');
  const community = String(body.community || '');
  const sourceGroup = String(body.source_group || 'DIRECT').slice(0, 32).toUpperCase();

  if (!ALLOWED_EVENTS.has(eventType) || !ALLOWED_COMMUNITIES.has(community)) {
    return json({ error: 'Invalid tracking event' }, 400);
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/click_events`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({
      event_type: eventType,
      community,
      source_group: sourceGroup
    })
  });

  if (!response.ok) return json({ error: 'Could not record event' }, 502);
  return json({ ok: true });
}