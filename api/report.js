const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pgtwwyvsseiurkpsjaxn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const CRON_SECRET = process.env.CRON_SECRET;
const COMMUNITIES = ['TA', 'SDE', 'DATA', 'SALES', 'DESIGN', 'FREELANCE', 'FOUNDERS'];

function json(response, status = 200) {
  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function getHeader(request, name) {
  if (typeof request.headers?.get === 'function') {
    return request.headers.get(name);
  }

  return request.headers?.[name] || request.headers?.[name.toLowerCase()];
}

async function sendTelegram(text) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    signal: controller.signal
  });
  clearTimeout(timeout);

  if (!response.ok) throw new Error('Telegram message failed');
}

export default async function handler(request) {
  const authorization = getHeader(request, 'authorization');
  if (CRON_SECRET && authorization !== `Bearer ${CRON_SECRET}`) {
    return json({ error: 'Unauthorized' }, 401);
  }

  if (!SUPABASE_ANON_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return json({ error: 'Reporting is not configured' }, 500);
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_click_report`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: '{}'
  });

  if (!response.ok) return json({ error: 'Could not read report data' }, 502);
  const report = await response.json();

  const messages = [];
  for (const eventType of ['website_visit', 'join_click']) {
    for (const community of COMMUNITIES) {
      const row = report.find((item) => item.event_type === eventType && item.community === community);
      const label = eventType === 'website_visit' ? 'Website visits' : 'Join Community clicks';
      const latest = row?.latest_count || 0;
      const total = row?.total_count || 0;
      messages.push(sendTelegram(`${community} Community\n\n${label} in the last 12 hours: ${latest}\nTotal ${label.toLowerCase()}: ${total}`));
    }
  }
  await Promise.all(messages);

  return json({ ok: true, messages: COMMUNITIES.length * 2 });
}