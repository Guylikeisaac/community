const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pgtwwyvsseiurkpsjaxn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN;

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const token = request.headers['x-dashboard-token'];
  if (!DASHBOARD_TOKEN || token !== DASHBOARD_TOKEN) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_click_report`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: '{}'
  });

  if (!supabaseResponse.ok) {
    return response.status(502).json({ error: 'Could not read report data' });
  }

  return response.status(200).json(await supabaseResponse.json());
}