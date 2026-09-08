const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pgtwwyvsseiurkpsjaxn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const CRON_SECRET = process.env.CRON_SECRET;
const COMMUNITIES = ['TA', 'SDE', 'DATA', 'SALES', 'DESIGN', 'FREELANCE', 'FOUNDERS'];

function json(response, body, status = 200) {
  response.status(status).json(body);
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

export default async function handler(request, response) {
  const authorization = getHeader(request, 'authorization');
  if (CRON_SECRET && authorization !== `Bearer ${CRON_SECRET}`) {
    return json(response, { error: 'Unauthorized' }, 401);
  }

  if (!SUPABASE_ANON_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return json(response, { error: 'Reporting is not configured' }, 500);
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

  if (!supabaseResponse.ok) return json(response, { error: 'Could not read report data' }, 502);
  const report = await supabaseResponse.json();

  const messages = ['Website visits in the last 12 hours', 'Join Community clicks in the last 12 hours'];
  const eventTypes = ['website_visit', 'join_click'];

  await Promise.all(messages.map((heading, index) => {
    const lines = COMMUNITIES.map((community) => {
      const row = report.find((item) => item.event_type === eventTypes[index] && item.community === community);
      const totalLabel = index === 0 ? 'website visits' : 'Join Community clicks';
      return `${community} Community\nLatest: ${row?.latest_count || 0}\nTotal ${totalLabel}: ${row?.total_count || 0}`;
    });

    return sendTelegram(`${heading}\n\n${lines.join('\n\n')}`);
  }));

  return json(response, { ok: true, messages: 2 });
}