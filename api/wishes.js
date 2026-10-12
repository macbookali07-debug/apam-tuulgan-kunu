// Куттуктоолорду Upstash Redis'те сактоо.
// Токен/каттоо/карт КЕРЕГИ ЖОК — убактылуу бош база колдонулат (3 күн иштейт).
// Узак мөөнөткө калтыруу үчүн "Claim" шилтемесин колдонсо болот (өз эсебине өткөрөт).

const KV_URL =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  'https://lucky-hedgehog-228085.upstash.io';

const KV_TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  'gQAAAAAAA3r1AQIgcDI1YTMzYWI4OWQxOGQ0Mzg2YWNiNjU1OGQwZTVkM2QwMw';

const KEY = 'wishes';
const configured = Boolean(KV_URL && KV_TOKEN);

// Upstash REST API (body-style): буйрукту JSON массиви катары жөнөтөбүз.
async function kvCommand(command) {
  const response = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  });
  if (!response.ok) {
    throw new Error(`Upstash суроо ишке ашпады (HTTP ${response.status})`);
  }
  const data = await response.json();
  return data.result;
}

async function readWishes() {
  const raw = await kvCommand(['GET', KEY]);
  if (raw == null) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeWishes(wishes) {
  await kvCommand(['SET', KEY, JSON.stringify(wishes)]);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // GET: бардык куттуктоолорду кайтаруу.
  if (req.method === 'GET') {
    if (!configured) return res.status(200).json([]);
    try {
      return res.status(200).json(await readWishes());
    } catch (error) {
      console.error('Куттуктоолорду окууда ката:', error);
      return res.status(200).json([]);
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Бул сурам колдоого алынбайт.' });
  }

  if (!configured) {
    return res.status(503).json({ error: 'Сактоо системасы даяр эмес.' });
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!name || !message || name.length > 80 || message.length > 2000) {
    return res.status(400).json({ error: 'Аты 1–80, куттуктоо 1–2000 белги болушу керек.' });
  }

  try {
    const wishes = await readWishes();
    wishes.unshift({ name, message, date: new Date().toISOString() });
    await writeWishes(wishes);
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Куттуктоону сактоодо ката:', error);
    return res.status(500).json({ error: 'Куттуктоону сактоодо ката кетти. Кайра аракет кылыңыз.' });
  }
};

